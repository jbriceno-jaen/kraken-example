"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Calendar, Clock, Trash2, AlertCircle, AlertTriangle } from "lucide-react";
import { parseDateLocal } from "@/lib/utils";
import { Logo } from "@/components/logo";

interface Reservation {
  id: number;
  day: string;
  time: string;
  date: string;
  createdAt: string;
  source?: 'reservation' | 'manager'; // 'reservation' = client-made, 'manager' = manager-added
}

interface ClassSlot {
  id: number;
  day: string;
  time: string;
  capacity: number;
  available: boolean;
  spotsRemaining: number;
  currentReservations: number;
}

const dayMap: Record<string, string> = {
  Lunes: "Monday",
  Martes: "Tuesday",
  Miércoles: "Wednesday",
  Jueves: "Thursday",
  Viernes: "Friday",
  Sábado: "Saturday",
};

const dayMapReverse: Record<string, string> = {
  Monday: "Lunes",
  Tuesday: "Martes",
  Wednesday: "Miércoles",
  Thursday: "Jueves",
  Friday: "Viernes",
  Saturday: "Sábado",
};

type TabType = "today" | "tomorrow";

export default function ReservationsPage() {
  const { showToast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [slots, setSlots] = useState<ClassSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("today");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<number | null>(null);

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      // Add cache-busting to ensure fresh data from database
      const timestamp = Date.now();
      const [reservationsRes, slotsRes] = await Promise.all([
        fetch(`/api/reservations?t=${timestamp}`, { cache: 'no-store' }),
        fetch(`/api/class-slots?t=${timestamp}`, { cache: 'no-store' }),
      ]);

      if (reservationsRes.ok) {
        const data = await reservationsRes.json();
        setReservations(data.reservations || []);
      } else {
        console.error("Failed to fetch reservations:", reservationsRes.status);
      }

      if (slotsRes.ok) {
        const data = await slotsRes.json();
        setSlots(data.slots || []);
      } else {
        console.error("Failed to fetch slots:", slotsRes.status);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("Error loading data", "error");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get today and tomorrow dates (recalculated on each render to ensure freshness)
  const getToday = (): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const getTomorrow = (): Date => {
    const tomorrow = new Date(getToday());
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  // Get the day name for the active tab
  const getActiveTabDate = (): Date => {
    return activeTab === "today" ? getToday() : getTomorrow();
  };

  // Get formatted date name for display in tabs
  const getTodayDateName = (): string => {
    const today = getToday();
    return today.toLocaleDateString("en-US", { 
      weekday: "long",
      month: "short",
      day: "numeric"
    });
  };

  const getTomorrowDateName = (): string => {
    const tomorrow = getTomorrow();
    return tomorrow.toLocaleDateString("en-US", { 
      weekday: "long",
      month: "short",
      day: "numeric"
    });
  };

  // Get reservations for the viewing date (the day being viewed, not booking date)
  const getDayReservations = (): Reservation[] => {
    const viewingDate = getActiveTabDate(); // Today or Tomorrow based on active tab
    
    const dayReservations = reservations.filter((reservation) => {
      const reservationDate = parseDateLocal(reservation.date);
      reservationDate.setHours(0, 0, 0, 0);
      const viewingDateNormalized = new Date(viewingDate);
      viewingDateNormalized.setHours(0, 0, 0, 0);
      return reservationDate.getTime() === viewingDateNormalized.getTime();
    });

    // Sort reservations by time (earliest first)
    return dayReservations.sort((a, b) => {
      const timeA = parseTimeFormat(a.time);
      const timeB = parseTimeFormat(b.time);
      
      if (!timeA || !timeB) {
        // If we can't parse either time, maintain original order
        return 0;
      }
      
      // Compare by hours first, then minutes
      if (timeA.hours !== timeB.hours) {
        return timeA.hours - timeB.hours;
      }
      return timeA.minutes - timeB.minutes;
    });
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

  // Check if a slot time has passed for a specific date
  // Compares current time with the slot time on that date
  const isSlotTimePassed = (slotTime: string, slotDate: Date): boolean => {
    const now = new Date();
    const timeParts = parseTimeFormat(slotTime);
    
    if (!timeParts) {
      // If we can't parse the time, don't log error, just return false (don't block)
      // This handles edge cases gracefully
      return false;
    }
    
    // Create the slot datetime for the given date
    const slotDateTime = new Date(slotDate);
    slotDateTime.setHours(timeParts.hours, timeParts.minutes, 0, 0);
    slotDateTime.setSeconds(0, 0);
    slotDateTime.setMilliseconds(0);
    
    // Simply compare: if slot datetime is before current time, it has passed
    return slotDateTime.getTime() < now.getTime();
  };

  // Get all slots for the viewing day (today or tomorrow based on tab)
  const getAllSlotsForBookingDay = (): Array<ClassSlot & { isReserved?: boolean; reservationId?: number; isPast?: boolean }> => {
    const viewingDate = getActiveTabDate(); // Today or Tomorrow based on active tab
    const viewingDayName = dayMapReverse[viewingDate.toLocaleDateString("en-US", { weekday: "long" })];

    // Get all slots for the viewing day (today or tomorrow)
    const daySlots = slots.filter((slot) => {
      if (slot.day !== viewingDayName) return false;
      return true; // Include all slots, even if not available
    });

    // Get user's reservations for the VIEWING day (the day being viewed, not booking day)
    const dayReservations = reservations.filter((res) => {
      const resDate = parseDateLocal(res.date);
      resDate.setHours(0, 0, 0, 0);
      const viewingDateNormalized = new Date(viewingDate);
      viewingDateNormalized.setHours(0, 0, 0, 0);
      return resDate.getTime() === viewingDateNormalized.getTime();
    });

    // Map slots and mark which ones are reserved and which are past
    // Check if current time > slot time for the viewing date (today or tomorrow)
    const mappedSlots = daySlots.map((slot) => {
      const userReservation = dayReservations.find((res) => res.time === slot.time);
      // Check if slot time has passed for the viewing date (today or tomorrow)
      const isPast = isSlotTimePassed(slot.time, viewingDate);
      return {
        ...slot,
        isReserved: !!userReservation,
        reservationId: userReservation?.id,
        isPast: isPast, // Check against viewing date, not booking date
      };
    });

    // Sort slots by time (earliest first)
    return mappedSlots.sort((a, b) => {
      const timeA = parseTimeFormat(a.time);
      const timeB = parseTimeFormat(b.time);
      
      if (!timeA || !timeB) {
        // If we can't parse either time, maintain original order
        return 0;
      }
      
      // Compare by hours first, then minutes
      if (timeA.hours !== timeB.hours) {
        return timeA.hours - timeB.hours;
      }
      return timeA.minutes - timeB.minutes;
    });
  };

  // Get available slots for booking (one day in advance rule)
  const getAvailableSlots = (): ClassSlot[] => {
    const viewingDate = getActiveTabDate(); // Today or Tomorrow
    const viewingDayName = dayMapReverse[viewingDate.toLocaleDateString("en-US", { weekday: "long" })];

    // Check if user already has ANY reservation for the VIEWING day (one reservation per day rule)
    const viewingDateNormalized = new Date(viewingDate);
    viewingDateNormalized.setHours(0, 0, 0, 0);
    const hasReservationForViewingDay = reservations.some(
      (res) => {
        const resDate = parseDateLocal(res.date);
        resDate.setHours(0, 0, 0, 0);
        return resDate.getTime() === viewingDateNormalized.getTime();
      }
    );

    const availableSlots = slots.filter((slot) => {
      if (!slot.available || slot.spotsRemaining <= 0) return false;
      
      // Show slots for the viewing day (today or tomorrow)
      if (slot.day !== viewingDayName) return false;

      // Check if slot time has passed for the viewing date
      if (isSlotTimePassed(slot.time, viewingDate)) return false;

      // If user already has a reservation for the viewing day, don't show available slots
      if (hasReservationForViewingDay) return false;

      return true;
    });

    // Sort slots by time (earliest first)
    return availableSlots.sort((a, b) => {
      const timeA = parseTimeFormat(a.time);
      const timeB = parseTimeFormat(b.time);
      
      if (!timeA || !timeB) {
        // If we can't parse either time, maintain original order
        return 0;
      }
      
      // Compare by hours first, then minutes
      if (timeA.hours !== timeB.hours) {
        return timeA.hours - timeB.hours;
      }
      return timeA.minutes - timeB.minutes;
    });
  };

  const canCancel = (reservation: Reservation): boolean => {
    const reservationDate = parseDateLocal(reservation.date);
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    return reservationDate > oneHourFromNow;
  };

  // Check if a reservation has passed (both date and time)
  const isReservationPast = (reservation: Reservation): boolean => {
    const reservationDate = parseDateLocal(reservation.date);
    const timeParts = parseTimeFormat(reservation.time);
    
    if (!timeParts) {
      // If we can't parse the time, return false (don't block)
      return false;
    }
    
    const reservationDateTime = new Date(reservationDate);
    reservationDateTime.setHours(timeParts.hours, timeParts.minutes, 0, 0);
    reservationDateTime.setSeconds(0, 0);
    reservationDateTime.setMilliseconds(0);
    const now = new Date();
    return reservationDateTime.getTime() < now.getTime();
  };

  // Handle slot click - book directly without modal
  const handleSlotClick = async (slot: ClassSlot & { isReserved?: boolean; reservationId?: number; isPast?: boolean }) => {
    const viewingDate = getActiveTabDate(); // The day being viewed (today or tomorrow)
    const today = getToday();

    // Enforce "one day in advance" rule: can't book for today
    const isViewingToday = viewingDate.getTime() === today.getTime();
    if (isViewingToday) {
      showToast("You can only book one day in advance. Please use the Tomorrow tab to book.", "error");
      return;
    }

    // Real-time validation: Check if slot time has passed for the VIEWING date
    if (isSlotTimePassed(slot.time, viewingDate)) {
      showToast("Cannot book a time slot that has already passed", "error");
      return;
    }

    // Don't allow booking past slots (from cached state)
    if (slot.isPast) {
      showToast("Cannot book a time slot that has already passed", "error");
      return;
    }

    if (!slot.available || slot.spotsRemaining <= 0) {
      showToast("This time slot is full", "error");
      return;
    }

    // Get reservations for the VIEWING day
    const viewingDateNormalized = new Date(viewingDate);
    viewingDateNormalized.setHours(0, 0, 0, 0);
    const dayReservationsForViewing = reservations.filter((res) => {
      const resDate = parseDateLocal(res.date);
      resDate.setHours(0, 0, 0, 0);
      return resDate.getTime() === viewingDateNormalized.getTime();
    });

    const isReserved = slot.isReserved || false;
    const userReservation = dayReservationsForViewing.find((res) => res.time === slot.time);
    
    // Check if user already has ANY reservation for the VIEWING day
    const hasReservationForViewingDay = reservations.some(
      (res) => {
        const resDate = parseDateLocal(res.date);
        resDate.setHours(0, 0, 0, 0);
        return resDate.getTime() === viewingDateNormalized.getTime();
      }
    );

    // If they have a reservation and it's NOT the slot they're clicking on, prevent booking
    if (hasReservationForViewingDay && !isReserved) {
      showToast("You can only make one reservation per day. Cancel your existing reservation first.", "error");
      return;
    }

    // If clicking on their own reserved slot, do nothing - they should manage it from "Your Reservations"
    if (isReserved && userReservation) {
      return; // Don't allow clicking on reserved slots - manage from "Your Reservations" section
    }
    
    // New reservation - check that they don't have one
    if (hasReservationForViewingDay) {
      showToast("You can only make one reservation per day", "error");
      return;
    }

    // Book directly without modal
    try {
      // Create new reservation
      const viewingDayName = dayMapReverse[viewingDate.toLocaleDateString("en-US", { weekday: "long" })];
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: viewingDayName, time: slot.time }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Reservation created successfully", "success");
        // Force a full refresh
        await fetchData(true);
      } else {
        showToast(data.error || "Error creating reservation", "error");
      }
    } catch (error) {
      console.error("Error creating reservation:", error);
      showToast("Error creating reservation", "error");
    }
  };


  const handleDelete = (id: number) => {
    const reservation = reservations.find((r) => r.id === id);
    if (!reservation) return;

    // Check if this is a manager-added attendee (cannot be deleted by client)
    if (reservation.source === 'manager') {
      showToast("This class was added by a manager. Please contact the manager to remove it.", "error");
      return;
    }

    // Check if reservation has passed
    if (isReservationPast(reservation)) {
      showToast("Cannot cancel a reservation that has already passed", "error");
      return;
    }

    if (!canCancel(reservation)) {
      showToast("Cannot cancel reservation with less than 1 hour notice", "error");
      return;
    }

    setReservationToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!reservationToDelete) return;

    try {
      const res = await fetch(`/api/reservations/${reservationToDelete}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Reservation canceled successfully", "success");
        // Force full refresh to update available spots
        await fetchData(true);
        setShowDeleteConfirm(false);
        setReservationToDelete(null);
      } else {
        showToast(data.error || "Error canceling reservation", "error");
      }
    } catch (error) {
      console.error("Error canceling reservation:", error);
      showToast("Error canceling reservation", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative size-16">
          <div className="size-full animate-spin rounded-full border-4 border-red-500/20 border-t-red-500" />
          <Calendar className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-red-400 animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-semibold text-zinc-400 font-[family-name:var(--font-orbitron)]">
          Loading reservations...
        </p>
      </div>
    );
  }

  // Recalculate when tab changes
  const viewingDate = getActiveTabDate(); // Today or Tomorrow based on active tab
  
  // Check if user already has ANY reservation for the VIEWING day (calculated once for all slots)
  const viewingDateNormalized = new Date(viewingDate);
  viewingDateNormalized.setHours(0, 0, 0, 0);
  const hasReservationForViewingDay = reservations.some(
    (res) => {
      const resDate = parseDateLocal(res.date);
      resDate.setHours(0, 0, 0, 0);
      return resDate.getTime() === viewingDateNormalized.getTime();
    }
  );
  
  const dayReservations = getDayReservations();
  const availableSlots = getAvailableSlots();
  const allSlotsForDay = getAllSlotsForBookingDay();
  
  // Format dates for display
  const viewingDateFormatted = viewingDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="bg-black p-4 sm:p-6 lg:p-8 shadow-2xl border border-red-500/50">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-[family-name:var(--font-orbitron)] text-white mb-2">
          BOOK YOUR SESSIONS
          <br />
          <span className="text-red-500">THIS WEEK</span>
        </h1>
        <p className="text-zinc-300 text-sm sm:text-base">
          Monday to Saturday. 60-minute sessions in the morning (5:00-8:00 AM) and afternoon (4:00-7:00 PM).
        </p>
      </Card>

      {/* Reservation Rules Section */}
      <Card className="bg-black p-4 sm:p-6 lg:p-8 shadow-2xl border border-red-500/50">
        <h2 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-orbitron)] text-white mb-4">
          Reservation Rules
        </h2>
        <ul className="space-y-2 text-zinc-300 text-sm sm:text-base">
          <li className="flex items-start gap-2">
            <AlertCircle className="size-5 text-red-400 flex-shrink-0 mt-0.5" />
            <span>You can only book one time slot per day</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="size-5 text-red-400 flex-shrink-0 mt-0.5" />
            <span>You can only book one day in advance</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="size-5 text-red-400 flex-shrink-0 mt-0.5" />
            <span>You cannot cancel with less than 1 hour notice</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="size-5 text-red-400 flex-shrink-0 mt-0.5" />
            <span>You cannot select time slots that have already passed</span>
          </li>
        </ul>
      </Card>

      {/* Time Slots Section with Tabs */}
      <Card className="bg-black p-4 sm:p-6 lg:p-8 shadow-2xl border border-red-500/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-orbitron)] text-white mb-2">
              Time Slots
            </h2>
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Clock className="size-4 text-red-400" />
              <span>1-hour sessions (60 minutes) for {viewingDateFormatted}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab("today");
            }}
            className={`px-4 py-2 rounded-lg font-[family-name:var(--font-orbitron)] text-sm font-semibold transition-all ${
              activeTab === "today"
                ? "bg-red-500 text-white border border-red-500"
                : "bg-white text-black border border-red-500/50 hover:bg-zinc-100"
            }`}
          >
            {getTodayDateName()}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("tomorrow");
            }}
            className={`px-4 py-2 rounded-lg font-[family-name:var(--font-orbitron)] text-sm font-semibold transition-all ${
              activeTab === "tomorrow"
                ? "bg-red-500 text-white border border-red-500"
                : "bg-white text-black border border-red-500/50 hover:bg-zinc-100"
            }`}
          >
            {getTomorrowDateName()}
          </button>
        </div>

        {(() => {
          const today = getToday();
          const isViewingToday = viewingDate.getTime() === today.getTime();
          
          if (isViewingToday && allSlotsForDay.length > 0) {
            // Show message that booking is disabled for today (one day in advance rule)
            return (
              <Card className="border border-yellow-500/30 bg-yellow-500/5 p-8 text-center">
                <AlertTriangle className="size-12 mx-auto mb-4 text-yellow-400" />
                <p className="text-yellow-400 text-lg mb-2 font-[family-name:var(--font-orbitron)]">
                  Booking Disabled for Today
                </p>
                <p className="text-zinc-400 text-sm mb-4">
                  You can only book one day in advance. Please use the Tomorrow tab to make a reservation.
                </p>
                <p className="text-zinc-500 text-xs">
                  You can view your existing reservations for today below.
                </p>
              </Card>
            );
          }
          
          if (allSlotsForDay.length === 0) {
            return (
              <Card className="border border-red-500/30 bg-black/30 p-8 text-center">
                <Clock className="size-12 mx-auto mb-4 text-zinc-500" />
                <p className="text-zinc-400 text-lg mb-2">No time slots available</p>
                <p className="text-zinc-500 text-sm">
                  No slots have been created for {viewingDateFormatted}
                </p>
              </Card>
            );
          }
          
          return null; // Will render slots below
        })()}
        
        {(() => {
          const today = getToday();
          const isViewingToday = viewingDate.getTime() === today.getTime();
          
          // Don't show slots if viewing today (one day in advance rule)
          if (isViewingToday) {
            return null;
          }
          
          return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {allSlotsForDay.map((slot) => {
              const isReserved = slot.isReserved || false;
              const isPast = slot.isPast || false;
              const userReservation = dayReservations.find((res) => res.time === slot.time);
              const isManagerAdded = userReservation?.source === 'manager';
              const canModify = userReservation ? canCancel(userReservation) : false;
              
              // Determine if slot is clickable
              // Note: isViewingToday is already checked above, so slots are only shown for tomorrow
              // Reserved slots are NOT clickable - manage from "Your Reservations" section
              const isClickable = !isPast && 
                                  !isReserved && // Don't allow clicking on reserved slots
                                  slot.available && 
                                  slot.spotsRemaining > 0 && 
                                  !hasReservationForViewingDay;

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => handleSlotClick(slot)}
                  disabled={!isClickable}
                  className={`p-4 rounded-lg border transition-all text-left ${
                    isPast
                      ? "border-zinc-600/30 bg-black/10 opacity-50 cursor-not-allowed"
                      : isReserved && isManagerAdded
                      ? "border-green-500/50 bg-green-500/10 cursor-default"
                      : isReserved
                      ? "border-blue-500/50 bg-blue-500/10 cursor-default"
                      : slot.available && slot.spotsRemaining > 0 && !hasReservationForViewingDay
                      ? "border-red-500/30 bg-black/30 hover:border-red-500 hover:bg-red-500/10 cursor-pointer"
                      : "border-zinc-500/30 bg-black/20 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className={`size-4 ${
                        isPast ? "text-zinc-600" :
                        isReserved && isManagerAdded ? "text-green-400" :
                        isReserved ? "text-blue-400" : 
                        slot.available && slot.spotsRemaining > 0 && !hasReservationForViewingDay ? "text-red-400" :
                        "text-zinc-500"
                      }`} />
                      <span className={`font-semibold font-[family-name:var(--font-orbitron)] ${
                        isPast ? "text-zinc-600" :
                        isReserved && isManagerAdded ? "text-green-300" :
                        isReserved ? "text-blue-300" :
                        slot.available && slot.spotsRemaining > 0 && !hasReservationForViewingDay ? "text-white" :
                        "text-zinc-500"
                      }`}>
                        {slot.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-start">
                    {isPast ? (
                      <Badge className="bg-zinc-600/20 border border-zinc-600/30 text-zinc-500 font-[family-name:var(--font-orbitron)] text-xs">
                        Passed
                      </Badge>
                    ) : isReserved && isManagerAdded ? (
                      <Badge className="bg-green-500/20 border border-green-500/30 text-green-400 font-[family-name:var(--font-orbitron)] text-xs">
                        Added by Manager
                      </Badge>
                    ) : isReserved ? (
                      <Badge className="bg-blue-500/20 border border-blue-500/30 text-blue-400 font-[family-name:var(--font-orbitron)] text-xs">
                        Your reservation
                      </Badge>
                    ) : hasReservationForViewingDay ? (
                      <Badge className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-[family-name:var(--font-orbitron)] text-xs">
                        Already reserved
                      </Badge>
                    ) : slot.available && slot.spotsRemaining > 0 ? (
                      <Badge className="bg-green-500/20 border border-green-500/30 text-green-400 font-[family-name:var(--font-orbitron)] text-xs">
                        {slot.spotsRemaining} available
                      </Badge>
                    ) : (
                      <Badge className="bg-zinc-500/20 border border-zinc-500/30 text-zinc-400 font-[family-name:var(--font-orbitron)] text-xs">
                        Full
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          );
        })()}
      </Card>

      {/* Your Reservations Section */}
      <Card className="bg-black p-4 sm:p-6 lg:p-8 shadow-2xl border border-red-500/50">
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-orbitron)] text-white">
            Your Reservations
          </h2>
        </div>

        {dayReservations.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="size-12 mx-auto mb-4 text-zinc-500" />
            <p className="text-zinc-400 text-lg mb-2 font-[family-name:var(--font-orbitron)]">
              No reservations for {viewingDateFormatted}
            </p>
            <p className="text-zinc-500 text-sm">
              Book a time slot above to create a reservation
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayReservations.map((reservation) => {
              const reservationDate = parseDateLocal(reservation.date);
              const canModify = canCancel(reservation);
              const isPast = isReservationPast(reservation);
              const isManagerAdded = reservation.source === 'manager';
              
              return (
                <Card
                  key={reservation.id}
                  tabIndex={-1}
                  className={`border bg-black/30 p-4 sm:p-5 ${
                    isPast
                      ? "border-zinc-600/30 opacity-60"
                      : isManagerAdded
                      ? "border-green-500/50"
                      : "border-red-500/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Day and Status Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`font-[family-name:var(--font-orbitron)] text-xs ${
                          isPast
                            ? "bg-zinc-600/20 border border-zinc-600/30 text-zinc-500"
                            : isManagerAdded
                            ? "bg-green-500/20 border border-green-500/30 text-green-400"
                            : "bg-red-500/20 border border-red-500/30 text-red-400"
                        }`}>
                          {dayMap[reservation.day] || reservation.day}
                        </Badge>
                        {isPast ? (
                          <Badge className="bg-zinc-600/20 border border-zinc-600/30 text-zinc-500 font-[family-name:var(--font-orbitron)] text-xs">
                            Passed
                          </Badge>
                        ) : isManagerAdded ? (
                          <Badge className="bg-green-500/20 border border-green-500/30 text-green-400 font-[family-name:var(--font-orbitron)] text-xs">
                            Added by Manager
                          </Badge>
                        ) : !canModify && (
                          <Badge className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-[family-name:var(--font-orbitron)] text-xs">
                            Cannot modify
                          </Badge>
                        )}
                      </div>
                      
                      {/* Time and Date */}
                      <div className="flex items-center gap-2">
                        <Clock className={`size-4 flex-shrink-0 ${
                          isPast 
                            ? "text-zinc-600" 
                            : isManagerAdded 
                            ? "text-green-400" 
                            : "text-red-400"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <span className={`font-semibold font-[family-name:var(--font-orbitron)] block ${
                            isPast ? "text-zinc-500" : "text-white"
                          }`}>
                            {reservation.time}
                          </span>
                          <p className={`text-xs mt-0.5 ${
                            isPast ? "text-zinc-600" : "text-zinc-400"
                          }`}>
                            {reservationDate.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Cancel Button */}
                    <div className="flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(reservation.id)}
                        disabled={isPast || !canModify || isManagerAdded}
                        className={`text-xs py-1.5 px-3 h-8 transition-all ${
                          isPast || isManagerAdded
                            ? "border-zinc-600/30 bg-zinc-600/10 text-zinc-500 cursor-not-allowed"
                            : "border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50 active:scale-95"
                        } disabled:opacity-50`}
                      >
                        <Trash2 className="size-3 mr-1.5" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="border border-red-500/50 bg-black text-white">
          <DialogHeader>
            <Logo variant="compact" showLink={false} className="justify-center mb-1" />
            <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs px-3 py-1 w-fit mx-auto">
              Confirm Cancellation
            </Badge>
            <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] text-white text-center pt-1">
              Cancel Reservation?
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-zinc-500 text-center font-light">
              Are you sure you want to cancel this reservation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-3 rounded-lg border border-red-500/50 bg-black/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="size-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-red-400 font-[family-name:var(--font-orbitron)] font-semibold mb-1">
                  Warning
                </p>
                <p className="text-xs text-zinc-400 font-light">
                  This will permanently cancel your reservation and free up the time slot for others.
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setReservationToDelete(null);
              }}
              className="flex-1 border-red-500/50 bg-black/30 text-white hover:bg-black/50 hover:border-red-500/70"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmDelete}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              Confirm Cancellation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
