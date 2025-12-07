"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone, Send, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast("¡Mensaje enviado! Te contactaremos pronto.", "success");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Volver al inicio
        </Link>

        <div className="space-y-4">
          <Badge className="bg-red-500/20 border border-red-500/30 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/20">
            Contacto
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent">
            Contáctanos
          </h1>
          <p className="text-lg text-zinc-300">
            ¿Tienes preguntas? Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr,1.2fr]">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black p-6 sm:p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)] mb-6">
                Información de Contacto
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400 flex-shrink-0">
                    <MapPin className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white font-[family-name:var(--font-orbitron)] mb-1">
                      Ubicación
                    </h3>
                    <p className="text-zinc-300 leading-relaxed">
                      Aguas Zarcas, Costa Rica
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400 flex-shrink-0">
                    <Mail className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white font-[family-name:var(--font-orbitron)] mb-1">
                      Email
                    </h3>
                    <a
                      href="mailto:info@krakenelitefitness.com"
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      info@krakenelitefitness.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400 flex-shrink-0">
                    <Phone className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white font-[family-name:var(--font-orbitron)] mb-1">
                      Teléfono
                    </h3>
                    <a
                      href="tel:+50600000000"
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      +506 0000-0000
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent p-6">
                <h3 className="text-lg font-semibold text-white font-[family-name:var(--font-orbitron)] mb-2">
                  Horarios de Atención
                </h3>
                <div className="space-y-2 text-zinc-300">
                  <p>Lunes - Sábado: 5:00 AM - 8:00 PM</p>
                  <p>Domingo: Cerrado</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black p-6 sm:p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)] mb-6">
              Envíanos un Mensaje
            </h2>
            {isSubmitted && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-400">
                <CheckCircle2 className="size-5" />
                <p className="text-sm font-medium">¡Mensaje enviado exitosamente!</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                    Nombre completo
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    className="min-h-[48px] sm:min-h-0 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                    Correo electrónico
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tucorreo@ejemplo.com"
                    className="min-h-[48px] sm:min-h-0 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                  Teléfono (opcional)
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 555-1234"
                  className="min-h-[48px] sm:min-h-0 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                  Asunto
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="¿Sobre qué quieres contactarnos?"
                  className="min-h-[48px] sm:min-h-0 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                  Mensaje
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Escribe tu mensaje aquí..."
                  rows={6}
                  className="min-h-[150px] sm:min-h-0 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto min-h-[48px] sm:min-h-0 text-base sm:text-sm gap-2 bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white hover:from-red-600 hover:via-red-700 hover:to-red-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/50 hover:shadow-red-500/70 transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="size-5 sm:size-4" />
                    Enviar mensaje
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}

