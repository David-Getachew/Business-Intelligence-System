import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  const [preset, setPreset] = useState('today');
  const [date, setDate] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [open, setOpen] = useState(false);

  const handlePreset = (presetName: string) => {
    setPreset(presetName);
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

    onChange({
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd'),
    });
  };

  const handleSelect = (selectedDate: { from: Date | undefined; to: Date | undefined }) => {
    setDate(selectedDate);
    if (selectedDate.from && selectedDate.to) {
      setPreset('custom');
      onChange({
        start: format(selectedDate.from, 'yyyy-MM-dd'),
        end: format(selectedDate.to, 'yyyy-MM-dd'),
      });
      setOpen(false);
    }
  };

  const formatDateRange = () => {
    if (!value.start || !value.end) return '';
    if (value.start === value.end) {
      return format(new Date(value.start), 'MMM d, yyyy');
    }
    return `${format(new Date(value.start), 'MMM d, yyyy')} - ${format(new Date(value.end), 'MMM d, yyyy')}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
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
            </DialogHeader>
            <Calendar
              mode="range"
              selected={date}
              onSelect={handleSelect}
              numberOfMonths={2}
              initialFocus
            />
          </DialogContent>
        </Dialog>
      </div>
      {value.start && value.end && (
        <p className="text-sm text-muted-foreground">
          {formatDateRange()}
        </p>
      )}
    </div>
  );
}