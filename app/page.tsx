import Hero from "@/components/hero";
import { Logo } from "@/components/logo";
import Navbar from "@/components/navbar";
import Pricing from "@/components/pricing";
import Testimonials from "@/components/testimonials";
import WorkoutHighlights from "@/components/workout-highlights";
import Location from "@/components/location";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white flex flex-col">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col gap-12 sm:gap-16 lg:gap-20 px-4 pb-20 pt-8 sm:pt-12 sm:px-6 lg:px-8 flex-1">
        <Hero />
        <WorkoutHighlights />
        <Testimonials />
        <Pricing />
        <Location />
      </main>
      <Footer />
    </div>
  );
}
