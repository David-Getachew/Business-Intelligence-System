import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StockLogTable } from '@/components/stock/StockLogTable';
import { AddCountModal } from '@/components/stock/AddCountModal';
import { mockStockLogs } from '@/data/mockStockLogs';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [stockLogs, setStockLogs] = useState<StockLog[]>(mockStockLogs);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleAddCount = (data: {
    date: string;
    itemName: string;
    quantity: number;
    unit: string;
    notes?: string;
  }) => {
    const newLog: StockLog = {
      id: `log-${Date.now()}`,
      date: data.date,
      itemName: data.itemName,
      quantity: data.quantity,
      unit: data.unit,
      notes: data.notes,
      loggedBy: 'Current User', // Placeholder - would be actual user in production
    };

    setStockLogs([newLog, ...stockLogs]);
    setShowAddModal(false);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(stockLogs.length / itemsPerPage);
  const paginatedLogs = stockLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      />
    </div>
  );
}