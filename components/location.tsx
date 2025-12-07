import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import Link from "next/link";

export default function Location() {
  return (
    <section id="location" className="relative overflow-hidden rounded-3xl border border-black/50 bg-black px-4 py-16 shadow-2xl sm:px-6 sm:py-20 lg:px-10 lg:py-24 space-y-8 sm:space-y-10">
      {/* Minimalist black background */}
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.03),transparent_80%)]" />
      
      {/* Subtle geometric lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      
      <div className="relative space-y-6 sm:space-y-8">
        <div className="space-y-4">
          <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs sm:text-sm px-4 sm:px-5 py-1.5">
            Ubicación
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter font-[family-name:var(--font-orbitron)] text-white break-words">
            ENCUÉNTRANOS
            <br />
            <span className="text-red-500">EN AGUAS ZARCAS</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-zinc-500 leading-relaxed font-light break-words">
            Visítanos en nuestro box de CrossFit en el corazón de Aguas Zarcas, Costa Rica.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="group border border-red-500/50 bg-black/30 p-6 sm:p-8 lg:p-10 transition-all duration-500 hover:border-red-500/70 hover:bg-black/50 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-transparent transition-all duration-500" />
            <div className="relative flex items-start gap-4 mb-6">
              <div className="flex size-12 sm:size-14 items-center justify-center rounded-lg bg-black border border-red-500/20 text-red-500/70 flex-shrink-0 group-hover:border-red-500/40 group-hover:text-red-500 transition-all duration-500">
                <MapPin className="size-6 sm:size-7" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-orbitron)] mb-2 break-words group-hover:text-red-500 transition-colors duration-300">
                  Dirección
                </h3>
                <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-medium break-words group-hover:text-zinc-400 transition-colors duration-300">
                  Aguas Zarcas
                </p>
                <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-medium break-words group-hover:text-zinc-400 transition-colors duration-300">
                  Costa Rica
                </p>
              </div>
            </div>
            <div className="relative rounded-xl border border-black/50 bg-black/50 p-4 sm:p-5 lg:p-6">
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed break-words group-hover:text-zinc-400 transition-colors duration-300">
                Nuestro box está ubicado en Aguas Zarcas, un lugar perfecto para entrenar rodeado de naturaleza y con el ambiente ideal para alcanzar tus objetivos de fitness.
              </p>
            </div>
          </Card>
          <Card className="group border border-red-500/50 bg-black/30 p-6 sm:p-8 lg:p-10 transition-all duration-500 hover:border-red-500/70 hover:bg-black/50 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-transparent transition-all duration-500" />
            <div className="relative space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex size-12 sm:size-14 items-center justify-center rounded-lg bg-black border border-red-500/20 text-red-500/70 flex-shrink-0 group-hover:border-red-500/40 group-hover:text-red-500 transition-all duration-500">
                  <Clock className="size-6 sm:size-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-2xl font-bold text-white font-[family-name:var(--font-orbitron)] mb-2 break-words group-hover:text-red-500 transition-colors duration-300">
                    Horarios
                  </h3>
                  <div className="space-y-2 text-zinc-600">
                    <p className="text-base sm:text-lg font-medium break-words group-hover:text-zinc-400 transition-colors duration-300">Lunes - Sábado</p>
                    <p className="text-sm sm:text-base break-words group-hover:text-zinc-400 transition-colors duration-300">5:00 AM - 8:00 PM</p>
                    <p className="text-base sm:text-lg font-medium mt-4 break-words group-hover:text-zinc-400 transition-colors duration-300">Domingo</p>
                    <p className="text-sm sm:text-base text-zinc-600 break-words">Cerrado</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-black/50 space-y-4">
                <div className="flex items-center gap-3 group/contact">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-black border border-red-500/20 text-red-500/70 group-hover/contact:border-red-500/40 group-hover/contact:text-red-500 transition-all duration-300">
                    <Phone className="size-5" />
                  </div>
                  <a
                    href="tel:+50600000000"
                    className="text-base sm:text-lg text-zinc-600 hover:text-white transition-colors font-medium break-words min-w-0 group-hover/contact:text-red-500"
                  >
                    +506 0000-0000
                  </a>
                </div>
                <div className="flex items-center gap-3 group/contact min-w-0">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-black border border-red-500/20 text-red-500/70 group-hover/contact:border-red-500/40 group-hover/contact:text-red-500 transition-all duration-300 flex-shrink-0">
                    <Mail className="size-5" />
                  </div>
                  <Link
                    href="/contact"
                    className="text-base sm:text-lg text-zinc-600 hover:text-white transition-colors font-medium break-words min-w-0 group-hover/contact:text-red-500"
                  >
                    Contáctanos
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

