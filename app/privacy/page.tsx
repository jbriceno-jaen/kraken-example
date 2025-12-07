import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad | Kraken Elite Fitness",
  description: "Política de privacidad de Kraken Elite Fitness",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8 sm:py-16 flex-1">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-red-500 transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Volver al inicio
        </Link>

        <div className="space-y-4">
          <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs sm:text-sm px-4 sm:px-5 py-1.5">
            Legal
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter font-[family-name:var(--font-orbitron)] text-white">
            POLÍTICA DE
            <br />
            <span className="text-red-500">PRIVACIDAD</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 font-light">
            Última actualización: {new Date().toLocaleDateString("es-CR", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <Card className="bg-black p-6 sm:p-8 lg:p-10 shadow-2xl">
          <div className="prose prose-invert max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">1. Información que Recopilamos</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                En Kraken Elite Fitness, recopilamos información que nos ayuda a brindarte el mejor servicio posible:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-500 ml-4 font-light">
                <li>Información de perfil (nombre, correo electrónico, teléfono, objetivos de entrenamiento)</li>
                <li>Récords personales y datos de entrenamiento</li>
                <li>Reservas de clases y preferencias de horarios</li>
                <li>Información de autenticación de tu cuenta de usuario</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">2. Uso de la Información</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                Utilizamos tu información para:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-500 ml-4 font-light">
                <li>Gestionar tus reservas de clases y comunicarnos contigo sobre tu entrenamiento</li>
                <li>Registrar y hacer seguimiento de tu progreso y récords personales</li>
                <li>Mejorar nuestros servicios y personalizar tu experiencia</li>
                <li>Enviar actualizaciones importantes sobre el gimnasio y cambios en los horarios</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">3. Protección de Datos</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado, pérdida o destrucción. Utilizamos servicios de autenticación seguros y almacenamos datos en bases de datos protegidas.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">4. Compartir Información</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-500 ml-4 font-light">
                <li>Cuando sea necesario para proporcionar nuestros servicios (proveedores de servicios autorizados)</li>
                <li>Cuando sea requerido por ley o para proteger nuestros derechos legales</li>
                <li>Con tu consentimiento explícito</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">5. Tus Derechos</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                Tienes derecho a:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-500 ml-4 font-light">
                <li>Acceder a tu información personal</li>
                <li>Corregir información inexacta</li>
                <li>Solicitar la eliminación de tus datos</li>
                <li>Oponerte al procesamiento de tu información</li>
                <li>Retirar tu consentimiento en cualquier momento</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">6. Cookies y Tecnologías Similares</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar el uso del sitio y personalizar el contenido. Puedes gestionar tus preferencias de cookies a través de la configuración de tu navegador.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">7. Cambios a esta Política</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre cambios significativos publicando la nueva política en esta página y actualizando la fecha de "Última actualización".
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">8. Contacto</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tu información, puedes contactarnos a través de nuestra página de <Link href="/contact" className="text-red-500 hover:text-red-400 underline font-medium">contacto</Link>.
              </p>
            </section>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

