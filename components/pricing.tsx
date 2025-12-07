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
    <section id="pricing" className="space-y-6">
      <div className="space-y-3">
        <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/30">Membresías</Badge>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight font-[family-name:var(--font-orbitron)]">Elige el plan que va con tu ritmo.</h2>
        <p className="text-base sm:text-lg text-zinc-300">Precios claros. Sin cargos ocultos. Pausa o cambia cuando quieras.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "group relative flex h-full flex-col border transition-all duration-500 overflow-hidden",
              "gap-6 sm:gap-6",
              "p-6 sm:p-8 lg:p-10", // More padding for premium feel
              "active:scale-[0.98]", // Active feedback on mobile
              "sm:hover:scale-[1.02] sm:hover:shadow-2xl", // Subtle hover effect
              plan.highlighted
                ? "border-red-500/50 bg-gradient-to-br from-red-500/10 via-black to-black shadow-2xl shadow-red-500/30 sm:scale-105 ring-2 ring-red-500/20"
                : "border-white/10 bg-gradient-to-br from-white/5 via-black/50 to-black active:border-red-500/30 active:bg-gradient-to-br active:from-red-500/5 active:via-black/50 active:to-black sm:hover:border-red-500/30"
            )}
          >
            {plan.highlighted && (
              <>
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -top-2 -right-2 w-24 h-24 bg-red-500/20 rounded-full blur-2xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-50" />
              </>
            )}
            <div className="relative flex items-center justify-between gap-3 min-w-0">
              <div className="min-w-0 flex-1">
                <p className={`text-xl sm:text-2xl font-bold font-[family-name:var(--font-orbitron)] break-words ${
                  plan.highlighted ? "text-white" : "text-white"
                }`}>
                  {plan.name}
                </p>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 break-words">{plan.cadence}</p>
              </div>
              {plan.highlighted && (
                <Badge className="bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white border-0 shadow-lg shadow-red-500/60 font-[family-name:var(--font-orbitron)] flex-shrink-0 text-xs sm:text-sm hover:shadow-red-500/80 transition-all duration-300">
                  Recomendado
                </Badge>
              )}
            </div>
            <div className="relative overflow-hidden">
              <p className={`text-4xl sm:text-5xl font-bold font-[family-name:var(--font-orbitron)] break-words ${
                plan.highlighted ? "bg-gradient-to-br from-white via-red-50 to-zinc-300 bg-clip-text text-transparent" : "text-white"
              }`}>
                {plan.price}
              </p>
              <span className="text-sm sm:text-base font-medium text-zinc-400 ml-2">/mes</span>
            </div>
            <div className="space-y-3 mt-2">
              {plan.perks.map((perk) => (
                <div key={perk} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300 group-hover:text-zinc-200 transition-colors min-w-0">
                  <div className={`mt-1.5 size-2 rounded-full flex-shrink-0 ${
                    plan.highlighted ? "bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/60" : "bg-gradient-to-br from-red-500 to-red-600"
                  }`} />
                  <span className="leading-relaxed break-words flex-1 min-w-0">{perk}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
