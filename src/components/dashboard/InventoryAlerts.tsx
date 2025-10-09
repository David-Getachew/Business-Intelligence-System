import { AlertTriangle } from 'lucide-react';
import { mockInventoryOnHand } from '@/mocks/inventory';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function InventoryAlerts() {
  const navigate = useNavigate();
  
  // Get items below reorder point
  const lowStockItems = mockInventoryOnHand
    .filter(item => item.qty_on_hand < item.reorder_point)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {lowStockItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">All items are well stocked</p>
      ) : (
        <>
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div
                key={item.ingredient_id}
                className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
              >
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.ingredient_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.qty_on_hand} {item.unit} (Reorder at {item.reorder_point})
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => navigate('/inventory')}
          >
            View All Inventory
          </Button>
        </>
      )}
    </div>
  );
}