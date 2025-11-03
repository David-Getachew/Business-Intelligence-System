import { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Trash2, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MenuItemCard } from '@/components/pos/MenuItemCard';
import { AddSaleModal } from '@/components/pos/AddSaleModal';
import { BufferPanel } from '@/components/pos/BufferPanel';
import { fetchMenuItems } from '@/api/index';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface BufferItem {
  id: string;
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  taxRate?: number;
}

export default function POSSale() {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [bufferItems, setBufferItems] = useState<BufferItem[]>([]);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const items = await fetchMenuItems();
      setMenuItems(items.filter((item: any) => item.active));
    } catch (error: any) {
      console.error('Error loading menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenuItem = (menuItem: any) => {
    setSelectedMenuItem(menuItem);
    setShowAddModal(true);
  };

  const handleAddToBuffer = (quantity: number) => {
    if (!selectedMenuItem || quantity <= 0) return;

    const newItem: BufferItem = {
      id: `${selectedMenuItem.id}-${Date.now()}`,
      menuItemId: selectedMenuItem.id,
      name: selectedMenuItem.name,
      price: selectedMenuItem.price,
      quantity,
      taxRate: selectedMenuItem.tax_rate,
    };

    setBufferItems([...bufferItems, newItem]);
    setShowAddModal(false);
    setSelectedMenuItem(null);
  };

  const handleRemoveFromBuffer = (id: string) => {
    setBufferItems(bufferItems.filter(item => item.id !== id));
  };

  const handleClearBuffer = () => {
    setBufferItems([]);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromBuffer(id);
      return;
    }
    setBufferItems(
      bufferItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleConfirmSale = async () => {
    if (!user) {
      toast.error('You must be authenticated to confirm a sale');
      return;
    }
    if (bufferItems.length === 0) {
      toast.error('Add items to the buffer before confirming a sale');
      return;
    }
    setSubmitting(true);
    try {
      const salesPayload = bufferItems.map(item => ({
        menu_item_id: item.menuItemId,
        menu_item_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        tax_rate: item.taxRate || 0,
        recorded_by: user.id,
      }));

      const { error } = await supabase!.rpc('log_buffer_sales', {
        p_sales: salesPayload,
      });

      if (error) throw error;

      toast.success('Sale logged successfully!');
      setBufferItems([]);
    } catch (error: any) {
      console.error('Error confirming sale:', error);
      toast.error(error.message || 'Failed to log sale');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-screen">
      {/* Main Content */}
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold">POS — Record Sales</h1>
          <p className="text-muted-foreground mt-1">
            Add items to buffer and confirm sale
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {menuItems.map((item: any) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onAdd={() => handleAddMenuItem(item)}
              onImageUploaded={loadMenuItems}
            />
          ))}
        </div>
      </div>

      {/* Buffer Panel - Sidebar on desktop, bottom drawer on mobile */}
      <div className="lg:w-80">
        <BufferPanel
          items={bufferItems}
          onRemove={handleRemoveFromBuffer}
          onClear={handleClearBuffer}
          onUpdateQuantity={handleUpdateQuantity}
          onConfirmSale={handleConfirmSale}
        />
      </div>

      {/* Add Sale Modal */}
      <AddSaleModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        menuItem={selectedMenuItem}
        onAddToBuffer={handleAddToBuffer}
      />
    </div>
  );
}