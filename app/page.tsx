import Hero from "@/components/hero";
import { Logo } from "@/components/logo";
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
        <div className="mx-auto max-w-6xl px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:gap-8 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 mb-4 sm:mb-8">
            <div className="space-y-2 sm:space-y-4 min-w-0 col-span-2 sm:col-span-1">
              <div className="flex flex-col gap-0.5">
                <span className="font-black uppercase tracking-tight font-[family-name:var(--font-orbitron)] text-base sm:text-lg lg:text-xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  KRAKEN
                </span>
                <span className="font-bold uppercase font-[family-name:var(--font-orbitron)] text-xs sm:text-sm lg:text-base bg-gradient-to-r from-red-500 via-red-600 to-red-500 bg-clip-text text-transparent">
                  ELITE FITNESS
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed break-words">
                Creado para atletas que quieren moverse mejor, levantar más y llegar más lejos.
              </p>
            </div>
            <div className="space-y-2 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">Enlaces</h3>
              <nav className="flex flex-col gap-0.5 sm:gap-1.5">
                <a href="/privacy" className="text-xs sm:text-sm text-zinc-400 hover:text-white active:text-white transition-colors min-h-[28px] sm:min-h-0 flex items-center">
                  Privacidad
                </a>
                <a href="/terms" className="text-xs sm:text-sm text-zinc-400 hover:text-white active:text-white transition-colors min-h-[28px] sm:min-h-0 flex items-center">
                  Términos
                </a>
                <a href="/contact" className="text-xs sm:text-sm text-zinc-400 hover:text-white active:text-white transition-colors min-h-[28px] sm:min-h-0 flex items-center">
                  Contacto
                </a>
              </nav>
            </div>
            <div className="space-y-2 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">Ubicación</h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-zinc-400">
                <p className="leading-relaxed">Aguas Zarcas</p>
                <p className="leading-relaxed">Costa Rica</p>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">Horarios</h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-zinc-400">
                <p>Lunes - Sábado</p>
                <p>5:00 AM - 8:00 PM</p>
                <p className="text-zinc-500">Domingo: Cerrado</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-4 sm:pt-8 text-center">
            <p className="text-xs sm:text-sm text-zinc-500 font-[family-name:var(--font-orbitron)]">
              &copy; {new Date().getFullYear()} <span className="font-black uppercase tracking-tight text-white">KRAKEN</span> <span className="bg-gradient-to-r from-red-500 via-red-600 to-red-500 bg-clip-text text-transparent font-bold uppercase">ELITE FITNESS</span>. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
