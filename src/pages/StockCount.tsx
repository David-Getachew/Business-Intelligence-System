import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StockLogTable } from '@/components/stock/StockLogTable';
import { AddCountModal } from '@/components/stock/AddCountModal';
import { fetchIngredients, fetchStockCounts } from '@/api/index';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface StockLog {
  id: string;
  date: string;
  itemName: string;
  quantity: number;
  unit: string;
  notes?: string;
  loggedBy: string;
}

export default function StockCount() {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ingredientsData, stockCountsData] = await Promise.all([
        fetchIngredients(),
        fetchStockCounts(),
      ]);
      setIngredients(ingredientsData.filter((item: any) => item.active));
      setStockLogs(stockCountsData);
      setCurrentPage(1);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCount = async (data: {
    ingredientId: number;
    ingredientName: string;
    quantity: number;
    unit: string;
    notes?: string;
  }) => {
    if (!user) {
      toast.error('You must be logged in to log stock counts');
      return;
    }
    setSubmitting(true);
    try {
      const payload = [{
        ingredient_id: data.ingredientId,
        quantity: data.quantity,
        unit: data.unit,
        notes: data.notes,
        recorded_by: user.id,
      }];

      const { error } = await supabase!.rpc('log_stock_count', {
        p_counts: payload,
      });

      if (error) throw error;

      toast.success('Stock count logged successfully!');
      setShowAddModal(false);
      await loadData();
    } catch (error: any) {
      console.error('Error logging stock count:', error);
      toast.error(error.message || 'Failed to log stock count');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(stockLogs.length / itemsPerPage);
  const paginatedLogs = stockLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Stock Count</h1>
          <p className="text-muted-foreground mt-1">
            Log and review physical stock counts
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="gradient-primary w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Count
        </Button>
      </div>

      {/* Stock Log Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Stock Count History</CardTitle>
        </CardHeader>
        <CardContent>
          <StockLogTable
            logs={paginatedLogs}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Add Count Modal */}
      <AddCountModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAddCount={handleAddCount}
        ingredients={ingredients}
      />
    </div>
  );
}