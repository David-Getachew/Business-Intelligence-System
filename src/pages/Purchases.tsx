import { useState, useRef, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { fetchIngredients } from '@/api/index';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatCurrencyDisplay } from '@/utils/formatCurrency';
import { toast } from 'sonner';

interface PurchaseItem {
  id: string;
  ingredient_id: number;  // INTEGER per schema
  ingredientName: string; // Display only, not in DB
  qty: number;            // EXACT schema name
  unitCost: number;
  totalCost: number;
}

export default function Purchases() {
  const formRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loadingIngredients, setLoadingIngredients] = useState(true);
  const [formData, setFormData] = useState({
    ingredientName: '',
    ingredient_id: 0,
    qty: '',           // Make deletable - string for better UX
    unitCost: '',      // Make deletable - string for better UX  
    totalCost: 0,
  });
  // Suppliers removed from MVP
  const [batch, setBatch] = useState<PurchaseItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadIngredients();
    // Suppliers removed
  }, []);

  const loadIngredients = async () => {
    try {
      setLoadingIngredients(true);
      const data = await fetchIngredients();
      setIngredients(data);
    } catch (error: any) {
      console.error('Error loading ingredients:', error);
      toast.error('Failed to load ingredients');
    } finally {
      setLoadingIngredients(false);
    }
  };

  // loadSuppliers removed

  // Remove auto-rounding; compute raw value and display as-is
  const totalCost = Number(formData.qty || 0) * Number(formData.unitCost || 0);

  // Auto-scroll to form when editing
  useEffect(() => {
    if (editingId && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [editingId]);

  const handleIngredientSelect = async (ingredientName: string) => {
    const ingredient = ingredients.find(ing => ing.name === ingredientName);
    if (!ingredient) return;

    // Fetch avg_unit_cost from inventory_on_hand to autopopulate
    try {
      const { data, error } = await supabase
        .from('inventory_on_hand')
        .select('avg_unit_cost')
        .eq('ingredient_id', ingredient.id)
        .maybeSingle();

      const unitCost = data?.avg_unit_cost || 0;

      setFormData(prev => ({
        ...prev,
        ingredientName,
        ingredient_id: ingredient.id,
        unitCost: unitCost.toString(),
        totalCost: parseFloat(prev.qty) * unitCost,
      }));

      if (unitCost > 0) {
        toast.success(`Unit cost auto-filled: ${formatCurrency(unitCost)}`);
      }
    } catch (error: any) {
      console.error('Error fetching unit cost:', error);
      // Continue without autofill
      setFormData(prev => ({
        ...prev,
        ingredientName,
        ingredient_id: ingredient.id,
      }));
    }
  };

  const addToBatch = () => {
    const qtyNum = Number(formData.qty);
    const costNum = Number(formData.unitCost);
    
    if (!formData.ingredientName || !formData.ingredient_id || !formData.qty || qtyNum <= 0 || !formData.unitCost || costNum <= 0) {
      toast.error('Please fill all required fields with valid values');
      return;
    }

    const computedTotal = Number(formData.qty) * Number(formData.unitCost);

    const newItem: PurchaseItem = {
      id: editingId || Date.now().toString(),
      ingredient_id: formData.ingredient_id,
      ingredientName: formData.ingredientName,
      qty: qtyNum,
      unitCost: costNum,
      totalCost: computedTotal,
    };

    if (editingId) {
      setBatch(prev => prev.map(item => item.id === editingId ? newItem : item));
      setEditingId(null);
    } else {
      setBatch(prev => [...prev, newItem]);
    }

    setFormData({
      ingredientName: '',
      ingredient_id: 0,
      qty: '',
      unitCost: '',
      totalCost: 0,
    });
    toast.success('Purchase added to batch');
  };

  const editItem = (item: PurchaseItem) => {
    setFormData({
      ingredientName: item.ingredientName,
      ingredient_id: item.ingredient_id,
      qty: item.qty.toString(),
      unitCost: item.unitCost.toString(),
      totalCost: item.totalCost,
    });
    setEditingId(item.id);
  };

  const removeItem = (id: string) => {
    setBatch(prev => prev.filter(item => item.id !== id));
    toast.success('Purchase removed from batch');
  };

  const resetBatch = () => {
    setBatch([]);
    setFormData({
      ingredientName: '',
      ingredient_id: 0,
      qty: '',        // Make deletable
      unitCost: '',   // Make deletable
      totalCost: 0,
    });
    setEditingId(null);
    toast.success('Batch cleared');
  };

  const submitBatch = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);

    try {
      const purchaseDate = new Date().toISOString().split('T')[0];
      
      // Use RPC to handle purchases (respects RLS and triggers)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      const purchasesPayload = batch.map(item => {
        const recomputedTotal = Number(item.qty) * Number(item.unitCost);
        return {
          ingredient_id: item.ingredient_id,
          qty: item.qty,
          unit_cost: item.unitCost,
          total_cost: recomputedTotal,
          purchase_date: purchaseDate,
          created_by: authUser.id,
        };
      });

      // Call submit_staff_forms RPC with _form_type signature
      const { error } = await supabase.rpc('submit_staff_forms', {
        _form_type: 'purchase',
        _payload: purchasesPayload,
      });

      if (error) throw error;

      setShowSuccessModal(true);
      setBatch([]);
      setFormData({
        ingredientName: '',
        ingredient_id: 0,
        qty: '',        // Make deletable
        unitCost: '',   // Make deletable
        totalCost: 0,
      });
      toast.success(`${batch.length} purchase(s) logged successfully!`);
    } catch (error: any) {
      console.error('Error submitting purchases:', error);
      toast.error(error.message || 'Failed to submit purchases');
    } finally {
      setSubmitting(false);
    }
  };

  const totalBatchValue = batch.reduce((sum, item) => sum + item.totalCost, 0);

  if (loadingIngredients) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Inventory Purchases</h1>
          <p className="text-muted-foreground mt-1">Loading data...</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Inventory Purchases</h1>
        <p className="text-muted-foreground mt-1">
          Record ingredient purchases and update inventory
        </p>
      </div>

      {ingredients.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No ingredients available. Please add ingredients first in the Inventory section.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Purchase Form */}
        <Card className="shadow-card" ref={formRef}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {editingId ? 'Edit Purchase' : 'Add Purchase'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ingredientName">Ingredient Name *</Label>
              <Select value={formData.ingredientName} onValueChange={handleIngredientSelect} disabled={loadingIngredients || ingredients.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingIngredients ? "Loading..." : ingredients.length === 0 ? "No ingredients available" : "Select ingredient"} />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map((ingredient) => (
                    <SelectItem key={ingredient.id} value={ingredient.name}>
                      {ingredient.name} ({ingredient.base_unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity Purchased *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.qty || ''}
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => setFormData(prev => {
                    const raw = e.target.value;
                    const qty = raw === '' ? '' as any : Number(raw);
                    return {
                      ...prev,
                      qty,
                      totalCost: Number(qty || 0) * Number(prev.unitCost || 0),
                    };
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost *</Label>
                <Input
                  id="unitCost"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.unitCost || ''}
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => setFormData(prev => {
                    const raw = e.target.value;
                    const unitCost = raw === '' ? '' as any : Number(raw);
                    return {
                      ...prev,
                      unitCost,
                      totalCost: Number(prev.qty || 0) * Number(unitCost || 0),
                    };
                  })}
                />
              </div>
            </div>

            {/* Supplier selection removed per MVP scope */}

            <div className="space-y-2">
              <Label htmlFor="totalCost">Total Cost</Label>
              <Input
                id="totalCost"
                value={formatCurrencyDisplay(totalCost)}
                readOnly
                className="bg-muted"
              />
            </div>

            <Button onClick={addToBatch} className="w-full gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              {editingId ? 'Update Purchase' : 'Add to Batch'}
            </Button>
          </CardContent>
        </Card>

        {/* Batch Preview */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Batch Preview ({batch.length} purchases)</CardTitle>
            {batch.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Total Cost: <span className="font-semibold text-foreground">${totalBatchValue.toFixed(2)}</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {batch.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No purchases in batch. Add purchases using the form.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit Cost</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batch.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.ingredientName}</TableCell>
                          <TableCell>{item.qty}</TableCell>
                          <TableCell>${item.unitCost.toFixed(2)}</TableCell>
                          <TableCell>${item.totalCost.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => editItem(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => setShowConfirmModal(true)}
                    className="flex-1 gradient-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Submit All ({batch.length})</>
                    )}
                  </Button>
                  <Button variant="outline" onClick={resetBatch} disabled={submitting}>
                    Reset
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              You are about to submit {batch.length} purchase entries totaling ${totalBatchValue.toFixed(2)}. Proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button onClick={submitBatch} className="gradient-primary">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submission Successful</DialogTitle>
            <DialogDescription>
              All purchase entries submitted successfully.
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
  );
}