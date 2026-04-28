import { useState } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import { format, addDays, addHours, setHours, setMinutes } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ScheduleSelectorProps {
  value: Date | null;
  onChange: (value: Date | null) => void;
}

// Generate time options in 15-minute increments
const generateTimeOptions = () => {
  const options: { value: string; label: string }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const date = setMinutes(setHours(new Date(), hour), minute);
      options.push({
        value: `${hour}:${minute}`,
        label: format(date, 'h:mm a'),
      });
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

export function ScheduleSelector({ value, onChange }: ScheduleSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value || undefined
  );
  const [selectedTime, setSelectedTime] = useState(
    value ? `${value.getHours()}:${Math.floor(value.getMinutes() / 15) * 15}` : '12:0'
  );

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const newDate = setMinutes(setHours(date, hours), minutes);
      onChange(newDate);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = setMinutes(setHours(selectedDate, hours), minutes);
      onChange(newDate);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setSelectedDate(undefined);
    setOpen(false);
  };

  const quickOptions = [
    { label: 'Tomorrow 9 AM', date: setHours(addDays(new Date(), 1), 9) },
    { label: 'Tomorrow 12 PM', date: setHours(addDays(new Date(), 1), 12) },
    { label: 'Tomorrow 6 PM', date: setHours(addDays(new Date(), 1), 18) },
    { label: 'In 1 hour', date: addHours(new Date(), 1) },
  ];

  if (value) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 text-body"
      >
        <Calendar className="h-3.5 w-3.5 text-accent" />
        <span className="font-medium">
          Scheduled for {format(value, 'MMM d, h:mm a')}
        </span>
        <button
          onClick={handleRemove}
          className="ml-1 p-0.5 rounded-full hover:bg-accent/30 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </motion.div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Calendar className="h-4 w-4" />
          Schedule
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b border-border">
          <p className="font-medium text-body">Schedule post</p>
          <p className="text-label text-muted-foreground">
            Choose when to publish
          </p>
        </div>

        {/* Quick Options */}
        <div className="p-2 border-b border-border">
          <div className="grid grid-cols-2 gap-1.5">
            {quickOptions.map((option) => (
              <Button
                key={option.label}
                variant="outline"
                size="sm"
                onClick={() => {
                  const date = setMinutes(option.date, 0);
                  setSelectedDate(date);
                  setSelectedTime(`${date.getHours()}:0`);
                  onChange(date);
                  setOpen(false);
                }}
                className="text-label justify-start"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="p-2">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => date < new Date()}
            initialFocus
          />
        </div>

        {/* Time Selector */}
        {selectedDate && (
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedTime} onValueChange={handleTimeSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Confirm */}
        {selectedDate && (
          <div className="p-3 border-t border-border">
            <Button
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Confirm Schedule
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
