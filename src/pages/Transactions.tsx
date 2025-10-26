import { useState, useEffect } from 'react';
import { FileText, Edit, Eye, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { fetchSales, fetchPurchases, fetchExpenses } from '@/api/index';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/utils/formatCurrency';
import { toast } from 'sonner';

export default function Transactions() {
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInsufficientStockModal, setShowInsufficientStockModal] = useState(false);
  const [insufficientStockMessage, setInsufficientStockMessage] = useState('');
  const [shortages, setShortages] = useState<any[]>([]);
  const [editForm, setEditForm] = useState<any>({});
  const [transactionType, setTransactionType] = useState('');
  const [sales, setSales] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [page, setPage] = useState({ sales: 1, purchases: 1, expenses: 1 });
  const pageSize = 10;

  useEffect(() => {
    loadAllTransactions();
  }, [dateRange]);

  const loadAllTransactions = async () => {
    try {
      setLoading(true);
      const { start, end } = computeRange();
      const [salesData, purchasesData, expensesData] = await Promise.all([
        fetchSales({ start_date: start, end_date: end }),
        fetchPurchases({ start_date: start, end_date: end }),
        fetchExpenses({ start_date: start, end_date: end }),
      ]);
      setSales(salesData);
      setPurchases(purchasesData);
      setExpenses(expensesData);
      setPage({ sales: 1, purchases: 1, expenses: 1 });
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const computeRange = () => {
    const now = new Date();
    const endDate = dateRange.end || new Date().toISOString().split('T')[0];
    const startDate = dateRange.start || '2020-01-01'; // All time default
    return { start: startDate, end: endDate };
  };

  const formatShort = (iso?: string) => {
    if (!iso) return '-';
    try {
      return format(new Date(iso), 'MMM d, h:mm a');
    } catch {
      return iso;
    }
  };

  const renderPagination = (type: 'sales' | 'purchases' | 'expenses', total: number) => {
    const current = page[type];
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return (
      <div className="flex items-center justify-end gap-2 mt-3">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => setPage(prev => ({ ...prev, [type]: Math.max(1, current - 1) }))}
          disabled={current <= 1}
        >
          Prev
        </button>
        <span className="text-sm text-muted-foreground">Page {current} of {totalPages}</span>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => setPage(prev => ({ ...prev, [type]: Math.min(totalPages, current + 1) }))}
          disabled={current >= totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  const openEditModal = async (transaction: any, type: string) => {
    setSelectedTransaction(transaction);
    setTransactionType(type);
    
    if (type === 'sale') {
      try {
        // Fetch full sale_line_items row to ensure we have menu_item_id
        const { data: fullRow, error } = await supabase!
          .from('sale_line_items')
          .select('*')
          .eq('id', transaction.id)
          .single();

        if (error) {
          console.error('Error fetching sale line item:', error);
          toast.error('Failed to load sale details');
          return;
        }

        // Pre-fill sales form with existing values and calculate line_total
        const qty = Number(fullRow.qty || 0);
        const unitPrice = Number(fullRow.unit_price || 0);
        
        
        setEditForm({
          id: fullRow.id, // This is the sale_line_items.id (transactionId)
          menu_item_id: fullRow.menu_item_id,
          menu_item: transaction.menu_item, // Keep display name from original transaction
          qty: qty,
          unit_price: unitPrice,
          line_total: qty * unitPrice,
          sale_date: fullRow.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        });
      } catch (error) {
        console.error('Error in openEditModal:', error);
        toast.error('Failed to load sale details');
        return;
      }
    } else {
    setEditForm({ ...transaction });
    }
    setShowEditModal(true);
  };

  const openViewModal = (transaction: any, type: string) => {
    setSelectedTransaction(transaction);
    setTransactionType(type);
    setShowViewModal(true);
  };

  const handleSave = async () => {
    try {
      if (!selectedTransaction) return;
      if (transactionType === 'sale') {
        // Use the sale_line_items.id as _line_id
        const transactionId = editForm.id;
        const menuItemId = Number(editForm.menu_item_id);
        
        // Verify menu_item_id is valid before calling RPC
        if (!menuItemId || menuItemId === 0) {
          throw new Error('Invalid menu item ID. Cannot update sale.');
        }
        
        // Send the full payload with all required fields
        const payload = {
          menu_item_id: menuItemId, // integer FK from sale_line_items
          qty: Number(editForm.qty) || 0, // numeric, updated quantity
          unit_price: Number(editForm.unit_price) || 0, // numeric
          sale_date: editForm.sale_date, // string/date
        };
        
        
        
        const { data, error } = await supabase!.rpc('update_sale_line_item', { _line_id: transactionId, _payload: payload });
        
        if (data) {
          // Check if the response indicates insufficient stock
          if (data.status === 'error' && data.message?.includes('Insufficient stock')) {
            setInsufficientStockMessage(data.message);
            if (Array.isArray(data.details)) {
              setShortages(data.details.map((item: any) => ({
                ingredient_id: item.ingredient_id,
                ingredient: item.ingredient_name || `Ingredient ${item.ingredient_id}`,
                available: Number(item.available_qty || 0),
                required: Number(item.needed_qty || 0),
                shortage: Math.max(0, Number(item.needed_qty || 0) - Number(item.available_qty || 0))
              })));
            }
            setShowInsufficientStockModal(true);
            return; // Don't show success toast
          }
        }
        if (error) throw error;
      } else if (transactionType === 'purchase') {
        const purchaseId = editForm.id;
        // Build RPC payload with simplified structure for update_purchase
        const qty = Number(editForm.quantity ?? editForm.qty ?? 0);
        const unitCost = Number(editForm.unit_cost ?? 0);
        const totalCost = Number(editForm.total_cost ?? (qty * unitCost));

        const payload = {
          qty: qty,
          unit_cost: unitCost,
          total_cost: totalCost,
        };
        const { error } = await supabase!.rpc('update_purchase', { _purchase_id: purchaseId, _payload: payload });
        if (error) throw error;
      } else if (transactionType === 'expense') {
        const expenseId = editForm.id;
        const payload = { ...editForm };
        delete payload.id; delete payload.created_at; delete payload.created_by;
        const { error } = await supabase!.rpc('update_expense', { _expense_id: expenseId, _payload: payload });
        if (error) throw error;
      }

    setShowEditModal(false);
      await loadAllTransactions();
      setShowSuccessModal(true);
      setSelectedTransaction(null);
      setEditForm({});
    } catch (e: any) {
      console.error('Edit save failed:', e);
      toast.error(e.message || 'Failed to save changes');
    }
  };

  const formatDateTime = (iso: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${dd}-${mm}-${yyyy} ${hours}:${minutes} ${ampm}`;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold">Transactions</h1>
              <p className="text-muted-foreground mt-1">
                View and manage all business transactions
              </p>
            </div>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sales" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger 
                  value="sales" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Sales
                </TabsTrigger>
                <TabsTrigger 
                  value="purchases" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Purchases
                </TabsTrigger>
                <TabsTrigger 
                  value="expenses" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Expenses
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sales" className="space-y-4">
                {sales.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No sales transactions for the selected date. Log sales to track revenue.
                    </AlertDescription>
                  </Alert>
                ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Menu Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales.slice((page.sales-1)*pageSize, page.sales*pageSize).map((sale) => (
                        <TableRow key={sale.id}>
                            <TableCell>{formatShort(sale.created_at || sale.sale_date)}</TableCell>
                          <TableCell className="font-medium">{sale.menu_item}</TableCell>
                          <TableCell>{sale.quantity}</TableCell>
                          <TableCell>{formatCurrency(sale.total)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openViewModal(sale, 'sale')}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>See details</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditModal(sale, 'sale')}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit transaction</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                    {renderPagination('sales', sales.length)}
                </div>
                )}
              </TabsContent>

              <TabsContent value="purchases" className="space-y-4">
                {purchases.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No purchase transactions for the selected date. Log purchases to track inventory and costs.
                    </AlertDescription>
                  </Alert>
                ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total Cost</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases.slice((page.purchases-1)*pageSize, page.purchases*pageSize).map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell>{formatShort(purchase.created_at || purchase.purchase_date)}</TableCell>
                          <TableCell className="font-medium">{purchase.ingredient}</TableCell>
                          <TableCell>{purchase.quantity}</TableCell>
                          <TableCell>{formatCurrency(purchase.total_cost)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openViewModal(purchase, 'purchase')}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>See details</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditModal(purchase, 'purchase')}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit transaction</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {renderPagination('purchases', purchases.length)}
                </div>
                )}
              </TabsContent>

              <TabsContent value="expenses" className="space-y-4">
                {expenses.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No expense transactions for the selected date. Log expenses to track operating costs.
                    </AlertDescription>
                  </Alert>
                ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Reference</TableHead>
                        {/* Notes column removed from default view */}
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.slice((page.expenses-1)*pageSize, page.expenses*pageSize).map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{formatShort(expense.created_at || expense.expense_date)}</TableCell>
                          <TableCell className="font-medium">{expense.category}</TableCell>
                          <TableCell>{formatCurrency(expense.amount)}</TableCell>
                          <TableCell>{expense.reference || '-'}</TableCell>
                          {/* Notes column removed from default view */}
                          <TableCell>
                            <div className="flex gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openViewModal(expense, 'expense')}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>See details</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditModal(expense, 'expense')}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit transaction</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {renderPagination('expenses', expenses.length)}
                </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* View Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>View {transactionType}</DialogTitle>
              <DialogDescription>
                Transaction details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedTransaction && (
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedTransaction).map(([key, value]) => {
                    // Remove unwanted fields from sales detailed view
                    if (transactionType === 'sale' && (key === 'sale_date' || key === 'sale_id' || key === 'menu_item_id')) {
                      return null;
                    }
                    
                    // Customize field labels
                    let displayKey = key.replace('_', ' ');
                    if (key === 'user_name') {
                      displayKey = 'Created By';
                    }
                    
                    return (
                    <div key={key} className="space-y-1">
                      <Label className="text-sm font-medium capitalize">
                          {displayKey}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                          {typeof value === 'number' && (key.includes('price') || key.includes('cost') || key.includes('amount') || key.includes('total'))
                          ? `$${(value as number).toFixed(2)}`
                            : key === 'created_at' && typeof value === 'string'
                            ? formatShort(value)
                          : String(value)}
                      </p>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowViewModal(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit {transactionType}</DialogTitle>
              <DialogDescription>
                Modify transaction details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedTransaction && transactionType === 'sale' ? (
                // Special handling for sales with live line_total calculation
                <>
                  <div className="space-y-2">
                    <Label htmlFor="sale_date">Sale Date</Label>
                    <Input
                      id="sale_date"
                      type="date"
                      value={editForm.sale_date || ''}
                      onChange={(e) => setEditForm((prev: any) => ({ ...prev, sale_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="menu_item">Menu Item</Label>
                    <Input
                      id="menu_item"
                      type="text"
                      value={editForm.menu_item || 'Unknown'}
                      readOnly
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Menu item cannot be changed</p>
                    {/* Hidden field to preserve menu_item_id */}
                    <input
                      type="hidden"
                      value={editForm.menu_item_id || ''}
                      onChange={(e) => setEditForm((prev: any) => ({ ...prev, menu_item_id: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qty">Quantity</Label>
                    <Input
                      id="qty"
                      type="number"
                      step="1"
                      value={editForm.qty || ''}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) => {
                        const qty = parseFloat(e.target.value) || 0;
                        const unitPrice = parseFloat(editForm.unit_price) || 0;
                        setEditForm((prev: any) => ({ 
                          ...prev, 
                          qty, 
                          line_total: qty * unitPrice 
                        }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit_price">Unit Price</Label>
                    <Input
                      id="unit_price"
                      type="number"
                      step="0.01"
                      value={editForm.unit_price || ''}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) => {
                        const unitPrice = parseFloat(e.target.value) || 0;
                        const qty = parseFloat(editForm.qty) || 0;
                        setEditForm((prev: any) => ({ 
                          ...prev, 
                          unit_price: unitPrice,
                          line_total: qty * unitPrice 
                        }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="line_total">Line Total (calculated)</Label>
                    <Input
                      id="line_total"
                      type="number"
                      step="0.01"
                      value={editForm.line_total || ''}
                      onWheel={(e) => e.currentTarget.blur()}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </>
              ) : selectedTransaction && Object.entries(editForm).map(([key, value]) => {
                if (key === 'id') return null;
                
                // Hide certain fields in edit modals
                if (transactionType === 'expense' && (key === 'created_by' || key === 'created_at' || key === 'user_name')) {
                  return null;
                }
                
                if (transactionType === 'purchase' && (key === 'created_at' || key === 'user_name' || key === 'ingredient')) {
                  return null;
                }
                
                // Make ingredient name read-only for purchases
                if (transactionType === 'purchase' && key === 'ingredient') {
                  return (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key} className="capitalize">
                        {key.replace('_', ' ')}
                      </Label>
                      <Input
                        id={key}
                        type="text"
                        value={value as string}
                        readOnly
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Ingredient cannot be changed</p>
                    </div>
                  );
                }
                
                return (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="capitalize">
                      {key.replace('_', ' ')}
                    </Label>
                    <Input
                      id={key}
                      type={typeof value === 'number' ? 'number' : 'text'}
                      value={value as string | number}
                      onChange={(e) => setEditForm((prev: any) => ({
                        ...prev,
                        [key]: typeof value === 'number' 
                          ? parseFloat(e.target.value) || 0 
                          : e.target.value
                      }))}
                    />
                  </div>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="gradient-primary">
                Save Changes
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
                Transaction updated successfully.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowSuccessModal(false)} className="gradient-primary">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Insufficient Stock Modal */}
        <Dialog open={showInsufficientStockModal} onOpenChange={setShowInsufficientStockModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insufficient Stock</DialogTitle>
              <DialogDescription>
                {insufficientStockMessage || 'Some items do not have enough stock to complete this edit.'}
              </DialogDescription>
            </DialogHeader>
            {shortages.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Shortage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shortages.map((s, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{s.ingredient}</TableCell>
                        <TableCell className={s.available < 0 ? "text-red-600" : ""}>
                          {s.available.toFixed(2)}
                        </TableCell>
                        <TableCell>{s.required.toFixed(2)}</TableCell>
                        <TableCell className="text-red-600 font-semibold">
                          {s.shortage.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setShowInsufficientStockModal(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}