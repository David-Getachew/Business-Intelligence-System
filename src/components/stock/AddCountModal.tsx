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

interface Ingredient {
  id: number;
  name: string;
  base_unit: string;
}

interface AddCountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCount: (data: {
    ingredientId: number;
    ingredientName: string;
    quantity: number;
    unit: string;
    notes?: string;
  }) => void;
  ingredients: Ingredient[];
}

const UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'box', 'dozen'];

export function AddCountModal({
  open,
  onOpenChange,
  onAddCount,
  ingredients,
}: AddCountModalProps) {
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSaveCount = async () => {
    if (!selectedIngredientId || !quantity || !unit) {
      return;
    }

    const ingredient = ingredients.find(ing => ing.id.toString() === selectedIngredientId);
    if (!ingredient) return;

    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return;
    }

    setSubmitting(true);
    try {
      await onAddCount({
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        quantity: parsedQuantity,
        unit,
        notes: notes || undefined,
      });

      setSelectedIngredientId('');
      setQuantity('');
      setUnit('kg');
      setNotes('');
    } finally {
      setSubmitting(false);
    }
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
          {/* Item Selector */}
          <div className="space-y-2">
            <Label htmlFor="ingredient">Ingredient</Label>
            <Select value={selectedIngredientId} onValueChange={setSelectedIngredientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an ingredient" />
              </SelectTrigger>
              <SelectContent>
                {ingredients.map((ing) => (
                  <SelectItem key={ing.id} value={ing.id.toString()}>
                    {ing.name}
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
            disabled={submitting || !selectedIngredientId || !quantity || !unit}
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