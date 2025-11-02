import { useState } from 'react';
import { Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MenuItemCard } from '@/components/pos/MenuItemCard';
import { AddSaleModal } from '@/components/pos/AddSaleModal';
import { BufferPanel } from '@/components/pos/BufferPanel';
import { mockMenuItems } from '@/data/mockMenuItems';

interface BufferItem {
  id: string;
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

export default function POSSale() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [bufferItems, setBufferItems] = useState<BufferItem[]>([]);

  const handleAddMenuItem = (menuItem: any) => {
    setSelectedMenuItem(menuItem);
    setShowAddModal(true);
  };

  const handleAddToBuffer = (quantity: number, note?: string) => {
    if (!selectedMenuItem || quantity <= 0) return;

    const newItem: BufferItem = {
      id: `${selectedMenuItem.id}-${Date.now()}`,
      menuItemId: selectedMenuItem.id,
      name: selectedMenuItem.name,
      price: selectedMenuItem.price,
      quantity,
      note,
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
          {mockMenuItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onAdd={() => handleAddMenuItem(item)}
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