"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, Phone, Mail, Navigation, Map, Calendar, Globe } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Location() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [clickedCard, setClickedCard] = useState<string | null>(null);

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
            Location
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter font-[family-name:var(--font-orbitron)] text-white break-words">
            FIND US
            <br />
            <span className="text-red-500">IN AGUAS ZARCAS</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-zinc-500 leading-relaxed font-light break-words">
            Visit us at our CrossFit box in the heart of Aguas Zarcas, Costa Rica.
          </p>
        </div>
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Address Card */}
          <Card 
            className="group border border-red-500/50 bg-black/30 p-5 sm:p-6 lg:p-8 transition-all duration-500 hover:border-red-500/70 hover:bg-black/50 overflow-hidden relative cursor-pointer active:scale-[0.98]"
            onMouseEnter={() => setHoveredCard("direccion")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setClickedCard(clickedCard === "direccion" ? null : "direccion")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-transparent transition-all duration-500" />
            <div className="relative space-y-4 sm:space-y-5">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`relative flex size-12 sm:size-14 lg:size-16 items-center justify-center rounded-xl bg-black border border-red-500/20 text-red-500/70 flex-shrink-0 transition-all duration-500 ${hoveredCard === "direccion" ? 'scale-110 border-red-500/50 text-red-500 shadow-lg shadow-red-500/30' : ''} ${clickedCard === "direccion" ? 'animate-pulse' : ''}`}>
                  <MapPin className={`size-6 sm:size-7 lg:size-8 transition-all duration-300 ${hoveredCard === "direccion" ? 'scale-110' : ''}`} />
                  {hoveredCard === "direccion" && (
                    <div className="absolute inset-0 rounded-xl bg-red-500/20 animate-ping" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold text-white font-[family-name:var(--font-orbitron)] mb-2 break-words transition-colors duration-300 ${hoveredCard === "direccion" ? 'text-red-500' : ''}`}>
                    ADDRESS
                  </h3>
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-sm sm:text-base lg:text-lg text-zinc-600 leading-relaxed font-medium break-words group-hover:text-zinc-400 transition-colors duration-300">
                      Aguas Zarcas
                    </p>
                    <p className="text-sm sm:text-base lg:text-lg text-zinc-600 leading-relaxed font-medium break-words group-hover:text-zinc-400 transition-colors duration-300">
                      Costa Rica
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative rounded-xl border border-red-500/30 bg-black/50 p-3 sm:p-4 lg:p-5 group-hover:border-red-500/50 group-hover:bg-black/70 transition-all duration-300">
                <p className="text-xs sm:text-sm lg:text-base text-zinc-500 leading-relaxed break-words group-hover:text-zinc-400 transition-colors duration-300">
                  Our box is located in Aguas Zarcas, a perfect place to train surrounded by nature and with the ideal environment to achieve your fitness goals.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-500 group-hover:text-red-500 transition-colors duration-300">
                <Navigation className={`size-3 sm:size-4 transition-transform duration-300 ${hoveredCard === "direccion" ? 'translate-x-1' : ''}`} />
                <span className="break-words">Easy access from anywhere</span>
              </div>
            </div>
          </Card>

          {/* Card de Horarios */}
          <Card 
            className="group border border-red-500/50 bg-black/30 p-5 sm:p-6 lg:p-8 transition-all duration-500 hover:border-red-500/70 hover:bg-black/50 overflow-hidden relative cursor-pointer active:scale-[0.98]"
            onMouseEnter={() => setHoveredCard("horarios")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setClickedCard(clickedCard === "horarios" ? null : "horarios")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-transparent transition-all duration-500" />
            <div className="relative space-y-4 sm:space-y-5">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`relative flex size-12 sm:size-14 lg:size-16 items-center justify-center rounded-xl bg-black border border-red-500/20 text-red-500/70 flex-shrink-0 transition-all duration-500 ${hoveredCard === "horarios" ? 'scale-110 border-red-500/50 text-red-500 shadow-lg shadow-red-500/30' : ''} ${clickedCard === "horarios" ? 'animate-pulse' : ''}`}>
                  <Clock className={`size-6 sm:size-7 lg:size-8 transition-all duration-300 ${hoveredCard === "horarios" ? 'scale-110 rotate-12' : ''}`} />
                  {hoveredCard === "horarios" && (
                    <div className="absolute inset-0 rounded-xl bg-red-500/20 animate-ping" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold text-white font-[family-name:var(--font-orbitron)] mb-2 break-words transition-colors duration-300 ${hoveredCard === "horarios" ? 'text-red-500' : ''}`}>
                    HOURS
                  </h3>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 rounded-lg border border-red-500/30 bg-black/50 group-hover:border-red-500/50 group-hover:bg-black/70 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="size-4 text-red-500/70" />
                    <p className="text-xs sm:text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">
                      Monday - Saturday
                    </p>
                  </div>
                  <p className="text-sm sm:text-base lg:text-lg text-red-500 font-bold">
                    5:00 AM - 8:00 PM
                  </p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg border border-red-500/20 bg-black/30 group-hover:border-red-500/30 group-hover:bg-black/50 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="size-4 text-zinc-500" />
                    <p className="text-xs sm:text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">
                      Sunday
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-500">
                    Closed
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-500 group-hover:text-red-500 transition-colors duration-300">
                <Clock className={`size-3 sm:size-4 transition-transform duration-300 ${hoveredCard === "horarios" ? 'rotate-12' : ''}`} />
                <span className="break-words">Multiple schedules available</span>
              </div>
            </div>
          </Card>

          {/* Contact Card */}
          <Card 
            className="group border border-red-500/50 bg-black/30 p-5 sm:p-6 lg:p-8 transition-all duration-500 hover:border-red-500/70 hover:bg-black/50 overflow-hidden relative cursor-pointer sm:col-span-2 lg:col-span-1 active:scale-[0.98]"
            onMouseEnter={() => setHoveredCard("contacto")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setClickedCard(clickedCard === "contacto" ? null : "contacto")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-transparent transition-all duration-500" />
            <div className="relative space-y-4 sm:space-y-5">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`relative flex size-12 sm:size-14 lg:size-16 items-center justify-center rounded-xl bg-black border border-red-500/20 text-red-500/70 flex-shrink-0 transition-all duration-500 ${hoveredCard === "contacto" ? 'scale-110 border-red-500/50 text-red-500 shadow-lg shadow-red-500/30' : ''} ${clickedCard === "contacto" ? 'animate-pulse' : ''}`}>
                  <Phone className={`size-6 sm:size-7 lg:size-8 transition-all duration-300 ${hoveredCard === "contacto" ? 'scale-110 rotate-12' : ''}`} />
                  {hoveredCard === "contacto" && (
                    <div className="absolute inset-0 rounded-xl bg-red-500/20 animate-ping" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold text-white font-[family-name:var(--font-orbitron)] mb-2 break-words transition-colors duration-300 ${hoveredCard === "contacto" ? 'text-red-500' : ''}`}>
                    CONTACT
                  </h3>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <a
                  href="tel:+50600000000"
                  className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border border-red-500/30 bg-black/50 group/link hover:border-red-500/50 hover:bg-black/70 active:scale-[0.98] transition-all duration-300"
                >
                  <div className="flex size-10 sm:size-12 items-center justify-center rounded-lg bg-black border border-red-500/20 text-red-500/70 group-hover/link:border-red-500/40 group-hover/link:text-red-500 group-hover/link:scale-110 transition-all duration-300 flex-shrink-0">
                    <Phone className="size-4 sm:size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-zinc-500 mb-0.5">Phone</p>
                    <p className="text-sm sm:text-base text-white font-medium group-hover/link:text-red-500 transition-colors duration-300 break-words">
                      +506 0000-0000
                    </p>
                  </div>
                </a>
                <Link
                  href="/contact"
                  className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border border-red-500/30 bg-black/50 group/link hover:border-red-500/50 hover:bg-black/70 active:scale-[0.98] transition-all duration-300"
                >
                  <div className="flex size-10 sm:size-12 items-center justify-center rounded-lg bg-black border border-red-500/20 text-red-500/70 group-hover/link:border-red-500/40 group-hover/link:text-red-500 group-hover/link:scale-110 transition-all duration-300 flex-shrink-0">
                    <Mail className="size-4 sm:size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-zinc-500 mb-0.5">Email</p>
                    <p className="text-sm sm:text-base text-white font-medium group-hover/link:text-red-500 transition-colors duration-300 break-words">
                      Contact us
                    </p>
                  </div>
                </Link>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-500 group-hover:text-red-500 transition-colors duration-300">
                <Globe className={`size-3 sm:size-4 transition-transform duration-300 ${hoveredCard === "contacto" ? 'rotate-12' : ''}`} />
                <span className="break-words">We're here to help you</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

