import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { fetchInventory } from '@/api/index';

export function InventoryAlerts() {
  const navigate = useNavigate();
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLowStockItems();
  }, []);

  const loadLowStockItems = async () => {
    try {
      setLoading(true);
      const inventory = await fetchInventory();
      const lowStock = inventory
        .filter((item: any) => (item.qty_on_hand ?? 0) < (item.reorder_point ?? 0))
        .sort((a: any, b: any) => (a.qty_on_hand ?? 0) - (b.qty_on_hand ?? 0));
      setLowStockItems(lowStock);
    } catch (error) {
      console.error('Error loading inventory alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

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
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.qty_on_hand} {item.base_unit} (Reorder at {item.reorder_point})
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => navigate('/inventory')}>
              View all
            </Button>
          </div>
        </>
      )}
    </div>
  );
}