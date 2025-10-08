import { useState } from 'react';
import { Plus, Edit, Trash2, Receipt } from 'lucide-react';
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
import { toast } from 'sonner';

interface ExpenseItem {
  id: string;
  category: string;
  subcategory: string;
  amount: number;
  notes: string;
}

const expenseCategories = {
  'Labor': ['Salary', 'Overtime', 'Benefits', 'Training'],
  'Rent': ['Monthly Rent', 'Security Deposit', 'Property Tax'],
  'Utilities': ['Electricity', 'Water', 'Gas', 'Internet', 'Phone'],
  'Supplies': ['Kitchen Supplies', 'Cleaning Supplies', 'Office Supplies'],
  'Other': ['Insurance', 'Legal', 'Accounting', 'Marketing', 'Maintenance'],
};

export default function Expenses() {
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    amount: 0,
    notes: '',
  });
  const [batch, setBatch] = useState<ExpenseItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const subcategoryOptions = formData.category ? expenseCategories[formData.category as keyof typeof expenseCategories] || [] : [];

  const addToBatch = () => {
    if (!formData.category || formData.amount <= 0) {
      toast.error('Please select a category and enter a valid amount');
      return;
    }

    const newItem: ExpenseItem = {
      id: editingId || Date.now().toString(),
      category: formData.category,
      subcategory: formData.subcategory,
      amount: formData.amount,
      notes: formData.notes,
    };

    if (editingId) {
      setBatch(prev => prev.map(item => item.id === editingId ? newItem : item));
      setEditingId(null);
    } else {
      setBatch(prev => [...prev, newItem]);
    }

    setFormData({
      category: '',
      subcategory: '',
      amount: 0,
      notes: '',
    });
    toast.success('Expense added to batch');
  };

  const editItem = (item: ExpenseItem) => {
    setFormData({
      category: item.category,
      subcategory: item.subcategory,
      amount: item.amount,
      notes: item.notes,
    });
    setEditingId(item.id);
  };

  const removeItem = (id: string) => {
    setBatch(prev => prev.filter(item => item.id !== id));
    toast.success('Expense removed from batch');
  };

  const resetBatch = () => {
    setBatch([]);
    setFormData({
      category: '',
      subcategory: '',
      amount: 0,
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
        category: '',
        subcategory: '',
        amount: 0,
        notes: '',
      });
    }, 1000);
  };

  const totalBatchValue = batch.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Operational Expenses</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage business operational expenses
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expense Form */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              {editingId ? 'Edit Expense' : 'Add Expense'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Expense Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value, subcategory: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(expenseCategories).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory / Details</Label>
              <Select 
                value={formData.subcategory} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory: value }))}
                disabled={!formData.category}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.category ? "Select subcategory" : "Select category first"} />
                </SelectTrigger>
                <SelectContent>
                  {subcategoryOptions.map((subcategory) => (
                    <SelectItem key={subcategory} value={subcategory}>
                      {subcategory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Optional notes about this expense..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <Button onClick={addToBatch} className="w-full gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              {editingId ? 'Update Expense' : 'Add to Batch'}
            </Button>
          </CardContent>
        </Card>

        {/* Batch Preview */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Batch Preview ({batch.length} expenses)</CardTitle>
            {batch.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Total Amount: <span className="font-semibold text-foreground">${totalBatchValue.toFixed(2)}</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {batch.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No expenses in batch. Add expenses using the form.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Subcategory</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batch.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.category}</TableCell>
                          <TableCell>{item.subcategory || '-'}</TableCell>
                          <TableCell>${item.amount.toFixed(2)}</TableCell>
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
              You are about to submit {batch.length} expense entries totaling ${totalBatchValue.toFixed(2)}. Proceed?
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
              All expense entries submitted successfully.
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