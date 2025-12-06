import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
        <Badge className="bg-white/10 text-white">Programación</Badge>
        <h2 className="text-3xl font-semibold tracking-tight">Entrenamientos hechos para progresar.</h2>
        <p className="text-lg text-zinc-300">
          Mezclamos fuerza, acondicionamiento y habilidad para que te muevas mejor, levantes más y dures más.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((item) => (
          <Card
            key={item.title}
            className={`h-full border border-white/10 bg-gradient-to-br ${item.tone} p-4 backdrop-blur transition-all duration-300 hover:scale-[1.03] hover:border-white/20 hover:shadow-lg`}
          >
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-zinc-200">{item.description}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.intensities.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-white/10 text-white">
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
