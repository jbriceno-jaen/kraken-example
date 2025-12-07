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
    title: "Movilidad",
    description: "Posiciones, activaciones y enfriamientos para mantenerte durable.",
    intensities: ["Recuperación", "Preparación"],
    tone: "from-emerald-500/30 to-lime-400/20",
  },
];

export default function WorkoutHighlights() {
  return (
    <section id="workouts" className="relative overflow-hidden rounded-3xl border border-black/50 bg-black px-4 py-16 shadow-2xl sm:px-6 sm:py-20 lg:px-10 lg:py-24 space-y-8 sm:space-y-10">
      {/* Minimalist black background */}
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.03),transparent_80%)]" />
      
      {/* Subtle geometric lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      
      <div className="relative space-y-6 sm:space-y-8">
        <div className="space-y-4">
          <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs sm:text-sm px-4 sm:px-5 py-1.5">
            Programación
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter font-[family-name:var(--font-orbitron)] text-white break-words">
            ENTRENAMIENTOS
            <br />
            <span className="text-red-500">PARA PROGRESAR</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-zinc-500 leading-relaxed max-w-3xl font-light break-words">
            Mezclamos fuerza, acondicionamiento y habilidad para que te muevas mejor, levantes más y dures más.
          </p>
        </div>
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <Card
              key={item.title}
              className={cn(
                "group relative h-full border border-red-500/50 bg-black/30 overflow-hidden transition-all duration-500",
                "p-6 sm:p-7 lg:p-8",
                "hover:border-red-500/70 hover:bg-black/50"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-transparent transition-all duration-500" />
              <div className="relative space-y-4 min-w-0 w-full">
                <h3 className={`font-bold text-white font-[family-name:var(--font-orbitron)] break-words group-hover:text-red-500 transition-colors duration-300 ${item.title.length > 15 ? 'text-lg sm:text-xl lg:text-2xl leading-tight' : 'text-xl sm:text-2xl'}`}>
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed break-words group-hover:text-zinc-400 transition-colors duration-300">{item.description}</p>
              </div>
              <div className="relative mt-4 sm:mt-6 flex flex-wrap gap-2">
                {item.intensities.map((tag) => (
                  <Badge 
                    key={tag} 
                    className="bg-black border border-red-500/20 text-red-500/70 font-[family-name:var(--font-orbitron)] text-xs sm:text-sm group-hover:border-red-500/40 group-hover:text-red-500 transition-all duration-300"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
