import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { mockMenuItems } from '@/data/mockMenuItems';

interface AddCountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCount: (data: {
    date: string;
    itemName: string;
    quantity: number;
    unit: string;
    notes?: string;
  }) => void;
}

const UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'box', 'dozen'];

export function AddCountModal({
  open,
  onOpenChange,
  onAddCount,
}: AddCountModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSaveCount = () => {
    if (!itemName || !quantity || !unit) {
      return;
    }

    setSubmitting(true);
    // Simulate brief processing
    setTimeout(() => {
      onAddCount({
        date,
        itemName,
        quantity: parseFloat(quantity),
        unit,
        notes: notes || undefined,
      });

      // Reset form
      setDate(new Date().toISOString().split('T')[0]);
      setItemName('');
      setQuantity('');
      setUnit('kg');
      setNotes('');
      setSubmitting(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Stock Count</DialogTitle>
          <DialogDescription>
            Record a physical stock count for an item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Item Selector */}
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name</Label>
            <Select value={itemName} onValueChange={setItemName}>
              <SelectTrigger>
                <SelectValue placeholder="Select an item" />
              </SelectTrigger>
              <SelectContent>
                {mockMenuItems.map((item) => (
                  <SelectItem key={item.id} value={item.name}>
                    {item.name}
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
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* Unit Selector */}
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select value={unit} onValueChange={setUnit}>
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCount}
            className="gradient-primary"
            disabled={submitting || !itemName || !quantity || !unit}
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
  );
}