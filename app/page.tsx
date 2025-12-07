import Hero from "@/components/hero";
import { Logo } from "@/components/logo";
import Navbar from "@/components/navbar";
import Pricing from "@/components/pricing";
import Testimonials from "@/components/testimonials";
import WorkoutHighlights from "@/components/workout-highlights";
import PhysicalChanges from "@/components/physical-changes";
import Location from "@/components/location";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white flex flex-col">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col gap-12 sm:gap-16 lg:gap-20 px-4 pb-20 pt-8 sm:pt-12 sm:px-6 lg:px-8 flex-1">
        {/* 1. Hero - Primera impresión, captura atención */}
        <Hero />
        
        {/* 2. Testimonials - Social proof temprano (genera confianza inmediatamente) */}
        <Testimonials />
        
        {/* 3. Physical Changes - Beneficios y resultados tangibles (crea deseo) */}
        <PhysicalChanges />
        
        {/* 4. Workout Highlights - Muestra el producto/servicio (qué ofreces) */}
        <WorkoutHighlights />
        
        {/* 5. Pricing - Después de mostrar valor, presenta precios (CTA principal) */}
        <Pricing />
        
        {/* 6. Location - Información de contacto al final (último paso) */}
        <Location />
      </main>
      <Footer />
    </div>
  );
}
