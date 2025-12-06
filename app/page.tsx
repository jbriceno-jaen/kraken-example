import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import Pricing from "@/components/pricing";
import Testimonials from "@/components/testimonials";
import WorkoutHighlights from "@/components/workout-highlights";
import Location from "@/components/location";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col gap-12 sm:gap-16 lg:gap-20 px-4 pb-20 pt-8 sm:pt-12 sm:px-6 lg:px-8">
        <Hero />
        <WorkoutHighlights />
        <Testimonials />
        <Pricing />
        <Location />
      </main>
      <footer className="border-t border-red-500/20 bg-gradient-to-b from-black to-slate-950 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="space-y-4 min-w-0">
              <div className="flex items-center gap-2 text-white flex-wrap">
                <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase tracking-tight font-[family-name:var(--font-orbitron)] flex-shrink-0">
                  Kraken
                </span>
                <span className="font-semibold font-[family-name:var(--font-orbitron)] break-words">Elite Fitness</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed break-words">
                Creado para atletas que quieren moverse mejor, levantar más y llegar más lejos.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">Enlaces</h3>
              <nav className="flex flex-col gap-3">
                <a href="/privacy" className="text-sm text-zinc-400 hover:text-white active:text-white transition-colors min-h-[44px] sm:min-h-0 flex items-center">
                  Privacidad
                </a>
                <a href="/terms" className="text-sm text-zinc-400 hover:text-white active:text-white transition-colors min-h-[44px] sm:min-h-0 flex items-center">
                  Términos
                </a>
                <a href="/contact" className="text-sm text-zinc-400 hover:text-white active:text-white transition-colors min-h-[44px] sm:min-h-0 flex items-center">
                  Contacto
                </a>
              </nav>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">Ubicación</h3>
              <div className="space-y-2 text-sm text-zinc-400">
                <p className="leading-relaxed">Aguas Zarcas</p>
                <p className="leading-relaxed">Costa Rica</p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">Horarios</h3>
              <div className="space-y-2 text-sm text-zinc-400">
                <p>Lunes - Sábado</p>
                <p>5:00 AM - 8:00 PM</p>
                <p className="text-zinc-500">Domingo: Cerrado</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-xs text-zinc-500">
            <p>&copy; {new Date().getFullYear()} Kraken Elite Fitness. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
