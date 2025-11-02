import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { fetchWeeklySummaries } from '@/api/index';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Reports() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [weeklySummaries, setWeeklySummaries] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeeklySummaries();
  }, []);

  const loadWeeklySummaries = async () => {
    try {
      setLoading(true);
      const summaries = await fetchWeeklySummaries();
      setWeeklySummaries(summaries);
      setFilteredReports(summaries);
    } catch (error: any) {
      console.error('Error loading weekly summaries:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (report: any) => {
    if (report.pdf_url) {
      window.open(report.pdf_url, '_blank');
      toast.success(`Opening report for week ${report.week_start} to ${report.week_end}`);
    } else {
      toast.error('PDF not available for this report');
    }
  };

  const applyDateFilter = () => {
    if (!startDate && !endDate) {
      setFilteredReports(weeklySummaries);
    } else {
      const filtered = weeklySummaries.filter(report => {
        const reportStart = new Date(report.week_start);
        const filterStart = startDate || new Date('1900-01-01');
        const filterEnd = endDate || new Date('2100-12-31');
        
        return reportStart >= filterStart && reportStart <= filterEnd;
      });
      setFilteredReports(filtered);
    }
    setShowFilterModal(false);
    toast.success('Filter applied successfully');
  };

  const clearFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setFilteredReports(weeklySummaries);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">Loading weekly summaries...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Weekly business performance reports with AI insights
          </p>
        </div>
        <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter by Date
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Filter Reports by Date</DialogTitle>
              <DialogDescription>
                Select a date range to filter the reports
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-sm font-medium">
                  Start Date
                </Label>
                <Popover open={startOpen} onOpenChange={setStartOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        if (date && endDate && date > endDate) {
                          setEndDate(date);
                        }
                        setStartOpen(false);
                      }}
                      initialFocus
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-sm font-medium">
                  End Date
                </Label>
                <Popover open={endOpen} onOpenChange={setEndOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                      disabled={!startDate}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setEndOpen(false);
                      }}
                      initialFocus
                      className="rounded-md border"
                      disabled={(date) => startDate ? date < startDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={clearFilter}>
                Clear Filter
              </Button>
              <Button onClick={applyDateFilter} disabled={!startDate || !endDate}>
                Apply Filter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
    </div>
  );
}