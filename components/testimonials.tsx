import { Badge } from "@/components/ui/badge";

export default function Testimonials() {
  return (
    <section id="coaches" className="space-y-4">
      <Badge className="bg-white/10 text-white">Comunidad</Badge>
      <h2 className="text-3xl font-semibold tracking-tight">Una comunidad que te impulsa.</h2>
      <p className="text-lg text-zinc-300">
        Kraken se construye sobre compañeros responsables, coaches expertos que observan cada repetición y una
        cultura que celebra el progreso desde tu primer pull-up hasta el día de competencia. Espera feedback
        sobre tus levantamientos, planes de ritmo para cada MetCon y compañeros que llegan temprano para animar
        al último en terminar.
      </p>
    </section>
  );
}
