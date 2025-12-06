import { Flame, Timer, UserCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export default function Hero() {
  return (
    <section
      id="top"
      className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-red-600/30 via-red-500/20 to-rose-500/10 px-6 py-12 shadow-2xl sm:px-10 sm:py-16"
    >
      <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-6">
          <Badge className="bg-white/10 text-white">CrossFit | Fuerza | Motor</Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Más fuerte en cada WOD. Imparable en cada temporada.
            </h1>
            <p className="text-lg text-zinc-200">
              Registra cada levantamiento, cada split, cada PR. Kraken Elite Fitness une programación de élite,
              seguimiento en tiempo real y energía de comunidad para que sigas progresando.
            </p>
          </div>
        </div>
        <div className="relative w-full max-w-lg">
          <div className="absolute inset-6 rounded-full bg-red-500/30 blur-3xl animate-pulse" />
          <div className="relative space-y-4 rounded-2xl border border-white/10 bg-black/50 p-6 shadow-2xl transition-all duration-300 hover:border-red-500/30 hover:shadow-red-500/10">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-red-500/20 text-red-200">
                <Flame className="size-5" />
              </span>
              <div>
                <p className="text-sm text-zinc-300">Kraken Elite Fitness</p>
                <p className="text-lg font-semibold text-white">Tu centro de control</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 transition-all duration-200 hover:bg-white/10 hover:border-red-500/20">
              <p className="text-sm text-zinc-300">Reservas</p>
              <p className="text-base font-medium text-white">
                Elige día y hora para asegurar una clase de 60 minutos entre 5-8 AM o 4-7 PM, de lunes a sábado.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:bg-white/10 hover:border-red-500/20 hover:scale-[1.02]">
                <div className="flex items-center gap-2 text-red-200">
                  <UserCheck className="size-4" />
                  <p className="text-sm font-semibold">Perfil</p>
                </div>
                <p className="text-sm text-zinc-200">Mantén tus datos y objetivos alineados con los coaches.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:bg-white/10 hover:border-red-500/20 hover:scale-[1.02]">
                <div className="flex items-center gap-2 text-red-200">
                  <Timer className="size-4" />
                  <p className="text-sm font-semibold">Mis PRs</p>
                </div>
                <p className="text-sm text-zinc-200">Registra levantamientos (ej. Snatch 185 lbs) y observa tu progreso.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
