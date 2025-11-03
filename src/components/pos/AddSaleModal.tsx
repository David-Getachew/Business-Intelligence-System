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

interface AddSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItem: any;
  onAddToBuffer: (quantity: number, note?: string) => void;
}

export function AddSaleModal({
  open,
  onOpenChange,
  menuItem,
  onAddToBuffer,
}: AddSaleModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const handleAddToBuffer = () => {
    if (quantity <= 0) return;
    setSubmitting(true);
    setTimeout(() => {
      onAddToBuffer(quantity);
      setQuantity(1);
      setSubmitting(false);
    }, 300);
  };

  const quickAddQty = (qty: number) => {
    setQuantity(qty);
  };

  const subtotal = menuItem ? menuItem.price * quantity : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Sale</DialogTitle>
          <DialogDescription>
            Add {menuItem?.name} to your buffer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Name (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name</Label>
            <Input
              id="itemName"
              value={menuItem?.name || ''}
              readOnly
              className="bg-muted"
            />
          </div>

          {/* Price Display */}
          <div className="space-y-2">
            <Label>Price per Item</Label>
            <div className="text-2xl font-bold text-primary">
              {menuItem?.price.toFixed(2)} Birr
            </div>
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-lg"
            />
          </div>

          {/* Quick Add Buttons */}
          <div className="space-y-2">
            <Label>Quick Add</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickAddQty(1)}
                className={quantity === 1 ? 'ring-2 ring-primary' : ''}
              >
                ×1
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickAddQty(2)}
                className={quantity === 2 ? 'ring-2 ring-primary' : ''}
              >
                ×2
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickAddQty(5)}
                className={quantity === 5 ? 'ring-2 ring-primary' : ''}
              >
                ×5
              </Button>
            </div>
          </div>

          {/* Subtotal */}
          <div className="bg-secondary/50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-xl font-bold text-primary">
                {subtotal.toFixed(2)} Birr
              </span>
            </div>
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
            onClick={handleAddToBuffer}
            className="gradient-primary"
            disabled={submitting || quantity <= 0}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add to Buffer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}