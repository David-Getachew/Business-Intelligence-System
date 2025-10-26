import { useState } from 'react';
import { CalendarIcon, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import { cn } from '@/lib/utils';

interface DateRange {
  start: string;
  end: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [preset, setPreset] = useState('all-time');
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(
    value.start ? new Date(value.start) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    value.end ? new Date(value.end) : undefined
  );
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const handlePreset = (presetName: string) => {
    setPreset(presetName);
    
    if (presetName === 'all-time') {
      // All time - no date filters
      setStartDate(undefined);
      setEndDate(undefined);
      onChange({ start: '', end: '' });
      return;
    }

    const today = new Date();
    let start = new Date();
    let end = today;

    switch (presetName) {
      case 'today':
        start = today;
        break;
      case 'week':
        start.setDate(today.getDate() - 7);
        break;
      case 'month':
        start.setMonth(today.getMonth() - 1);
        break;
    }

    const startDateStr = format(start, 'yyyy-MM-dd');
    const endDateStr = format(end, 'yyyy-MM-dd');
    
    setStartDate(start);
    setEndDate(end);
    onChange({
      start: startDateStr,
      end: endDateStr,
    });
  };

  const handleApply = () => {
    if (startDate && endDate) {
      setPreset('custom');
      onChange({
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd'),
      });
    }
    setOpen(false);
  };

  const clearFilter = () => {
    setPreset('all-time');
    setStartDate(undefined);
    setEndDate(undefined);
    onChange({ start: '', end: '' });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={preset === 'all-time' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePreset('all-time')}
        >
          All Time
        </Button>
        <Button
          variant={preset === 'today' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePreset('today')}
        >
          Today
        </Button>
        <Button
          variant={preset === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePreset('week')}
        >
          This Week
        </Button>
        <Button
          variant={preset === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePreset('month')}
        >
          This Month
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant={preset === 'custom' ? 'default' : 'outline'}
              size="sm"
              className={cn('gap-2')}
            >
              <CalendarIcon className="h-4 w-4" />
              Custom
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Select Date Range</DialogTitle>
              <DialogDescription>
                Choose a start and end date for your report
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="start-date" className="text-sm font-medium">
                  Start Date
                </label>
                <Popover open={startOpen} onOpenChange={setStartOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 mt-2" align="start">
                    <Calendar
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
                <label htmlFor="end-date" className="text-sm font-medium">
                  End Date
                </label>
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
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 mt-2" align="start">
                    <Calendar
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
                Clear
              </Button>
              <Button onClick={handleApply} disabled={!startDate || !endDate}>
                Apply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {value.start && value.end && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilter}
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}