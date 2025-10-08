import { useState } from 'react';
import { Package, AlertTriangle, History, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import { mockInventoryOnHand, mockInventoryMovements } from '@/mocks/inventory';
import { toast } from 'sonner';

export default function Inventory() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [reorderForm, setReorderForm] = useState({
    suggestedQty: 0,
    notes: '',
  });
  
  const [adjustForm, setAdjustForm] = useState({
    adjustQty: 0,
    reason: '',
  });

  const openReorderModal = (item: any) => {
    setSelectedItem(item);
    const suggestedQty = Math.max(item.reorder_point * 2, 10);
    setReorderForm({
      suggestedQty,
      notes: '',
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
    setSuccessMessage(`Reorder request submitted for ${selectedItem?.ingredient_name}`);
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
    if (item.qty_on_hand < item.reorder_point) return { status: 'Low Stock', variant: 'warning' as const };
    return { status: 'In Stock', variant: 'success' as const };
  };

  const itemMovements = mockInventoryMovements.filter(
    movement => movement.ingredient_id === selectedItem?.ingredient_id
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Inventory Overview</h1>
        <p className="text-muted-foreground mt-1">
          Monitor stock levels and manage inventory
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Current Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReorderModal(item)}
                          >
                            Reorder
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openHistoryModal(item)}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openAdjustModal(item)}
                          >
                            Adjust
                          </Button>
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

      {/* Reorder Modal */}
      <Dialog open={showReorderModal} onOpenChange={setShowReorderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reorder {selectedItem?.ingredient_name}</DialogTitle>
            <DialogDescription>
              Submit a reorder request for this ingredient
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
                onChange={(e) => setReorderForm(prev => ({ ...prev, suggestedQty: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Supplier Contact</Label>
              <Input value="Mock Supplier - (555) 123-4567" readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Optional notes for the supplier..."
                value={reorderForm.notes}
                onChange={(e) => setReorderForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReorderModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleReorder} className="gradient-primary">
              Submit Reorder Request
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
              <Textarea
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
  );
}