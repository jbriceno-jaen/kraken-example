"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { DatePicker } from "@/components/ui/date-picker";
import { Dumbbell } from "lucide-react";
import { formatDateLocal, parseDateLocal } from "@/lib/utils";

interface WOD {
  id: number;
  date: string;
  title: string;
  description: string;
}

interface WODModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingWOD?: WOD | null;
  selectedDate?: Date | null;
}

export function WODModal({ open, onOpenChange, onSuccess, editingWOD, selectedDate }: WODModalProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    title: "",
    description: "",
  });

  useEffect(() => {
    if (editingWOD) {
      // Parse the date and ensure it's at midnight to avoid timezone issues
      const wodDate = parseDateLocal(editingWOD.date);
      const dateAtMidnight = new Date(wodDate.getFullYear(), wodDate.getMonth(), wodDate.getDate());
      const dateStr = formatDateLocal(dateAtMidnight);
      setFormData({
        date: dateStr,
        title: editingWOD.title,
        description: editingWOD.description,
      });
    } else if (selectedDate) {
      // Ensure selectedDate is at midnight to avoid timezone issues
      const dateAtMidnight = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const dateStr = formatDateLocal(dateAtMidnight);
      setFormData({
        date: dateStr,
        title: "",
        description: "",
      });
    } else {
      // Create today's date at midnight to avoid timezone issues
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateStr = formatDateLocal(today);
      setFormData({
        date: dateStr,
        title: "",
        description: "",
      });
    }
  }, [editingWOD, selectedDate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let res: Response;
      let url: string;
      let method: string;

      if (editingWOD) {
        // Update existing WOD using PUT
        url = `/api/manager/wod/${editingWOD.id}`;
        method = "PUT";
      } else {
        // Create new WOD using POST
        url = "/api/manager/wod";
        method = "POST";
      }

      res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.date,
          title: formData.title.trim(),
          description: formData.description.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(
          editingWOD ? "WOD actualizado exitosamente" : "WOD creado exitosamente",
          "success"
        );
        onSuccess();
        onOpenChange(false);
      } else {
        showToast(data.error || "Error al guardar WOD", "error");
      }
    } catch (error) {
      console.error("Error saving WOD:", error);
      showToast("Error al guardar WOD", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="rounded-full bg-gradient-to-r from-red-500 to-red-600 px-3 py-1 text-xs font-bold uppercase tracking-tight font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/50">
              Kraken
            </span>
            <span className="text-lg font-bold font-[family-name:var(--font-orbitron)]">Elite Fitness</span>
          </div>
          <Badge className="bg-red-500/20 border border-red-500/30 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/20 w-fit mx-auto">
            {editingWOD ? "Editar WOD" : "Crear WOD"}
          </Badge>
          <DialogTitle className="text-3xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent text-center pt-2">
            {editingWOD ? "Editar Workout del Día" : "Nuevo Workout del Día"}
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-400 text-center">
            {editingWOD ? "Modifica el workout del día" : "Crea un nuevo workout del día para una fecha específica"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
              Fecha *
            </label>
            <DatePicker
              value={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
              Título del WOD *
            </label>
            <Input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Fran, Murph, Cindy, etc."
              className="min-h-[48px] text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
              Descripción del WOD *
            </label>
            <textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ej: 21-15-9 de Thrusters (95/65 lbs) y Pull-ups. Tiempo límite: 20 minutos."
              rows={8}
              className="w-full text-base sm:text-sm border border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 rounded-md px-3 py-2 resize-none"
            />
            <p className="text-xs text-zinc-500">Incluye ejercicios, repeticiones, pesos y cualquier información relevante</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-zinc-500/40 bg-zinc-500/10 text-zinc-300 hover:bg-zinc-500/20 hover:border-zinc-500/50 active:scale-[0.98] transition-all duration-200"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50"
            >
              {isLoading ? "Guardando..." : editingWOD ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

