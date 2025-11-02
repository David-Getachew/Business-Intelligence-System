import { Trash2, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface BufferItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

interface BufferPanelProps {
  items: BufferItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

export function BufferPanel({
  items,
  onRemove,
  onClear,
  onUpdateQuantity,
}: BufferPanelProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
    <Card className="shadow-card sticky top-6 lg:h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Buffer ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No items added yet</p>
              <p className="text-xs">Add items from the menu to get started</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="space-y-2 p-3 bg-secondary/30 rounded-lg">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                    {item.note && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {item.note}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(item.id)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Quantity and Price */}
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      onUpdateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-16 h-8 text-sm"
                  />
                  <span className="text-sm text-muted-foreground">×</span>
                  <span className="text-sm font-medium">{item.price.toFixed(2)} Birr</span>
                  <span className="ml-auto font-semibold text-primary">
                    {(item.price * item.quantity).toFixed(2)} Birr
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <>
            <Separator />

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{subtotal.toFixed(2)} Birr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span className="font-medium">{tax.toFixed(2)} Birr</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary text-lg">
                  {total.toFixed(2)} Birr
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button className="w-full gradient-primary" disabled>
                Confirm Sale
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={onClear}
              >
                Clear Buffer
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}