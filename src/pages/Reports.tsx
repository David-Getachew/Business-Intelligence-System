import { useState } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { mockWeeklySummaries } from '@/mocks/summaries';
import { toast } from 'sonner';

export default function Reports() {
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filteredReports, setFilteredReports] = useState(mockWeeklySummaries);

  const handleDownload = (report: any) => {
    // Mock PDF download
    toast.success(`Downloading report for week ${report.week_start} to ${report.week_end}`);
    
    // In a real app, this would trigger an actual download
    const link = document.createElement('a');
    link.href = '#'; // Would be the actual PDF URL
    link.download = `weekly-report-${report.week_start}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const applyDateFilter = () => {
    if (!dateFilter.startDate && !dateFilter.endDate) {
      setFilteredReports(mockWeeklySummaries);
    } else {
      const filtered = mockWeeklySummaries.filter(report => {
        const reportStart = new Date(report.week_start);
        const filterStart = dateFilter.startDate ? new Date(dateFilter.startDate) : new Date('1900-01-01');
        const filterEnd = dateFilter.endDate ? new Date(dateFilter.endDate) : new Date('2100-12-31');
        
        return reportStart >= filterStart && reportStart <= filterEnd;
      });
      setFilteredReports(filtered);
    }
    setShowFilterModal(false);
    toast.success('Filter applied successfully');
  };

  const clearFilter = () => {
    setDateFilter({ startDate: '', endDate: '' });
    setFilteredReports(mockWeeklySummaries);
    setShowFilterModal(false);
    toast.success('Filter cleared');
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Weekly business performance reports with AI insights
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilterModal(true)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filter by Date
        </Button>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Weekly PDF Reports ({filteredReports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Week Period</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Gross Profit</TableHead>
                  <TableHead>Net Profit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No reports found for the selected date range
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium w-1/3">
                        {formatDateRange(report.week_start, report.week_end)}
                      </TableCell>
                      <TableCell>{formatCurrency(report.revenue)}</TableCell>
                      <TableCell>{formatCurrency(report.gross_profit)}</TableCell>
                      <TableCell>{formatCurrency(report.net_profit)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(report)}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sample Report Preview */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="text-sm text-muted-foreground">
            {filteredReports.length > 0 && formatDateRange(filteredReports[0].week_start, filteredReports[0].week_end)}
          </div>
          <CardTitle>Latest Report Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReports.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(filteredReports[0].revenue)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">COGS</p>
                  <p className="text-2xl font-bold">{formatCurrency(filteredReports[0].cogs)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Operating Expense</p>
                  <p className="text-2xl font-bold">{formatCurrency(filteredReports[0].operating_expense)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(filteredReports[0].net_profit)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">AI Analysis</h3>
                <p className="text-muted-foreground">{filteredReports[0].analysis}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Modal */}
      <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Reports by Date</DialogTitle>
            <DialogDescription>
              Select a date range to filter the reports
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={clearFilter}>
              Clear Filter
            </Button>
            <Button onClick={applyDateFilter} className="gradient-primary">
              Apply Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}