"use client";

import { Calendar, UserCheck, Trophy, BarChart3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export default function Hero() {
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
      className="relative overflow-hidden rounded-3xl border border-black/50 bg-black px-4 py-20 shadow-2xl sm:px-6 sm:py-24 lg:px-10 lg:py-32"
    >
      {/* Minimalist black background with subtle red accents */}
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.03),transparent_80%)]" />
      
      {/* Subtle geometric lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      
      {/* Minimal red accent dots */}
      <div className="absolute top-20 right-20 w-1 h-1 bg-red-500 rounded-full opacity-40" />
      <div className="absolute bottom-32 left-16 w-1 h-1 bg-red-500 rounded-full opacity-40" />
      
      <div className="relative mx-auto max-w-7xl">
        {/* Top Section - Hero Content */}
        <div className="text-center space-y-8 sm:space-y-10 lg:space-y-12 mb-16 sm:mb-20 lg:mb-24">
          {/* Minimalist Badge */}
          <div className="flex justify-center animate-fade-in">
            <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs sm:text-sm px-4 sm:px-5 py-1.5 hover:border-red-500/50 transition-all duration-300">
              CrossFit | Fuerza | Motor
            </Badge>
          </div>

          {/* Main Heading - Ultra Minimalist */}
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black leading-[0.95] tracking-tighter font-[family-name:var(--font-orbitron)] text-white break-words animate-fade-in-up">
              ENTRENA
              <br />
              <span className="text-red-500">COMO UN</span>
              <br />
              <span className="text-white">GUERRERO</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-zinc-500 leading-relaxed max-w-3xl mx-auto font-light break-words px-4 animate-fade-in-up delay-200">
              La plataforma que transforma tu entrenamiento. Reserva clases, rastrea PRs y alcanza tus objetivos con programación de élite y seguimiento en tiempo real.
            </p>
          </div>
        </div>

        {/* Minimalist Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative rounded-xl border border-red-500/50 bg-black/30 p-6 sm:p-7 lg:p-8 hover:border-red-500/70 hover:bg-black/50 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Subtle hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-transparent transition-all duration-500" />
                
                <div className="relative flex flex-col items-center text-center gap-5 z-10">
                  {/* Minimalist Icon */}
                  <div className="relative flex size-14 sm:size-16 lg:size-20 items-center justify-center rounded-lg bg-black border border-red-500/20 text-red-500/70 group-hover:border-red-500/40 group-hover:text-red-500 group-hover:scale-105 transition-all duration-500 flex-shrink-0">
                    <Icon className="size-7 sm:size-8 lg:size-10 flex-shrink-0" />
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-2 flex-1 min-w-0 w-full">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold font-[family-name:var(--font-orbitron)] text-white group-hover:text-red-500 transition-colors duration-300 break-words">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm lg:text-base text-zinc-600 leading-relaxed group-hover:text-zinc-400 transition-colors duration-300 break-words">
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
