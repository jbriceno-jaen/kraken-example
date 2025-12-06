"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  CalendarClock,
  Timer,
  Clock,
  RotateCw,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  days,
  times,
  getCurrentDayName,
  getEarliestAvailableTime,
  isTimeSlotPassed,
  isMoreThanOneDayAhead,
  hasReservationForDay,
  isLessThanOneHourBefore,
} from "@/lib/dashboard-helpers";

export default function ReservasPage() {
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const currentDay = getCurrentDayName();
  const earliestTime = getEarliestAvailableTime(currentDay);

  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [selectedTime, setSelectedTime] = useState(earliestTime);
  const [bookings, setBookings] = useState<Array<{ day: string; time: string; id?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [slotCounts, setSlotCounts] = useState<Record<string, { current: number; capacity: number; available: boolean }>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const reservationsRes = await fetch("/api/reservations");
      if (reservationsRes.ok) {
        const { reservations } = await reservationsRes.json();
        const now = new Date();
        const filteredReservations = reservations.filter((r: { date: string; day: string; time: string; id: number }) => {
          const reservationDate = new Date(r.date);
          return reservationDate >= now;
        });
        setBookings(filteredReservations.map((r: { day: string; time: string; id: number }) => ({ day: r.day, time: r.time, id: r.id })));
      }

      const slotsRes = await fetch("/api/class-slots");
      if (slotsRes.ok) {
        const { slots } = await slotsRes.json();
        const countsMap: Record<string, { current: number; capacity: number; available: boolean }> = {};
        slots.forEach((slot: { day: string; time: string; currentReservations: number; capacity: number; available: boolean }) => {
          const key = `${slot.day}-${slot.time}`;
          countsMap[key] = {
            current: slot.currentReservations,
            capacity: slot.capacity,
            available: slot.available,
          };
        });
        setSlotCounts(countsMap);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  useEffect(() => {
    const earliest = getEarliestAvailableTime(selectedDay);
    setSelectedTime(earliest);
  }, [selectedDay]);

  const handleBook = async () => {
    if (hasReservationForDay(selectedDay, bookings)) {
      showToast("Ya tienes una reserva para este día. Solo puedes reservar un horario por día.", "warning");
      return;
    }

    if (isMoreThanOneDayAhead(selectedDay)) {
      showToast("Solo puedes reservar para hoy o mañana.", "warning");
      return;
    }

    if (isTimeSlotPassed(selectedDay, selectedTime)) {
      showToast("Este horario ya ha pasado. Por favor selecciona un horario futuro.", "warning");
      return;
    }

    const exists = bookings.some((b) => b.day === selectedDay && b.time === selectedTime);
    if (exists) return;
    
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: selectedDay, time: selectedTime }),
      });

      if (res.ok) {
        const { reservation } = await res.json();
        setBookings([{ day: reservation.day, time: reservation.time, id: reservation.id }, ...bookings]);
        
        const slotKey = `${selectedDay}-${selectedTime}`;
        const currentCount = slotCounts[slotKey]?.current || 0;
        setSlotCounts({
          ...slotCounts,
          [slotKey]: {
            current: currentCount + 1,
            capacity: slotCounts[slotKey]?.capacity || 14,
            available: currentCount + 1 < (slotCounts[slotKey]?.capacity || 14),
          },
        });
        
        showToast(`Reserva creada exitosamente: ${selectedDay} | ${selectedTime}`, "success");
        // Refresh data to show updated counts
        setTimeout(() => {
          fetchData();
        }, 500);
      } else {
        const error = await res.json();
        // Check if it's an approval error
        if (res.status === 403 && error.error?.includes("aprobación")) {
          showToast(error.error, "warning");
        } else {
          showToast(error.error || "Error al crear la reserva", "error");
        }
      }
    } catch (error) {
      console.error("Error creating reservation:", error);
      showToast("Error al crear la reserva", "error");
    }
  };

  const handleCancelBooking = async (day: string, time: string) => {
    if (isLessThanOneHourBefore(day, time)) {
      showToast("No puedes cancelar una reserva con menos de 1 hora de anticipación.", "warning");
      return;
    }

    const reservation = bookings.find((b) => b.day === day && b.time === time);
    if (reservation?.id) {
      try {
        const res = await fetch(`/api/reservations/${reservation.id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setBookings(bookings.filter((b) => !(b.day === day && b.time === time)));
          
          const slotKey = `${day}-${time}`;
          const currentCount = slotCounts[slotKey]?.current || 0;
          setSlotCounts({
            ...slotCounts,
            [slotKey]: {
              current: Math.max(0, currentCount - 1),
              capacity: slotCounts[slotKey]?.capacity || 14,
              available: true,
            },
          });
          
          showToast(`Reserva cancelada: ${day} | ${time}`, "success");
          // Refresh data to show updated counts
          setTimeout(() => {
            fetchData();
          }, 500);
        } else {
          showToast("Error al cancelar la reserva", "error");
        }
      } catch (error) {
        console.error("Error canceling reservation:", error);
        showToast("Error al cancelar la reserva", "error");
      }
    } else {
      setBookings(bookings.filter((b) => !(b.day === day && b.time === time)));
      showToast(`Reserva cancelada: ${day} | ${time}`, "success");
      // Refresh data to show updated counts
      setTimeout(() => {
        fetchData();
      }, 500);
    }
  };

  const reservationSummary = useMemo(
    () => bookings.map((b) => `${b.day} | ${b.time}`).join(", "),
    [bookings]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative size-16">
          <div className="size-full animate-spin rounded-full border-4 border-red-500/30 border-t-red-500" />
          <CalendarClock className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-red-400 animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-semibold text-zinc-400 font-[family-name:var(--font-orbitron)]">
          Cargando reservas...
        </p>
      </div>
    );
  }

  return (
    <Card className="border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black p-4 sm:p-6 lg:p-8 shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge variant="secondary" className="bg-red-500/20 border border-red-500/30 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/20">
            Reservas
          </Badge>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-white font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent">
            Aparta tus sesiones de esta semana
          </h2>
          <p className="text-sm text-zinc-300 mt-2">
            Lunes a Sábado. Sesiones de 60 minutos por la mañana (5:00-8:00 AM) y tarde (4:00-7:00 PM).
          </p>
          <div className="mt-4 sm:mt-6 rounded-xl border border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 p-3 sm:p-4 shadow-lg shadow-yellow-500/20">
            <p className="text-xs font-semibold text-yellow-200 mb-2 font-[family-name:var(--font-orbitron)]">Reglas de reserva:</p>
            <ul className="text-xs text-yellow-100/80 space-y-1 list-disc list-inside">
              <li>Solo puedes reservar un horario por día</li>
              <li>Solo puedes reservar para hoy o mañana</li>
              <li>No puedes cancelar con menos de 1 hora de anticipación</li>
              <li>No puedes seleccionar horarios que ya pasaron</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-[0.9fr,1.1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <p className="text-sm font-semibold text-white font-[family-name:var(--font-orbitron)] mb-4">Días</p>
          <div className="flex flex-wrap gap-2.5 sm:gap-2">
            {days.map((day) => {
              const isDisabled = isMoreThanOneDayAhead(day) || hasReservationForDay(day, bookings);
              return (
                <button
                  key={day}
                  onClick={() => !isDisabled && setSelectedDay(day)}
                  disabled={isDisabled}
                  className={cn(
                    buttonVariants({ variant: day === selectedDay ? "default" : "outline", size: "sm" }),
                    "rounded-full transition-all duration-200",
                    "px-5 py-2.5 sm:px-4 sm:py-1.5",
                    "min-h-[44px] sm:min-h-0",
                    "text-sm sm:text-xs",
                    day === selectedDay && "bg-red-500 text-white shadow-lg shadow-red-500/30",
                    day !== selectedDay && !isDisabled && "active:border-red-500/50 active:scale-95",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                  title={
                    isDisabled
                      ? hasReservationForDay(day, bookings)
                        ? "Ya tienes una reserva para este día"
                        : "Solo puedes reservar para hoy o mañana"
                      : undefined
                  }
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.08em] text-zinc-400">Selección actual</p>
          <div className="mt-2 rounded-xl border border-dashed border-red-500/50 bg-black/40 px-3 py-2 text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">
            {selectedDay} | {selectedTime}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">Horarios</p>
              <div className="flex items-center gap-2">
                <Button
                  onClick={fetchData}
                  variant="outline"
                  size="sm"
                  className="min-h-[36px] sm:min-h-[32px] border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/50 active:scale-[0.98] transition-all duration-200"
                  title="Refrescar horarios"
                >
                  <RotateCw className="size-3.5 sm:size-3" />
                </Button>
                <div className="hidden items-center gap-2 rounded-full bg-red-500/20 border border-red-500/30 backdrop-blur-sm px-4 py-2 min-h-[36px] sm:min-h-[32px] text-xs font-semibold text-white font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/20 sm:flex">
                  <CalendarClock className="size-3.5 sm:size-3 text-red-400" />
                  Vista semanal
                </div>
              </div>
            </div>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Clock className="size-3" />
              Sesiones de 1 hora (60 minutos)
            </p>
          </div>
          <div className="grid gap-3 sm:gap-2 sm:grid-cols-2">
            {times.map((time) => {
              const isPassed = isTimeSlotPassed(selectedDay, time);
              const slotKey = `${selectedDay}-${time}`;
              const slotInfo = slotCounts[slotKey] || { current: 0, capacity: 14, available: true };
              const isFull = slotInfo.current >= slotInfo.capacity;
              const isDisabled = isPassed || isFull || !slotInfo.available;
              const spotsRemaining = slotInfo.capacity - slotInfo.current;
              
              return (
                <button
                  key={time}
                  onClick={() => !isDisabled && setSelectedTime(time)}
                  disabled={isDisabled}
                  className={cn(
                    "flex items-center justify-between rounded-xl border transition-all duration-200 text-white",
                    "px-4 py-3.5 sm:px-3 sm:py-2",
                    "min-h-[56px] sm:min-h-0",
                    "text-base sm:text-sm",
                    "active:scale-[0.98]",
                    time === selectedTime && !isDisabled
                      ? "border-red-400 bg-red-500/10 shadow-md shadow-red-500/20"
                      : !isDisabled
                      ? "border-white/20 active:border-red-200/60 active:bg-white/5"
                      : "border-white/10 bg-white/5 opacity-40 cursor-not-allowed"
                  )}
                  title={
                    isDisabled
                      ? isPassed
                        ? "Este horario ya ha pasado"
                        : isFull
                        ? `Lleno (${slotInfo.current}/${slotInfo.capacity})`
                        : "No disponible"
                      : `${slotInfo.current}/${slotInfo.capacity} personas - ${spotsRemaining} lugares disponibles`
                  }
                >
                  <div className="flex flex-col items-start">
                    <span>{time}</span>
                    <span className="text-xs text-zinc-400 mt-0.5">
                      {slotInfo.current}/{slotInfo.capacity} personas
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isFull ? (
                      <span className="text-xs text-red-400 font-semibold">LLENO</span>
                    ) : (
                      <span className="text-xs text-green-400 font-semibold">
                        {spotsRemaining} disponibles
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <Timer className="size-4" />
                      <span className="text-xs text-zinc-400">1h</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              onClick={handleBook}
              disabled={
                isMoreThanOneDayAhead(selectedDay) ||
                hasReservationForDay(selectedDay, bookings) ||
                isTimeSlotPassed(selectedDay, selectedTime)
              }
              className="w-full sm:w-auto min-h-[48px] sm:min-h-0 text-base sm:text-sm bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/50"
            >
              Reservar este horario
            </Button>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-zinc-400">
                Toca un día y hora para añadirlos a tus reservas de la semana.
              </p>
              {(isMoreThanOneDayAhead(selectedDay) ||
                hasReservationForDay(selectedDay, bookings) ||
                isTimeSlotPassed(selectedDay, selectedTime)) && (
                <p className="text-xs text-red-400">
                  {isMoreThanOneDayAhead(selectedDay)
                    ? "Solo puedes reservar para hoy o mañana"
                    : hasReservationForDay(selectedDay, bookings)
                    ? "Ya tienes una reserva para este día"
                    : "Este horario ya ha pasado"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <p className="text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">Tus reservas</p>
        {bookings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-3 text-sm text-zinc-200">
            Aún no tienes reservas. Elige un día y hora para agendar.
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-2 sm:grid-cols-2">
            {bookings.map((booking) => {
              const canCancel = !isLessThanOneHourBefore(booking.day, booking.time);
              const isPassed = isTimeSlotPassed(booking.day, booking.time);
              return (
                <div
                  key={`${booking.day}-${booking.time}`}
                  className={cn(
                    "flex items-center justify-between rounded-xl border transition-all duration-200",
                    "px-5 py-4 sm:px-4 sm:py-3",
                    "min-h-[64px] sm:min-h-0",
                    "text-base sm:text-sm font-medium",
                    "active:scale-[0.98]",
                    isPassed
                      ? "border-white/5 bg-white/5 opacity-50"
                      : "border-white/10 bg-white/5 active:bg-white/10 active:border-red-500/30"
                  )}
                >
                  <div className="flex flex-col">
                    <span className={cn("text-white", isPassed && "line-through")}>
                      {booking.day}
                    </span>
                    <span className={cn("text-red-300 text-xs", isPassed && "line-through")}>
                      {booking.time}
                    </span>
                    {!canCancel && !isPassed && (
                      <span className="text-xs text-yellow-400 mt-1">
                        No se puede cancelar (menos de 1 hora)
                      </span>
                    )}
                    {isPassed && (
                      <span className="text-xs text-zinc-500 mt-1">Ya pasó</span>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleCancelBooking(booking.day, booking.time)}
                    disabled={!canCancel || isPassed}
                    className={cn(
                      "text-red-400 active:text-red-300 active:bg-red-500/10",
                      "min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0",
                      "active:scale-95",
                      (!canCancel || isPassed) && "opacity-50 cursor-not-allowed"
                    )}
                    aria-label={`Cancelar reserva ${booking.day} ${booking.time}`}
                    title={
                      !canCancel
                        ? "No se puede cancelar con menos de 1 hora de anticipación"
                        : isPassed
                        ? "Esta reserva ya pasó"
                        : "Cancelar reserva"
                    }
                  >
                    <X className="size-5 sm:size-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
        {reservationSummary && <p className="text-xs text-zinc-300">Próximas: {reservationSummary}</p>}
      </div>
    </Card>
  );
}

