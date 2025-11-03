import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Minus, Plus, Loader2, AlertCircle, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatCurrency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fetchInventory, adjustIngredientStock, fetchIngredients, fetchStockCounts } from '@/api/index';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  ingredients: string[];
  defaultPackSize?: number;
}

interface StockLog {
  id: string;
  date: string;
  itemName: string;
  quantity: number;
  unit: string;
  notes?: string;
  loggedBy: string;
}

const UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'box', 'dozen'];

export default function Inventory() {
  const { profile, user } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showEditSettingsModal, setShowEditSettingsModal] = useState(false);
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showAddCountModal, setShowAddCountModal] = useState(false);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // Changed to 7 items per page as requested
  
  const [adjustForm, setAdjustForm] = useState({
    adjustQty: 0,
    reason: '',
  });

  const [addIngredientForm, setAddIngredientForm] = useState({
    name: '',
    base_unit: '',
    reorder_point: 0,
    active: true,
  });

  const [addCountForm, setAddCountForm] = useState({
    selectedIngredientId: '',
    quantity: '',
    unit: 'kg',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [inventoryData, ingredientsData, stockCountsData] = await Promise.all([
        fetchInventory(),
        fetchIngredients(),
        fetchStockCounts(),
      ]);
      setInventoryItems(inventoryData);
      setIngredients(ingredientsData.filter((item: any) => item.active));
      setStockLogs(stockCountsData);
      setCurrentPage(1);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadMovements = async (ingredientId: string) => {
    try {
      const { data, error } = await supabase
        .from('view_inventory_movements')
        .select('*')
        .eq('ingredient_id', ingredientId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setMovements(data || []);
    } catch (error: any) {
      console.error('Error loading movements:', error);
      toast.error('Failed to load movement history');
    }
  };

  const openAdjustModal = (item: any) => {
    if (!isAdmin) {
      toast.error('You do not have permission to adjust inventory stock.');
      return;
    }
    setSelectedItem(item);
    setAdjustForm({
      adjustQty: 0,
      reason: '',
    });
    setShowAdjustModal(true);
  };

  const [editSettingsForm, setEditSettingsForm] = useState<{ avg_unit_cost: number | string; reorder_point: number | string }>({ avg_unit_cost: '', reorder_point: '' });
  const openEditSettings = (item: any) => {
    setSelectedItem(item);
    setEditSettingsForm({
      avg_unit_cost: item.avg_unit_cost ?? 0,
      reorder_point: item.reorder_point ?? 0,
    });
    setShowEditSettingsModal(true);
  };

  const handleAdjustStock = async () => {
    if (!selectedItem || !adjustForm.reason.trim()) {
      toast.error('Please provide a reason for the adjustment');
      return;
    }

    // Check if new quantity would be negative
    const newQuantity = (selectedItem?.qty_on_hand || 0) + adjustForm.adjustQty;
    if (newQuantity < 0) {
      toast.error('Cannot adjust: New quantity would be negative.');
      return;
    }

    try {
      setSubmitting(true);
      
      // Call RPC with correct parameter order
      await adjustIngredientStock(
        adjustForm.adjustQty,        // _adjust_qty (signed numeric)
        selectedItem.ingredient_id,  // _ingredient_id (integer)
        adjustForm.reason,          // _notes (text)
        null                        // _unit_cost (numeric, nullable)
      );

      setShowAdjustModal(false);
      setSuccessMessage(`Stock adjustment recorded for ${selectedItem?.name}`);
      setShowSuccessModal(true);
      setAdjustForm({ adjustQty: 0, reason: '' });
      setSelectedItem(null);
      await loadInventory();
      toast.success('Inventory adjusted successfully!');
    } catch (error: any) {
      console.error('Error adjusting inventory:', error);
      toast.error(error.message || 'Failed to adjust inventory');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCount = async () => {
    if (!user) {
      toast.error('You must be logged in to log stock counts');
      return;
    }
    
    if (!addCountForm.selectedIngredientId || !addCountForm.quantity || !addCountForm.unit) {
      toast.error('Please fill all required fields');
      return;
    }

    const ingredient = ingredients.find(ing => ing.id.toString() === addCountForm.selectedIngredientId);
    if (!ingredient) {
      toast.error('Selected ingredient not found');
      return;
    }

    const parsedQuantity = parseFloat(addCountForm.quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    setSubmitting(true);
    try {
      const payload = [{
        ingredient_id: parseInt(addCountForm.selectedIngredientId),
        quantity: parsedQuantity,
        unit: addCountForm.unit,
        notes: addCountForm.notes || undefined,
        recorded_by: user.id,
      }];

      const { error } = await supabase!.rpc('log_stock_count', {
        p_counts: payload,
      });

      if (error) throw error;

      toast.success('Stock count logged successfully!');
      setShowAddCountModal(false);
      setAddCountForm({
        selectedIngredientId: '',
        quantity: '',
        unit: 'kg',
        notes: '',
      });
      await loadData();
    } catch (error: any) {
      console.error('Error logging stock count:', error);
      toast.error(error.message || 'Failed to log stock count');
    } finally {
      setSubmitting(false);
    }
  };

  const loadInventory = async () => {
    try {
      const inventory = await fetchInventory();
      setInventoryItems(inventory);
    } catch (error: any) {
      console.error('Error loading inventory:', error);
      toast.error('Failed to load inventory');
    }
  };

  const getStockStatus = (item: any) => {
    if (item.qty_on_hand <= 0) return { status: 'Out of Stock', variant: 'destructive' as const };
    if (item.qty_on_hand < item.reorder_point) return { status: 'Low Stock', variant: 'destructive' as const };
    return { status: 'In Stock', variant: 'success' as const };
  };

  const itemMovements = movements.filter(
    movement => movement.ingredient_id === selectedItem?.ingredient_id
  );

  // Pagination for stock logs
  const totalPages = Math.ceil(stockLogs.length / itemsPerPage);
  const paginatedLogs = stockLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Inventory Overview</h1>
          <p className="text-muted-foreground mt-1">
            Monitor stock levels and manage inventory
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-heading font-bold">Current Inventory</h2>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button onClick={() => setShowAddCountModal(true)} variant="secondary">
                <Plus className="mr-2 h-4 w-4" />
                Add Count
              </Button>
              <Button onClick={() => setShowAddIngredientModal(true)} className="gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Ingredient
              </Button>
            </div>
          )}
        </div>

        <Card className="shadow-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Current Qty</TableHead>
                    <TableHead>Reorder Point</TableHead>
                    <TableHead>Avg Unit Cost</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(inventoryItems ?? []).map((item) => {
                    const stockStatus = getStockStatus(item);
                    return (
                      <TableRow key={item.ingredient_id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          {item.qty_on_hand ?? 0} {item.base_unit}
                        </TableCell>
                        <TableCell>{item.reorder_point ?? 0} {item.base_unit}</TableCell>
                        <TableCell>{formatCurrency(item.avg_unit_cost || 0)}</TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant}>
                            {stockStatus.status}
                          </Badge>
                        </TableCell>
                        {isAdmin && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditSettings(item)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit inventory settings</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openAdjustModal(item)}
                                >
                                  Adjust
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Adjust stock</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Live Stock Count Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Live Stock Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Logged By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No stock counts recorded yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{formatDate(log.date)}</TableCell>
                          <TableCell>{log.itemName}</TableCell>
                          <TableCell className="text-right font-semibold">{log.quantity}</TableCell>
                          <TableCell className="text-muted-foreground">{log.unit}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                            {log.notes || '—'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{log.loggedBy}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Adjust Stock Modal */}
        <Dialog open={showAdjustModal} onOpenChange={setShowAdjustModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adjust Stock - {selectedItem?.name}</DialogTitle>
              <DialogDescription>
                Make manual adjustments to inventory levels
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Stock</Label>
                <Input value={`${selectedItem?.qty_on_hand} ${selectedItem?.base_unit}`} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Adjustment Quantity</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAdjustForm(prev => ({ ...prev, adjustQty: Number((prev.adjustQty - 1).toFixed(2)) }))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    step="any"
                    value={adjustForm.adjustQty}
                    onChange={(e) => setAdjustForm(prev => ({ ...prev, adjustQty: parseFloat(e.target.value) || 0 }))}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAdjustForm(prev => ({ ...prev, adjustQty: Number((prev.adjustQty + 1).toFixed(2)) }))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className={`text-sm ${(selectedItem?.qty_on_hand || 0) + adjustForm.adjustQty < 0 ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
                  New quantity will be: {(selectedItem?.qty_on_hand || 0) + adjustForm.adjustQty} {selectedItem?.base_unit}
                  {(selectedItem?.qty_on_hand || 0) + adjustForm.adjustQty < 0 && (
                    <span className="block text-xs text-red-600 mt-1">⚠️ Cannot adjust: New quantity would be negative</span>
                  )}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Reason / Notes *</Label>
                <Input
                  placeholder="Reason for adjustment (required)..."
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdjustModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAdjustStock} 
                className="gradient-primary"
                disabled={(selectedItem?.qty_on_hand || 0) + adjustForm.adjustQty < 0}
              >
                Confirm Adjustment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Ingredient Modal (Admin only) */}
        <Dialog open={showAddIngredientModal} onOpenChange={setShowAddIngredientModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Ingredient</DialogTitle>
              <DialogDescription>
                Create a new ingredient record
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ing-name">Name *</Label>
                <Input id="ing-name" value={addIngredientForm.name} onChange={(e) => setAddIngredientForm(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ing-unit">Base Unit *</Label>
                <Input id="ing-unit" value={addIngredientForm.base_unit} onChange={(e) => setAddIngredientForm(prev => ({ ...prev, base_unit: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ing-reorder">Reorder Point</Label>
                <Input id="ing-reorder" type="number" min="0" step="any" value={addIngredientForm.reorder_point}
                  onChange={(e) => setAddIngredientForm(prev => ({ ...prev, reorder_point: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input 
                    id="ing-active" 
                    type="checkbox" 
                    checked={addIngredientForm.active} 
                    onChange={(e) => setAddIngredientForm(prev => ({ ...prev, active: e.target.checked }))}
                    className="sr-only"
                  />
                  <label 
                    htmlFor="ing-active"
                    className={cn(
                      "flex items-center justify-center w-12 h-6 rounded-full cursor-pointer transition-all duration-200",
                      addIngredientForm.active 
                        ? "bg-primary" 
                        : "bg-muted"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200",
                      addIngredientForm.active ? "translate-x-3" : "-translate-x-3"
                    )} />
                  </label>
                </div>
                <Label htmlFor="ing-active" className="text-sm font-medium cursor-pointer">
                  Active
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddIngredientModal(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  try {
                    setSubmitting(true);
                    const { error } = await supabase
                      .from('ingredients')
                      .insert([{
                        name: addIngredientForm.name,
                        base_unit: addIngredientForm.base_unit,
                        reorder_point: addIngredientForm.reorder_point,
                        active: addIngredientForm.active,
                      }]);
                    if (error) throw error;
                    setShowAddIngredientModal(false);
                    setSuccessMessage('Ingredient added successfully');
                    setShowSuccessModal(true);
                    setAddIngredientForm({ name: '', base_unit: '', reorder_point: 0, active: true });
                    await loadInventory();
                    toast.success('Ingredient added');
                  } catch (e: any) {
                    console.error('Add ingredient error:', e);
                    toast.error(e.message || 'Failed to add ingredient');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="gradient-primary"
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Count Modal */}
        <Dialog open={showAddCountModal} onOpenChange={setShowAddCountModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Stock Count</DialogTitle>
              <DialogDescription>
                Record a physical stock count for an item
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Item Selector */}
              <div className="space-y-2">
                <Label htmlFor="ingredient">Ingredient</Label>
                <Select value={addCountForm.selectedIngredientId} onValueChange={(value) => setAddCountForm(prev => ({ ...prev, selectedIngredientId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an ingredient" />
                  </SelectTrigger>
                  <SelectContent>
                    {ingredients.map((ing) => (
                      <SelectItem key={ing.id} value={ing.id.toString()}>
                        {ing.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity Input */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={addCountForm.quantity}
                  onChange={(e) => setAddCountForm(prev => ({ ...prev, quantity: e.target.value }))}
                />
              </div>

              {/* Unit Selector */}
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={addCountForm.unit} onValueChange={(value) => setAddCountForm(prev => ({ ...prev, unit: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="e.g., Damaged items, discrepancies..."
                  value={addCountForm.notes}
                  onChange={(e) => setAddCountForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddCountModal(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCount}
                className="gradient-primary"
                disabled={submitting || !addCountForm.selectedIngredientId || !addCountForm.quantity || !addCountForm.unit}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Count'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Inventory Settings Modal */}
        <Dialog open={showEditSettingsModal} onOpenChange={setShowEditSettingsModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Settings - {selectedItem?.name}</DialogTitle>
              <DialogDescription>Update average unit cost and reorder point</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avg_unit_cost">Average Unit Cost</Label>
                <Input
                  id="avg_unit_cost"
                  type="number"
                  step="0.01"
                  value={editSettingsForm.avg_unit_cost}
                  onChange={(e) => setEditSettingsForm(prev => ({ ...prev, avg_unit_cost: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorder_point">Reorder Point</Label>
                <Input
                  id="reorder_point"
                  type="number"
                  step="any"
                  value={editSettingsForm.reorder_point}
                  onChange={(e) => setEditSettingsForm(prev => ({ ...prev, reorder_point: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditSettingsModal(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  try {
                    setSubmitting(true);
                    const { data, error } = await supabase.rpc('update_inventory_settings', {
                      _ingredient_id: selectedItem!.ingredient_id,
                      _payload: {
                        avg_unit_cost: Number(editSettingsForm.avg_unit_cost) || 0,
                        reorder_point: Number(editSettingsForm.reorder_point) || 0,
                      }
                    });
                    if (error) throw error;
                    if (data?.status === 'ok') {
                      toast.success('Inventory settings updated successfully');
                    } else {
                      toast.success('Inventory settings updated');
                    }
                    setShowEditSettingsModal(false);
                    await loadInventory();
                  } catch (e: any) {
                    console.error('update_inventory_settings error:', e);
                    toast.error(e.message || 'Failed to update settings');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="gradient-primary"
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Success</DialogTitle>
              <DialogDescription>
                {successMessage}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowSuccessModal(false)} className="gradient-primary">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}