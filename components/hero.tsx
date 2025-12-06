"use client";

import { ArrowRight, Calendar, UserCheck, Trophy, BarChart3, Clock, Target, Zap } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const { data: session } = useSession();

  const features = [
    {
      icon: Calendar,
      title: "Reservas Inteligentes",
      description: "Reserva tus clases con un día de anticipación. Sistema automático de gestión de horarios.",
    },
    {
      icon: Trophy,
      title: "Récords Personales",
      description: "Registra y rastrea todos tus PRs. Observa tu progreso en tiempo real.",
    },
    {
      icon: UserCheck,
      title: "Perfil Completo",
      description: "Mantén tus datos actualizados y objetivos alineados con tus coaches.",
    },
    {
      icon: BarChart3,
      title: "Seguimiento de Progreso",
      description: "Visualiza tu evolución con métricas detalladas y análisis de rendimiento.",
    },
  ];

  return (
    <section
      id="top"
      className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black px-4 py-16 shadow-2xl sm:px-6 sm:py-20 lg:px-10 lg:py-24"
    >
      {/* Subtle background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-transparent to-red-500/3" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.04),transparent_60%)]" />
      
      <div className="relative mx-auto max-w-7xl">
        {/* Top Section - Hero Content */}
        <div className="text-center space-y-6 sm:space-y-8 lg:space-y-10 mb-12 sm:mb-16 lg:mb-20">
          {/* Badge */}
          <div className="flex justify-center">
            <Badge className="bg-red-500/20 border border-red-500/30 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/20 text-xs sm:text-sm px-4 sm:px-5 py-2">
              CrossFit | Fuerza | Motor
            </Badge>
          </div>

          {/* Main Heading */}
          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight font-[family-name:var(--font-orbitron)] text-white break-words">
              Entrena como un
              <br />
              <span className="bg-gradient-to-r from-red-500 via-red-400 to-red-500 bg-clip-text text-transparent">
                Guerrero
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-zinc-300 leading-relaxed max-w-3xl mx-auto font-medium break-words px-4">
              La plataforma que transforma tu entrenamiento. Reserva clases, rastrea PRs y alcanza tus objetivos con programación de élite y seguimiento en tiempo real.
            </p>
          </div>

        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/3 to-transparent p-6 sm:p-7 lg:p-8 hover:border-red-500/40 hover:bg-gradient-to-br hover:from-red-500/10 hover:via-red-500/5 hover:to-transparent transition-all duration-300 active:scale-[0.98] cursor-pointer overflow-hidden flex flex-col"
              >
                {/* Hover effect background */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-transparent transition-all duration-300" />
                
                <div className="relative flex flex-col items-center text-center gap-4">
                  {/* Icon */}
                  <div className="flex size-14 sm:size-16 items-center justify-center rounded-xl bg-red-500/20 text-red-400 group-hover:bg-red-500/30 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-red-500/20 flex-shrink-0">
                    <Icon className="size-7 sm:size-8 flex-shrink-0" />
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-2 flex-1 min-w-0 w-full">
                    <h3 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-orbitron)] text-white group-hover:text-red-400 transition-colors break-words">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors break-words">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
