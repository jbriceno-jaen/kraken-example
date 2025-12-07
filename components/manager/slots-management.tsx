"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { useToast } from "@/components/ui/toast";
import { Clock, Plus, Edit, Trash2, X, Check, AlertTriangle } from "lucide-react";
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

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function SlotsManagement() {
  const { showToast } = useToast();
  const [slots, setSlots] = useState<ClassSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ClassSlot | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<ClassSlot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    day: "",
    hour: "5",
    minute: "00",
    period: "AM",
    capacity: "14",
    available: true,
  });

  useEffect(() => {
    fetchSlots();
  }, []);

  // Set initial selected day to today or first day
  useEffect(() => {
    if (slots.length > 0 && !selectedDay) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const dayMap: Record<number, string> = {
        1: "Lunes",
        2: "Martes",
        3: "Miércoles",
        4: "Jueves",
        5: "Viernes",
        6: "Sábado",
      };
      const todayName = dayMap[dayOfWeek] || days[0];
      setSelectedDay(todayName);
    }
  }, [slots, selectedDay]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/manager/class-slots");
      if (res.ok) {
        const { slots: slotsData } = await res.json();
        setSlots(slotsData);
      } else {
        showToast("Error al cargar horarios", "error");
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      showToast("Error al cargar horarios", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!formData.day || !formData.hour || !formData.minute || !formData.period) {
      showToast("Día y hora son requeridos", "error");
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
        showToast("Horario creado exitosamente", "success");
        setShowAddModal(false);
        setFormData({ day: "", hour: "5", minute: "00", period: "AM", capacity: "14", available: true });
        fetchSlots();
      } else {
        showToast(data.error || "Error al crear horario", "error");
      }
    } catch (error) {
      console.error("Error creating slot:", error);
      showToast("Error al crear horario", "error");
    }
  };

  const handleEditSlot = async () => {
    if (!selectedSlot || !formData.day || !formData.hour || !formData.minute || !formData.period) {
      showToast("Día y hora son requeridos", "error");
      return;
    }

    // Combine hour, minute, and period into time string
    const time = `${formData.hour}:${formData.minute} ${formData.period}`;

    try {
      const res = await fetch(`/api/manager/class-slots/${selectedSlot.id}`, {
        method: "PATCH",
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
        showToast("Horario actualizado exitosamente", "success");
        setShowEditModal(false);
        setSelectedSlot(null);
        setFormData({ day: "", hour: "5", minute: "00", period: "AM", capacity: "14", available: true });
        fetchSlots();
      } else {
        showToast(data.error || "Error al actualizar horario", "error");
      }
    } catch (error) {
      console.error("Error updating slot:", error);
      showToast("Error al actualizar horario", "error");
    }
  };

  const handleDeleteSlot = async () => {
    if (!slotToDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/manager/class-slots/${slotToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Horario eliminado exitosamente", "success");
        setShowDeleteConfirm(false);
        setSlotToDelete(null);
        fetchSlots();
      } else {
        showToast(data.error || "Error al eliminar horario", "error");
      }
    } catch (error) {
      console.error("Error deleting slot:", error);
      showToast("Error al eliminar horario", "error");
    } finally {
      setIsDeleting(false);
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

  const openEditModal = (slot: ClassSlot) => {
    setSelectedSlot(slot);
    const parsedTime = parseTime(slot.time);
    setFormData({
      day: slot.day,
      hour: parsedTime.hour,
      minute: parsedTime.minute,
      period: parsedTime.period,
      capacity: slot.capacity.toString(),
      available: slot.available,
    });
    setShowEditModal(true);
  };

  const openDeleteConfirm = (slot: ClassSlot) => {
    setSlotToDelete(slot);
    setShowDeleteConfirm(true);
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

  const slotsByDay = days.reduce((acc, day) => {
    const daySlots = slots.filter((slot) => slot.day === day);
    // Sort slots by time (ascending)
    daySlots.sort((a, b) => timeTo24h(a.time) - timeTo24h(b.time));
    acc[day] = daySlots;
    return acc;
  }, {} as Record<string, ClassSlot[]>);

  const currentDaySlots = selectedDay ? slotsByDay[selectedDay] || [] : [];

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-orbitron)] text-white">
            Gestión de Horarios
          </h2>
          <p className="text-zinc-400 mt-1">Administra los horarios disponibles por día de la semana</p>
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
          className="w-full sm:w-auto min-h-[44px] sm:min-h-[40px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:scale-[0.98] transition-all duration-200"
        >
          <Plus className="mr-2 size-4 sm:size-3.5" />
          <span className="text-base sm:text-sm">Agregar Horario</span>
        </Button>
      </div>

      {/* Day Selection Buttons */}
      <Card className="border border-red-500/20 bg-gradient-to-br from-white/5 via-black/50 to-black p-3 sm:p-4">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-2">
          {days.map((day) => {
            const daySlots = slotsByDay[day] || [];
            const isSelected = selectedDay === day;
            return (
              <Button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "min-h-[44px] w-full sm:w-auto sm:min-h-[40px] px-4 sm:px-6 transition-all duration-200 font-[family-name:var(--font-orbitron)] flex items-center justify-center gap-2",
                  isSelected
                    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30"
                    : "border border-red-500/20 bg-white/5 text-zinc-300 hover:bg-red-500/10 hover:border-red-500/30"
                )}
              >
                <span className="text-sm sm:text-sm font-semibold">{day}</span>
                {daySlots.length > 0 && (
                  <Badge
                    className={cn(
                      "text-xs min-w-[24px] flex items-center justify-center",
                      isSelected
                        ? "bg-white/20 text-white border-white/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    )}
                  >
                    {daySlots.length}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Selected Day Slots */}
      {selectedDay && (
        <Card className="border border-red-500/20 bg-gradient-to-br from-white/5 via-black/50 to-black p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold font-[family-name:var(--font-orbitron)] text-white mb-1">
                {selectedDay}
              </h3>
              <p className="text-zinc-400 text-sm">
                {currentDaySlots.length} {currentDaySlots.length === 1 ? "horario configurado" : "horarios configurados"}
              </p>
            </div>
            <Badge className="bg-red-500/20 border border-red-500/30 text-red-400 font-[family-name:var(--font-orbitron)] text-sm px-3 py-1">
              {currentDaySlots.filter(s => s.available).length} disponibles
            </Badge>
          </div>

          {currentDaySlots.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {currentDaySlots.map((slot) => (
                <div
                  key={slot.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02]",
                    slot.available
                      ? "border-green-500/20 bg-green-500/5 hover:bg-green-500/10 hover:border-green-500/30"
                      : "border-red-500/20 bg-red-500/5 opacity-70"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className={cn("size-5", slot.available ? "text-green-400" : "text-red-400")} />
                      <span className="font-bold font-[family-name:var(--font-orbitron)] text-white text-lg">
                        {slot.time}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(slot)}
                            className="min-h-[36px] min-w-[36px] p-0 border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/50 active:scale-95"
                          >
                            <Edit className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar horario</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteConfirm(slot)}
                            className="min-h-[36px] min-w-[36px] p-0 border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50 active:scale-95"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Eliminar horario</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Capacidad:</span>
                      <span className="text-white font-semibold">{slot.capacity}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Reservas:</span>
                      <span className="text-white font-semibold">{slot.currentReservations}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Disponibles:</span>
                      <span className={cn("font-semibold", slot.spotsRemaining > 0 ? "text-green-400" : "text-red-400")}>
                        {slot.spotsRemaining}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-red-500/20">
                      <Badge
                        className={cn(
                          "w-full justify-center font-[family-name:var(--font-orbitron)]",
                          slot.available
                            ? "bg-green-500/20 border-green-500/30 text-green-400"
                            : "bg-red-500/20 border-red-500/30 text-red-400"
                        )}
                      >
                        {slot.available ? "✓ Disponible" : "✗ No disponible"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="size-16 mx-auto mb-4 text-zinc-500 opacity-50" />
              <p className="text-zinc-400 text-lg mb-2">No hay horarios configurados para {selectedDay}</p>
              <p className="text-zinc-500 text-sm">Usa el botón "Agregar Horario" para crear uno</p>
            </div>
          )}
        </Card>
      )}

      {/* Add Slot Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black text-white max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Logo variant="compact" showLink={false} className="justify-center" />
            </div>
            <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/30 w-fit mx-auto">
              Nuevo Horario
            </Badge>
            <DialogTitle className="text-2xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent text-center pt-2">
              Agregar Horario
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-400 text-center">
              Crea un nuevo horario de clase
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddSlot();
            }}
            className="space-y-4 mt-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Día *
              </label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                required
                className="w-full min-h-[48px] text-base sm:text-sm border border-red-500/20 bg-black text-white rounded-md px-3 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 [&>option]:bg-black [&>option]:text-white"
              >
                <option value="">Seleccionar día</option>
                {days.map((day) => (
                  <option key={day} value={day} className="bg-black text-white">
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Hora *
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
              <label className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Capacidad
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
                className="flex-1 border-zinc-500/40 bg-zinc-500/10 text-zinc-300 hover:bg-zinc-500/20 hover:border-zinc-500/50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                Crear
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Slot Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black text-white max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Logo variant="compact" showLink={false} className="justify-center" />
            </div>
            <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/30 w-fit mx-auto">
              Editar Horario
            </Badge>
            <DialogTitle className="text-2xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent text-center pt-2">
              Editar Horario
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-400 text-center">
              Modifica la información del horario
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEditSlot();
            }}
            className="space-y-4 mt-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Día *
              </label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                required
                className="w-full min-h-[48px] text-base sm:text-sm border border-red-500/20 bg-black text-white rounded-md px-3 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 [&>option]:bg-black [&>option]:text-white"
              >
                {days.map((day) => (
                  <option key={day} value={day} className="bg-black text-white">
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Hora *
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
              <label className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Capacidad
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
                Horario disponible
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSlot(null);
                }}
                className="flex-1 border-zinc-500/40 bg-zinc-500/10 text-zinc-300 hover:bg-zinc-500/20 hover:border-zinc-500/50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                Actualizar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={(open) => {
        if (!open && !isDeleting) {
          setShowDeleteConfirm(false);
          setSlotToDelete(null);
        }
      }}>
        <DialogContent className="border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black text-white max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Logo variant="compact" showLink={false} className="justify-center" />
            </div>
            <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/30 w-fit mx-auto">
              Confirmar Eliminación
            </Badge>
            <DialogTitle className="text-2xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent text-center pt-2">
              ¿Eliminar Horario?
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-400 text-center">
              ¿Estás seguro de que quieres eliminar el horario <span className="font-semibold text-red-400">"{slotToDelete?.day} - {slotToDelete?.time}"</span>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center py-4">
            <div className="rounded-full bg-red-500/20 border border-red-500/30 p-4">
              <AlertTriangle className="size-8 text-red-400" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!isDeleting) {
                  setShowDeleteConfirm(false);
                  setSlotToDelete(null);
                }
              }}
              disabled={isDeleting}
              className="flex-1 border-zinc-500/40 bg-zinc-500/10 text-zinc-300 hover:bg-zinc-500/20 hover:border-zinc-500/50 disabled:opacity-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteSlot}
              disabled={isDeleting}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Eliminando...
                </span>
              ) : (
                "Eliminar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

