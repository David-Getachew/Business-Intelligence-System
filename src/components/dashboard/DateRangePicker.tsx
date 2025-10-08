import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
  const [preset, setPreset] = useState('today');

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

  return (
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
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={preset === 'custom' ? 'default' : 'outline'}
            size="sm"
            className={cn('gap-2')}
          >
            <CalendarIcon className="h-4 w-4" />
            Custom
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={value.start ? new Date(value.start) : undefined}
            onSelect={(date) => {
              if (date) {
                setPreset('custom');
                onChange({
                  start: format(date, 'yyyy-MM-dd'),
                  end: format(new Date(), 'yyyy-MM-dd'),
                });
              }
            }}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
