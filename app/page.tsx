import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import Pricing from "@/components/pricing";
import Testimonials from "@/components/testimonials";
import WorkoutHighlights from "@/components/workout-highlights";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <Hero />
        <WorkoutHighlights />
        <Testimonials />
        <Pricing />
      </main>
      <footer className="border-t border-white/10 bg-black/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-white">
            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase tracking-tight">
              Kraken
            </span>
            <span className="font-semibold">Elite Fitness</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <a className="hover:text-white" href="/privacy">
              Privacidad
            </a>
            <a className="hover:text-white" href="/terms">
              Términos
            </a>
            <a className="hover:text-white" href="/contact">
              Contacto
            </a>
          </div>
          <p className="text-xs text-zinc-500">
            Creado para atletas que quieren moverse mejor, levantar más y llegar más lejos.
          </p>
        </div>
      </footer>
    </div>
  );
}
