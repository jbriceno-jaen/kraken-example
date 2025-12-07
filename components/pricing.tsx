import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Plan = {
  name: string;
  price: string;
  cadence: string;
  perks: string[];
  highlighted?: boolean;
};

const plans: Plan[] = [
  {
    name: "Básico",
    price: "₡3000",
    cadence: "Clase suelta / Casual",
    perks: ["1 clase", "Open gym el mismo día", "Calentamiento guiado por coach"],
  },
  {
    name: "Estándar",
    price: "₡15000",
    cadence: "3x / semana",
    perks: ["12 clases / mes", "Acceso a open gym", "Seguimiento de progreso + benchmarks"],
  },
  {
    name: "Ilimitado",
    price: "₡30000",
    cadence: "Clases ilimitadas",
    perks: ["Clases ilimitadas", "Todos los programas especiales", "Prioridad en lista de espera + prep de comps"],
    highlighted: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden rounded-3xl border border-black/50 bg-black px-4 py-12 shadow-2xl sm:px-6 sm:py-16 lg:px-10 lg:py-20 space-y-6 sm:space-y-8">
      {/* Minimalist black background */}
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.03),transparent_80%)]" />
      
      {/* Subtle geometric lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      
      <div className="relative space-y-5 sm:space-y-6">
        <div className="space-y-3">
          <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs sm:text-sm px-4 sm:px-5 py-1.5">
            Membresías
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter font-[family-name:var(--font-orbitron)] text-white break-words">
            ELIGE EL PLAN
            <br />
            <span className="text-red-500">QUE VA CON TU RITMO</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-zinc-500 leading-relaxed font-light break-words">
            Precios claros. Sin cargos ocultos. Pausa o cambia cuando quieras.
          </p>
        </div>
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "group relative flex h-full flex-col border bg-black/30 transition-all duration-500 overflow-hidden",
                "p-5 sm:p-6 lg:p-7",
                plan.highlighted ? "border-red-500/60" : "border-red-500/50",
                "hover:border-red-500/70 hover:bg-black/50"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-transparent transition-all duration-500" />
              <div className="relative flex items-center justify-between gap-3 min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-xl font-bold font-[family-name:var(--font-orbitron)] text-white break-words group-hover:text-red-500 transition-colors duration-300">
                    {plan.name}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1 break-words group-hover:text-zinc-400 transition-colors duration-300">{plan.cadence}</p>
                </div>
                {plan.highlighted && (
                  <Badge className="bg-black border border-red-500/40 text-red-500 font-[family-name:var(--font-orbitron)] flex-shrink-0 text-xs">
                    Recomendado
                  </Badge>
                )}
              </div>
              <div className="relative overflow-hidden mt-3">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold font-[family-name:var(--font-orbitron)] text-white break-words group-hover:text-red-500 transition-colors duration-300">
                  {plan.price}
                </p>
                <span className="text-xs sm:text-sm font-medium text-zinc-600 ml-2 group-hover:text-zinc-400 transition-colors duration-300">/mes</span>
              </div>
              <div className="space-y-2 mt-3">
                {plan.perks.map((perk) => (
                  <div key={perk} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-600 group-hover:text-zinc-400 transition-colors duration-300 min-w-0">
                    <div className="mt-1.5 size-2 rounded-full flex-shrink-0 bg-red-500/50 group-hover:bg-red-500 transition-colors duration-300" />
                    <span className="leading-relaxed break-words flex-1 min-w-0">{perk}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
