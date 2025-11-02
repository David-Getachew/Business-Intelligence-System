import { useState, useRef, useEffect } from 'react';
import { Plus, Edit, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
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
import { fetchMenuItems, processSale } from '@/api/index';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatCurrencyDisplay } from '@/utils/formatCurrency';
import { toast } from 'sonner';

interface SaleItem {
  id: string;
  menu_item_id: number;  // INTEGER per schema
  itemName: string;
  qty: number;           // EXACT schema name
  unitPrice: number;
  lineTotal: number;
}

export default function QuickSales() {
  const formRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [formData, setFormData] = useState({
    itemName: '',
    menu_item_id: 0,
    qty: '',
    unitPrice: '',
  });
  const [batch, setBatch] = useState<SaleItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInsufficientStockModal, setShowInsufficientStockModal] = useState(false);
  const [insufficientStockMessage, setInsufficientStockMessage] = useState('');
  const [shortages, setShortages] = useState<Array<{ ingredient: string; shortage: number; available: number; required: number; ingredient_id?: number }>>([]);  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoadingMenu(true);
      const items = await fetchMenuItems();
      setMenuItems(items.filter((item: any) => item.active));
    } catch (error: any) {
      console.error('Error loading menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoadingMenu(false);
    }
  };

  const selectedItem = menuItems.find(item => item.name === formData.itemName);
  const qtyNum = Number(formData.qty) || 0;
  const priceNum = parseFloat(formData.unitPrice) || 0;
  const lineTotal = qtyNum * priceNum;

  useEffect(() => {
    if (editingId && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [editingId]);

  const handleItemSelect = (itemName: string) => {
    const item = menuItems.find(item => item.name === itemName);
    setFormData(prev => ({
      ...prev,
      itemName,
      menu_item_id: item?.id || 0,
      unitPrice: item?.price?.toString() || '0',
    }));
  };

  const addToBatch = () => {
    const qtyNum = Number(formData.qty);
    const priceNum = Number(formData.unitPrice);
    const calculatedTotal = qtyNum * priceNum;
    
    if (!formData.itemName || !formData.menu_item_id || qtyNum <= 0 || priceNum <= 0) {
      toast.error('Please fill all required fields with valid values');
      return;
    }

    const newItem: SaleItem = {
      id: editingId || Date.now().toString(),
      menu_item_id: formData.menu_item_id,
      itemName: formData.itemName,
      qty: qtyNum,
      unitPrice: priceNum,
      lineTotal: calculatedTotal,
    };

    if (editingId) {
      setBatch(prev => prev.map(item => item.id === editingId ? newItem : item));
      setEditingId(null);
    } else {
      setBatch(prev => [...prev, newItem]);
    }

          setFormData({
      itemName: '',
      menu_item_id: 0,
      qty: '',
      unitPrice: '',
    });
    toast.success('Item added to batch');
  };

  const editItem = (item: SaleItem) => {
    setFormData({
      itemName: item.itemName,
      menu_item_id: item.menu_item_id,
      qty: item.qty.toString(),
      unitPrice: item.unitPrice.toString(),
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
      menu_item_id: 0,
      qty: '',
      unitPrice: '',
    });
    setEditingId(null);
    toast.success('Batch cleared');
  };

  const submitBatch = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);

    try {
      const saleDate = new Date().toISOString();

      // EXACT schema payload - no subtotal, tax, or menu_item_name
      await processSale({
        sale_date: saleDate,
        items: batch.map(item => ({
          menu_item_id: item.menu_item_id,  // INTEGER
          qty: item.qty,                     // NOT quantity
          unit_price: item.unitPrice,
        })),
      });

      setShowSuccessModal(true);
      setBatch([]);
      setFormData({
        itemName: '',
        menu_item_id: 0,
        qty: '',
        unitPrice: '',
      });
      toast.success('Sales batch processed successfully!');
    } catch (error: any) {
      console.error('Error processing sale:', error);
      const msg = error.message || '';
      if (msg.toLowerCase().includes('insufficient_stock') || msg.toLowerCase().includes('insufficient stock')) {
        setInsufficientStockMessage('Insufficient stock for one or more ingredients');
        try {
          // Parse the JSON array from the error message
          // Format: "insufficient_stock: [{"on_hand": "-87", "required": "50", "ingredient_id": 4}]"
          const jsonStart = msg.indexOf('[');
          const jsonEnd = msg.lastIndexOf(']') + 1;
          if (jsonStart !== -1 && jsonEnd > jsonStart) {
            const jsonStr = msg.substring(jsonStart, jsonEnd);
            const parsed = JSON.parse(jsonStr);
            if (Array.isArray(parsed)) {
              // Map the parsed data to our shortage format
              const shortageData = parsed.map((item: any) => {
                const required = Number(item.required || 0);
                const onHand = Number(item.on_hand || 0);
                const shortage = Math.max(0, required - onHand);
                
                return {
                  ingredient_id: item.ingredient_id,
                  ingredient: `Ingredient ${item.ingredient_id}`, // Will be replaced with actual name
                  available: onHand,
                  required: required,
                  shortage: shortage
                };
              });
              
              setShortages(shortageData);
              
              // Fetch ingredient names for better display
              if (shortageData.length > 0) {
                const ingredientIds = shortageData.map(s => s.ingredient_id);
                try {
                  const { data: ingredients } = await supabase
                    .from('ingredients')
                    .select('id, name')
                    .in('id', ingredientIds);
                  
                  if (ingredients) {
                    const nameMap = new Map(ingredients.map(i => [i.id, i.name]));
                    setShortages(prev => prev.map(s => ({
                      ...s,
                      ingredient: nameMap.get(s.ingredient_id) || `Ingredient ${s.ingredient_id}`
                    })));
                  }
                } catch (fetchError) {
                  console.warn('Failed to fetch ingredient names:', fetchError);
                }
              }
            }
          }
        } catch (parseError) {
          console.warn('Failed to parse insufficient stock details:', parseError);
          setShortages([]);
        }
        setShowInsufficientStockModal(true);
      } else if (msg.toLowerCase().includes('ambiguous') || msg.toLowerCase().includes('column reference')) {
        toast.error('Sale processing failed due to database ambiguity—please verify menu item IDs.');
      } else {
        toast.error(msg || 'Failed to process sale');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const totalBatchValue = batch.reduce((sum, item) => sum + item.lineTotal, 0);

  if (loadingMenu) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Quick Sales</h1>
          <p className="text-muted-foreground mt-1">Loading menu items...</p>
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
        <h1 className="text-3xl font-heading font-bold">Quick Sales</h1>
        <p className="text-muted-foreground mt-1">
          Process sales transactions quickly and efficiently
        </p>
      </div>

      {menuItems.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No active menu items available. Please add menu items first in the Menu & Recipes section.
            </p>
          </CardContent>
        </Card>
      )}

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
              <Select value={formData.itemName} onValueChange={handleItemSelect} disabled={menuItems.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder={menuItems.length === 0 ? "No menu items available" : "Select menu item"} />
                </SelectTrigger>
                <SelectContent>
                  {menuItems.map((item) => (
                    <SelectItem key={item.id} value={item.name}>
                      {item.name} - {formatCurrency(item.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qty">Quantity *</Label>
                <Input
                  id="qty"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.qty}
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => {
                    const v = e.target.value;
                    // allow empty while typing
                    if (v === '') { setFormData(prev => ({ ...prev, qty: v })); return; }
                    // reject decimals inline
                    if (v.includes('.') || v.includes(',')) {
                      toast.error('Quantity must be a whole number');
                      return;
                    }
                    setFormData(prev => ({ ...prev, qty: v }));
                  }}
                  placeholder="0"
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
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lineTotal">Line Total</Label>
              <Input
                id="lineTotal"
                value={formatCurrencyDisplay(lineTotal)}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label>Created By</Label>
              <Input value={user?.email || 'Current User'} readOnly className="bg-muted" />
            </div>

            <Button onClick={addToBatch} className="w-full gradient-primary" disabled={menuItems.length === 0}>
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
                Total Value: <span className="font-semibold text-foreground">{formatCurrency(totalBatchValue)}</span>
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
                          <TableCell>{item.qty}</TableCell>
                          <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell>{formatCurrency(item.lineTotal)}</TableCell>
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

      {/* Insufficient Stock Modal */}
      <Dialog open={showInsufficientStockModal} onOpenChange={setShowInsufficientStockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insufficient Stock</DialogTitle>
            <DialogDescription>
              {insufficientStockMessage || 'Some items do not have enough stock to complete this sale.'}
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

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              You are about to submit {batch.length} sales entries totaling {formatCurrency(totalBatchValue)}. Proceed?
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