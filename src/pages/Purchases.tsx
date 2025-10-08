import { useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { mockIngredients } from '@/mocks/ingredients';
import { toast } from 'sonner';

interface PurchaseItem {
  id: string;
  ingredientName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  notes: string;
}

export default function Purchases() {
  const [formData, setFormData] = useState({
    ingredientName: '',
    quantity: 1,
    unitCost: 0,
    notes: '',
  });
  const [batch, setBatch] = useState<PurchaseItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const totalCost = formData.quantity * formData.unitCost;

  const addToBatch = () => {
    if (!formData.ingredientName || formData.quantity <= 0 || formData.unitCost <= 0) {
      toast.error('Please fill all required fields with valid values');
      return;
    }

    const newItem: PurchaseItem = {
      id: editingId || Date.now().toString(),
      ingredientName: formData.ingredientName,
      quantity: formData.quantity,
      unitCost: formData.unitCost,
      totalCost: totalCost,
      notes: formData.notes,
    };

    if (editingId) {
      setBatch(prev => prev.map(item => item.id === editingId ? newItem : item));
      setEditingId(null);
    } else {
      setBatch(prev => [...prev, newItem]);
    }

    setFormData({
      ingredientName: '',
      quantity: 1,
      unitCost: 0,
      notes: '',
    });
    toast.success('Purchase added to batch');
  };

  const editItem = (item: PurchaseItem) => {
    setFormData({
      ingredientName: item.ingredientName,
      quantity: item.quantity,
      unitCost: item.unitCost,
      notes: item.notes,
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
      quantity: 1,
      unitCost: 0,
      notes: '',
    });
    setEditingId(null);
    toast.success('Batch cleared');
  };

  const submitBatch = () => {
    setShowConfirmModal(false);
    // Mock API call
    setTimeout(() => {
      setShowSuccessModal(true);
      setBatch([]);
      setFormData({
        ingredientName: '',
        quantity: 1,
        unitCost: 0,
        notes: '',
      });
    }, 1000);
  };

  const totalBatchValue = batch.reduce((sum, item) => sum + item.totalCost, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Inventory Purchases</h1>
        <p className="text-muted-foreground mt-1">
          Record ingredient purchases and update inventory
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Purchase Form */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {editingId ? 'Edit Purchase' : 'Add Purchase'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ingredientName">Ingredient Name *</Label>
              <Select value={formData.ingredientName} onValueChange={(value) => setFormData(prev => ({ ...prev, ingredientName: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ingredient" />
                </SelectTrigger>
                <SelectContent>
                  {mockIngredients.map((ingredient) => (
                    <SelectItem key={ingredient.id} value={ingredient.name}>
                      {ingredient.name} ({ingredient.unit})
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
                  min="0.01"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 1 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost *</Label>
                <Input
                  id="unitCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitCost}
                  onChange={(e) => setFormData(prev => ({ ...prev, unitCost: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalCost">Total Cost</Label>
              <Input
                id="totalCost"
                value={`$${totalCost.toFixed(2)}`}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Optional notes about this purchase..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
                          <TableCell>{item.quantity}</TableCell>
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
                  >
                    Submit All ({batch.length})
                  </Button>
                  <Button variant="outline" onClick={resetBatch}>
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