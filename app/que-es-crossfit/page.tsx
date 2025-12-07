import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowLeft, Activity, Heart, Target, Zap, Users, TrendingUp } from "lucide-react";

export const metadata = {
  title: "¿Qué es CrossFit? | Kraken Elite Fitness",
  description: "Descubre qué es CrossFit, sus beneficios y por qué es el entrenamiento más efectivo para alcanzar tus objetivos de fitness",
};

export default function QueEsCrossfitPage() {
  const benefits = [
    {
      icon: Activity,
      title: "Entrenamiento Funcional",
      description: "Movimientos que imitan actividades de la vida diaria, mejorando tu capacidad para realizar tareas cotidianas con mayor facilidad y menor riesgo de lesiones.",
    },
    {
      icon: Heart,
      title: "Mejora Cardiovascular",
      description: "Estudios muestran mejoras del 10-15% en VO2 max en solo 10 semanas de entrenamiento constante, según el Journal of Strength and Conditioning Research.",
    },
    {
      icon: Target,
      title: "Fuerza y Resistencia",
      description: "Desarrollo simultáneo de fuerza máxima y resistencia muscular. Investigaciones indican aumentos del 20-30% en fuerza en los primeros 3-6 meses.",
    },
    {
      icon: Zap,
      title: "Alta Intensidad",
      description: "Los WODs (Workout of the Day) queman entre 12-20 calorías por minuto, siendo uno de los entrenamientos más eficientes para la pérdida de grasa.",
    },
    {
      icon: Users,
      title: "Comunidad y Motivación",
      description: "El ambiente de apoyo mutuo y camaradería aumenta la adherencia al ejercicio en un 40% comparado con entrenamientos individuales.",
    },
    {
      icon: TrendingUp,
      title: "Variedad Constante",
      description: "Cada día es diferente, evitando la monotonía y manteniendo tu cuerpo adaptándose constantemente a nuevos desafíos.",
    },
  ];

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
            CrossFit
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter font-[family-name:var(--font-orbitron)] text-white">
            ¿QUÉ ES
            <br />
            <span className="text-red-500">CROSSFIT?</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 font-light">
            Descubre el método de entrenamiento que está transformando vidas en todo el mundo.
          </p>
        </div>

        <Card className="bg-black p-6 sm:p-8 lg:p-10 shadow-2xl">
          <div className="prose prose-invert max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white font-[family-name:var(--font-orbitron)]">
                DEFINICIÓN
              </h2>
              <p className="text-zinc-500 leading-relaxed font-light text-base sm:text-lg">
                CrossFit es un programa de entrenamiento de fuerza y acondicionamiento físico de alta intensidad que combina ejercicios funcionales variados, realizados a alta intensidad. Fue fundado por Greg Glassman en el año 2000 y se ha convertido en uno de los métodos de entrenamiento más populares y efectivos del mundo.
              </p>
              <p className="text-zinc-500 leading-relaxed font-light text-base sm:text-lg">
                La filosofía de CrossFit se basa en preparar a las personas para cualquier desafío físico que puedan enfrentar, mejorando diez dominios físicos reconocidos: resistencia cardiovascular y respiratoria, resistencia muscular, fuerza, flexibilidad, potencia, velocidad, coordinación, agilidad, equilibrio y precisión.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white font-[family-name:var(--font-orbitron)]">
                EL WOD (WORKOUT OF THE DAY)
              </h2>
              <p className="text-zinc-500 leading-relaxed font-light text-base sm:text-lg">
                Cada día, los entrenadores diseñan un WOD único que combina diferentes movimientos funcionales. Estos entrenamientos son:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-500 ml-4 font-light text-base sm:text-lg">
                <li><strong className="text-white">Variados:</strong> Nunca haces el mismo entrenamiento dos veces seguidas</li>
                <li><strong className="text-white">Funcionales:</strong> Movimientos que imitan actividades de la vida real</li>
                <li><strong className="text-white">De alta intensidad:</strong> Diseñados para maximizar resultados en el menor tiempo posible</li>
                <li><strong className="text-white">Escalables:</strong> Adaptables a cualquier nivel de condición física</li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white font-[family-name:var(--font-orbitron)]">
                BENEFICIOS CIENTÍFICAMENTE COMPROBADOS
              </h2>
              <p className="text-zinc-500 leading-relaxed font-light text-base sm:text-lg">
                Numerosos estudios científicos han documentado los beneficios del CrossFit. Aquí están los principales:
              </p>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={index}
                      className="group p-5 rounded-xl border border-red-500/30 bg-black/30 hover:border-red-500/50 hover:bg-black/50 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex size-12 items-center justify-center rounded-lg bg-black border border-red-500/20 text-red-500/70 flex-shrink-0 group-hover:border-red-500/40 group-hover:text-red-500 transition-all duration-300">
                          <Icon className="size-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-white font-[family-name:var(--font-orbitron)] mb-2 group-hover:text-red-500 transition-colors duration-300">
                            {benefit.title}
                          </h3>
                          <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors duration-300 font-light">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white font-[family-name:var(--font-orbitron)]">
                RESULTADOS EN LOS PRIMEROS MESES
              </h2>
              <p className="text-zinc-500 leading-relaxed font-light text-base sm:text-lg">
                Según estudios publicados en el <strong className="text-white">Journal of Strength and Conditioning Research</strong>, los practicantes de CrossFit experimentan mejoras significativas en los primeros 3-6 meses:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-500 ml-4 font-light text-base sm:text-lg">
                <li>Reducción promedio de 3-5% en grasa corporal</li>
                <li>Aumento de 2-4 kg de masa muscular</li>
                <li>Mejora del 20-30% en fuerza máxima</li>
                <li>Incremento del 10-15% en capacidad cardiovascular (VO2 max)</li>
                <li>Mejora del 15-25% en flexibilidad y movilidad</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white font-[family-name:var(--font-orbitron)]">
                ¿ES PARA MÍ?
              </h2>
              <p className="text-zinc-500 leading-relaxed font-light text-base sm:text-lg">
                CrossFit es para todos. Los entrenamientos son completamente escalables, lo que significa que pueden adaptarse a cualquier nivel de condición física, edad o experiencia. Ya seas un atleta experimentado o alguien que está comenzando su viaje de fitness, CrossFit puede ser modificado para desafiar tus capacidades actuales mientras progresas de manera segura.
              </p>
              <p className="text-zinc-500 leading-relaxed font-light text-base sm:text-lg">
                La comunidad de CrossFit es conocida por su apoyo mutuo y ambiente inclusivo. Cada persona en el box está ahí para superarse a sí misma, y todos celebran los logros de los demás, sin importar el nivel.
              </p>
            </section>

            <section className="space-y-4 pt-4 border-t border-black/50">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white font-[family-name:var(--font-orbitron)]">
                FUENTES CIENTÍFICAS
              </h2>
              <div className="space-y-2 text-zinc-500 font-light text-sm sm:text-base">
                <p>• Journal of Strength and Conditioning Research - "Physiological Adaptations to CrossFit Training"</p>
                <p>• International Journal of Exercise Science - "CrossFit-based High-Intensity Power Training"</p>
                <p>• Sports Medicine - "Metabolic and Cardiovascular Responses to CrossFit Workouts"</p>
                <p>• American Council on Exercise - "CrossFit Training Effectiveness Study"</p>
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-black/50">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white font-[family-name:var(--font-orbitron)]">
                COMENZAR EN KRAKEN ELITE FITNESS
              </h2>
              <p className="text-zinc-500 leading-relaxed font-light text-base sm:text-lg">
                En Kraken Elite Fitness, nuestros coaches certificados te guiarán desde tu primer día, asegurándonos de que aprendas la técnica correcta y progreses de manera segura. Nuestro ambiente de apoyo mutuo y sin juicios hace que cada entrenamiento sea una experiencia positiva.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white font-bold font-[family-name:var(--font-orbitron)] rounded-lg hover:from-red-600 hover:via-red-700 hover:to-red-600 transition-all duration-300 shadow-lg shadow-red-500/50 hover:shadow-red-500/70"
                >
                  Comenzar Ahora
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 border border-red-500/50 bg-black/30 text-white font-medium font-[family-name:var(--font-orbitron)] rounded-lg hover:border-red-500/70 hover:bg-black/50 transition-all duration-300"
                >
                  Contáctanos
                </Link>
              </div>
            </section>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

