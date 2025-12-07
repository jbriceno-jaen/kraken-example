import { Badge } from "@/components/ui/badge";

export default function Testimonials() {
  return (
    <section id="coaches" className="relative space-y-6 rounded-3xl border border-black/50 bg-black px-6 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24 shadow-2xl overflow-hidden">
      {/* Minimalist black background */}
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.03),transparent_80%)]" />
      
      {/* Subtle geometric lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      
      <div className="relative space-y-6 sm:space-y-8">
        <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs sm:text-sm px-4 sm:px-5 py-1.5">
          Comunidad
        </Badge>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter font-[family-name:var(--font-orbitron)] text-white leading-tight break-words">
          UNA COMUNIDAD
          <br />
          <span className="text-red-500">QUE TE IMPULSA</span>
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-zinc-500 leading-relaxed max-w-3xl font-light break-words">
          Kraken se construye sobre compañeros responsables, coaches expertos que observan cada repetición y una
          cultura que celebra el progreso desde tu primer pull-up hasta el día de competencia. Espera feedback
          sobre tus levantamientos, planes de ritmo para cada MetCon y compañeros que llegan temprano para animar
          al último en terminar.
        </p>
        <div className="flex flex-wrap gap-2 sm:gap-3 pt-4">
          <div className="rounded-full bg-black border border-red-500/20 px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-500/70 font-[family-name:var(--font-orbitron)] break-words hover:border-red-500/40 hover:text-red-500 transition-all duration-300">
            Apoyo constante
          </div>
          <div className="rounded-full bg-black border border-red-500/20 px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-500/70 font-[family-name:var(--font-orbitron)] break-words hover:border-red-500/40 hover:text-red-500 transition-all duration-300">
            Coaching experto
          </div>
          <div className="rounded-full bg-black border border-red-500/20 px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-500/70 font-[family-name:var(--font-orbitron)] break-words hover:border-red-500/40 hover:text-red-500 transition-all duration-300">
            Cultura de progreso
          </div>
        </div>
      </div>
    </section>
  );
}
