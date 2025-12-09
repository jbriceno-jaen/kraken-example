"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { useToast } from "@/components/ui/toast";
import { Clock, Plus, Edit, X, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
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

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const times = ["5:00 AM", "6:00 AM", "7:00 AM", "8:00 AM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"];

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

  const date = new Date(today);
  date.setDate(today.getDate() + daysToAdd);
  return date;
};

interface SlotsManagementProps {
  onLoadingChange?: (loading: boolean) => void;
}

export function SlotsManagement({ onLoadingChange }: SlotsManagementProps) {
  const { showToast } = useToast();
  const [slots, setSlots] = useState<ClassSlot[]>([]);
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
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ClassSlot | null>(null);
  const [formData, setFormData] = useState({
    day: "",
    hour: "5",
    minute: "00",
    period: "AM",
    capacity: "14",
    available: true,
  });

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      try {
        // Fetch slots - the API will ensure all slots exist
        await fetchSlots();
        
        // After fetching, verify all slots are present
        // If any are missing, the API's ensureSlotsExist() should have created them
        // But we can refresh once more to be sure
        if (mounted) {
          // Small delay to ensure API has processed
          setTimeout(async () => {
            if (mounted) {
              await fetchSlots();
            }
          }, 500);
        }
      } catch (error) {
        console.error("Error loading slots:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Set initial selected day to today or first day
  useEffect(() => {
    if (slots.length > 0 && !selectedDay) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const dayMap: Record<number, string> = {
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday",
      };
      const todayName = dayMap[dayOfWeek] || days[0];
      setSelectedDay(todayName);
    }
  }, [slots, selectedDay]);

  // Update dates when selected day changes (for weekly refresh)
  const [dateUpdateKey, setDateUpdateKey] = useState(0);
  useEffect(() => {
    const updateDates = () => {
      setDateUpdateKey(prev => prev + 1);
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
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/manager/class-slots");
      if (res.ok) {
        const { slots: slotsData } = await res.json();
        // Slots are already in English from API
        setSlots(slotsData);
      } else {
        showToast("Error loading time slots", "error");
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      showToast("Error loading time slots", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!formData.day || !formData.hour || !formData.minute || !formData.period) {
      showToast("Day and time are required", "error");
      return;
    }

    // Combine hour, minute, and period into time string
    const time = `${formData.hour}:${formData.minute} ${formData.period}`;

    try {
      const res = await fetch("/api/manager/class-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: formData.day,
          time: time,
          capacity: parseInt(formData.capacity),
          available: formData.available,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Time slot created successfully", "success");
        setShowAddModal(false);
        setFormData({ day: selectedDay || "", hour: "5", minute: "00", period: "AM", capacity: "14", available: true });
        fetchSlots();
      } else {
        showToast(data.error || "Error creating time slot", "error");
      }
    } catch (error) {
      console.error("Error creating slot:", error);
      showToast("Error creating time slot", "error");
    }
  };

  const handleEditSlot = async () => {
    if (!selectedSlot || !formData.day || !formData.hour || !formData.minute || !formData.period) {
      showToast("Day and time are required", "error");
      return;
    }

    // Combine hour, minute, and period into time string
    const time = `${formData.hour}:${formData.minute} ${formData.period}`;

    try {
      const updatePayload = {
        day: formData.day,
        time: time,
        capacity: parseInt(formData.capacity),
        available: formData.available,
      };
      
      // Debug: Log what we're sending
      console.log('[SlotsManagement] Updating slot:', {
        slotId: selectedSlot.id,
        payload: updatePayload,
        availableType: typeof updatePayload.available,
        availableValue: updatePayload.available
      });
      
      const res = await fetch(`/api/manager/class-slots/${selectedSlot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      const data = await res.json();
      
      // Debug: Log API response
      if (res.ok) {
        console.log('[SlotsManagement] Slot updated successfully:', {
          slotId: data.slot?.id,
          available: data.slot?.available,
          availableType: typeof data.slot?.available
        });
      } else {
        console.error('[SlotsManagement] Update failed:', data);
      }

      if (res.ok) {
        showToast("Time slot updated successfully", "success");
        setShowEditModal(false);
        setSelectedSlot(null);
        setFormData({ day: selectedDay || "", hour: "5", minute: "00", period: "AM", capacity: "14", available: true });
        fetchSlots();
      } else {
        showToast(data.error || "Error updating time slot", "error");
      }
    } catch (error) {
      console.error("Error updating slot:", error);
      showToast("Error updating time slot", "error");
    }
  };


  // Helper function to parse time string (e.g., "5:00 AM") into hour, minute, period
  const parseTime = (timeStr: string): { hour: string; minute: string; period: string } => {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      return {
        hour: match[1],
        minute: match[2],
        period: match[3].toUpperCase(),
      };
    }
    return { hour: "5", minute: "00", period: "AM" };
  };

  const openEditModal = (slot: ClassSlot & { exists?: boolean }) => {
    if (!slot.exists) return; // Don't allow editing non-existent slots
    setSelectedSlot(slot);
    const parsedTime = parseTime(slot.time);
    setFormData({
      day: slot.day, // Already in English
      hour: parsedTime.hour,
      minute: parsedTime.minute,
      period: parsedTime.period,
      capacity: slot.capacity.toString(),
      available: slot.available,
    });
    setShowEditModal(true);
  };


  // Helper function to convert 12h time to 24h for sorting
  const timeTo24h = (timeStr: string): number => {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 0;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    
    return hours * 60 + minutes; // Convert to minutes for easy sorting
  };


  // Get all slots for selected day (ALL slots should always exist)
  // If a slot doesn't exist, it means it needs to be created
  const getAllSlotsForDay = (day: string): Array<ClassSlot & { exists: boolean }> => {
    const existingSlots = slots.filter((slot) => slot.day === day);
    const existingTimes = new Set(existingSlots.map(s => s.time));
    
    // Get all standard times (these should ALWAYS exist)
    const standardTimes = new Set(times);
    
    // Get custom times (non-standard times that were added)
    const customTimes = existingSlots
      .map(s => s.time)
      .filter(time => !standardTimes.has(time));
    
    // Combine standard times and custom times, then sort
    const allTimes = [...times, ...customTimes];
    
    // Create array with all times
    // All standard times should exist (if not, they'll be created by the API)
    // Custom times only exist if they were explicitly created
    return allTimes.map((time) => {
      const existingSlot = existingSlots.find(s => s.time === time);
      if (existingSlot) {
        return { ...existingSlot, exists: true };
      }
      // For standard times, they should exist but if they don't, mark as needs creation
      // This should rarely happen as ensureSlotsExist() creates them
      const isStandardTime = standardTimes.has(time);
      return {
        id: 0,
        day: day,
        time: time,
        capacity: 14,
        available: true,
        spotsRemaining: 14,
        currentReservations: 0,
        exists: false, // Will trigger "Create" button for standard times that somehow don't exist
      };
    }).sort((a, b) => timeTo24h(a.time) - timeTo24h(b.time));
  };

  const currentDaySlots = selectedDay ? getAllSlotsForDay(selectedDay) : [];

  // Don't return null - always render so callback can work
  // The parent handles the loading screen

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-orbitron)] text-white break-words">
            Time Slot Management
          </h2>
          <p className="text-zinc-400 mt-1 text-sm sm:text-base">Manage available time slots by day of the week</p>
        </div>
        <Button
          onClick={() => {
            setFormData({ 
              day: selectedDay || "", 
              hour: "5", 
              minute: "00", 
              period: "AM", 
              capacity: "14", 
              available: true 
            });
            setShowAddModal(true);
          }}
          className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex-shrink-0"
        >
          <Plus className="mr-2 size-4 sm:size-3.5" />
          <span className="text-base sm:text-sm">Add Time Slot</span>
        </Button>
      </div>

      {/* Day Selection Buttons */}
      <Card className="border border-red-500/50 bg-black/30 p-4 sm:p-6">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {days.map((day) => {
            const daySlots = getAllSlotsForDay(day);
            const configuredCount = daySlots.filter(s => s.exists).length;
            const isSelected = selectedDay === day;
            const dayDate = getDateForDay(day);
            return (
              <button
                key={`${day}-${dateUpdateKey}`}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "flex flex-col items-center justify-center px-2 sm:px-4 py-3 rounded-lg border w-full transition-colors font-[family-name:var(--font-orbitron)]",
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
                {configuredCount > 0 && (
                  <Badge
                    className={cn(
                      "text-xs min-w-[20px] h-5 flex items-center justify-center mt-1",
                      isSelected
                        ? "bg-white/20 text-white border-white/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    )}
                  >
                    {configuredCount}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Selected Day Slots */}
      <Card className="border border-red-500/50 bg-black/30 p-5 sm:p-8">
        {selectedDay ? (
          <>
            <div className="flex items-center justify-between mb-6 gap-2 flex-wrap sm:flex-nowrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-orbitron)] text-white whitespace-nowrap">
                    {selectedDay}
                  </h3>
                  <span className="text-sm text-zinc-400 font-[family-name:var(--font-orbitron)] whitespace-nowrap">
                    {getDateForDay(selectedDay).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
              <Badge className="bg-red-500/20 border border-red-500/30 text-red-400 font-[family-name:var(--font-orbitron)] text-xs px-3 py-1 flex-shrink-0 whitespace-nowrap">
                {currentDaySlots.filter(s => s.exists && s.available).length} available
              </Badge>
            </div>

            <div className="space-y-3">
              {currentDaySlots.map((slot) => {
                const exists = slot.exists;
                const isAvailable = slot.available;
                
                return (
                  <div
                    key={`${selectedDay}-${slot.time}`}
                    className={cn(
                      "p-4 sm:p-5 rounded-lg border transition-all",
                      exists
                        ? isAvailable
                          ? "border-green-500/20 bg-green-500/5 hover:bg-green-500/10 hover:border-green-500/30"
                          : "border-red-500/50 bg-black/30 opacity-70"
                        : "border-zinc-500/30 bg-black/20 opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
                        <Clock className={cn(
                          "size-5 flex-shrink-0",
                          exists
                            ? isAvailable ? "text-green-400" : "text-red-400"
                            : "text-zinc-500"
                        )} />
                        <span className="font-bold font-[family-name:var(--font-orbitron)] text-white text-base whitespace-nowrap">
                          {slot.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {exists ? (
                          <>
                            <Badge
                              className={cn(
                                "font-[family-name:var(--font-orbitron)] text-[10px] px-1.5 py-0.5",
                                isAvailable
                                  ? "bg-green-500/20 border-green-500/30 text-green-400"
                                  : "bg-red-500/20 border-red-500/30 text-red-400"
                              )}
                            >
                              {slot.spotsRemaining} available
                            </Badge>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditModal(slot)}
                                  className="min-h-[28px] min-w-[28px] p-0 border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/50"
                                >
                                  <Edit className="size-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit time slot</p>
                              </TooltipContent>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            <Badge className="bg-zinc-500/20 border border-zinc-500/30 text-zinc-400 font-[family-name:var(--font-orbitron)] text-[10px] px-1.5 py-0.5">
                              Not configured
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const parsedTime = parseTime(slot.time);
                                setFormData({
                                  day: selectedDay,
                                  hour: parsedTime.hour,
                                  minute: parsedTime.minute,
                                  period: parsedTime.period,
                                  capacity: "14",
                                  available: true,
                                });
                                setShowAddModal(true);
                              }}
                              className="h-7 px-2 text-xs border-green-500/40 bg-green-500/10 text-green-300 hover:bg-green-500/20 hover:border-green-500/50"
                            >
                              <Plus className="size-3 mr-1" />
                              Create
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {exists && (
                      <div className="grid grid-cols-3 gap-3 pt-3 mt-3 border-t border-red-500/30">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-zinc-400">Capacity</span>
                          <span className="text-sm text-white font-semibold">{slot.capacity}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-zinc-400">Reservations</span>
                          <span className="text-sm text-white font-semibold">{slot.currentReservations}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-zinc-400">Available</span>
                          <span className={cn("text-sm font-semibold", slot.spotsRemaining > 0 ? "text-green-400" : "text-red-400")}>
                            {slot.spotsRemaining}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[500px]">
            <div className="text-center">
              <Clock className="size-16 mx-auto mb-4 text-zinc-500 opacity-50" />
              <p className="text-zinc-400 text-lg mb-2">Select a day to view time slots</p>
              <p className="text-zinc-500 text-sm">Choose a day from above to get started</p>
            </div>
          </div>
        )}
      </Card>

      {/* Add Slot Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="border border-red-500/50 bg-black text-white">
          <DialogHeader>
            <Logo variant="compact" showLink={false} className="justify-center mb-1" />
            <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs px-3 py-1 w-fit mx-auto">
              New Time Slot
            </Badge>
            <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent text-center pt-1">
              Add Time Slot
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-zinc-400 text-center">
              Create a new class time slot
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddSlot();
            }}
            className="space-y-3 mt-4"
          >
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Day *
              </label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                required
                className="w-full min-h-[48px] sm:h-12 text-base sm:text-sm border border-red-500/50 bg-black text-white rounded-md px-4 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 [&>option]:bg-black [&>option]:text-white"
              >
                <option value="">Select day</option>
                {days.map((day) => (
                  <option key={day} value={day} className="bg-black text-white">
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Time *
              </label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.hour}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                      setFormData({ ...formData, hour: value });
                    }
                  }}
                  placeholder="5"
                  required
                  className="min-h-[48px] text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
                />
                <span className="text-white font-bold">:</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={formData.minute}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                      setFormData({ ...formData, minute: value.padStart(2, "0") });
                    }
                  }}
                  placeholder="00"
                  required
                  className="min-h-[48px] text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
                />
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  required
                  className="min-h-[48px] text-base sm:text-sm border border-red-500/20 bg-black text-white rounded-md px-3 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 [&>option]:bg-black [&>option]:text-white"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Capacity
              </label>
              <Input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
                className="min-h-[48px] text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="flex-1 border-black/50 bg-black/30 text-white hover:bg-black/50 hover:border-red-500/50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Slot Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="border border-red-500/50 bg-black text-white">
          <DialogHeader>
            <Logo variant="compact" showLink={false} className="justify-center mb-1" />
            <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs px-3 py-1 w-fit mx-auto">
              Edit Time Slot
            </Badge>
            <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent text-center pt-1">
              Edit Time Slot
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-zinc-400 text-center">
              Modify the time slot information
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEditSlot();
            }}
            className="space-y-3 mt-4"
          >
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Day *
              </label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                required
                className="w-full min-h-[48px] sm:h-12 text-base sm:text-sm border border-red-500/50 bg-black text-white rounded-md px-4 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 [&>option]:bg-black [&>option]:text-white"
              >
                {days.map((day) => (
                  <option key={day} value={day} className="bg-black text-white">
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Time *
              </label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.hour}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                      setFormData({ ...formData, hour: value });
                    }
                  }}
                  placeholder="5"
                  required
                  className="min-h-[48px] text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
                />
                <span className="text-white font-bold">:</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={formData.minute}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                      setFormData({ ...formData, minute: value.padStart(2, "0") });
                    }
                  }}
                  placeholder="00"
                  required
                  className="min-h-[48px] text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
                />
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  required
                  className="min-h-[48px] text-base sm:text-sm border border-red-500/20 bg-black text-white rounded-md px-3 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 [&>option]:bg-black [&>option]:text-white"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Capacity
              </label>
              <Input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
                className="min-h-[48px] text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="w-5 h-5 rounded border-red-500/20 bg-white/5 text-red-500 focus:ring-2 focus:ring-red-500/20"
              />
              <label htmlFor="available" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Time slot available
              </label>
            </div>

            <div className="flex gap-2 sm:gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSlot(null);
                }}
                className="flex-1 border-black/50 bg-black/30 text-white hover:bg-black/50 hover:border-red-500/50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                Update
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}

