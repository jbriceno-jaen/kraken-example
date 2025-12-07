import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import Link from "next/link";

export default function Location() {
  return (
    <section id="location" className="space-y-6">
      <div className="space-y-3">
        <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/30">
          Ubicación
        </Badge>
        <h2 className="text-3xl font-semibold tracking-tight font-[family-name:var(--font-orbitron)]">
          Encuéntranos en Aguas Zarcas
        </h2>
        <p className="text-lg text-zinc-300">
          Visítanos en nuestro box de CrossFit en el corazón de Aguas Zarcas, Costa Rica.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="group border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black p-6 sm:p-8 lg:p-10 shadow-2xl transition-all duration-500 sm:hover:border-red-500/40 sm:hover:shadow-red-500/20 sm:hover:scale-[1.02] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-start gap-4 mb-6">
            <div className="flex size-12 sm:size-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/25 via-red-600/20 to-red-500/25 text-red-400 flex-shrink-0 group-hover:from-red-500/35 group-hover:via-red-600/30 group-hover:to-red-500/35 group-hover:shadow-xl group-hover:shadow-red-500/40 transition-all duration-300 shadow-lg shadow-red-500/25">
              <MapPin className="size-6 sm:size-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-orbitron)] mb-2 break-words">
                Dirección
              </h3>
              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-medium break-words">
                Aguas Zarcas
              </p>
              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-medium break-words">
                Costa Rica
              </p>
            </div>
          </div>
          <div className="relative rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent p-4 sm:p-5 lg:p-6 overflow-hidden">
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed break-words">
              Nuestro box está ubicado en Aguas Zarcas, un lugar perfecto para entrenar rodeado de naturaleza y con el ambiente ideal para alcanzar tus objetivos de fitness.
            </p>
          </div>
        </Card>
        <Card className="group border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black p-6 sm:p-8 lg:p-10 shadow-2xl transition-all duration-500 sm:hover:border-red-500/40 sm:hover:shadow-red-500/20 sm:hover:scale-[1.02] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex size-12 sm:size-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/25 via-red-600/20 to-red-500/25 text-red-400 flex-shrink-0 group-hover:from-red-500/35 group-hover:via-red-600/30 group-hover:to-red-500/35 group-hover:shadow-xl group-hover:shadow-red-500/40 transition-all duration-300 shadow-lg shadow-red-500/25">
                <Clock className="size-6 sm:size-7" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-2xl font-bold text-white font-[family-name:var(--font-orbitron)] mb-2 break-words">
                  Horarios
                </h3>
                <div className="space-y-2 text-zinc-300">
                  <p className="text-base sm:text-lg font-medium break-words">Lunes - Sábado</p>
                  <p className="text-sm sm:text-base break-words">5:00 AM - 8:00 PM</p>
                  <p className="text-base sm:text-lg font-medium mt-4 break-words">Domingo</p>
                  <p className="text-sm sm:text-base text-zinc-500 break-words">Cerrado</p>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex items-center gap-3 group/contact">
                <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10 group-hover/contact:bg-red-500/20 transition-colors">
                  <Phone className="size-5 text-red-400" />
                </div>
                <a
                  href="tel:+50600000000"
                  className="text-base sm:text-lg text-zinc-300 hover:text-white transition-colors font-medium break-words min-w-0"
                >
                  +506 0000-0000
                </a>
              </div>
              <div className="flex items-center gap-3 group/contact min-w-0">
                <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10 group-hover/contact:bg-red-500/20 transition-colors flex-shrink-0">
                  <Mail className="size-5 text-red-400" />
                </div>
                <Link
                  href="/contact"
                  className="text-base sm:text-lg text-zinc-300 hover:text-white transition-colors font-medium break-words min-w-0"
                >
                  Contáctanos
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

