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
  Today: {
    warmup: ["3 rounds: 200 m row, 10 air squats, 10 scapular pull-ups"],
    strength: "Front Squat 4x4 @ 78% (tempo 32X1)",
    metcon: "For time: 30-20-10 Cal Echo Bike + 15-12-9 Bar Muscle-ups",
  },
  "This week": {
    warmup: ["Dynamic activation + barbell complex"],
    strength: "Split Jerk Wave: 3x3 @ 70%, 3x2 @ 78%, 3x1 @ 85%",
    metcon: "AMRAP 14: 10 DB Snatch (70/50), 12 Box Jump Overs (24/20), 200 m run",
  },
  "Leaderboard": {
    warmup: ["Mobility + activation"],
    strength: "Olympic total highlight",
    metcon: "Benchmark: 'DT' - 5 rounds: 12 DL, 9 HPC, 6 Jerk (155/105)",
  },
};

const tabs = Object.keys(data) as Array<keyof typeof data>;

export default function SchedulePreview() {
  const [active, setActive] = useState<keyof typeof data>("Today");
  const wod = data[active];

  return (
    <section id="schedule" className="space-y-6">
      <div className="space-y-3">
        <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs sm:text-sm px-4 sm:px-5 py-1.5">
          Daily WOD
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-[family-name:var(--font-orbitron)] text-white">
          See what's next.
        </h2>
        <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
          Switch between today, the week, or leaderboard benchmarks.
        </p>
      </div>

      <Card className="border border-red-500/50 bg-black/30 p-4 sm:p-6 transition-all duration-300 hover:border-red-500/70">
        <div className="flex flex-wrap gap-2.5 sm:gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant={tab === active ? "default" : "outline"}
              className={`min-h-[44px] sm:min-h-0 h-10 sm:h-9 rounded-full font-[family-name:var(--font-orbitron)] text-sm sm:text-xs transition-all duration-200 active:scale-95 ${
                tab === active
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30 border-red-500"
                  : "border-red-500/50 bg-black/30 text-white hover:bg-black/50 hover:border-red-500/70 active:bg-black/20"
              }`}
              onClick={() => setActive(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card className="border border-red-500/50 bg-black/30 p-4 transition-all duration-200 hover:bg-black/50 hover:border-red-500/70">
            <p className="text-sm font-semibold font-[family-name:var(--font-orbitron)] text-white">Warm-up</p>
            <ul className="mt-2 space-y-1 text-sm text-zinc-400">
              {wod.warmup.map((item) => (
                <li key={item} className="transition-colors hover:text-zinc-300">- {item}</li>
              ))}
            </ul>
          </Card>
          <Card className="border border-red-500/50 bg-black/30 p-4 transition-all duration-200 hover:bg-black/50 hover:border-red-500/70">
            <p className="text-sm font-semibold font-[family-name:var(--font-orbitron)] text-white">Strength</p>
            <p className="mt-2 text-sm text-zinc-400">{wod.strength}</p>
          </Card>
        </div>

        <Card className="mt-4 border border-red-500/50 bg-gradient-to-r from-red-500/20 to-red-600/10 p-4 transition-all duration-200 hover:from-red-500/30 hover:to-red-600/20 hover:border-red-500/70">
          <p className="text-sm font-semibold font-[family-name:var(--font-orbitron)] text-white">MetCon</p>
          <p className="mt-2 text-sm text-zinc-300">{wod.metcon}</p>
        </Card>
      </Card>
    </section>
  );
}
