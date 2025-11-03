import { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Trash2, X, Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [filteredMenuItems, setFilteredMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [bufferItems, setBufferItems] = useState<BufferItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingItem, setEditingItem] = useState<BufferItem | null>(null); // For editing buffer items

  // Get unique categories from menu items
  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

  useEffect(() => {
    loadMenuItems();
  }, []);

  // Filter menu items based on search term and category
  useEffect(() => {
    let filtered = menuItems;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    setFilteredMenuItems(filtered);
  }, [menuItems, searchTerm, selectedCategory]);

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
    setEditingItem(null); // Clear editing state
    setShowAddModal(true);
  };

  const handleEditBufferItem = (item: BufferItem) => {
    // Find the original menu item to get all details
    const originalMenuItem = menuItems.find(m => m.id === item.menuItemId);
    if (originalMenuItem) {
      setSelectedMenuItem(originalMenuItem);
      setEditingItem(item); // Set the item being edited
      setShowAddModal(true);
    }
  };

  const handleAddToBuffer = (quantity: number) => {
    if (!selectedMenuItem || quantity <= 0) return;

    if (editingItem) {
      // Update existing item in buffer
      setBufferItems(bufferItems.map(item => 
        item.id === editingItem.id 
          ? { ...item, quantity } 
          : item
      ));
    } else {
      // Add new item to buffer
      const newItem: BufferItem = {
        id: `${selectedMenuItem.id}-${Date.now()}`,
        menuItemId: selectedMenuItem.id,
        name: selectedMenuItem.name,
        price: selectedMenuItem.price,
        quantity,
        taxRate: selectedMenuItem.tax_rate,
      };

      setBufferItems([...bufferItems, newItem]);
    }

    setShowAddModal(false);
    setSelectedMenuItem(null);
    setEditingItem(null);
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
        {/* Search and Category Filters */}
        <div className="mb-4 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="flex flex-col items-center gap-1 h-auto py-2 px-3"
              >
                <span className="text-xs">{category}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMenuItems.map((item: any) => (
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
          onEdit={handleEditBufferItem}
          onConfirmSale={handleConfirmSale}
        />
      </div>

      {/* Add Sale Modal */}
      <AddSaleModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        menuItem={selectedMenuItem}
        initialQuantity={editingItem?.quantity || 1}
        onAddToBuffer={handleAddToBuffer}
      />
    </div>
  );
}