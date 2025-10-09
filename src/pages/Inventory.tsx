import { useState } from 'react';
import { Package, AlertTriangle, History, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { mockInventoryOnHand, mockInventoryMovements } from '@/mocks/inventory';
import { mockIngredients } from '@/mocks/ingredients';
import { toast } from 'sonner';

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  ingredients: string[];
  defaultPackSize?: number;
}

export default function Inventory() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [reorderForm, setReorderForm] = useState({
    suggestedQty: 0,
  });
  
  const [adjustForm, setAdjustForm] = useState({
    adjustQty: 0,
    reason: '',
  });

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    email: '',
    phone: '',
    ingredients: [] as string[],
    defaultPackSize: 0,
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: '1',
      name: 'Fresh Produce Co.',
      email: 'orders@freshproduce.com',
      phone: '(555) 123-4567',
      ingredients: ['Romaine Lettuce', 'Tomato Sauce'],
      defaultPackSize: 10
    },
    {
      id: '2',
      name: 'Dairy Suppliers Inc.',
      email: 'dairy@dairysuppliers.com',
      phone: '(555) 987-6543',
      ingredients: ['Mozzarella Cheese', 'Cheddar Cheese', 'Milk'],
      defaultPackSize: 5
    }
  ]);

  const openReorderModal = (item: any) => {
    setSelectedItem(item);
    const suggestedQty = Math.max(item.reorder_point * 2, 10);
    setReorderForm({
      suggestedQty,
    });
    setShowReorderModal(true);
  };

  const openAdjustModal = (item: any) => {
    setSelectedItem(item);
    setAdjustForm({
      adjustQty: 0,
      reason: '',
    });
    setShowAdjustModal(true);
  };

  const openHistoryModal = (item: any) => {
    setSelectedItem(item);
    setShowHistoryModal(true);
  };

  const handleReorder = () => {
    setShowReorderModal(false);
    setSuccessMessage(`Reorder request noted for ${selectedItem?.ingredient_name}`);
    setShowSuccessModal(true);
    setSelectedItem(null);
  };

  const handleAdjustStock = () => {
    if (!adjustForm.reason.trim()) {
      toast.error('Please provide a reason for the adjustment');
      return;
    }
    setShowAdjustModal(false);
    setSuccessMessage(`Stock adjustment recorded for ${selectedItem?.ingredient_name}`);
    setShowSuccessModal(true);
    setSelectedItem(null);
  };

  const getStockStatus = (item: any) => {
    if (item.qty_on_hand <= 0) return { status: 'Out of Stock', variant: 'destructive' as const };
    if (item.qty_on_hand < item.reorder_point) return { status: 'Low Stock', variant: 'destructive' as const };
    return { status: 'In Stock', variant: 'success' as const };
  };

  const itemMovements = mockInventoryMovements.filter(
    movement => movement.ingredient_id === selectedItem?.ingredient_id
  );

  const addSupplier = () => {
    if (!supplierForm.name) {
      toast.error('Please enter supplier name');
      return;
    }

    if (!supplierForm.email && !supplierForm.phone) {
      toast.error('Please provide either email or phone contact');
      return;
    }

    const newSupplier: Supplier = {
      id: (suppliers.length + 1).toString(),
      ...supplierForm,
    };

    setSuppliers(prev => [...prev, newSupplier]);
    setSupplierForm({
      name: '',
      email: '',
      phone: '',
      ingredients: [],
      defaultPackSize: 0,
    });
    setShowSupplierModal(false);
    setSuccessMessage('Supplier added successfully');
    setShowSuccessModal(true);
  };

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
          <Button onClick={() => setShowSupplierModal(true)} className="gradient-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInventoryOnHand.map((item) => {
                    const stockStatus = getStockStatus(item);
                    return (
                      <TableRow key={item.ingredient_id}>
                        <TableCell className="font-medium">{item.ingredient_name}</TableCell>
                        <TableCell>
                          {item.qty_on_hand} {item.unit}
                        </TableCell>
                        <TableCell>{item.reorder_point} {item.unit}</TableCell>
                        <TableCell>${item.avg_unit_cost.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant}>
                            {stockStatus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openReorderModal(item)}
                                >
                                  Reorder
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Reorder item</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openHistoryModal(item)}
                                >
                                  <History className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>See movement history</p>
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
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Ingredients</TableHead>
                    <TableHead>Default Pack Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>
                        {supplier.email && <div>Email: {supplier.email}</div>}
                        {supplier.phone && <div>Phone: {supplier.phone}</div>}
                      </TableCell>
                      <TableCell>
                        {supplier.ingredients.join(', ')}
                      </TableCell>
                      <TableCell>
                        {supplier.defaultPackSize ? `${supplier.defaultPackSize} units` : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Reorder Modal - Read Only */}
        <Dialog open={showReorderModal} onOpenChange={setShowReorderModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reorder {selectedItem?.ingredient_name}</DialogTitle>
              <DialogDescription>
                Supplier information for reordering
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Stock</Label>
                <Input value={`${selectedItem?.qty_on_hand} ${selectedItem?.unit}`} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Suggested Quantity</Label>
                <Input
                  type="number"
                  value={reorderForm.suggestedQty}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Supplier Contact</Label>
                <Input value="Mock Supplier - (555) 123-4567" readOnly className="bg-muted" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowReorderModal(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Adjust Stock Modal */}
        <Dialog open={showAdjustModal} onOpenChange={setShowAdjustModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adjust Stock - {selectedItem?.ingredient_name}</DialogTitle>
              <DialogDescription>
                Make manual adjustments to inventory levels
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Stock</Label>
                <Input value={`${selectedItem?.qty_on_hand} ${selectedItem?.unit}`} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Adjustment Quantity</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAdjustForm(prev => ({ ...prev, adjustQty: prev.adjustQty - 1 }))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={adjustForm.adjustQty}
                    onChange={(e) => setAdjustForm(prev => ({ ...prev, adjustQty: parseInt(e.target.value) || 0 }))}
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAdjustForm(prev => ({ ...prev, adjustQty: prev.adjustQty + 1 }))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  New quantity will be: {(selectedItem?.qty_on_hand || 0) + adjustForm.adjustQty} {selectedItem?.unit}
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
              <Button onClick={handleAdjustStock} className="gradient-primary">
                Confirm Adjustment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Movement History Modal */}
        <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Movement History - {selectedItem?.ingredient_name}</DialogTitle>
              <DialogDescription>
                Recent inventory movements for this ingredient
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemMovements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No movement history available
                      </TableCell>
                    </TableRow>
                  ) : (
                    itemMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>{new Date(movement.movement_date).toLocaleDateString()}</TableCell>
                        <TableCell className="capitalize">{movement.movement_type}</TableCell>
                        <TableCell className={movement.qty_change > 0 ? 'text-success' : 'text-destructive'}>
                          {movement.qty_change > 0 ? '+' : ''}{movement.qty_change}
                        </TableCell>
                        <TableCell>{movement.reference}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowHistoryModal(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Supplier Modal */}
        <Dialog open={showSupplierModal} onOpenChange={setShowSupplierModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
              <DialogDescription>
                Add supplier information and ingredients they supply
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplierName">Supplier Name *</Label>
                <Input
                  id="supplierName"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter supplier name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplierEmail">Email (Optional)</Label>
                  <Input
                    id="supplierEmail"
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="supplier@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierPhone">Phone (Optional)</Label>
                  <Input
                    id="supplierPhone"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ingredients">Ingredients Supplied</Label>
                <Select onValueChange={(value) => {
                  if (!supplierForm.ingredients.includes(value)) {
                    setSupplierForm(prev => ({ 
                      ...prev, 
                      ingredients: [...prev.ingredients, value] 
                    }));
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ingredients" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockIngredients.map((ingredient) => (
                      <SelectItem key={ingredient.id} value={ingredient.name}>
                        {ingredient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {supplierForm.ingredients.map((ingredient, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {ingredient}
                      <button 
                        type="button"
                        onClick={() => setSupplierForm(prev => ({
                          ...prev,
                          ingredients: prev.ingredients.filter((_, i) => i !== index)
                        }))}
                        className="ml-1 hover:bg-destructive/20 rounded-full"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultPackSize">Default Pack Size (Optional)</Label>
                <Input
                  id="defaultPackSize"
                  type="number"
                  min="0"
                  value={supplierForm.defaultPackSize || ''}
                  onChange={(e) => setSupplierForm(prev => ({ 
                    ...prev, 
                    defaultPackSize: parseInt(e.target.value) || 0 
                  }))}
                  placeholder="Enter default pack size"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSupplierModal(false)}>
                Cancel
              </Button>
              <Button onClick={addSupplier} className="gradient-primary">
                Add Supplier
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