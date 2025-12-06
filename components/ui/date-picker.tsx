"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, formatDateLocal } from "@/lib/utils";

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

export function DatePicker({ value, onChange, minDate, maxDate, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    } else {
      // If no value, show current month
      setCurrentMonth(new Date());
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedDate = value ? new Date(value) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateSelect = (date: Date) => {
    const dateStr = formatDateLocal(date);
    onChange(dateStr);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "Seleccionar fecha";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isDateDisabled = (date: Date): boolean => {
    const dateStr = formatDateLocal(date);
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isToday = (date: Date): boolean => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full justify-between border border-red-500/20 bg-white/5 text-white hover:bg-white/10 hover:border-red-500/30 min-h-[48px]",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-red-400" />
          <span className="font-[family-name:var(--font-orbitron)]">
            {formatDisplayDate(value)}
          </span>
        </div>
        <ChevronRight className={cn("size-4 transition-transform", isOpen && "rotate-90")} />
      </Button>

      {isOpen && (
        <Card className="absolute z-50 mt-2 border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black shadow-2xl p-4 w-[320px] sm:w-[340px]">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrevMonth}
              className="border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50 active:scale-[0.98] transition-all duration-200"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <h3 className="text-lg font-bold font-[family-name:var(--font-orbitron)] text-white">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              className="border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50 active:scale-[0.98] transition-all duration-200"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-zinc-400 font-[family-name:var(--font-orbitron)] py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const disabled = isDateDisabled(date);
              const selected = isDateSelected(date);
              const todayDate = isToday(date);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => !disabled && handleDateSelect(date)}
                  disabled={disabled}
                  className={cn(
                    "aspect-square rounded-lg border transition-all duration-200 font-[family-name:var(--font-orbitron)] text-sm",
                    "hover:scale-110 active:scale-95",
                    disabled
                      ? "opacity-30 cursor-not-allowed border-transparent text-zinc-600"
                      : selected
                      ? "bg-gradient-to-br from-red-500 to-red-600 text-white border-red-500 shadow-lg shadow-red-500/50 ring-2 ring-red-500/30"
                      : todayDate
                      ? "border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500"
                      : "border-red-500/20 bg-white/5 text-zinc-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-white"
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-red-500/20 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const todayStr = formatDateLocal(today);
                onChange(todayStr);
                setIsOpen(false);
              }}
              className="flex-1 border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50 active:scale-[0.98] transition-all duration-200 text-xs font-[family-name:var(--font-orbitron)]"
            >
              Hoy
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowStr = formatDateLocal(tomorrow);
                onChange(tomorrowStr);
                setIsOpen(false);
              }}
              className="flex-1 border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50 active:scale-[0.98] transition-all duration-200 text-xs font-[family-name:var(--font-orbitron)]"
            >
              Mañana
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

