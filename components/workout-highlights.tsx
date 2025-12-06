import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Highlight = {
  title: string;
  description: string;
  intensities: string[];
  tone: string;
};

const highlights: Highlight[] = [
  {
    title: "Fuerza",
    description: "Ciclos pesados de barra, trabajo posicional y sobrecarga progresiva.",
    intensities: ["Pesado", "Técnica"],
    tone: "from-red-500/30 to-rose-500/20",
  },
  {
    title: "MetCon",
    description: "Motores rápidos con modalidades mixtas y objetivos de ritmo inteligentes.",
    intensities: ["Motor", "Umbral"],
    tone: "from-orange-500/30 to-amber-400/20",
  },
  {
    title: "Gimnasia",
    description: "Progresiones de tirón y empuje con bases estrictas.",
    intensities: ["Habilidad", "Estricto"],
    tone: "from-blue-500/30 to-cyan-400/20",
  },
  {
    title: "Movilidad y Recuperación",
    description: "Posiciones, activaciones y enfriamientos para mantenerte durable.",
    intensities: ["Recuperación", "Preparación"],
    tone: "from-emerald-500/30 to-lime-400/20",
  },
];

export default function WorkoutHighlights() {
  return (
    <section id="workouts" className="space-y-6">
      <div className="space-y-3">
        <Badge className="bg-white/10 text-white font-[family-name:var(--font-orbitron)]">Programación</Badge>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight font-[family-name:var(--font-orbitron)]">Entrenamientos hechos para progresar.</h2>
        <p className="text-base sm:text-lg text-zinc-300">
          Mezclamos fuerza, acondicionamiento y habilidad para que te muevas mejor, levantes más y dures más.
        </p>
      </div>
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((item) => (
          <Card
            key={item.title}
            className={cn(
              "group relative h-full border overflow-hidden bg-gradient-to-br backdrop-blur-sm transition-all duration-500",
              item.tone,
              "p-6 sm:p-7 lg:p-8", // More padding for better spacing
              "min-h-[200px] sm:min-h-[220px]", // Consistent height
              "active:scale-[0.98]", // Active feedback on mobile
              "sm:hover:scale-[1.05] sm:hover:border-white/30 sm:hover:shadow-2xl sm:hover:shadow-red-500/20"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative space-y-4 min-w-0">
              <h3 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-orbitron)] drop-shadow-lg break-words">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed break-words">{item.description}</p>
            </div>
            <div className="relative mt-4 sm:mt-6 flex flex-wrap gap-2">
              {item.intensities.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="bg-white/20 backdrop-blur-sm border border-white/30 text-white font-[family-name:var(--font-orbitron)] font-semibold shadow-lg group-hover:bg-white/30 transition-colors text-xs sm:text-sm"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
