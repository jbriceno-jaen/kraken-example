import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Términos y Condiciones | Kraken Elite Fitness",
  description: "Términos y condiciones de uso de Kraken Elite Fitness",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white flex flex-col">
      <Navbar />
      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8 sm:py-16 flex-1">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Volver al inicio
        </Link>

        <div className="space-y-4">
          <Badge className="bg-red-500/20 border border-red-500/30 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/20">
            Legal
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent">
            Términos y Condiciones
          </h1>
          <p className="text-lg text-zinc-300">
            Última actualización: {new Date().toLocaleDateString("es-CR", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <Card className="border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black p-6 sm:p-8 shadow-2xl">
          <div className="prose prose-invert max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">1. Aceptación de los Términos</h2>
              <p className="text-zinc-300 leading-relaxed">
                Al acceder y utilizar el sitio web y los servicios de Kraken Elite Fitness, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">2. Uso del Servicio</h2>
              <p className="text-zinc-300 leading-relaxed">
                Nuestro servicio te permite:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-300 ml-4">
                <li>Reservar clases de CrossFit con un día de anticipación</li>
                <li>Registrar y hacer seguimiento de tus récords personales</li>
                <li>Actualizar tu perfil y objetivos de entrenamiento</li>
                <li>Acceder a información sobre horarios y disponibilidad</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">3. Reglas de Reserva</h2>
              <p className="text-zinc-300 leading-relaxed">
                Al hacer una reserva, aceptas las siguientes reglas:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-300 ml-4">
                <li>Solo puedes reservar un horario por día</li>
                <li>Solo puedes reservar con un día de anticipación</li>
                <li>No puedes cancelar con menos de 1 hora de anticipación</li>
                <li>No puedes seleccionar horarios que ya pasaron</li>
                <li>Debes presentarte puntualmente a tu clase reservada</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">4. Cuenta de Usuario</h2>
              <p className="text-zinc-300 leading-relaxed">
                Eres responsable de:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-300 ml-4">
                <li>Mantener la confidencialidad de tu cuenta y contraseña</li>
                <li>Proporcionar información precisa y actualizada</li>
                <li>Notificarnos inmediatamente sobre cualquier uso no autorizado</li>
                <li>Ser responsable de todas las actividades que ocurran bajo tu cuenta</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">5. Conducta del Usuario</h2>
              <p className="text-zinc-300 leading-relaxed">
                Te comprometes a no:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-300 ml-4">
                <li>Usar el servicio para fines ilegales o no autorizados</li>
                <li>Interferir con el funcionamiento del servicio</li>
                <li>Intentar acceder a áreas restringidas del sistema</li>
                <li>Transmitir virus, malware o código malicioso</li>
                <li>Usar bots o scripts automatizados sin autorización</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">6. Propiedad Intelectual</h2>
              <p className="text-zinc-300 leading-relaxed">
                Todo el contenido del sitio web, incluyendo textos, gráficos, logos, imágenes y software, es propiedad de Kraken Elite Fitness y está protegido por leyes de propiedad intelectual. No puedes reproducir, distribuir o crear obras derivadas sin nuestro consentimiento escrito.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">7. Limitación de Responsabilidad</h2>
              <p className="text-zinc-300 leading-relaxed">
                Kraken Elite Fitness no será responsable de:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-300 ml-4">
                <li>Daños indirectos, incidentales o consecuentes</li>
                <li>Pérdida de datos o información</li>
                <li>Interrupciones del servicio por causas fuera de nuestro control</li>
                <li>Lesiones físicas que puedan ocurrir durante las clases de CrossFit</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">8. Modificaciones del Servicio</h2>
              <p className="text-zinc-300 leading-relaxed">
                Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto del servicio en cualquier momento, con o sin previo aviso. No seremos responsables ante ti ni ante terceros por cualquier modificación, suspensión o discontinuación del servicio.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">9. Terminación</h2>
              <p className="text-zinc-300 leading-relaxed">
                Podemos terminar o suspender tu acceso al servicio inmediatamente, sin previo aviso, por cualquier motivo, incluyendo si violas estos términos y condiciones.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">10. Ley Aplicable</h2>
              <p className="text-zinc-300 leading-relaxed">
                Estos términos se rigen por las leyes de Costa Rica. Cualquier disputa relacionada con estos términos será resuelta en los tribunales competentes de Costa Rica.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">11. Contacto</h2>
              <p className="text-zinc-300 leading-relaxed">
                Si tienes preguntas sobre estos términos y condiciones, puedes contactarnos a través de nuestra página de <Link href="/contact" className="text-red-400 hover:text-red-300 underline">contacto</Link>.
              </p>
            </section>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

