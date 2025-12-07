"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Activity, Dumbbell, TrendingUp, Heart, Zap, Target } from "lucide-react";
import { useEffect, useState } from "react";

export default function PhysicalChanges() {
  const [animatedValues, setAnimatedValues] = useState({
    grasa: 0,
    musculo: 0,
    fuerza: 0,
    cardio: 0,
    flexibilidad: 0,
    resistencia: 0,
  });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Datos basados en estudios reales de CrossFit (primeros 3-6 meses)
  const physicalChanges = [
    { 
      name: "Reducción de grasa corporal", 
      before: 25, 
      after: 20, 
      unit: "%",
      improvement: 20,
      color: "from-red-500 to-red-600",
      description: "Promedio en 3-6 meses",
      icon: Target,
    },
    { 
      name: "Aumento de masa muscular", 
      before: 0, 
      after: 3, 
      unit: "kg",
      improvement: 100,
      color: "from-red-500/90 to-red-600/90",
      description: "Ganancia típica",
      icon: Dumbbell,
    },
    { 
      name: "Aumento de fuerza máxima", 
      before: 0, 
      after: 25, 
      unit: "%",
      improvement: 100,
      color: "from-red-500/80 to-red-600/80",
      description: "Mejora promedio",
      icon: TrendingUp,
    },
    { 
      name: "Capacidad cardiovascular", 
      before: 0, 
      after: 15, 
      unit: "%",
      improvement: 100,
      color: "from-red-500/85 to-red-600/85",
      description: "Mejora en VO2 max",
      icon: Heart,
    },
    { 
      name: "Flexibilidad y movilidad", 
      before: 0, 
      after: 22, 
      unit: "%",
      improvement: 100,
      color: "from-red-500/75 to-red-600/75",
      description: "Rango de movimiento",
      icon: Activity,
    },
    { 
      name: "Resistencia muscular", 
      before: 0, 
      after: 30, 
      unit: "%",
      improvement: 100,
      color: "from-red-500/70 to-red-600/70",
      description: "Capacidad de trabajo",
      icon: Zap,
    },
  ];

  useEffect(() => {
    const animateBars = () => {
      physicalChanges.forEach((change, index) => {
        setTimeout(() => {
          let current = 0;
          const interval = setInterval(() => {
            current += 1;
            const maxValue = change.after;
            if (current >= maxValue) {
              current = maxValue;
              clearInterval(interval);
            }
            const key = change.name.toLowerCase().includes("grasa") ? "grasa" :
                       change.name.toLowerCase().includes("muscular") ? "musculo" :
                       change.name.toLowerCase().includes("fuerza") ? "fuerza" :
                       change.name.toLowerCase().includes("cardiovascular") ? "cardio" :
                       change.name.toLowerCase().includes("flexibilidad") ? "flexibilidad" : "resistencia";
            setAnimatedValues((prev) => ({
              ...prev,
              [key]: current,
            }));
          }, 30);
        }, index * 200);
      });
    };

    const timer = setTimeout(animateBars, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="physical-changes" className="relative overflow-hidden rounded-3xl border border-black/50 bg-black px-4 py-16 shadow-2xl sm:px-6 sm:py-20 lg:px-10 lg:py-24 space-y-8 sm:space-y-10">
      {/* Minimalist black background */}
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.03),transparent_80%)]" />
      
      {/* Subtle geometric lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      
      <div className="relative space-y-6 sm:space-y-8">
        <div className="space-y-4">
          <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs sm:text-sm px-4 sm:px-5 py-1.5">
            Resultados
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter font-[family-name:var(--font-orbitron)] text-white break-words">
            CAMBIOS FÍSICOS
            <br />
            <span className="text-red-500">REALES</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-zinc-500 leading-relaxed font-light break-words">
            Basado en estudios científicos. Resultados medibles en los primeros 3-6 meses de entrenamiento constante.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {physicalChanges.map((change, index) => {
            const key = change.name.toLowerCase().includes("grasa") ? "grasa" :
                       change.name.toLowerCase().includes("muscular") ? "musculo" :
                       change.name.toLowerCase().includes("fuerza") ? "fuerza" :
                       change.name.toLowerCase().includes("cardiovascular") ? "cardio" :
                       change.name.toLowerCase().includes("flexibilidad") ? "flexibilidad" : "resistencia";
            const currentValue = animatedValues[key] || 0;
            
            const maxValue = change.name.includes("grasa") ? 30 : 
                            change.name.includes("muscular") ? 5 :
                            change.name.includes("fuerza") ? 30 : 
                            change.name.includes("cardiovascular") ? 20 :
                            change.name.includes("flexibilidad") ? 30 : 35;
            const percentage = (currentValue / maxValue) * 100;
            const isHovered = hoveredIndex === index;
            const Icon = change.icon;
            
            return (
              <Card
                key={change.name}
                className="group/item border border-red-500/50 bg-black/30 p-5 sm:p-6 lg:p-7 transition-all duration-500 hover:border-red-500/70 hover:bg-black/50 overflow-hidden relative cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover/item:from-red-500/5 group-hover/item:to-transparent transition-all duration-500" />
                
                <div className="relative space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex size-10 sm:size-12 items-center justify-center rounded-lg bg-black border border-red-500/20 text-red-500/70 flex-shrink-0 transition-all duration-300 ${isHovered ? 'scale-110 border-red-500/50 text-red-500' : ''}`}>
                      <Icon className="size-5 sm:size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`text-sm sm:text-base font-bold text-white font-[family-name:var(--font-orbitron)] mb-1 break-words transition-colors duration-300 ${isHovered ? 'text-red-500' : ''}`}>
                        {change.name}
                      </h3>
                      <p className="text-xs text-zinc-500 group-hover/item:text-zinc-400 transition-colors duration-300">
                        {change.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      {change.before > 0 && (
                        <span className="text-xs text-zinc-500 line-through">
                          {change.before}{change.unit}
                        </span>
                      )}
                      <span className={`text-xl sm:text-2xl font-black text-red-500 font-[family-name:var(--font-orbitron)] transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
                        {currentValue > 0 ? `${currentValue}${change.unit}` : `+${change.after}${change.unit}`}
                      </span>
                    </div>
                    
                    <div className="relative h-3 sm:h-4 rounded-full bg-black/50 border border-red-500/20 overflow-hidden group-hover/item:border-red-500/40 transition-all duration-300">
                      <div
                        className={`absolute left-0 top-0 h-full bg-gradient-to-r ${change.color} rounded-full transition-all duration-500 ease-out shadow-lg shadow-red-500/30 ${isHovered ? 'shadow-red-500/50' : ''}`}
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          transitionDelay: `${index * 100}ms`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        {isHovered && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/30 to-white/10 animate-pulse" />
                        )}
                      </div>
                      {isHovered && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-black text-red-500 font-[family-name:var(--font-orbitron)] animate-fade-in">
                          {Math.round(percentage)}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="pt-6 border-t border-black/50">
          <div className="p-5 sm:p-6 rounded-xl border border-red-500/30 bg-black/30 group/quote hover:border-red-500/50 hover:bg-black/50 transition-all duration-300">
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed italic text-center font-light">
              "Aquí no solo entrenas tu cuerpo, transformas tu alma. Cada gota de sudor es una promesa a ti mismo. Cada repetición, un paso más cerca de quien siempre supiste que podías ser."
            </p>
            <p className="text-xs text-zinc-600 text-center mt-3 font-[family-name:var(--font-orbitron)]">
              — Filosofía Kraken Elite Fitness
            </p>
          </div>
        </div>

        <div className="pt-4">
          <p className="text-xs sm:text-sm text-zinc-500 italic leading-relaxed text-center">
            *Datos basados en estudios de Journal of Strength and Conditioning Research
          </p>
        </div>
      </div>
    </section>
  );
}
