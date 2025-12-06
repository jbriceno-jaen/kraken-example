"use client";

import { useMemo, useState, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import {
  CalendarClock,
  Check,
  CheckCircle2,
  Pencil,
  Plus,
  Timer,
  Trophy,
  User,
  X,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const times = ["5:00 AM", "6:00 AM", "7:00 AM", "8:00 AM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"];
type SectionKey = "reservations" | "profile" | "prs";

// Helper functions for reservation rules
const getDayOfWeek = (dayName: string): number => {
  const dayMap: Record<string, number> = {
    Lunes: 1,
    Martes: 2,
    Miércoles: 3,
    Jueves: 4,
    Viernes: 5,
    Sábado: 6,
  };
  return dayMap[dayName] || 1;
};

const getDateForDay = (dayName: string): Date => {
  const today = new Date();
  const currentDay = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday (0) to 7
  const targetDay = getDayOfWeek(dayName);

  let daysToAdd = targetDay - currentDay;
  if (daysToAdd < 0) {
    daysToAdd += 7; // Next week
  }

  const date = new Date(today);
  date.setDate(today.getDate() + daysToAdd);
  return date;
};

const parseTime = (timeStr: string): { hours: number; minutes: number } => {
  const [time, period] = timeStr.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let hour24 = hours;
  if (period === "PM" && hours !== 12) hour24 += 12;
  if (period === "AM" && hours === 12) hour24 = 0;
  return { hours: hour24, minutes: minutes || 0 };
};

const getDateTimeForSlot = (day: string, time: string): Date => {
  const date = getDateForDay(day);
  const { hours, minutes } = parseTime(time);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const isTimeSlotPassed = (day: string, time: string): boolean => {
  const slotDateTime = getDateTimeForSlot(day, time);
  const now = new Date();
  return slotDateTime < now;
};

const isMoreThanOneDayAhead = (day: string): boolean => {
  const slotDate = getDateForDay(day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  slotDate.setHours(0, 0, 0, 0);
  
  const diffTime = slotDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 1;
};

const isLessThanOneHourBefore = (day: string, time: string): boolean => {
  const slotDateTime = getDateTimeForSlot(day, time);
  const now = new Date();
  const diffMs = slotDateTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours < 1 && diffHours > 0;
};

const hasReservationForDay = (day: string, bookings: Array<{ day: string; time: string }>): boolean => {
  return bookings.some((b) => b.day === day);
};

const getCurrentDayName = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Convert JavaScript day to our day format
  // Sunday (0) -> Monday (next available day)
  // Monday (1) -> Lunes, Tuesday (2) -> Martes, etc.
  const dayMap: Record<number, string> = {
    0: days[0], // Sunday -> Monday (next available)
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
  };
  
  return dayMap[dayOfWeek] || days[0]; // Fallback to Monday if something goes wrong
};

const getEarliestAvailableTime = (day: string): string => {
  // Find the first time slot that hasn't passed for the given day
  for (const time of times) {
    if (!isTimeSlotPassed(day, time)) {
      return time;
    }
  }
  // If all times have passed, return the first time anyway (for next week)
  return times[0];
};

const sectionCards: Array<{ id: SectionKey; title: string; description: string; icon: LucideIcon }> = [
  {
    id: "reservations",
    title: "Reservas",
    description: "Aparta tus clases de mañana o tarde esta semana.",
    icon: CalendarClock,
  },
  {
    id: "profile",
    title: "Perfil",
    description: "Mantén actuales tus datos y objetivos.",
    icon: User,
  },
  {
    id: "prs",
    title: "Mis PR's",
    description: "Registra tus mejores levantamientos y benchmarks.",
    icon: Trophy,
  },
];

export default function Dashboard() {
  const currentDay = getCurrentDayName();
  const earliestTime = getEarliestAvailableTime(currentDay);
  
  const [activeSection, setActiveSection] = useState<SectionKey>("reservations");
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [selectedTime, setSelectedTime] = useState(earliestTime);
  const [bookings, setBookings] = useState<Array<{ day: string; time: string; id?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [slotCounts, setSlotCounts] = useState<Record<string, { current: number; capacity: number; available: boolean }>>({});

  // Fetch data from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch reservations
        const reservationsRes = await fetch("/api/reservations");
        if (reservationsRes.ok) {
          const { reservations } = await reservationsRes.json();
          setBookings(reservations.map((r: any) => ({ day: r.day, time: r.time, id: r.id })));
        }

        // Fetch profile
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const { profile } = await profileRes.json();
          if (profile) {
            setProfile({
              name: profile.name || "",
              email: profile.email || "",
              phone: profile.phone || "",
              goals: profile.goals || "",
            });
          }
        }

        // Fetch personal records
        const prRes = await fetch("/api/personal-records");
        if (prRes.ok) {
          const { records } = await prRes.json();
          setPrList(records.map((r: any) => ({
            id: r.id.toString(),
            exercise: r.exercise,
            weight: r.weight,
          })));
        }

        // Fetch class slots with counts
        const slotsRes = await fetch("/api/class-slots");
        if (slotsRes.ok) {
          const { slots } = await slotsRes.json();
          const countsMap: Record<string, { current: number; capacity: number; available: boolean }> = {};
          slots.forEach((slot: any) => {
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

    fetchData();
  }, []);

  // Update selected time when day changes to earliest available
  useEffect(() => {
    const earliest = getEarliestAvailableTime(selectedDay);
    setSelectedTime(earliest);
  }, [selectedDay]);

  const [profile, setProfile] = useState({
    name: "Miembro",
    email: "member@kraken.fit",
    phone: "(555) 555-1234",
    goals: "Construir fuerza, mejorar motor, moverme mejor.",
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [prList, setPrList] = useState<Array<{ id: string; exercise: string; weight: string }>>([
    { id: "pr-1", exercise: "Back Squat", weight: "295 lbs" },
    { id: "pr-2", exercise: "Clean & Jerk", weight: "205 lbs" },
  ]);
  const [newExercise, setNewExercise] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPr, setEditingPr] = useState<{ exercise: string; weight: string }>({
    exercise: "",
    weight: "",
  });

  const reservationSummary = useMemo(
    () => bookings.map((b) => `${b.day} @ ${b.time}`).join(", "),
    [bookings]
  );

  const createPrId = () => Math.random().toString(36).slice(2, 10);

  const handleBook = async () => {
    // Rule 1: Only one horario per day
    if (hasReservationForDay(selectedDay, bookings)) {
      alert("Ya tienes una reserva para este día. Solo puedes reservar un horario por día.");
      return;
    }

    // Rule 2: Can only reserve one day ahead
    if (isMoreThanOneDayAhead(selectedDay)) {
      alert("Solo puedes reservar con un día de anticipación.");
      return;
    }

    // Rule 4: Can't select horarios that have passed
    if (isTimeSlotPassed(selectedDay, selectedTime)) {
      alert("Este horario ya ha pasado. Por favor selecciona un horario futuro.");
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
        
        // Update slot counts
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
      } else {
        const error = await res.json();
        alert(error.error || "Error al crear la reserva");
      }
    } catch (error) {
      console.error("Error creating reservation:", error);
      alert("Error al crear la reserva");
    }
  };

  const handleCancelBooking = async (day: string, time: string) => {
    // Rule 3: Can't cancel if less than 1 hour before
    if (isLessThanOneHourBefore(day, time)) {
      alert("No puedes cancelar una reserva con menos de 1 hora de anticipación.");
      return;
    }

    // Find the reservation ID
    const reservation = bookings.find((b) => b.day === day && b.time === time);
    if (reservation?.id) {
      try {
        const res = await fetch(`/api/reservations/${reservation.id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setBookings(bookings.filter((b) => !(b.day === day && b.time === time)));
          
          // Update slot counts
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
        } else {
          alert("Error al cancelar la reserva");
        }
      } catch (error) {
        console.error("Error canceling reservation:", error);
        alert("Error al cancelar la reserva");
      }
    } else {
      // Fallback to local state if no ID
      setBookings(bookings.filter((b) => !(b.day === day && b.time === time)));
    }
  };

  const handleProfileSave = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 1800);
      } else {
        const error = await res.json();
        alert(error.error || "Error al guardar el perfil");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error al guardar el perfil");
    }
  };

  const handleAddPr = async () => {
    if (!newExercise.trim() || !newWeight.trim()) return;
    
    try {
      const res = await fetch("/api/personal-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: newExercise.trim(),
          weight: newWeight.trim(),
        }),
      });

      if (res.ok) {
        const { record } = await res.json();
        setPrList((prev) => [
          { id: record.id.toString(), exercise: record.exercise, weight: record.weight },
          ...prev,
        ]);
        setNewExercise("");
        setNewWeight("");
      } else {
        const error = await res.json();
        alert(error.error || "Error al agregar el PR");
      }
    } catch (error) {
      console.error("Error adding PR:", error);
      alert("Error al agregar el PR");
    }
  };

  const startEditPr = (entry: { id: string; exercise: string; weight: string }) => {
    setEditingId(entry.id);
    setEditingPr({ exercise: entry.exercise, weight: entry.weight });
  };

  const handleUpdatePr = async () => {
    if (!editingId || !editingPr.exercise.trim() || !editingPr.weight.trim()) return;
    
    try {
      const res = await fetch(`/api/personal-records/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: editingPr.exercise.trim(),
          weight: editingPr.weight.trim(),
        }),
      });

      if (res.ok) {
        const { record } = await res.json();
        setPrList((prev) =>
          prev.map((pr) =>
            pr.id === editingId
              ? { ...pr, exercise: record.exercise, weight: record.weight }
              : pr
          )
        );
        setEditingId(null);
        setEditingPr({ exercise: "", weight: "" });
      } else {
        const error = await res.json();
        alert(error.error || "Error al actualizar el PR");
      }
    } catch (error) {
      console.error("Error updating PR:", error);
      alert("Error al actualizar el PR");
    }
  };

  const cancelEditPr = () => {
    setEditingId(null);
    setEditingPr({ exercise: "", weight: "" });
  };

  const handleDeletePr = async (prId: string) => {
    try {
      const res = await fetch(`/api/personal-records/${prId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPrList((prev) => prev.filter((pr) => pr.id !== prId));
      } else {
        const error = await res.json();
        alert(error.error || "Error al eliminar el PR");
      }
    } catch (error) {
      console.error("Error deleting PR:", error);
      alert("Error al eliminar el PR");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 sm:py-14">
        <div className="flex flex-col gap-2">
          <Badge className="w-fit">Panel</Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tu centro de entrenamiento Kraken</h1>
          <p className="text-lg text-zinc-200">
            Reserva clases, mantén tu perfil al día y registra tus PRs en un solo lugar.
          </p>
        </div>

      <SignedOut>
        <Card className="flex flex-col gap-4 border-dashed border-white/20 bg-white/5 p-6 text-center">
          <p className="text-lg font-semibold text-white">Inicia sesión para entrar al panel.</p>
          <p className="text-sm text-zinc-300">
            Agenda clases, actualiza tu información y sigue tu progreso una vez ingreses.
          </p>
          <div className="flex justify-center">
            <SignInButton mode="modal">
              <Button>Iniciar sesión</Button>
            </SignInButton>
          </div>
        </Card>
      </SignedOut>

      <SignedIn>
        {loading ? (
          <Card className="border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-zinc-300">Cargando datos...</p>
          </Card>
        ) : (
          <>
        <div className="grid gap-4 md:grid-cols-3">
          {sectionCards.map(({ id, title, description, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <Card
                key={id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveSection(id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActiveSection(id)}
                className={cn(
                  "cursor-pointer border border-red-500/30 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20 dark:border-red-500/30 dark:bg-zinc-950 dark:hover:border-red-400/80",
                  isActive && "border-red-500 shadow-lg shadow-red-500/20 dark:border-red-500 scale-[1.02]"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:bg-red-500/10 dark:text-red-100",
                      isActive && "bg-red-500 text-white dark:bg-red-500 dark:text-white"
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">{description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {activeSection === "reservations" && (
          <Card className="border border-white/10 bg-white/5 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge variant="secondary">Reservas</Badge>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Aparta tus sesiones de esta semana</h2>
                <p className="text-sm text-zinc-300">
                  Lunes a sábado. Sesiones de 60 minutos por la mañana (5:00-8:00 AM) y tarde (4:00-7:00 PM).
                </p>
                <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                  <p className="text-xs font-semibold text-yellow-200 mb-2">Reglas de reserva:</p>
                  <ul className="text-xs text-yellow-100/80 space-y-1 list-disc list-inside">
                    <li>Solo puedes reservar un horario por día</li>
                    <li>Solo puedes reservar con un día de anticipación</li>
                    <li>No puedes cancelar con menos de 1 hora de anticipación</li>
                    <li>No puedes seleccionar horarios que ya pasaron</li>
                  </ul>
                </div>
              </div>
              <div className="hidden items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-100 sm:flex">
                <CalendarClock className="size-4" />
                Vista semanal
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-[0.9fr,1.1fr]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Días</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {days.map((day) => {
                    const isDisabled = isMoreThanOneDayAhead(day) || hasReservationForDay(day, bookings);
                    return (
                      <button
                        key={day}
                        onClick={() => !isDisabled && setSelectedDay(day)}
                        disabled={isDisabled}
                        className={cn(
                          buttonVariants({ variant: day === selectedDay ? "default" : "outline", size: "sm" }),
                          "rounded-full px-4 transition-all duration-200",
                          day === selectedDay && "bg-red-500 text-white shadow-lg shadow-red-500/30",
                          day !== selectedDay && !isDisabled && "hover:border-red-500/50 hover:scale-105",
                          isDisabled && "opacity-50 cursor-not-allowed"
                        )}
                        title={
                          isDisabled
                            ? hasReservationForDay(day, bookings)
                              ? "Ya tienes una reserva para este día"
                              : "Solo puedes reservar con un día de anticipación"
                            : undefined
                        }
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.08em] text-zinc-400">Selección actual</p>
                <div className="mt-2 rounded-xl border border-dashed border-red-500/50 bg-black/40 px-3 py-2 text-sm font-semibold text-white">
                  {selectedDay} @ {selectedTime}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Horarios</p>
                  <span className="text-xs text-zinc-400">Sesiones de 60 minutos</span>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
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
                          "flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition-all duration-200 text-white",
                          time === selectedTime && !isDisabled
                            ? "border-red-400 bg-red-500/10 shadow-md shadow-red-500/20 scale-[1.02]"
                            : !isDisabled
                            ? "border-white/20 hover:border-red-200/60 hover:bg-white/5 hover:scale-[1.02]"
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
                          <Timer className="size-4" />
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    onClick={handleBook}
                    disabled={
                      isMoreThanOneDayAhead(selectedDay) ||
                      hasReservationForDay(selectedDay, bookings) ||
                      isTimeSlotPassed(selectedDay, selectedTime)
                    }
                    className="w-full sm:w-auto bg-red-500 text-white hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          ? "Solo puedes reservar con un día de anticipación"
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
              <p className="text-sm font-semibold text-white">Tus reservas</p>
              {bookings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-3 text-sm text-zinc-200">
                  Aún no tienes reservas. Elige un día y hora para agendar.
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {bookings.map((booking) => {
                    const canCancel = !isLessThanOneHourBefore(booking.day, booking.time);
                    const isPassed = isTimeSlotPassed(booking.day, booking.time);
                    return (
                      <div
                        key={`${booking.day}-${booking.time}`}
                        className={cn(
                          "flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200",
                          isPassed
                            ? "border-white/5 bg-white/5 opacity-50"
                            : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-red-500/30"
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
                            "text-red-400 hover:text-red-300 hover:bg-red-500/10",
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
                          <X className="size-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              {reservationSummary && <p className="text-xs text-zinc-300">Próximas: {reservationSummary}</p>}
            </div>
          </Card>
        )}

        {activeSection === "profile" && (
          <Card className="border border-white/10 bg-white/5 p-6">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="secondary">Perfil</Badge>
                <h3 className="mt-3 text-xl font-semibold text-white">Actualiza tus datos</h3>
                <p className="text-sm text-zinc-300">
                  Mantén tu información y objetivos al día para tus coaches.
                </p>
              </div>
              {profileSaved && (
                <div className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-100">
                  <CheckCircle2 className="size-4" />
                  Guardado
                </div>
              )}
            </div>
            <div className="mt-5 space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-white">Nombre completo</label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Tu nombre"
                  className="border-white/20 bg-white/5 text-white placeholder:text-zinc-400"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-white">Correo</label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="tucorreo@kraken.fit"
                  className="border-white/20 bg-white/5 text-white placeholder:text-zinc-400"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-white">TelAcfono</label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="(555) 555-1234"
                  className="border-white/20 bg-white/5 text-white placeholder:text-zinc-400"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-white">Objetivos</label>
                <Textarea
                  value={profile.goals}
                  onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
                  placeholder="Define tus objetivos para las próximas 12 semanas."
                  rows={3}
                  className="border-white/20 bg-white/5 text-white placeholder:text-zinc-400"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleProfileSave} className="bg-red-500 text-white hover:bg-red-400">
                Guardar cambios
              </Button>
              <Button variant="outline" onClick={() => setProfileSaved(false)}>
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        {activeSection === "prs" && (
          <Card className="border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="secondary">Mis PR&apos;s</Badge>
                <h3 className="mt-3 text-xl font-semibold text-white">Registra récords personales</h3>
                <p className="text-sm text-zinc-300">
                  Guarda tus mejores levantamientos y benchmarks para ver tu progreso.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1.1fr,0.9fr,auto]">
              <Input
                placeholder="Ejercicio (ej. Snatch)"
                value={newExercise}
                onChange={(e) => setNewExercise(e.target.value)}
                className="border-white/20 bg-white/5 text-white placeholder:text-zinc-400"
              />
              <Input
                placeholder="Peso (ej. 175 lbs)"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="border-white/20 bg-white/5 text-white placeholder:text-zinc-400"
              />
              <Button onClick={handleAddPr} className="gap-2 bg-red-500 text-white hover:bg-red-400">
                <Plus className="size-4" />
                Agregar
              </Button>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {prList.map((entry) => {
                const isEditing = editingId === entry.id;
                return (
                  <div
                    key={entry.id}
                    className="relative rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white transition-all duration-200 hover:bg-white/10 hover:border-red-500/20"
                  >
                    {isEditing ? (
                      <div className="grid grid-cols-[1fr,auto] items-start gap-3 sm:grid-cols-[1fr,1fr,auto] sm:items-center">
                        <Input
                          value={editingPr.exercise}
                          onChange={(e) => setEditingPr({ ...editingPr, exercise: e.target.value })}
                          placeholder="Ejercicio"
                          className="border-white/20 bg-white/5 text-white placeholder:text-zinc-400"
                        />
                        <Input
                          value={editingPr.weight}
                          onChange={(e) => setEditingPr({ ...editingPr, weight: e.target.value })}
                          placeholder="Peso"
                          className="border-white/20 bg-white/5 text-white placeholder:text-zinc-400 col-start-1 row-start-2 sm:col-start-2 sm:row-start-1"
                        />
                        <div className="col-start-2 row-start-1 row-span-2 flex flex-col items-center gap-2 self-start sm:col-start-3 sm:row-span-1 sm:row-start-1 sm:flex-row sm:justify-end sm:self-center">
                          <Button
                            size="icon"
                            className="bg-red-500 text-white hover:bg-red-400"
                            onClick={handleUpdatePr}
                            aria-label="Guardar PR"
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="border-white/30 bg-white text-black hover:bg-white/80 hover:text-black"
                            onClick={cancelEditPr}
                            aria-label="Cancelar edición"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-white">{entry.exercise}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-red-300">{entry.weight}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-white hover:bg-white hover:text-black"
                            onClick={() => startEditPr(entry)}
                            aria-label={`Editar ${entry.exercise}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            onClick={() => handleDeletePr(entry.id)}
                            aria-label={`Eliminar ${entry.exercise}`}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
          </>
        )}
      </SignedIn>
      </main>
      <footer className="border-t border-white/10 bg-black/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-white">
            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase tracking-tight">
              Kraken
            </span>
            <span className="font-semibold">Elite Fitness</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <a className="hover:text-white" href="/privacy">
              Privacidad
            </a>
            <a className="hover:text-white" href="/terms">
              Términos
            </a>
            <a className="hover:text-white" href="/contact">
              Contacto
            </a>
          </div>
          <p className="text-xs text-zinc-400">
            Creado para atletas que quieren moverse mejor, levantar más y llegar más lejos.
          </p>
        </div>
      </footer>
    </div>
  );
}

