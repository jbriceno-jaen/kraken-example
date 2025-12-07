"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Trophy, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface PR {
  id: string;
  exercise: string;
  weight: string;
}

export default function PRsPage() {
  const { data: session, status } = useSession();
  const { showToast } = useToast();

  const [prList, setPrList] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);
  const [newExercise, setNewExercise] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPr, setEditingPr] = useState<{ exercise: string; weight: string }>({
    exercise: "",
    weight: "",
  });

  const extractWeightNumber = (weight: string): string => {
    return weight.replace(/\s*lbs?/i, "").trim();
  };

  const formatWeight = (weight: string): string => {
    const num = extractWeightNumber(weight);
    return num ? `${num} lbs` : weight;
  };

  const fetchPRs = async () => {
    try {
      setLoading(true);
      const prRes = await fetch("/api/personal-records");
      if (prRes.ok) {
        const { records } = await prRes.json();
        setPrList(records.map((r: { id: number; exercise: string; weight: string }) => ({
          id: r.id.toString(),
          exercise: r.exercise,
          weight: r.weight,
        })));
      }
    } catch (error) {
      console.error("Error fetching PRs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchPRs();
    }
  }, [status]);

  const handleAddPR = async () => {
    if (!newExercise.trim() || !newWeight.trim()) {
      showToast("Por favor completa todos los campos", "error");
      return;
    }

    try {
      const formattedWeight = formatWeight(newWeight);
      const res = await fetch("/api/personal-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: newExercise.trim(),
          weight: formattedWeight,
        }),
      });

      if (res.ok) {
        const { record } = await res.json();
        setPrList([...prList, {
          id: record.id.toString(),
          exercise: record.exercise,
          weight: record.weight,
        }]);
        setNewExercise("");
        setNewWeight("");
        showToast("PR agregado exitosamente", "success");
      } else {
        const error = await res.json();
        showToast(error.error || "Error al agregar PR", "error");
      }
    } catch (error) {
      console.error("Error adding PR:", error);
      showToast("Error al agregar PR", "error");
    }
  };

  const handleEditPR = (pr: PR) => {
    setEditingId(pr.id);
    setEditingPr({
      exercise: pr.exercise,
      weight: extractWeightNumber(pr.weight),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingPr.exercise.trim() || !editingPr.weight.trim()) {
      showToast("Por favor completa todos los campos", "error");
      return;
    }

    try {
      const formattedWeight = formatWeight(editingPr.weight);
      const res = await fetch(`/api/personal-records/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: editingPr.exercise.trim(),
          weight: formattedWeight,
        }),
      });

      if (res.ok) {
        const { record } = await res.json();
        setPrList(prList.map((pr) =>
          pr.id === editingId
            ? { id: pr.id, exercise: record.exercise, weight: record.weight }
            : pr
        ));
        setEditingId(null);
        setEditingPr({ exercise: "", weight: "" });
        showToast("PR actualizado exitosamente", "success");
      } else {
        const error = await res.json();
        showToast(error.error || "Error al actualizar PR", "error");
      }
    } catch (error) {
      console.error("Error updating PR:", error);
      showToast("Error al actualizar PR", "error");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingPr({ exercise: "", weight: "" });
  };

  const handleDeletePR = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este PR?")) {
      return;
    }

    try {
      const res = await fetch(`/api/personal-records/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPrList(prList.filter((pr) => pr.id !== id));
        showToast("PR eliminado exitosamente", "success");
      } else {
        const error = await res.json();
        showToast(error.error || "Error al eliminar PR", "error");
      }
    } catch (error) {
      console.error("Error deleting PR:", error);
      showToast("Error al eliminar PR", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative size-16">
          <div className="size-full animate-spin rounded-full border-4 border-red-500/30 border-t-red-500" />
          <Trophy className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-red-400 animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-semibold text-zinc-400 font-[family-name:var(--font-orbitron)]">
          Cargando PR's...
        </p>
      </div>
    );
  }

  return (
    <Card className="bg-black p-4 sm:p-6 lg:p-8 xl:p-10 shadow-2xl">
      <div className="flex items-start justify-between">
        <div>
          <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs sm:text-sm px-4 sm:px-5 py-1.5">
            Mis PR's
          </Badge>
          <h3 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-white font-[family-name:var(--font-orbitron)]">
            RÉCORDS
            <br />
            <span className="text-red-500">PERSONALES</span>
          </h3>
          <p className="text-sm sm:text-base text-zinc-500 mt-2 font-light">
            Registra tus mejores levantamientos y benchmarks.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mt-10 space-y-6 sm:space-y-8">
        <div className="rounded-xl border border-red-500/50 bg-black/30 p-5 sm:p-6 lg:p-7">
          <h4 className="text-lg font-semibold text-white font-[family-name:var(--font-orbitron)] mb-4">
            Agregar Nuevo PR
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Ejercicio
              </label>
              <Input
                value={newExercise}
                onChange={(e) => setNewExercise(e.target.value)}
                placeholder="Ej: Back Squat"
                className="min-h-[48px] sm:min-h-0 text-base sm:text-sm border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Peso
              </label>
              <Input
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Ej: 225 lbs"
                className="min-h-[48px] sm:min-h-0 text-base sm:text-sm border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>
          </div>
          <Button
            onClick={handleAddPR}
            className="mt-4 w-full sm:w-auto min-h-[48px] sm:min-h-0 text-base sm:text-sm bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white hover:from-red-600 hover:via-red-700 hover:to-red-600 active:scale-[0.98] shadow-lg shadow-red-500/50"
          >
            <Plus className="mr-2 size-4" />
            Agregar PR
          </Button>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <h4 className="text-xl sm:text-2xl font-semibold text-white font-[family-name:var(--font-orbitron)]">
            Tus Récords
          </h4>
          {prList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-red-500/30 bg-black/30 px-4 py-8 text-center text-sm text-zinc-600">
              Aún no tienes PR's registrados. Agrega tu primer récord personal.
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {prList.map((pr) => (
                <div
                  key={pr.id}
                  className={cn(
                    "rounded-xl border transition-all duration-200",
                    "px-5 py-4 sm:px-4 sm:py-3",
                    "min-h-[100px] sm:min-h-0",
                    editingId === pr.id
                      ? "border-red-500/70 bg-red-500/10"
                      : "border-red-500/50 bg-black/30 hover:border-red-500/70 hover:bg-black/50"
                  )}
                >
                  {editingId === pr.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editingPr.exercise}
                        onChange={(e) => setEditingPr({ ...editingPr, exercise: e.target.value })}
                        className="min-h-[44px] sm:min-h-0 text-base sm:text-sm border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 transition-all"
                      />
                      <Input
                        value={editingPr.weight}
                        onChange={(e) => setEditingPr({ ...editingPr, weight: e.target.value })}
                        placeholder="Ej: 225 lbs"
                        className="min-h-[44px] sm:min-h-0 text-base sm:text-sm border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 transition-all"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveEdit}
                          size="sm"
                          className="flex-1 min-h-[40px] bg-gradient-to-r from-red-500 via-red-600 to-red-500 hover:from-red-600 hover:via-red-700 hover:to-red-600 text-white shadow-lg shadow-red-500/50 active:scale-[0.98] transition-all duration-200"
                        >
                          <Check className="mr-2 size-4" />
                          Guardar
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          size="sm"
                          variant="outline"
                          className="min-h-[40px] border-red-500/50 bg-black/30 text-white hover:bg-black/50"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-base sm:text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">
                          {pr.exercise}
                        </p>
                        <p className="text-lg sm:text-base font-bold text-red-500 mt-1">
                          {pr.weight}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditPR(pr)}
                          size="icon"
                          variant="ghost"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 min-w-[36px] min-h-[36px]"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeletePR(pr.id)}
                          size="icon"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 min-w-[36px] min-h-[36px]"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

