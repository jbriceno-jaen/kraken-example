import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
        <Badge className="bg-white/10 text-white">Membresías</Badge>
        <h2 className="text-3xl font-semibold tracking-tight">Elige el plan que va con tu ritmo.</h2>
        <p className="text-lg text-zinc-300">Precios claros. Sin cargos ocultos. Pausa o cambia cuando quieras.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`flex h-full flex-col gap-4 border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/10 ${
              plan.highlighted ? "ring-2 ring-red-500/60 hover:ring-red-500/80" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-white">{plan.name}</p>
                <p className="text-sm text-zinc-300">{plan.cadence}</p>
              </div>
              {plan.highlighted && <Badge className="bg-red-500 text-white">Recomendado</Badge>}
            </div>
            <p className="text-4xl font-semibold text-white">
              {plan.price} <span className="text-base font-medium text-zinc-400">/mes</span>
            </p>
            <div className="space-y-2">
              {plan.perks.map((perk) => (
                <div key={perk} className="flex items-center gap-2 text-sm text-zinc-200">
                  <span className="size-2 rounded-full bg-red-400" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
