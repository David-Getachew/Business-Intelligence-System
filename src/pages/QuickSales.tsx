import { useState, useRef, useEffect } from 'react';
import { Plus, Edit, Trash2, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { mockMenuItems } from '@/mocks/menuItems';
import { toast } from 'sonner';

interface SaleItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export default function QuickSales() {
  const formRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: 1,
    unitPrice: 0,
  });
  const [batch, setBatch] = useState<SaleItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const selectedItem = mockMenuItems.find(item => item.name === formData.itemName);
  const lineTotal = formData.quantity * formData.unitPrice;

  // Auto-scroll to form when editing
  useEffect(() => {
    if (editingId && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [editingId]);

  const handleItemSelect = (itemName: string) => {
    const item = mockMenuItems.find(item => item.name === itemName);
    setFormData(prev => ({
      ...prev,
      itemName,
      unitPrice: item?.price || 0,
    }));
  };

  const addToBatch = () => {
    if (!formData.itemName || formData.quantity <= 0 || formData.unitPrice <= 0) {
      toast.error('Please fill all required fields with valid values');
      return;
    }

    const newItem: SaleItem = {
      id: editingId || Date.now().toString(),
      itemName: formData.itemName,
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      lineTotal: lineTotal,
    };

    if (editingId) {
      setBatch(prev => prev.map(item => item.id === editingId ? newItem : item));
      setEditingId(null);
    } else {
      setBatch(prev => [...prev, newItem]);
    }

    setFormData({
      itemName: '',
      quantity: 1,
      unitPrice: 0,
    });
    toast.success('Item added to batch');
  };

  const editItem = (item: SaleItem) => {
    setFormData({
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    });
    setEditingId(item.id);
  };

  const removeItem = (id: string) => {
    setBatch(prev => prev.filter(item => item.id !== id));
    toast.success('Item removed from batch');
  };

  const resetBatch = () => {
    setBatch([]);
    setFormData({
      itemName: '',
      quantity: 1,
      unitPrice: 0,
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
        itemName: '',
        quantity: 1,
        unitPrice: 0,
      });
    }, 1000);
  };

  const totalBatchValue = batch.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Quick Sales</h1>
        <p className="text-muted-foreground mt-1">
          Process sales transactions quickly and efficiently
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Form */}
        <Card className="shadow-card" ref={formRef}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {editingId ? 'Edit Sale Item' : 'Add Sale Item'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name *</Label>
              <Select value={formData.itemName} onValueChange={handleItemSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select menu item" />
                </SelectTrigger>
                <SelectContent>
                  {mockMenuItems.map((item) => (
                    <SelectItem key={item.id} value={item.name}>
                      {item.name} - ${item.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lineTotal">Line Total</Label>
              <Input
                id="lineTotal"
                value={`$${lineTotal.toFixed(2)}`}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label>Created By</Label>
              <Input value="Sarah Johnson (Owner)" readOnly className="bg-muted" />
            </div>

            <Button onClick={addToBatch} className="w-full gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              {editingId ? 'Update Item' : 'Add to Batch'}
            </Button>
          </CardContent>
        </Card>

        {/* Batch Preview */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Batch Preview ({batch.length} items)</CardTitle>
            {batch.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Total Value: <span className="font-semibold text-foreground">${totalBatchValue.toFixed(2)}</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {batch.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items in batch. Add items using the form.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batch.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.itemName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell>${item.lineTotal.toFixed(2)}</TableCell>
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
              You are about to submit {batch.length} sales entries totaling ${totalBatchValue.toFixed(2)}. Proceed?
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
              All sales entries submitted successfully.
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