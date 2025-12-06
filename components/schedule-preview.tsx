"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Wod = {
  warmup: string[];
  strength: string;
  metcon: string;
};

const data: Record<string, Wod> = {
  Hoy: {
    warmup: ["3 rondas: 200 m remo, 10 sentadillas al aire, 10 dominadas de escápula"],
    strength: "Front Squat 4x4 @ 78% (tempo 32X1)",
    metcon: "For time: 30-20-10 Cal Echo Bike + 15-12-9 Bar Muscle-ups",
  },
  "Esta semana": {
    warmup: ["Activación dinámica + complejo con barra"],
    strength: "Onda de Split Jerk: 3x3 @ 70%, 3x2 @ 78%, 3x1 @ 85%",
    metcon: "AMRAP 14: 10 DB Snatch (70/50), 12 Box Jump Overs (24/20), 200 m carrera",
  },
  "Tabla de posiciones": {
    warmup: ["Movilidad + activación"],
    strength: "Destacado de total olímpico",
    metcon: "Benchmark: 'DT' - 5 rounds: 12 DL, 9 HPC, 6 Jerk (155/105)",
  },
};

const tabs = Object.keys(data) as Array<keyof typeof data>;

export default function SchedulePreview() {
  const [active, setActive] = useState<keyof typeof data>("Hoy");
  const wod = data[active];

  return (
    <section id="schedule" className="space-y-6">
      <div className="space-y-3">
        <Badge className="bg-white/10 text-white">WOD diario</Badge>
        <h2 className="text-3xl font-semibold tracking-tight">Mira lo que sigue.</h2>
        <p className="text-lg text-zinc-300">Cambia entre hoy, la semana o benchmarks del leaderboard.</p>
      </div>

      <Card className="border border-white/10 bg-black/50 p-4 sm:p-6 transition-all duration-300 hover:border-red-500/20">
        <div className="flex flex-wrap gap-2.5 sm:gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant={tab === active ? "default" : "outline"}
              className={`min-h-[44px] sm:min-h-0 h-10 sm:h-9 rounded-full border-white/20 text-sm sm:text-xs transition-all duration-200 active:scale-95 ${
                tab === active
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                  : "text-white active:bg-white/10 active:border-red-500/30"
              }`}
              onClick={() => setActive(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card className="border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:bg-white/10 hover:border-red-500/20">
            <p className="text-sm font-semibold text-white">Calentamiento</p>
            <ul className="mt-2 space-y-1 text-sm text-zinc-200">
              {wod.warmup.map((item) => (
                <li key={item} className="transition-colors hover:text-white">- {item}</li>
              ))}
            </ul>
          </Card>
          <Card className="border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:bg-white/10 hover:border-red-500/20">
            <p className="text-sm font-semibold text-white">Fuerza</p>
            <p className="mt-2 text-sm text-zinc-200">{wod.strength}</p>
          </Card>
        </div>

        <Card className="mt-4 border border-white/10 bg-gradient-to-r from-red-500/20 to-rose-500/10 p-4 transition-all duration-200 hover:from-red-500/30 hover:to-rose-500/20 hover:border-red-500/30">
          <p className="text-sm font-semibold text-white">MetCon</p>
          <p className="mt-2 text-sm text-zinc-100">{wod.metcon}</p>
        </Card>
      </Card>
    </section>
  );
}
