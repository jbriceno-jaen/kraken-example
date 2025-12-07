"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Dumbbell, Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { WODModal } from "@/components/manager/wod-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatDateLocal, parseDateLocal } from "@/lib/utils";

interface WOD {
  id: number;
  date: string;
  title: string;
  description: string;
}

export default function WODPage() {
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const [wodList, setWodList] = useState<WOD[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWodForm, setShowWodForm] = useState(false);
  const [selectedWodDate, setSelectedWodDate] = useState<Date | null>(null);
  const [editingWOD, setEditingWOD] = useState<WOD | null>(null);
  const [showDeleteWodConfirm, setShowDeleteWodConfirm] = useState(false);
  const [wodToDelete, setWodToDelete] = useState<{ id: number; title: string } | null>(null);
  const [isDeletingWod, setIsDeletingWod] = useState(false);

  const fetchWODs = async () => {
    try {
      setLoading(true);
      const wodPromises = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = formatDateLocal(date);
        wodPromises.push(
          fetch(`/api/manager/wod?date=${dateStr}`).then((res) => res.json())
        );
      }
      const results = await Promise.all(wodPromises);
      const wods = results
        .filter((r) => r.wod !== null)
        .map((r) => r.wod)
        .sort((a: WOD, b: WOD) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setWodList(wods);
    } catch (error) {
      console.error("Error fetching WODs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "manager") {
      fetchWODs();
    }
  }, [status, session]);

  const handleDeleteWOD = (wod: { id: number; title: string }) => {
    setWodToDelete(wod);
    setShowDeleteWodConfirm(true);
  };

  const handleConfirmDeleteWOD = async () => {
    if (!wodToDelete) return;

    setIsDeletingWod(true);
    try {
      const res = await fetch(`/api/manager/wod/${wodToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("WOD eliminado exitosamente", "success");
        fetchWODs();
        setShowDeleteWodConfirm(false);
        setWodToDelete(null);
      } else {
        const { error } = await res.json();
        showToast(error || "Error al eliminar WOD", "error");
      }
    } catch (error) {
      showToast("Error al eliminar WOD", "error");
    } finally {
      setIsDeletingWod(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative size-16">
          <div className="size-full animate-spin rounded-full border-4 border-red-500/30 border-t-red-500" />
          <Dumbbell className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-red-400 animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-semibold text-zinc-400 font-[family-name:var(--font-orbitron)]">
          Cargando WOD's...
        </p>
      </div>
    );
  }

  return (
    <>
      <Card className="bg-black p-4 sm:p-6 lg:p-8 xl:p-10 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter font-[family-name:var(--font-orbitron)] text-white">
              WORKOUT
              <br />
              <span className="text-red-500">DEL DÍA</span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 mt-2 font-light">
              Crea y edita workouts del día.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingWOD(null);
              setSelectedWodDate(null);
              setShowWodForm(true);
            }}
            className="w-full sm:w-auto min-h-[48px] sm:min-h-0 text-base sm:text-sm bg-gradient-to-r from-red-500 via-red-600 to-red-500 hover:from-red-600 hover:via-red-700 hover:to-red-600 active:scale-[0.98] transition-all duration-200"
          >
            <Plus className="mr-2 size-4" />
            Crear WOD
          </Button>
        </div>

        <div className="space-y-4 sm:space-y-5">
          {wodList.length > 0 ? (
            wodList.map((wod) => {
              const wodDate = parseDateLocal(wod.date);
              const isToday = wodDate.toDateString() === new Date().toDateString();
              return (
                <Card
                  key={wod.id}
                  className="border border-red-500/50 bg-black/30 transition-all duration-300 hover:border-red-500/70 hover:bg-black/50 active:scale-[0.98] p-5 sm:p-6 lg:p-7"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-orbitron)] text-white break-words">
                          {wod.title}
                        </h3>
                        {isToday && (
                          <Badge className="bg-green-500/20 border border-green-500/30 text-green-400 font-[family-name:var(--font-orbitron)] text-xs flex-shrink-0">
                            Hoy
                          </Badge>
                        )}
                      </div>
                      <p className="text-zinc-400 text-sm mb-2">
                        {wodDate.toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-zinc-600 text-sm whitespace-pre-wrap line-clamp-3">
                        {wod.description}
                      </p>
                    </div>
                    <div className="flex gap-2 sm:flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedWodDate(null);
                          setEditingWOD(wod);
                          setShowWodForm(true);
                        }}
                        className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-[36px] border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/50 active:scale-[0.98] transition-all duration-200"
                      >
                        <Edit className="size-4 sm:size-3.5 mr-2" />
                        <span className="text-sm sm:text-xs">Editar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteWOD({ id: wod.id, title: wod.title })}
                        className="min-h-[44px] sm:min-h-[36px] min-w-[44px] sm:min-w-[36px] border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50 active:scale-[0.98] transition-all duration-200"
                      >
                        <Trash2 className="size-4 sm:size-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="border border-red-500/30 bg-black/30 p-12 text-center">
              <Dumbbell className="size-12 mx-auto mb-4 text-zinc-500" />
              <p className="text-zinc-400 text-lg mb-2">No hay WOD's creados</p>
              <p className="text-zinc-500 text-sm">Crea un WOD para comenzar</p>
            </Card>
          )}
        </div>
      </Card>

      <WODModal
        open={showWodForm}
        onOpenChange={(open) => {
          if (!open) {
            setShowWodForm(false);
            setEditingWOD(null);
            setSelectedWodDate(null);
          }
        }}
        onSuccess={() => {
          fetchWODs();
          setShowWodForm(false);
          setEditingWOD(null);
          setSelectedWodDate(null);
        }}
        editingWOD={editingWOD}
        selectedDate={selectedWodDate}
      />

      <Dialog open={showDeleteWodConfirm} onOpenChange={setShowDeleteWodConfirm}>
        <DialogContent className="border border-red-500/50 bg-black text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500 font-black tracking-tighter font-[family-name:var(--font-orbitron)]">
              <AlertTriangle className="size-5" />
              CONFIRMAR ELIMINACIÓN
            </DialogTitle>
            <DialogDescription className="text-zinc-500 font-light">
              ¿Estás seguro de que quieres eliminar el WOD "{wodToDelete?.title}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteWodConfirm(false);
                setWodToDelete(null);
              }}
              className="flex-1 border-red-500/50 bg-black/30 text-white hover:bg-black/50 hover:border-red-500/70 active:scale-[0.98] transition-all duration-200 min-h-[48px]"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDeleteWOD}
              disabled={isDeletingWod}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:scale-[0.98] transition-all duration-200 min-h-[48px] disabled:opacity-50"
            >
              {isDeletingWod ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

