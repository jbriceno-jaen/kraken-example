import { Badge } from "@/components/ui/badge";

export default function Testimonials() {
  return (
    <section id="coaches" className="relative space-y-6 rounded-3xl border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black p-6 sm:p-8 lg:p-12 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent rounded-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(239,68,68,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(239,68,68,0.05),transparent_50%)]" />
      <div className="relative space-y-5 sm:space-y-6">
        <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/30">
          Comunidad
        </Badge>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-red-50 to-zinc-300 bg-clip-text text-transparent leading-tight break-words">
          Una comunidad que te impulsa.
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-zinc-300 leading-relaxed max-w-3xl break-words">
          Kraken se construye sobre compañeros responsables, coaches expertos que observan cada repetición y una
          cultura que celebra el progreso desde tu primer pull-up hasta el día de competencia. Espera feedback
          sobre tus levantamientos, planes de ritmo para cada MetCon y compañeros que llegan temprano para animar
          al último en terminar.
        </p>
        <div className="flex flex-wrap gap-2 sm:gap-3 pt-4">
          <div className="rounded-full bg-gradient-to-r from-red-500/15 via-red-600/12 to-red-500/15 border border-red-500/30 px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-300 font-[family-name:var(--font-orbitron)] break-words shadow-md shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300">
            Apoyo constante
          </div>
          <div className="rounded-full bg-gradient-to-r from-red-500/15 via-red-600/12 to-red-500/15 border border-red-500/30 px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-300 font-[family-name:var(--font-orbitron)] break-words shadow-md shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300">
            Coaching experto
          </div>
          <div className="rounded-full bg-gradient-to-r from-red-500/15 via-red-600/12 to-red-500/15 border border-red-500/30 px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-300 font-[family-name:var(--font-orbitron)] break-words shadow-md shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300">
            Cultura de progreso
          </div>
        </div>
      </div>
    </section>
  );
}
