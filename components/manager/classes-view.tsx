"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Logo } from "@/components/logo";
import { Users, Calendar, Clock, UserPlus, X, RotateCw } from "lucide-react";
import { cn, formatDateLocal, parseDateLocal } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ClassSlot {
  id: number;
  day: string;
  time: string;
  capacity: number;
  available: boolean;
  spotsRemaining: number;
  currentReservations: number;
}

interface Attendee {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  day: string;
  time: string;
  date: string;
  source?: 'reservation' | 'manager';
  addedBy?: number | null;
}

interface ClassesViewProps {
  onAddAttendee?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}

// Day mappings
const DAY_MAP_EN_TO_ES: Record<string, string> = {
  Monday: "Lunes",
  Tuesday: "Martes",
  Wednesday: "Miércoles",
  Thursday: "Jueves",
  Friday: "Viernes",
  Saturday: "Sábado",
};

const DAY_MAP_ES_TO_EN: Record<string, string> = {
  Lunes: "Monday",
  Martes: "Tuesday",
  Miércoles: "Wednesday",
  Jueves: "Thursday",
  Viernes: "Friday",
  Sábado: "Saturday",
};

const DAYS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const toSpanishDay = (dayEn: string): string => DAY_MAP_EN_TO_ES[dayEn] || dayEn;
const toEnglishDay = (dayEs: string): string => DAY_MAP_ES_TO_EN[dayEs] || dayEs;

// Get date for a day name - always returns the upcoming date for that day
const getDateForDay = (dayName: string): Date => {
  const dayMap: Record<string, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const currentDay = today.getDay();
  
  // If it's Sunday, all days should be next week
  if (currentDay === 0) {
    const targetDay = dayMap[dayName];
    if (!targetDay) return today;
    const date = new Date(today);
    date.setDate(today.getDate() + targetDay);
    return date;
  }
  
  const targetDay = dayMap[dayName];
  if (!targetDay) {
    const date = new Date(today);
    const daysToMonday = (8 - currentDay) % 7 || 7;
    date.setDate(today.getDate() + daysToMonday);
    return date;
  }

  let daysToAdd = targetDay - currentDay;
  if (daysToAdd < 0) {
    daysToAdd += 7;
  }
  // If daysToAdd is 0, it means the selected day is today, so return today's date
  // This ensures that slots for today are correctly compared with current time

  const date = new Date(today);
  date.setDate(today.getDate() + daysToAdd);
  return date;
};

const getCurrentDayName = (date: Date = new Date()): string => {
  const dayOfWeek = date.getDay();
  const dayMap: Record<number, string> = {
    0: DAYS_EN[0], // Sunday -> Monday
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };
  return dayMap[dayOfWeek] || DAYS_EN[0];
};

// Parse time string to minutes for sorting
const parseTimeToMinutes = (timeStr: string): number => {
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':');
  let h = parseInt(hours);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + parseInt(minutes || '0');
};

// Convert time from "5:00 AM" or "6:00 PM" format to 24-hour format (hours, minutes)
const parseTimeFormat = (timeString: string): { hours: number; minutes: number } | null => {
  if (!timeString || typeof timeString !== 'string') {
    return null;
  }

  // Try to parse "HH:MM AM/PM" format (e.g., "5:00 AM", "6:00 PM")
  const amPmMatch = timeString.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (amPmMatch) {
    let hours = parseInt(amPmMatch[1], 10);
    const minutes = parseInt(amPmMatch[2], 10);
    const period = amPmMatch[3].toUpperCase();

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return { hours, minutes };
    }
  }

  // Try to parse "HH:MM" format (24-hour format)
  const timeMatch = timeString.match(/^(\d{1,2}):(\d{2})$/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);

    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return { hours, minutes };
    }
  }

  return null;
};

// Check if a time slot has passed for a specific date
// Rule: if current date and time > slot date and time = Status passed
const isSlotTimePassed = (slotTime: string, slotDate: Date): boolean => {
  const now = new Date();
  const timeParts = parseTimeFormat(slotTime);
  
  if (!timeParts) {
    return false;
  }
  
  // Create the slot datetime for the given date
  // Make sure we're working with a clean date (no time component from the date object)
  const slotDateTime = new Date(slotDate);
  slotDateTime.setHours(timeParts.hours, timeParts.minutes, 0, 0);
  slotDateTime.setSeconds(0, 0);
  slotDateTime.setMilliseconds(0);
  
  // Compare: if current date and time is greater than slot date and time, slot has passed
  // If slot datetime is less than or equal to current datetime, the slot has passed
  // This handles both past dates and past times on the same day
  return slotDateTime.getTime() < now.getTime();
};

// Check if a reservation has passed (both date and time)
const isReservationPast = (reservationDate: Date, reservationTime: string): boolean => {
  const timeParts = parseTimeFormat(reservationTime);
  
  if (!timeParts) {
    return false;
  }
  
  const reservationDateTime = new Date(reservationDate);
  reservationDateTime.setHours(timeParts.hours, timeParts.minutes, 0, 0);
  reservationDateTime.setSeconds(0, 0);
  reservationDateTime.setMilliseconds(0);
  const now = new Date();
  return reservationDateTime.getTime() < now.getTime();
};

export function ClassesView({ onAddAttendee, onLoadingChange }: ClassesViewProps) {
  const { showToast } = useToast();
  
  // State
  const [slots, setSlots] = useState<ClassSlot[]>([]);
  const [users, setUsers] = useState<Array<{ id: number; name: string; email: string }>>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [allDayAttendees, setAllDayAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);

  // Notify parent of loading state changes
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(loading);
    }
  }, [loading, onLoadingChange]);

  // Notify parent immediately on mount
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(true);
    }
  }, []);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddAttendee, setShowAddAttendee] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [attendeeToDelete, setAttendeeToDelete] = useState<{ id: number; source?: 'reservation' | 'manager'; time?: string } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [dateUpdateKey, setDateUpdateKey] = useState(0);

  // Update dates daily to ensure weekly updates
  useEffect(() => {
    const updateDates = () => {
      setDateUpdateKey(prev => prev + 1);
      if (selectedDay) {
        const date = getDateForDay(selectedDay);
        setSelectedDate(formatDateLocal(date));
      }
    };

    updateDates();

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const midnightTimeout = setTimeout(() => {
      updateDates();
      const interval = setInterval(updateDates, 3600000);
      return () => clearInterval(interval);
    }, msUntilMidnight);

    const hourlyInterval = setInterval(updateDates, 3600000);

    return () => {
      clearTimeout(midnightTimeout);
      clearInterval(hourlyInterval);
    };
  }, [selectedDay]);

  // Initialize: Fetch slots and users, set initial day
  useEffect(() => {
    let mounted = true;
    
    const initialize = async () => {
      try {
        const results = await Promise.allSettled([fetchSlots(), fetchUsers()]);
        const slotsSuccess = results[0].status === 'fulfilled' && results[0].value !== false;
        
        if (mounted && slotsSuccess) {
          const today = new Date();
          const currentDayName = getCurrentDayName(today);
          setSelectedDay(currentDayName);
          const initialDate = getDateForDay(currentDayName);
          setSelectedDate(formatDateLocal(initialDate));
        }
      } catch (error) {
        console.error("Error initializing:", error);
        if (mounted) {
          showToast("Error loading data", "error");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    initialize();
    
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch attendees when day/date changes
  useEffect(() => {
    if (selectedDay && selectedDate) {
      fetchAllDayAttendees(selectedDay, selectedDate);
    }
  }, [selectedDay, selectedDate]);

  // Refresh slots when window regains focus (user returns from Schedules page)
  // Also refresh on visibility change (tab switch)
  useEffect(() => {
    const handleFocus = () => {
      // Refresh slots to get latest availability status
      fetchSlots();
    };
    
    const handleVisibilityChange = () => {
      // Refresh when tab becomes visible
      if (!document.hidden) {
        fetchSlots();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch slots
  const fetchSlots = async () => {
    try {
      // Add timestamp to prevent caching
      const res = await fetch(`/api/class-slots?t=${Date.now()}`, {
        cache: 'no-store', // Always fetch fresh data to reflect availability changes
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (res.ok) {
        const { slots: slotsData }: { slots: any[] } = await res.json();
        // Convert day names from Spanish to English if needed
        // The database stores English day names, but we convert to ensure consistency
        // Type the raw API response to allow for flexible available types
        const convertedSlots: ClassSlot[] = slotsData.map((slot: any) => {
          const convertedDay = toEnglishDay(slot.day);
          
          // Convert available to strict boolean
          // The API should return boolean, but handle edge cases
          let available: boolean;
          if (typeof slot.available === 'boolean') {
            available = slot.available;
          } else if (typeof slot.available === 'number') {
            available = slot.available !== 0;
          } else if (typeof slot.available === 'string') {
            const lower = slot.available.toLowerCase();
            available = lower !== 'false' && lower !== '0' && lower !== '';
          } else {
            // Default to true if undefined/null or other type
            available = slot.available != null ? Boolean(slot.available) : true;
          }
          
          return {
            ...slot,
            day: convertedDay,
            available: available, // Always a boolean
          } as ClassSlot;
        });
        
        // Debug: Log all slots to verify data
        console.log('[ClassesView] Fetched slots:', convertedSlots.length, 'total');
        const mondaySlots = convertedSlots.filter(s => s.day === 'Monday');
        console.log('[ClassesView] All Monday slots:', mondaySlots.map(s => ({
          id: s.id,
          time: s.time,
          available: s.available,
          availableType: typeof s.available,
          spotsRemaining: s.spotsRemaining
        })));
        
        const monday6am = convertedSlots.find(s => s.day === 'Monday' && s.time === '6:00 AM');
        if (monday6am) {
          console.log('[ClassesView] Monday 6:00 AM slot after conversion:', {
            id: monday6am.id,
            day: monday6am.day,
            time: monday6am.time,
            available: monday6am.available,
            availableType: typeof monday6am.available,
            originalAvailable: slotsData.find((s: any) => s.day === 'Monday' && s.time === '6:00 AM')?.available,
            originalAvailableType: typeof slotsData.find((s: any) => s.day === 'Monday' && s.time === '6:00 AM')?.available
          });
        } else {
          console.warn('[ClassesView] Monday 6:00 AM slot NOT FOUND in converted slots');
        }
        
        setSlots(convertedSlots);
        return true;
      } else {
        showToast("Error loading time slots", "error");
        return false;
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      showToast("Error loading time slots", "error");
      return false;
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/manager/users");
      if (res.ok) {
        const { users: usersData } = await res.json();
        setUsers(usersData.filter((u: any) => u.role === "client"));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch attendees for a specific day and date
  const fetchAllDayAttendees = async (dayEn: string, date: string) => {
    try {
      const dayEs = toSpanishDay(dayEn);
      const res = await fetch(
        `/api/manager/class-attendees?day=${encodeURIComponent(dayEs)}&date=${encodeURIComponent(date)}`
      );
      
      if (res.ok) {
        const data = await res.json();
        const attendeesData = data.attendees || [];
        const convertedAttendees = attendeesData.map((attendee: Attendee) => ({
          ...attendee,
          day: toEnglishDay(attendee.day),
        }));
        setAllDayAttendees(convertedAttendees);
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(`Error loading attendees: ${errorData.error || res.statusText}`, "error");
      }
    } catch (error) {
      console.error("Error fetching attendees:", error);
      showToast("Error loading attendees", "error");
    }
  };

  // Handle day selection
  const handleDayClick = (day: string) => {
    setSelectedDay(day);
    setSelectedTime(null);
    const date = getDateForDay(day);
    setSelectedDate(formatDateLocal(date));
    // Refresh slots when switching days to ensure latest status
    fetchSlots();
  };

  // Handle time selection
  const handleTimeClick = (time: string) => {
    if (!selectedDay) return;
    
    // Check if time slot has passed
    const dayDate = getDateForDay(selectedDay);
    if (isSlotTimePassed(time, dayDate)) {
      showToast("This time slot has already passed", "warning");
      return;
    }
    
    // Find slot with robust matching
    const slot = slots.find((s) => {
      const slotDay = s.day?.trim();
      const selectedDayTrimmed = selectedDay?.trim();
      const dayMatch = slotDay === selectedDayTrimmed;
      const timeMatch = s.time?.trim() === time?.trim();
      return dayMatch && timeMatch;
    });
    
    if (slot && slot.available === false) {
      showToast("This class is canceled. Actions cannot be performed.", "warning");
      return;
    }
    setSelectedTime(time);
    setTimeout(() => {
      const attendanceSection = document.getElementById('attendance-section');
      if (attendanceSection) {
        attendanceSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchSlots(),
        selectedDay && selectedDate 
          ? fetchAllDayAttendees(selectedDay, selectedDate)
          : Promise.resolve()
      ]);
      showToast("Time slots and attendance updated", "success");
    } catch (error) {
      console.error("Error refreshing:", error);
      showToast("Error updating", "error");
    } finally {
      setRefreshing(false);
    }
  };

  // Handle add attendee
  const handleAddAttendee = async () => {
    if (!selectedDay || !selectedTime || !selectedUserId || !selectedDate) {
      showToast("Please complete all fields", "error");
      return;
    }
    
    // Check if time slot has passed
    const dayDate = getDateForDay(selectedDay);
    if (isSlotTimePassed(selectedTime, dayDate)) {
      showToast("Cannot add clients to a time slot that has already passed", "error");
      return;
    }
    
    // Find slot and validate availability
    const slot = slots.find((s) => {
      const slotDay = s.day?.trim();
      const selectedDayTrimmed = selectedDay?.trim();
      const dayMatch = slotDay === selectedDayTrimmed;
      const timeMatch = s.time?.trim() === selectedTime?.trim();
      return dayMatch && timeMatch;
    });
    
    if (slot && slot.available === false) {
      showToast("This class is canceled. Attendees cannot be added.", "error");
      return;
    }

    try {
      const dayEs = toSpanishDay(selectedDay);
      const requestBody = {
        userId: parseInt(selectedUserId),
        day: dayEs,
        time: selectedTime,
        date: selectedDate,
      };
      
      console.log("[Classes] Adding attendee with data:", requestBody);
      
      const res = await fetch("/api/manager/class-attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      console.log("[Classes] API response:", { status: res.status, data });

      if (res.ok) {
        showToast("User added to class successfully", "success");
        setShowAddAttendee(false);
        setSelectedUserId("");
        
        // Refresh data
        await Promise.all([
          fetchAllDayAttendees(selectedDay, selectedDate),
          fetchSlots()
        ]);
        onAddAttendee?.();
      } else {
        console.error("[Classes] Error adding attendee:", data);
        showToast(data.error || "Error adding user", "error");
      }
    } catch (error) {
      console.error("[Classes] Error adding attendee:", error);
      showToast("Error adding user", "error");
    }
  };

  // Handle remove attendee click
  const handleRemoveAttendeeClick = (attendeeId: number, source?: 'reservation' | 'manager', time?: string) => {
    if (time) {
      // Find slot with robust matching
      const slot = slots.find((s) => {
        const slotDay = s.day?.trim();
        const selectedDayTrimmed = selectedDay?.trim();
        const dayMatch = slotDay === selectedDayTrimmed;
        const timeMatch = s.time?.trim() === time?.trim();
        return dayMatch && timeMatch;
      });
      
      if (slot && slot.available === false) {
        showToast("This class is canceled. Attendees cannot be removed.", "error");
        return;
      }
    }
    setAttendeeToDelete({ id: attendeeId, source, time });
    setShowDeleteConfirm(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!attendeeToDelete) return;

    try {
      const endpoint = attendeeToDelete.source === 'reservation' 
        ? `/api/manager/reservations/${attendeeToDelete.id}`
        : `/api/manager/class-attendees/${attendeeToDelete.id}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Client removed from class successfully", "success");
        setShowDeleteConfirm(false);
        const deletedId = attendeeToDelete.id;
        const deletedSource = attendeeToDelete.source;
        setAttendeeToDelete(null);
        
        // Update attendees list locally
        setAllDayAttendees((prevAttendees) => prevAttendees.filter((a) => {
          if (deletedSource) {
            return !(a.id === deletedId && a.source === deletedSource);
          }
          return a.id !== deletedId;
        }));
        
        // Refresh from server
        if (selectedDay && selectedDate) {
          await fetchAllDayAttendees(selectedDay, selectedDate);
        }
        await fetchSlots();
      } else {
        const { error } = await res.json();
        showToast(error || "Error removing client", "error");
      }
    } catch (error) {
      console.error("Error removing attendee:", error);
      showToast("Error removing client", "error");
    }
  };

  // Get available times for selected day, sorted
  // Note: This includes all times for the day, even if unavailable (they'll be marked as canceled)
  const availableTimes = useMemo(() => {
    if (!selectedDay) return [];
    
    // Filter slots for the selected day, ensuring day names match exactly
    const daySlots = slots.filter(s => {
      const slotDay = s.day?.trim();
      const selectedDayTrimmed = selectedDay?.trim();
      return slotDay === selectedDayTrimmed;
    });
    
    // Get unique times
    const times = daySlots.map(s => s.time).filter((time, index, self) => self.indexOf(time) === index);
    
    return times.sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
  }, [slots, selectedDay]);

  // Get attendees for selected time
  const timeAttendees = useMemo(() => {
    if (!selectedTime) return [];
    return allDayAttendees.filter(a => a.time?.trim() === selectedTime.trim());
  }, [allDayAttendees, selectedTime]);

  // Get all reservations for the day
  const dayReservations = useMemo(() => {
    return allDayAttendees.filter(a => a.source === 'reservation');
  }, [allDayAttendees]);

  // Don't return null - always render so callback can work
  // The parent handles the loading screen

  return (
    <div className="space-y-6 relative">
      {/* Loading Overlay */}
      {refreshing && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="relative size-16">
              <div className="size-full animate-spin rounded-full border-4 border-red-500/20 border-t-red-500" />
              <RotateCw className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-red-400 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">
              Updating time slots and attendance...
            </p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-orbitron)] text-white mb-2">
            Class Management
          </h3>
          <p className="text-zinc-400 text-sm sm:text-base">
            Select a day to view time slots and attendees
          </p>
        </div>
      </div>

      {/* Day Selector */}
      <Card className="border border-red-500/50 bg-black/30 p-4 sm:p-6">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {DAYS_EN.map((day) => {
            const dayDate = getDateForDay(day);
            const isSelected = selectedDay === day;
            return (
              <button
                key={`${day}-${dateUpdateKey}`}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "flex flex-col items-center justify-center px-2 sm:px-4 py-3 rounded-lg border w-full transition-colors",
                  isSelected
                    ? "border-red-500 bg-gradient-to-br from-red-500/20 via-red-500/10 to-black shadow-lg shadow-red-500/30 ring-2 ring-red-500/20"
                    : "border-red-500/50 hover:border-red-500/70 hover:bg-black/50"
                )}
              >
                <span className={cn(
                  "font-bold font-[family-name:var(--font-orbitron)] mb-1 text-xs sm:text-sm",
                  isSelected ? "text-white" : "text-zinc-300"
                )}>
                  {day}
                </span>
                <span className={cn(
                  "text-xs font-[family-name:var(--font-orbitron)]",
                  isSelected ? "text-red-300" : "text-zinc-500"
                )}>
                  {dayDate.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main Content: Time Slots and Attendance */}
      <div className="grid gap-6 lg:grid-cols-2 items-stretch min-h-[800px]">
        {selectedDay ? (
          <>
            {/* Time Slots Section */}
            <Card className="border border-red-500/20 bg-gradient-to-br from-white/5 via-black/50 to-black p-4 sm:p-6 h-full min-h-[800px] flex flex-col flex-shrink-0">
              <div className="mb-4 flex items-center justify-between gap-2">
                <Badge className="bg-red-500/20 border border-red-500/30 text-red-400 font-[family-name:var(--font-orbitron)] flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm">
                  Time Slots
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleRefresh}
                      variant="outline"
                      size="sm"
                      disabled={refreshing}
                      className="border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RotateCw className={cn("size-4 mr-2", refreshing && "animate-spin")} />
                      <span className="text-xs">{refreshing ? "Updating..." : "Refresh"}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh time slots and attendees</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-2">
                {availableTimes.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="size-12 mx-auto mb-4 text-zinc-500 opacity-50" />
                    <p className="text-zinc-400 text-lg mb-2">No time slots configured</p>
                    <p className="text-zinc-500 text-sm">Configure time slots in the Schedules page</p>
                  </div>
                ) : (
                  availableTimes.map((time) => {
                    // Find the slot matching the selected day and time
                    // Ensure day names match (both should be in English after conversion)
                    const slot = slots.find((s) => {
                      const slotDay = s.day?.trim();
                      const selectedDayTrimmed = selectedDay?.trim();
                      const dayMatch = slotDay === selectedDayTrimmed;
                      const timeMatch = s.time?.trim() === time?.trim();
                      return dayMatch && timeMatch;
                    });
                    
                    const isSelected = selectedTime === time;
                    
                    // Determine slot states
                    // 1. Check if slot exists
                    const slotExists = !!slot;
                    
                    // 2. Check if canceled (available === false)
                    // The available field is guaranteed to be a boolean after fetchSlots conversion
                    const isCanceled = slotExists && slot ? slot.available === false : false;
                    
                    // 3. Check if full (no spots remaining)
                    const isFull = slotExists && slot!.spotsRemaining === 0;
                    
                    // 4. Get spots remaining (default to 0 if slot doesn't exist)
                    const spotsRemaining = slotExists ? slot!.spotsRemaining : 0;
                    
                    // 5. Get capacity (default to 14 if slot doesn't exist)
                    const capacity = slotExists ? slot!.capacity : 14;
                    
                    // 6. Get current reservations count
                    const currentReservations = slotExists ? slot!.currentReservations : 0;
                    
                    // 7. Get attendees for this time slot
                    const attendees = allDayAttendees.filter(a => a.time?.trim() === time.trim());
                    const attendeeCount = attendees.length;
                    
                    // 8. Check if time slot has passed
                    const dayDate = selectedDay ? getDateForDay(selectedDay) : new Date();
                    const isPast = isSlotTimePassed(time, dayDate);
                    
                    // Debug: Log status determination for Monday 6:00 AM (after all variables are declared)
                    if (selectedDay === 'Monday' && time === '6:00 AM') {
                      console.log('[ClassesView] Status determination for Monday 6:00 AM:', {
                        slotExists,
                        slotId: slot?.id,
                        available: slot?.available,
                        availableType: typeof slot?.available,
                        isCanceled,
                        isPast,
                        isFull,
                        spotsRemaining,
                        badgeWillShow: isPast ? 'Passed' : isCanceled ? 'Class Canceled' : `${spotsRemaining} available`
                      });
                    }
                    
                    // Validation: Log if slot is missing but time is in availableTimes
                    if (!slotExists && process.env.NODE_ENV === 'development') {
                      console.warn('[ClassesView] Slot not found for:', { day: selectedDay, time, availableSlots: slots.filter(s => s.day === selectedDay).map(s => s.time) });
                    }

                    return (
                      <button
                        key={time}
                        onClick={() => !isCanceled && !isPast && handleTimeClick(time)}
                        disabled={isCanceled || isPast}
                        className={cn(
                          "w-full text-left p-4 sm:p-5 rounded-lg border min-h-[60px] sm:min-h-[56px] transition-colors",
                          (isCanceled || isPast) && "cursor-not-allowed opacity-60",
                          !isCanceled && !isPast && isSelected
                            ? "border-red-500 bg-gradient-to-br from-red-500/20 via-red-500/10 to-black shadow-lg shadow-red-500/30 ring-2 ring-red-500/20"
                            : !isCanceled && !isPast
                            ? "border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5"
                            : isPast
                            ? "border-zinc-600/30 bg-zinc-600/5"
                            : "border-orange-500/30 bg-orange-500/5",
                          isFull && !isCanceled && !isPast && "opacity-60"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                          <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
                            <Clock className={cn(
                              "size-5 flex-shrink-0",
                              isPast ? "text-zinc-600" :
                              isCanceled ? "text-orange-400" :
                              isSelected ? "text-red-400" : "text-zinc-400"
                            )} />
                            <div className="flex flex-col min-w-0">
                              <span className={cn(
                                "font-medium font-[family-name:var(--font-orbitron)] whitespace-nowrap",
                                isPast ? "text-zinc-500" :
                                isCanceled ? "text-orange-300" :
                                isSelected ? "text-white" : "text-zinc-300"
                              )}>
                                {time}
                              </span>
                              {attendeeCount > 0 && !isPast && !isCanceled && (
                                <span className="text-xs text-zinc-400 font-[family-name:var(--font-orbitron)]">
                                  {attendeeCount} {attendeeCount === 1 ? "attendee" : "attendees"}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isPast ? (
                              <Badge className="bg-zinc-600/20 border border-zinc-600/30 text-zinc-500 font-[family-name:var(--font-orbitron)]">
                                Passed
                              </Badge>
                            ) : isCanceled ? (
                              <Badge className="bg-orange-500/20 border border-orange-500/30 text-orange-400 font-[family-name:var(--font-orbitron)]">
                                Class Canceled
                              </Badge>
                            ) : (
                              <Badge
                                className={
                                  isFull
                                    ? "bg-red-500/20 border border-red-500/30 text-red-400 font-[family-name:var(--font-orbitron)]"
                                    : "bg-green-500/20 border border-green-500/30 text-green-400 font-[family-name:var(--font-orbitron)]"
                                }
                              >
                                {spotsRemaining} available
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Attendance Section */}
            <Card className="border border-red-500/20 bg-gradient-to-br from-white/5 via-black/50 to-black p-4 sm:p-6 h-full min-h-[800px] flex flex-col flex-shrink-0">
              <div className="mb-4 flex items-center justify-between gap-2">
                <Badge className="bg-red-500/20 border border-red-500/30 text-red-400 font-[family-name:var(--font-orbitron)] flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm">
                  Attendance
                </Badge>
                <Button
                  onClick={() => {
                    if (!selectedTime) {
                      showToast("Please select a time slot first", "warning");
                      return;
                    }
                    if (!selectedDay) {
                      showToast("Please select a day first", "warning");
                      return;
                    }
                    
                    // Check if time slot has passed
                    const dayDate = getDateForDay(selectedDay);
                    if (isSlotTimePassed(selectedTime, dayDate)) {
                      showToast("Cannot add clients to a time slot that has already passed", "error");
                      return;
                    }
                    
                    // Find slot and validate availability
                    const slot = slots.find((s) => {
                      const slotDay = s.day?.trim();
                      const selectedDayTrimmed = selectedDay?.trim();
                      const dayMatch = slotDay === selectedDayTrimmed;
                      const timeMatch = s.time?.trim() === selectedTime?.trim();
                      return dayMatch && timeMatch;
                    });
                    
                    if (slot && slot.available === false) {
                      showToast("This class is canceled. Attendees cannot be added.", "error");
                      return;
                    }
                    setShowAddAttendee(true);
                  }}
                  disabled={(() => {
                    if (!selectedTime || !selectedDay) return false;
                    const dayDate = getDateForDay(selectedDay);
                    if (isSlotTimePassed(selectedTime, dayDate)) return true;
                    // Find slot with robust matching
                    const slot = slots.find((s) => {
                      const slotDay = s.day?.trim();
                      const selectedDayTrimmed = selectedDay?.trim();
                      const dayMatch = slotDay === selectedDayTrimmed;
                      const timeMatch = s.time?.trim() === selectedTime?.trim();
                      return dayMatch && timeMatch;
                    });
                    return slot && slot.available === false;
                  })()}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="mr-2 size-4 sm:size-3.5" />
                  <span className="text-sm sm:text-xs">Add</span>
                </Button>
              </div>

              <div id="attendance-section" className="space-y-4 flex-1 overflow-y-auto pr-2">
                {selectedTime ? (
                  // Show attendees for selected time
                  timeAttendees.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-red-500/20">
                        <Clock className="size-5 text-red-400" />
                        <h4 className="text-xl font-bold font-[family-name:var(--font-orbitron)] text-white">
                          {selectedTime}
                        </h4>
                        <Badge className="bg-red-500/20 border border-red-500/30 text-red-400 font-[family-name:var(--font-orbitron)] text-xs">
                          {timeAttendees.length} {timeAttendees.length === 1 ? "attendee" : "attendees"}
                        </Badge>
                      </div>
                      {timeAttendees.map((attendee) => {
                        const reservationDate = attendee.source === 'reservation' && attendee.date 
                          ? parseDateLocal(attendee.date) 
                          : null;
                        const isPast = reservationDate && attendee.time 
                          ? isReservationPast(reservationDate, attendee.time)
                          : false;
                        
                        return (
                          <div
                            key={`${attendee.source || 'unknown'}-${attendee.id}`}
                            className={cn(
                              "group flex items-center justify-between p-3 sm:p-4 rounded-lg border transition-all",
                              isPast
                                ? "border-zinc-600/30 bg-zinc-600/5 opacity-60"
                                : "border-red-500/20 bg-white/5 hover:bg-white/10 hover:border-red-500/30"
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <p className={cn(
                                  "text-base sm:text-sm font-bold font-[family-name:var(--font-orbitron)] break-words",
                                  isPast ? "text-zinc-500" : "text-white"
                                )}>
                                  {attendee.userName}
                                </p>
                                {isPast ? (
                                  <Badge className="bg-zinc-600/20 border border-zinc-600/30 text-zinc-500 font-[family-name:var(--font-orbitron)] text-xs">
                                    Passed
                                  </Badge>
                                ) : attendee.source === 'reservation' ? (
                                  <Badge className="bg-blue-500/20 border border-blue-500/30 text-blue-400 font-[family-name:var(--font-orbitron)] text-xs">
                                    Reservation
                                  </Badge>
                                ) : attendee.source === 'manager' ? (
                                  <Badge className="bg-green-500/20 border border-green-500/30 text-green-400 font-[family-name:var(--font-orbitron)] text-xs">
                                    Added
                                  </Badge>
                                ) : null}
                              </div>
                              <p className={cn(
                                "text-xs sm:text-sm break-words",
                                isPast ? "text-zinc-500" : "text-zinc-400"
                              )}>
                                {attendee.userEmail}
                              </p>
                              {attendee.time && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Clock className={cn(
                                    "size-3.5",
                                    isPast ? "text-zinc-600" : attendee.source === 'reservation' ? "text-blue-400" : "text-green-400"
                                  )} />
                                  <p className={cn(
                                    "text-xs font-[family-name:var(--font-orbitron)]",
                                    isPast ? "text-zinc-500" : attendee.source === 'reservation' ? "text-blue-300" : "text-green-300"
                                  )}>
                                    {attendee.date ? (
                                      <>
                                        {parseDateLocal(attendee.date).toLocaleDateString("en-US", {
                                          weekday: "short",
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        })} - {attendee.time}
                                      </>
                                    ) : (
                                      attendee.time
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveAttendeeClick(attendee.id, attendee.source, attendee.time)}
                                  disabled={(() => {
                                    if (!attendee.time) return false;
                                    if (isPast) return true;
                                    // Find slot with robust matching
                                    const slot = slots.find((s) => {
                                      const slotDay = s.day?.trim();
                                      const selectedDayTrimmed = selectedDay?.trim();
                                      const attendeeTime = attendee.time?.trim();
                                      const dayMatch = slotDay === selectedDayTrimmed;
                                      const timeMatch = s.time?.trim() === attendeeTime;
                                      return dayMatch && timeMatch;
                                    });
                                    return slot && slot.available === false;
                                  })()}
                                  className={cn(
                                    "min-h-[36px] sm:min-h-[32px] min-w-[36px] sm:min-w-[32px] flex-shrink-0 ml-2 disabled:opacity-50 disabled:cursor-not-allowed",
                                    isPast
                                      ? "border-zinc-600/30 bg-zinc-600/10 text-zinc-500 cursor-not-allowed"
                                      : "border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50"
                                  )}
                                >
                                  <X className="size-3.5 sm:size-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {(() => {
                                    if (!attendee.time) return "Remove client";
                                    if (isPast) return "Reservation has passed - Cannot be removed";
                                    // Find slot with robust matching
                                    const slot = slots.find((s) => {
                                      const slotDay = s.day?.trim();
                                      const selectedDayTrimmed = selectedDay?.trim();
                                      const attendeeTime = attendee.time?.trim();
                                      const dayMatch = slotDay === selectedDayTrimmed;
                                      const timeMatch = s.time?.trim() === attendeeTime;
                                      return dayMatch && timeMatch;
                                    });
                                    return slot && slot.available === false ? "Class canceled - Attendees cannot be removed" : "Remove client";
                                  })()}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                      <Users className="size-12 mx-auto mb-4 text-zinc-500" />
                      <p className="text-zinc-400 text-lg mb-2">No attendees for this time slot</p>
                      <p className="text-zinc-500 text-sm">Use the "Add" button to add clients</p>
                    </div>
                  )
                ) : (
                  // Show all reservations when no time is selected
                  dayReservations.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-blue-500/20">
                        <Calendar className="size-5 text-blue-400" />
                        <h4 className="text-xl font-bold font-[family-name:var(--font-orbitron)] text-white">
                          Reservations
                        </h4>
                        <Badge className="bg-blue-500/20 border border-blue-500/30 text-blue-400 font-[family-name:var(--font-orbitron)] text-xs">
                          {dayReservations.length} {dayReservations.length === 1 ? "reservation" : "reservations"}
                        </Badge>
                      </div>
                      {dayReservations.map((attendee) => {
                        const reservationDate = attendee.date ? parseDateLocal(attendee.date) : null;
                        const isPast = reservationDate && attendee.time 
                          ? isReservationPast(reservationDate, attendee.time)
                          : false;
                        
                        return (
                          <div
                            key={`reservation-${attendee.id}`}
                            className={cn(
                              "group flex items-center justify-between p-3 sm:p-4 rounded-lg border transition-all",
                              isPast
                                ? "border-zinc-600/30 bg-zinc-600/5 opacity-60"
                                : "border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/30"
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <p className={cn(
                                  "text-base sm:text-sm font-bold font-[family-name:var(--font-orbitron)] break-words",
                                  isPast ? "text-zinc-500" : "text-white"
                                )}>
                                  {attendee.userName}
                                </p>
                                {isPast ? (
                                  <Badge className="bg-zinc-600/20 border border-zinc-600/30 text-zinc-500 font-[family-name:var(--font-orbitron)] text-xs">
                                    Passed
                                  </Badge>
                                ) : (
                                  <Badge className="bg-blue-500/20 border border-blue-500/30 text-blue-400 font-[family-name:var(--font-orbitron)] text-xs">
                                    Reservation
                                  </Badge>
                                )}
                              </div>
                              <p className={cn(
                                "text-xs sm:text-sm break-words mb-1",
                                isPast ? "text-zinc-500" : "text-zinc-400"
                              )}>
                                {attendee.userEmail}
                              </p>
                              {attendee.time && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Clock className={cn(
                                    "size-3.5",
                                    isPast ? "text-zinc-600" : "text-blue-400"
                                  )} />
                                  <p className={cn(
                                    "text-xs font-[family-name:var(--font-orbitron)]",
                                    isPast ? "text-zinc-500" : "text-blue-300"
                                  )}>
                                    {reservationDate ? (
                                      <>
                                        {reservationDate.toLocaleDateString("en-US", {
                                          weekday: "short",
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        })} - {attendee.time}
                                      </>
                                    ) : (
                                      attendee.time
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveAttendeeClick(attendee.id, attendee.source, attendee.time)}
                                  disabled={(() => {
                                    if (!attendee.time) return false;
                                    // Find slot with robust matching
                                    const slot = slots.find((s) => {
                                      const slotDay = s.day?.trim();
                                      const selectedDayTrimmed = selectedDay?.trim();
                                      const attendeeTime = attendee.time?.trim();
                                      const dayMatch = slotDay === selectedDayTrimmed;
                                      const timeMatch = s.time?.trim() === attendeeTime;
                                      return dayMatch && timeMatch;
                                    });
                                    return (slot && slot.available === false) || isPast;
                                  })()}
                                  className={cn(
                                    "min-h-[36px] sm:min-h-[32px] min-w-[36px] sm:min-w-[32px] flex-shrink-0 ml-2 disabled:opacity-50 disabled:cursor-not-allowed",
                                    isPast
                                      ? "border-zinc-600/30 bg-zinc-600/10 text-zinc-500 cursor-not-allowed"
                                      : "border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50"
                                  )}
                                >
                                  <X className="size-3.5 sm:size-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {(() => {
                                    if (!attendee.time) return "Remove client";
                                    if (isPast) return "Reservation has passed - Cannot be removed";
                                    // Find slot with robust matching
                                    const slot = slots.find((s) => {
                                      const slotDay = s.day?.trim();
                                      const selectedDayTrimmed = selectedDay?.trim();
                                      const attendeeTime = attendee.time?.trim();
                                      const dayMatch = slotDay === selectedDayTrimmed;
                                      const timeMatch = s.time?.trim() === attendeeTime;
                                      return dayMatch && timeMatch;
                                    });
                                    return slot && slot.available === false ? "Class canceled - Attendees cannot be removed" : "Remove client";
                                  })()}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                      <Users className="size-12 mx-auto mb-4 text-zinc-500" />
                      <p className="text-zinc-400 text-lg mb-2">No attendees registered</p>
                      <p className="text-zinc-500 text-sm">
                        Select a time slot and use the "Add" button to add clients
                      </p>
                    </div>
                  )
                )}
              </div>
            </Card>
          </>
        ) : (
          <>
            {/* Placeholder when no day is selected */}
            <Card className="border border-red-500/20 bg-gradient-to-br from-white/5 via-black/50 to-black p-4 sm:p-6 flex items-center justify-center h-full min-h-[800px] flex-shrink-0">
              <div className="text-center">
                <Calendar className="size-16 mx-auto mb-4 text-zinc-500" />
                <p className="text-zinc-400 text-lg mb-2">Select a day to view time slots</p>
                <p className="text-zinc-500 text-sm">Choose a day from above to get started</p>
              </div>
            </Card>
            <Card className="border border-red-500/20 bg-gradient-to-br from-white/5 via-black/50 to-black p-4 sm:p-6 flex items-center justify-center h-full min-h-[800px] flex-shrink-0">
              <div className="text-center">
                <Users className="size-16 mx-auto mb-4 text-zinc-500" />
                <p className="text-zinc-400 text-lg mb-2">Select a day to view attendance</p>
                <p className="text-zinc-500 text-sm">Choose a day from above to see attendees</p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Add Attendee Modal */}
      <Dialog open={showAddAttendee} onOpenChange={setShowAddAttendee}>
        <DialogContent className="border border-red-500/50 bg-black text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <Logo variant="compact" showLink={false} className="justify-center mb-1" />
            <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs px-3 py-1 w-fit mx-auto">
              Add Client
            </Badge>
            <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent text-center pt-1">
              Add Client to Class
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-zinc-400 text-center">
              Select a client to add them to {selectedDay} - {selectedTime}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Client *
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full min-h-[48px] sm:h-12 text-base sm:text-sm border border-red-500/20 bg-black text-white rounded-md px-4 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 [&>option]:bg-black [&>option]:text-white"
              >
                <option value="" className="bg-black text-white">Select a client</option>
                {(() => {
                  const registeredUserIds = new Set(
                    allDayAttendees
                      .filter(a => a.time?.trim() === selectedTime?.trim())
                      .map(a => a.userId)
                  );
                  const availableUsers = users.filter(user => !registeredUserIds.has(user.id));
                  
                  return availableUsers.map((user) => (
                    <option key={user.id} value={user.id} className="bg-black text-white">
                      {user.name} ({user.email})
                    </option>
                  ));
                })()}
              </select>
              {(() => {
                const registeredUserIds = new Set(
                  allDayAttendees
                    .filter(a => a.time?.trim() === selectedTime?.trim())
                    .map(a => a.userId)
                );
                const availableUsers = users.filter(user => !registeredUserIds.has(user.id));
                
                if (availableUsers.length === 0 && users.length > 0) {
                  return (
                    <p className="text-xs text-yellow-400 font-[family-name:var(--font-orbitron)]">
                      All clients are already registered for this time slot
                    </p>
                  );
                }
                return null;
              })()}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Date
              </label>
              <div className="min-h-[48px] sm:h-12 text-base sm:text-sm border border-red-500/20 bg-white/5 text-white rounded-md px-4 py-3 flex items-center">
                {selectedDate ? parseDateLocal(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }) : "Select a day first"}
              </div>
              <p className="text-xs text-zinc-500">The date is calculated automatically based on the selected day</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddAttendee(false)}
                className="flex-1 border-black/50 bg-black/30 text-white hover:bg-black/50 hover:border-red-500/50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddAttendee}
                disabled={!selectedUserId}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50"
              >
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="border border-red-500/50 bg-black text-white">
          <DialogHeader>
            <Logo variant="compact" showLink={false} className="justify-center mb-1" />
            <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs px-3 py-1 w-fit mx-auto">
              Confirm Deletion
            </Badge>
            <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent text-center pt-1">
              Remove Client?
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-zinc-400 text-center">
              Are you sure you want to remove this client from the class? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setAttendeeToDelete(null);
              }}
              className="flex-1 border-zinc-500/40 bg-zinc-500/10 text-zinc-300 hover:bg-zinc-500/20 hover:border-zinc-500/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
