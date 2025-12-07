"use client";

import { useState, useEffect } from "react";
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
}

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const times = ["5:00 AM", "6:00 AM", "7:00 AM", "8:00 AM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"];

// Helper to get date for a day name
const getDateForDay = (dayName: string, baseDate: Date = new Date()): Date => {
  const dayMap: Record<string, number> = {
    Lunes: 1,
    Martes: 2,
    Miércoles: 3,
    Jueves: 4,
    Viernes: 5,
    Sábado: 6,
  };

  const today = new Date(baseDate);
  const currentDay = today.getDay() === 0 ? 7 : today.getDay();
  const targetDay = dayMap[dayName] || 1;

  let daysToAdd = targetDay - currentDay;
  if (daysToAdd < 0) {
    daysToAdd += 7;
  }

  // Create date in local timezone to avoid timezone issues
  const date = new Date(today);
  date.setHours(0, 0, 0, 0); // Set to midnight to avoid timezone shifts
  date.setDate(today.getDate() + daysToAdd);
  return date;
};

export function ClassesView({ onAddAttendee }: ClassesViewProps) {
  const { showToast } = useToast();
  const [slots, setSlots] = useState<ClassSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [allDayAttendees, setAllDayAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAttendee, setShowAddAttendee] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [attendeeToDelete, setAttendeeToDelete] = useState<{ id: number; source?: 'reservation' | 'manager'; time?: string } | null>(null);
  const [users, setUsers] = useState<Array<{ id: number; name: string; email: string }>>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSlots();
    fetchUsers();
    
    // Set initial day to today or first available day
    const today = new Date();
    const currentDayName = getCurrentDayName(today);
    setSelectedDay(currentDayName);
    const initialDate = getDateForDay(currentDayName, today);
    setSelectedDate(formatDateLocal(initialDate));
    
    // Find nearest reservation across next 7 days (only once on mount)
    findNearestReservationAcrossDays();
  }, []);

  useEffect(() => {
    if (selectedDay && selectedDate) {
      fetchAllDayAttendees(selectedDay, selectedDate);
    }
  }, [selectedDay, selectedDate]);

  const getCurrentDayName = (date: Date = new Date()): string => {
    const dayOfWeek = date.getDay();
    const dayMap: Record<number, string> = {
      0: days[0], // Sunday -> Monday
      1: "Lunes",
      2: "Martes",
      3: "Miércoles",
      4: "Jueves",
      5: "Viernes",
      6: "Sábado",
    };
    return dayMap[dayOfWeek] || days[0];
  };

  const fetchSlots = async () => {
    try {
      const res = await fetch("/api/class-slots");
      if (res.ok) {
        const { slots: slotsData } = await res.json();
        setSlots(slotsData);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const fetchAllDayAttendees = async (day: string, date: string) => {
    try {
      console.log("[Frontend] Fetching attendees for:", { day, date });
      const res = await fetch(
        `/api/manager/class-attendees?day=${encodeURIComponent(day)}&date=${encodeURIComponent(date)}`
      );
      if (res.ok) {
        const data = await res.json();
        const attendeesData = data.attendees || [];
        console.log("[Frontend] Fetched attendees:", {
          count: attendeesData.length,
          data: attendeesData,
          firstFew: attendeesData.slice(0, 3)
        });
        setAllDayAttendees(attendeesData);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("[Frontend] Error response:", res.status, res.statusText, errorData);
        showToast(`Error al cargar asistentes: ${errorData.error || res.statusText}`, "error");
      }
    } catch (error) {
      console.error("[Frontend] Error fetching attendees:", error);
      showToast("Error al cargar asistentes", "error");
    }
  };

  const findNearestReservationAcrossDays = async () => {
    const now = new Date();
    now.setSeconds(0, 0);
    
    let nearestReservation: { attendee: Attendee; date: Date; dayName: string; dateStr: string } | null = null;
    
    // Check next 7 days for reservations
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() + i);
      const dayName = getCurrentDayName(checkDate);
      const dateStr = formatDateLocal(checkDate);
      
      try {
        const res = await fetch(
          `/api/manager/class-attendees?day=${encodeURIComponent(dayName)}&date=${encodeURIComponent(dateStr)}`
        );
        
        if (res.ok) {
          const data = await res.json();
          const attendees = data.attendees || [];
          const reservations = attendees.filter((a: Attendee) => a.source === 'reservation' && a.date);
          
          for (const reservation of reservations) {
            if (!reservation.date || !reservation.time) continue;
            
            try {
              const reservationDate = parseDateLocal(reservation.date);
              
              // Parse time string (e.g., "5:00 AM") and set it on the date
              const timeMatch = reservation.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
              if (timeMatch) {
                let hours = parseInt(timeMatch[1]);
                const minutes = parseInt(timeMatch[2]);
                const period = timeMatch[3].toUpperCase();
                
                if (period === 'PM' && hours !== 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;
                
                reservationDate.setHours(hours, minutes, 0, 0);
              }
              
              // Only consider future reservations
              if (reservationDate > now) {
                if (!nearestReservation || reservationDate < nearestReservation.date) {
                  nearestReservation = {
                    attendee: reservation,
                    date: reservationDate,
                    dayName: dayName,
                    dateStr: dateStr
                  };
                }
              }
            } catch (error) {
              console.error("Error parsing reservation date:", error);
            }
          }
          
          // If we found a nearest reservation, we can stop searching
          // (since we're going day by day chronologically)
          if (nearestReservation) {
            break;
          }
        }
      } catch (error) {
        console.error(`Error fetching attendees for ${dayName}:`, error);
      }
    }
    
    if (nearestReservation) {
      setSelectedDay(nearestReservation.dayName);
      setSelectedDate(nearestReservation.dateStr);
      setSelectedTime(nearestReservation.attendee.time);
      setHasInitialized(true);
      
      console.log("[Frontend] Selected nearest reservation:", {
        day: nearestReservation.dayName,
        date: nearestReservation.dateStr,
        time: nearestReservation.attendee.time,
        userName: nearestReservation.attendee.userName
      });
    } else {
      setHasInitialized(true);
    }
  };

  const findAndSelectNearestReservation = (attendees: Attendee[]) => {
    // This function is kept for backward compatibility but won't be used on initial load
    // since we now search across multiple days
    const now = new Date();
    now.setSeconds(0, 0);
    
    const reservations = attendees.filter(a => a.source === 'reservation' && a.date);
    
    if (reservations.length === 0) {
      return;
    }
    
    let nearestReservation: Attendee | null = null;
    let nearestDateTime: Date | null = null;
    
    for (const reservation of reservations) {
      if (!reservation.date) continue;
      
      try {
        const reservationDate = parseDateLocal(reservation.date);
        
        const timeMatch = reservation.time?.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          const period = timeMatch[3].toUpperCase();
          
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          
          reservationDate.setHours(hours, minutes, 0, 0);
        }
        
        if (reservationDate > now) {
          if (!nearestDateTime || reservationDate < nearestDateTime) {
            nearestDateTime = reservationDate;
            nearestReservation = reservation;
          }
        }
      } catch (error) {
        console.error("Error parsing reservation date:", error);
      }
    }
    
    if (nearestReservation && nearestReservation.date && nearestReservation.time) {
      const nearestDate = parseDateLocal(nearestReservation.date);
      const nearestDayName = getCurrentDayName(nearestDate);
      
      setSelectedDay(nearestDayName);
      setSelectedDate(formatDateLocal(nearestDate));
      setSelectedTime(nearestReservation.time);
    }
  };

  const handleDayClick = (day: string) => {
    setSelectedDay(day);
    setSelectedTime(null);
    
    // Calculate date for the selected day
    const date = getDateForDay(day);
    setSelectedDate(formatDateLocal(date));
  };

  const handleTimeClick = (time: string) => {
    // Check if the slot is canceled
    const slot = slots.find((s) => s.day === selectedDay && s.time === time);
    if (slot && !slot.available) {
      showToast("Esta clase está cancelada. No se pueden realizar acciones.", "warning");
      return;
    }
    
    setSelectedTime(time);
    // Scroll to the attendance section to show the selected time's attendees
    setTimeout(() => {
      const attendanceSection = document.getElementById('attendance-section');
      if (attendanceSection) {
        attendanceSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleAddAttendee = async () => {
    if (!selectedDay || !selectedTime || !selectedUserId || !selectedDate) {
      showToast("Por favor completa todos los campos", "error");
      return;
    }
    
    // Check if the slot is canceled
    const slot = slots.find((s) => s.day === selectedDay && s.time === selectedTime);
    if (slot && !slot.available) {
      showToast("Esta clase está cancelada. No se pueden agregar asistentes.", "error");
      return;
    }

    try {
      const res = await fetch("/api/manager/class-attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(selectedUserId),
          day: selectedDay,
          time: selectedTime,
          date: selectedDate,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Usuario agregado a la clase exitosamente", "success");
        setShowAddAttendee(false);
        setSelectedUserId("");
        
        // Update slots counter locally for immediate feedback
        if (selectedDay && selectedTime) {
          setSlots((prevSlots) =>
            prevSlots.map((slot) => {
              if (slot.day === selectedDay && slot.time === selectedTime) {
                return {
                  ...slot,
                  spotsRemaining: Math.max(0, slot.spotsRemaining - 1),
                  currentReservations: slot.currentReservations + 1,
                };
              }
              return slot;
            })
          );
        }
        
        // Refresh all day attendees from server
        fetchAllDayAttendees(selectedDay, selectedDate);
        
        // Refresh slots from server to ensure consistency
        fetchSlots();
        
        onAddAttendee?.();
      } else {
        showToast(data.error || "Error al agregar usuario", "error");
      }
    } catch (error) {
      console.error("Error adding attendee:", error);
      showToast("Error al agregar usuario", "error");
    }
  };

  const handleRemoveAttendeeClick = (attendeeId: number, source?: 'reservation' | 'manager', time?: string) => {
    // Check if the slot is canceled
    if (time) {
      const slot = slots.find((s) => s.day === selectedDay && s.time === time);
      if (slot && !slot.available) {
        showToast("Esta clase está cancelada. No se pueden eliminar asistentes.", "error");
        return;
      }
    }
    setAttendeeToDelete({ id: attendeeId, source, time });
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!attendeeToDelete) return;

    try {
      // Determine which endpoint to use based on source
      const endpoint = attendeeToDelete.source === 'reservation' 
        ? `/api/manager/reservations/${attendeeToDelete.id}`
        : `/api/manager/class-attendees/${attendeeToDelete.id}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Cliente removido de la clase exitosamente", "success");
        setShowDeleteConfirm(false);
        const deletedId = attendeeToDelete.id;
        const deletedSource = attendeeToDelete.source;
        setAttendeeToDelete(null);
        
        // Update slots counter locally for immediate feedback
        if (selectedDay && attendeeToDelete.time) {
          setSlots((prevSlots) =>
            prevSlots.map((slot) => {
              if (slot.day === selectedDay && slot.time === attendeeToDelete.time) {
                return {
                  ...slot,
                  spotsRemaining: slot.spotsRemaining + 1,
                  currentReservations: Math.max(0, slot.currentReservations - 1),
                };
              }
              return slot;
            })
          );
        }
        
        // Update attendees list locally for immediate feedback
        setAllDayAttendees((prevAttendees) => prevAttendees.filter((a) => {
          // Filter by both id and source to ensure correct removal
          if (deletedSource) {
            return !(a.id === deletedId && a.source === deletedSource);
          }
          return a.id !== deletedId;
        }));
        
        // Refresh all day attendees from server
        if (selectedDay && selectedDate) {
          fetchAllDayAttendees(selectedDay, selectedDate);
        }
        
        // Refresh slots from server to ensure consistency
        fetchSlots();
      } else {
        const { error } = await res.json();
        showToast(error || "Error al remover cliente", "error");
      }
    } catch (error) {
      console.error("Error removing attendee:", error);
      showToast("Error al remover cliente", "error");
    }
  };

  const getDayDate = (dayName: string): Date => {
    return getDateForDay(dayName);
  };

  // Group attendees by time slot
  const attendeesByTime = times.reduce((acc, time) => {
    acc[time] = allDayAttendees.filter(a => {
      // Normalize time comparison (handle potential whitespace or format differences)
      const attendeeTime = a.time?.trim();
      const slotTime = time.trim();
      // Exact match required
      const matches = attendeeTime === slotTime;
      return matches;
    });
    return acc;
  }, {} as Record<string, Attendee[]>);
  
  // Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("[Frontend] All day attendees:", {
      total: allDayAttendees.length,
      attendees: allDayAttendees.map(a => ({ name: a.userName, time: a.time, day: a.day })),
      times: allDayAttendees.map(a => a.time),
      uniqueTimes: [...new Set(allDayAttendees.map(a => a.time))]
    });
    console.log("[Frontend] Attendees by time:", Object.keys(attendeesByTime).map(time => ({
      time,
      count: attendeesByTime[time].length,
      names: attendeesByTime[time].map(a => a.userName)
    })));
    console.log("[Frontend] Times array:", times);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-20">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Clock className="size-6 sm:size-8 text-red-500 animate-pulse" />
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-lg sm:text-xl font-bold font-[family-name:var(--font-orbitron)] text-white mb-2">
            Cargando horarios
          </p>
          <p className="text-sm sm:text-base text-zinc-400">
            Por favor espera un momento...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Loading Overlay */}
      {refreshing && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="relative size-16">
              <div className="size-full animate-spin rounded-full border-4 border-red-500/30 border-t-red-500" />
              <RotateCw className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-red-400 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">
              Actualizando horarios y asistencia...
            </p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-orbitron)] text-white mb-2">
            Gestión de Clases
          </h3>
          <p className="text-zinc-400 text-sm sm:text-base">
            Selecciona un día para ver los horarios y asistentes
          </p>
        </div>
      </div>

      {/* Day Selector */}
      <Card className="border border-red-500/50 bg-black/30 p-4 sm:p-6">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {days.map((day) => {
            const dayDate = getDateForDay(day);
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "flex flex-col items-center justify-center px-2 sm:px-4 py-3 rounded-lg border transition-all duration-300 w-full",
                  isSelected
                    ? "border-red-500 bg-gradient-to-br from-red-500/20 via-red-500/10 to-black shadow-lg shadow-red-500/30 ring-2 ring-red-500/20"
                    : "border-red-500/50 hover:border-red-500/70 hover:bg-black/50 active:scale-[0.98]"
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
                  {dayDate.toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main Content: Horarios and Attendance */}
      {selectedDay && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Horarios Section */}
          <Card className="border border-red-500/20 bg-gradient-to-br from-white/5 via-black/50 to-black p-5 sm:p-6 lg:p-7">
            <div className="mb-4 flex items-center justify-between gap-2">
              <Badge className="bg-red-500/20 border border-red-500/30 text-red-400 font-[family-name:var(--font-orbitron)] min-h-[44px] sm:min-h-[40px] flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm">
                Horarios
              </Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={async () => {
                      setRefreshing(true);
                      try {
                        // Refresh both slots and attendees in parallel
                        await Promise.all([
                          fetchSlots(),
                          selectedDay && selectedDate 
                            ? fetchAllDayAttendees(selectedDay, selectedDate)
                            : Promise.resolve()
                        ]);
                        showToast("Horarios y asistencia actualizados", "success");
                      } catch (error) {
                        console.error("Error refreshing:", error);
                        showToast("Error al actualizar", "error");
                      } finally {
                        setRefreshing(false);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    disabled={refreshing}
                    className="min-h-[44px] sm:min-h-[40px] border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/50 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCw className={`size-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="text-xs">{refreshing ? "Actualizando..." : "Refrescar"}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refrescar horarios y asistentes</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="space-y-2">
              {(() => {
                // Get all unique times from slots for the selected day
                const availableTimes = slots
                  .filter(s => s.day === selectedDay)
                  .map(s => s.time)
                  .filter((time, index, self) => self.indexOf(time) === index)
                  .sort((a, b) => {
                    // Sort times properly
                    const parseTime = (t: string) => {
                      const [time, period] = t.split(' ');
                      const [hours, minutes] = time.split(':');
                      let h = parseInt(hours);
                      if (period === 'PM' && h !== 12) h += 12;
                      if (period === 'AM' && h === 12) h = 0;
                      return h * 60 + parseInt(minutes);
                    };
                    return parseTime(a) - parseTime(b);
                  });
                
                // If no slots exist, show all times as unavailable
                if (availableTimes.length === 0) {
                  return times.map((time) => (
                    <div
                      key={time}
                      className="w-full text-left p-4 sm:p-5 rounded-lg border border-black/50 bg-black/30 opacity-50 cursor-not-allowed min-h-[60px] sm:min-h-[56px]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="size-5 text-zinc-500" />
                          <div className="flex flex-col">
                            <span className="font-medium font-[family-name:var(--font-orbitron)] text-zinc-500">
                              {time}
                            </span>
                          </div>
                        </div>
                        <Badge className="bg-black/30 border border-black/50 text-zinc-500 font-[family-name:var(--font-orbitron)]">
                          No disponible
                        </Badge>
                      </div>
                    </div>
                  ));
                }
                
                return availableTimes.map((time) => {
                  const slot = slots.find((s) => s.day === selectedDay && s.time === time);
                  const isSelected = selectedTime === time;
                  const isFull = slot && slot.spotsRemaining === 0;
                  const isCanceled = slot && !slot.available;
                  const timeAttendees = attendeesByTime[time] || [];
                  const attendeeCount = timeAttendees.length;
                  
                  // Default values if no slot exists (shouldn't happen but just in case)
                  const defaultCapacity = 14;
                  const defaultSpotsRemaining = slot ? slot.spotsRemaining : defaultCapacity;

                  return (
                    <button
                      key={time}
                      onClick={() => !isCanceled && handleTimeClick(time)}
                      disabled={isCanceled}
                      className={cn(
                        "w-full text-left p-4 sm:p-5 rounded-lg border transition-all duration-300 min-h-[60px] sm:min-h-[56px]",
                        isCanceled && "cursor-not-allowed opacity-60",
                        !isCanceled && isSelected
                          ? "border-red-500 bg-gradient-to-br from-red-500/20 via-red-500/10 to-black shadow-lg shadow-red-500/30 ring-2 ring-red-500/20"
                          : !isCanceled
                          ? "border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 active:scale-[0.98]"
                          : "border-orange-500/30 bg-orange-500/5",
                        isFull && !isCanceled && "opacity-60"
                      )}
                    >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className={cn("size-5", isSelected ? "text-red-400" : "text-zinc-400")} />
                        <div className="flex flex-col">
                          <span className={cn(
                            "font-medium font-[family-name:var(--font-orbitron)]",
                            isSelected ? "text-white" : "text-zinc-300"
                          )}>
                            {time}
                          </span>
                          {attendeeCount > 0 && (
                            <span className="text-xs text-zinc-400 font-[family-name:var(--font-orbitron)]">
                              {attendeeCount} {attendeeCount === 1 ? "asistente" : "asistentes"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCanceled ? (
                          <Badge className="bg-orange-500/20 border border-orange-500/30 text-orange-400 font-[family-name:var(--font-orbitron)]">
                            Clase Cancelada
                          </Badge>
                        ) : (
                          <Badge
                            className={
                              isFull
                                ? "bg-red-500/20 border border-red-500/30 text-red-400 font-[family-name:var(--font-orbitron)]"
                                : "bg-green-500/20 border border-green-500/30 text-green-400 font-[family-name:var(--font-orbitron)]"
                            }
                          >
                            {defaultSpotsRemaining} disponibles
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                  );
                });
              })()}
            </div>
          </Card>

          {/* Attendance Section */}
          <Card className="border border-red-500/20 bg-gradient-to-br from-white/5 via-black/50 to-black p-5 sm:p-6 lg:p-7">
            <div className="mb-4 flex items-center justify-between gap-2">
              <Badge className="bg-red-500/20 border border-red-500/30 text-red-400 font-[family-name:var(--font-orbitron)] min-h-[44px] sm:min-h-[40px] flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm">
                Asistencia
              </Badge>
              <Button
                onClick={() => {
                  if (!selectedTime) {
                    showToast("Por favor selecciona un horario primero", "warning");
                    return;
                  }
                  // Check if the slot is canceled
                  const slot = slots.find((s) => s.day === selectedDay && s.time === selectedTime);
                  if (slot && !slot.available) {
                    showToast("Esta clase está cancelada. No se pueden agregar asistentes.", "error");
                    return;
                  }
                  setShowAddAttendee(true);
                }}
                disabled={(() => {
                  if (!selectedTime) return false;
                  const slot = slots.find((s) => s.day === selectedDay && s.time === selectedTime);
                  return slot && !slot.available;
                })()}
                className="min-h-[44px] sm:min-h-[40px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="mr-2 size-4 sm:size-3.5" />
                <span className="text-sm sm:text-xs">Agregar</span>
              </Button>
            </div>

            {allDayAttendees.length > 0 ? (
              <div id="attendance-section" className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {selectedTime ? (
                  // Show only selected time's attendees - filter directly from allDayAttendees
                  (() => {
                    // Filter attendees for the selected time with exact match
                    const timeAttendees = allDayAttendees.filter(a => {
                      const attendeeTime = a.time?.trim();
                      const selectedTimeTrimmed = selectedTime.trim();
                      return attendeeTime === selectedTimeTrimmed;
                    });
                    
                    if (process.env.NODE_ENV === "development") {
                      console.log(`[Frontend] Filtering for selected time "${selectedTime}":`, {
                        totalAttendees: allDayAttendees.length,
                        filteredCount: timeAttendees.length,
                        filteredAttendees: timeAttendees.map(a => ({ name: a.userName, time: a.time }))
                      });
                    }
                    
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-red-500/20">
                          <Clock className="size-5 text-red-400" />
                          <h4 className="text-xl font-bold font-[family-name:var(--font-orbitron)] text-white">
                            {selectedTime}
                          </h4>
                          <Badge className="bg-red-500/20 border border-red-500/30 text-red-400 font-[family-name:var(--font-orbitron)] text-xs">
                            {timeAttendees.length} {timeAttendees.length === 1 ? "asistente" : "asistentes"}
                          </Badge>
                        </div>
                        {timeAttendees.length > 0 ? (
                          <div className="space-y-2">
                            {timeAttendees.map((attendee) => (
                              <div
                                key={`${attendee.source || 'unknown'}-${attendee.id}`}
                                className="group flex items-center justify-between p-3 sm:p-4 rounded-lg border border-red-500/20 bg-white/5 hover:bg-white/10 hover:border-red-500/30 transition-all duration-300"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <p className="text-base sm:text-sm font-bold font-[family-name:var(--font-orbitron)] text-white break-words">
                                      {attendee.userName}
                                    </p>
                                    {attendee.source === 'reservation' ? (
                                      <Badge className="bg-blue-500/20 border border-blue-500/30 text-blue-400 font-[family-name:var(--font-orbitron)] text-xs">
                                        Reserva
                                      </Badge>
                                    ) : attendee.source === 'manager' ? (
                                      <Badge className="bg-green-500/20 border border-green-500/30 text-green-400 font-[family-name:var(--font-orbitron)] text-xs">
                                        Agregado
                                      </Badge>
                                    ) : null}
                                  </div>
                                  <p className="text-xs sm:text-sm text-zinc-400 break-words">{attendee.userEmail}</p>
                                  {attendee.source === 'reservation' && attendee.date && (
                                    <p className="text-xs text-zinc-500 mt-1">
                                      {parseDateLocal(attendee.date).toLocaleDateString("es-ES", {
                                        weekday: "short",
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })} - {attendee.time}
                                    </p>
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
                                        const slot = slots.find((s) => s.day === selectedDay && s.time === attendee.time);
                                        return slot && !slot.available;
                                      })()}
                                      className="min-h-[36px] sm:min-h-[32px] min-w-[36px] sm:min-w-[32px] border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50 active:scale-[0.98] transition-all duration-200 flex-shrink-0 ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <X className="size-3.5 sm:size-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {(() => {
                                        if (!attendee.time) return "Eliminar cliente";
                                        const slot = slots.find((s) => s.day === selectedDay && s.time === attendee.time);
                                        return slot && !slot.available ? "Clase cancelada - No se pueden eliminar asistentes" : "Eliminar cliente";
                                      })()}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Users className="size-10 mx-auto mb-3 text-zinc-500" />
                            <p className="text-zinc-400">No hay asistentes para este horario</p>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  // Show only reservations with their date/time when no time is selected
                  (() => {
                    // Filter to only show reservations
                    const reservations = allDayAttendees.filter(a => a.source === 'reservation');
                    
                    if (reservations.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <Users className="size-10 mx-auto mb-3 text-zinc-500" />
                          <p className="text-zinc-400">No hay reservas para este día</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-3">
                        {reservations.map((attendee) => {
                          const reservationDate = attendee.date ? parseDateLocal(attendee.date) : null;
                          return (
                            <div
                              key={`reservation-${attendee.id}`}
                              className="group flex items-center justify-between p-3 sm:p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-300"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <p className="text-base sm:text-sm font-bold font-[family-name:var(--font-orbitron)] text-white break-words">
                                    {attendee.userName}
                                  </p>
                                  <Badge className="bg-blue-500/20 border border-blue-500/30 text-blue-400 font-[family-name:var(--font-orbitron)] text-xs">
                                    Reserva
                                  </Badge>
                                </div>
                                <p className="text-xs sm:text-sm text-zinc-400 break-words mb-1">{attendee.userEmail}</p>
                                {reservationDate && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <Clock className="size-3.5 text-blue-400" />
                                    <p className="text-xs text-blue-300 font-[family-name:var(--font-orbitron)]">
                                      {reservationDate.toLocaleDateString("es-ES", {
                                        weekday: "short",
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })} - {attendee.time}
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
                                      const slot = slots.find((s) => s.day === selectedDay && s.time === attendee.time);
                                      return slot && !slot.available;
                                    })()}
                                    className="min-h-[36px] sm:min-h-[32px] min-w-[36px] sm:min-w-[32px] border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50 active:scale-[0.98] transition-all duration-200 flex-shrink-0 ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <X className="size-3.5 sm:size-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {(() => {
                                      if (!attendee.time) return "Eliminar cliente";
                                      const slot = slots.find((s) => s.day === selectedDay && s.time === attendee.time);
                                      return slot && !slot.available ? "Clase cancelada - No se pueden eliminar asistentes" : "Eliminar cliente";
                                    })()}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="size-12 mx-auto mb-4 text-zinc-500" />
                <p className="text-zinc-400 text-lg mb-2">No hay asistentes registrados</p>
                <p className="text-zinc-500 text-sm">
                  {selectedTime 
                    ? `No hay asistentes para ${selectedTime}. Usa el botón "Agregar" para añadir clientes.`
                    : "Selecciona un horario y usa el botón \"Agregar\" para añadir clientes"}
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Add Attendee Modal */}
      <Dialog open={showAddAttendee} onOpenChange={setShowAddAttendee}>
        <DialogContent className="border border-red-500/50 bg-black text-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Logo variant="compact" showLink={false} className="justify-center" />
            </div>
            <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/30 w-fit mx-auto">
              Agregar Cliente
            </Badge>
            <DialogTitle className="text-3xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent text-center pt-2">
              Agregar Cliente a Clase
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-400 text-center">
              Selecciona un cliente para agregarlo a {selectedDay} - {selectedTime}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Cliente *
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full min-h-[48px] text-base sm:text-sm border border-red-500/20 bg-black text-white rounded-md px-3 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 [&>option]:bg-black [&>option]:text-white"
              >
                <option value="" className="bg-black text-white">Selecciona un cliente</option>
                {(() => {
                  // Get IDs of users already registered for this time slot
                  const registeredUserIds = new Set(
                    allDayAttendees
                      .filter(a => a.time?.trim() === selectedTime?.trim())
                      .map(a => a.userId)
                  );
                  
                  // Filter out users that are already registered
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
                      Todos los clientes ya están registrados en este horario
                    </p>
                  );
                }
                return null;
              })()}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Fecha
              </label>
              <div className="min-h-[48px] text-base sm:text-sm border border-red-500/20 bg-white/5 text-white rounded-md px-3 py-2 flex items-center">
                {selectedDate ? parseDateLocal(selectedDate).toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }) : "Selecciona un día primero"}
              </div>
              <p className="text-xs text-zinc-500">La fecha se calcula automáticamente según el día seleccionado</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddAttendee(false)}
                className="flex-1 border-black/50 bg-black/30 text-white hover:bg-black/50 hover:border-red-500/50 active:scale-[0.98] transition-all duration-200"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddAttendee}
                disabled={!selectedUserId}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50"
              >
                Agregar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="border border-red-500/50 bg-black text-white max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Logo variant="compact" showLink={false} className="justify-center" />
            </div>
            <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/30 w-fit mx-auto">
              Confirmar Eliminación
            </Badge>
            <DialogTitle className="text-2xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent text-center pt-2">
              ¿Eliminar Cliente?
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-400 text-center">
              ¿Estás seguro de que quieres remover este cliente de la clase? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setAttendeeToDelete(null);
              }}
              className="flex-1 border-zinc-500/40 bg-zinc-500/10 text-zinc-300 hover:bg-zinc-500/20 hover:border-zinc-500/50 active:scale-[0.98] transition-all duration-200"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:scale-[0.98] transition-all duration-200"
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
