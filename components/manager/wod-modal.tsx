"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
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
          editingWOD ? "WOD updated successfully" : "WOD created successfully",
          "success"
        );
        onSuccess();
        onOpenChange(false);
      } else {
        showToast(data.error || "Error saving WOD", "error");
      }
    } catch (error) {
      console.error("Error saving WOD:", error);
      showToast("Error saving WOD", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-red-500/50 bg-black text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <Logo variant="compact" showLink={false} className="justify-center mb-1" />
          <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs px-3 py-1 w-fit mx-auto">
            {editingWOD ? "Edit WOD" : "Create WOD"}
          </Badge>
          <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] text-white text-center pt-1">
            {editingWOD ? "Edit Workout" : "New Workout"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-zinc-500 text-center font-light">
            {editingWOD ? "Modify the workout of the day" : "Create a new workout for a specific date"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <label htmlFor="date" className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
              Date *
            </label>
            <DatePicker
              value={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="title" className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
              WOD Title *
            </label>
            <Input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Fran, Murph, Cindy, etc."
              className="border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
              WOD Description *
            </label>
            <textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: 21-15-9 Thrusters (95/65 lbs) and Pull-ups. Time limit: 20 minutes."
              rows={6}
              className="w-full min-h-[100px] text-sm border border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 rounded-md px-4 py-3 resize-none"
            />
            <p className="text-xs text-zinc-500">Include exercises, repetitions, weights, and any relevant information</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-black/50 bg-black/30 text-white hover:bg-black/50 hover:border-red-500/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : editingWOD ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

