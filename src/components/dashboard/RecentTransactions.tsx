import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { fetchSales } from '@/api/index';

export function RecentTransactions() {
  const navigate = useNavigate();
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecentTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const sales = await fetchSales();
      setRecentSales(sales.slice(0, 7));
    } catch (err: any) {
      console.error('Error loading recent transactions:', err);
      setError(err.message || 'Failed to load recent transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentTransactions();
  }, []);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-red-600">{error}</p>
            <Button onClick={loadRecentTransactions} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        ) : recentSales.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No recent transactions yet. Start by submitting sales.
          </p>
        ) : (
          <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Menu Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.slice(0,7).map((sale, index) => {
                  const formatSaleDate = (sale: any) => {
                    const dateStr = sale.created_at || sale.sale_date;
                    if (!dateStr) return 'N/A';
                    try {
                      const date = new Date(dateStr);
                      if (isNaN(date.getTime())) return 'Invalid Date';
                      return format(date, 'MMM d, h:mm a');
                    } catch {
                      return 'Invalid Date';
                    }
                  };

                  return (
                    <TableRow key={sale.id} className="relative">
                      {index === 5 && (
                        <div className="absolute inset-x-0 top-0 h-16 backdrop-blur-md bg-opacity-50 bg-gradient-to-r from-muted/30 via-muted/10 to-muted/30 pointer-events-none" />
                      )}
                      {index === 6 && (
                        <div className="absolute inset-x-0 top-0 h-8 backdrop-blur-md bg-opacity-50 bg-gradient-to-r from-muted/30 via-muted/10 to-muted/30 pointer-events-none" />
                      )}
                      <TableCell className="text-sm">{formatSaleDate(sale)}</TableCell>
                      <TableCell className="font-medium">{sale.menu_item}</TableCell>
                      <TableCell>{sale.quantity}</TableCell>
                      <TableCell>${typeof sale.total === 'number' ? sale.total.toFixed(2) : '0.00'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex justify-center">
            <Button 
              variant="outline"
              className="rounded-md px-4 py-2"
              onClick={() => navigate('/transactions')}
            >
              View All
            </Button>
          </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
