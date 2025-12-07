"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function ProgramacionPage() {
  const { data: session, status } = useSession();
  const [wod, setWod] = useState<{ title: string; description: string; date: string } | null>(null);
  const [userData, setUserData] = useState<{ wodEnabled: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userRes = await fetch("/api/user-data");
      if (userRes.ok) {
        const data = await userRes.json();
        setUserData(data);
        
        if (data.wodEnabled) {
          const wodRes = await fetch("/api/manager/wod");
          if (wodRes.ok) {
            const { wod: wodData } = await wodRes.json();
            if (wodData) {
              setWod(wodData);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
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
          Cargando programación...
        </p>
      </div>
    );
  }

  if (!userData?.wodEnabled) {
    return (
      <Card className="bg-black p-4 sm:p-6 lg:p-8 xl:p-10 shadow-2xl">
        <div className="text-center py-12">
          <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs sm:text-sm px-4 sm:px-5 py-1.5">
            Programación
          </Badge>
          <h3 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-white font-[family-name:var(--font-orbitron)]">
            WORKOUT
            <br />
            <span className="text-red-500">DEL DÍA</span>
          </h3>
          <p className="text-sm sm:text-base text-zinc-500 mt-4 font-light">
            La programación no está habilitada para tu cuenta.
          </p>
        </div>
      </Card>
    );
  }

  if (!wod) {
    return (
      <Card className="bg-black p-4 sm:p-6 lg:p-8 xl:p-10 shadow-2xl">
        <div className="text-center py-12">
          <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs sm:text-sm px-4 sm:px-5 py-1.5">
            Programación
          </Badge>
          <h3 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-white font-[family-name:var(--font-orbitron)]">
            WORKOUT
            <br />
            <span className="text-red-500">DEL DÍA</span>
          </h3>
          <p className="text-sm sm:text-base text-zinc-500 mt-4 font-light">
            No hay workout disponible para hoy.
          </p>
        </div>
      </Card>
    );
  }

  const wodDate = new Date(wod.date);
  const today = new Date();
  const isToday = wodDate.toDateString() === today.toDateString();

  return (
    <Card className="border border-red-500/50 bg-black p-4 sm:p-6 lg:p-8 shadow-2xl">
      <div className="flex items-start justify-between">
        <div>
          <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs sm:text-sm px-4 sm:px-5 py-1.5">
            Programación
          </Badge>
          <h3 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-white font-[family-name:var(--font-orbitron)]">
            WORKOUT
            <br />
            <span className="text-red-500">DEL DÍA</span>
          </h3>
          <p className="text-sm sm:text-base text-zinc-500 mt-2 font-light">
            {isToday ? "Workout de hoy" : `Workout del ${wodDate.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mt-10 rounded-xl border border-red-500/50 bg-black/30 p-6 sm:p-8 lg:p-10">
        <h4 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-orbitron)] mb-4">
          {wod.title}
        </h4>
        <div className="prose prose-invert max-w-none">
          <p className="text-base sm:text-lg text-zinc-400 whitespace-pre-wrap leading-relaxed">
            {wod.description}
          </p>
        </div>
      </div>
    </Card>
  );
}

