import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowLeft, Activity, Heart, Target, Zap, Users, TrendingUp } from "lucide-react";

export const metadata = {
  title: "What is CrossFit? | Venom Elite Fitness",
  description: "Discover what CrossFit is, its benefits, and why it's the most effective training to achieve your fitness goals",
};

export default function WhatIsCrossfitPage() {
  const benefits = [
    {
      icon: Activity,
      title: "Functional Training",
      description: "Movements that mimic daily life activities, improving your ability to perform everyday tasks with greater ease and lower risk of injury.",
    },
    {
      icon: Heart,
      title: "Cardiovascular Improvement",
      description: "Studies show 10-15% improvements in VO2 max in just 10 weeks of consistent training, according to the Journal of Strength and Conditioning Research.",
    },
    {
      icon: Target,
      title: "Strength and Endurance",
      description: "Simultaneous development of maximum strength and muscular endurance. Research indicates 20-30% increases in strength in the first 3-6 months.",
    },
    {
      icon: Zap,
      title: "High Intensity",
      description: "WODs (Workout of the Day) burn between 12-20 calories per minute, making them one of the most efficient workouts for fat loss.",
    },
    {
      icon: Users,
      title: "Community and Motivation",
      description: "The environment of mutual support and camaraderie increases exercise adherence by 40% compared to individual training.",
    },
    {
      icon: TrendingUp,
      title: "Constant Variety",
      description: "Every day is different, avoiding monotony and keeping your body constantly adapting to new challenges.",
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
          Back to home
        </Link>

        <div className="space-y-4">
          <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs sm:text-sm px-4 sm:px-5 py-1.5">
            CrossFit
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter font-[family-name:var(--font-orbitron)] text-white">
            WHAT IS
            <br />
            <span className="text-red-500">CROSSFIT?</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 font-light">
            Discover the training method that is transforming lives around the world.
          </p>
        </div>

        <Card className="bg-black p-6 sm:p-8 lg:p-10 shadow-2xl">
          <div className="prose prose-invert max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white font-[family-name:var(--font-orbitron)]">
                DEFINITION
              </h2>
              <p className="text-zinc-500 leading-relaxed font-light text-base sm:text-lg">
                CrossFit is a high-intensity strength and conditioning training program that combines varied functional exercises performed at high intensity. It was founded by Greg Glassman in 2000 and has become one of the world's most popular and effective training methods.
              </p>
              <p className="text-zinc-500 leading-relaxed font-light text-base sm:text-lg">
                CrossFit's philosophy is based on preparing people for any physical challenge they may face, improving ten recognized physical domains: cardiovascular and respiratory endurance, muscular endurance, strength, flexibility, power, speed, coordination, agility, balance, and accuracy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white font-[family-name:var(--font-orbitron)]">
                THE WOD (WORKOUT OF THE DAY)
              </h2>
              <p className="text-zinc-500 leading-relaxed font-light text-base sm:text-lg">
                Each day, trainers design a unique WOD that combines different functional movements. These workouts are:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-500 ml-4 font-light text-base sm:text-lg">
                <li><strong className="text-white">Varied:</strong> You never do the same workout twice in a row</li>
                <li><strong className="text-white">Functional:</strong> Movements that mimic real-life activities</li>
                <li><strong className="text-white">High intensity:</strong> Designed to maximize results in the shortest time possible</li>
                <li><strong className="text-white">Scalable:</strong> Adaptable to any fitness level</li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white font-[family-name:var(--font-orbitron)]">
                SCIENTIFICALLY PROVEN BENEFITS
              </h2>
              <p className="text-zinc-500 leading-relaxed font-light text-base sm:text-lg">
                Numerous scientific studies have documented the benefits of CrossFit. Here are the main ones:
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
                RESULTS IN THE FIRST MONTHS
              </h2>
              <p className="text-zinc-500 leading-relaxed font-light text-base sm:text-lg">
                According to studies published in the <strong className="text-white">Journal of Strength and Conditioning Research</strong>, CrossFit practitioners experience significant improvements in the first 3-6 months:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-500 ml-4 font-light text-base sm:text-lg">
                <li>Average reduction of 3-5% in body fat</li>
                <li>Increase of 2-4 kg of muscle mass</li>
                <li>20-30% improvement in maximum strength</li>
                <li>10-15% increase in cardiovascular capacity (VO2 max)</li>
                <li>15-25% improvement in flexibility and mobility</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white font-[family-name:var(--font-orbitron)]">
                IS IT FOR ME?
              </h2>
              <p className="text-zinc-500 leading-relaxed font-light text-base sm:text-lg">
                CrossFit is for everyone. Workouts are completely scalable, meaning they can be adapted to any fitness level, age, or experience. Whether you're an experienced athlete or someone just starting their fitness journey, CrossFit can be modified to challenge your current abilities while progressing safely.
              </p>
              <p className="text-zinc-500 leading-relaxed font-light text-base sm:text-lg">
                The CrossFit community is known for its mutual support and inclusive environment. Every person in the box is there to push themselves, and everyone celebrates each other's achievements, regardless of level.
              </p>
            </section>

            <section className="space-y-4 pt-4 border-t border-black/50">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white font-[family-name:var(--font-orbitron)]">
                SCIENTIFIC SOURCES
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
                START AT VENOM ELITE FITNESS
              </h2>
              <p className="text-zinc-500 leading-relaxed font-light text-base sm:text-lg">
                At Venom Elite Fitness, our certified coaches will guide you from your first day, ensuring you learn the correct technique and progress safely. Our supportive and non-judgmental environment makes every workout a positive experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white font-bold font-[family-name:var(--font-orbitron)] rounded-lg hover:from-red-600 hover:via-red-700 hover:to-red-600 transition-all duration-300 shadow-lg shadow-red-500/50 hover:shadow-red-500/70"
                >
                  Start Now
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 border border-red-500/50 bg-black/30 text-white font-medium font-[family-name:var(--font-orbitron)] rounded-lg hover:border-red-500/70 hover:bg-black/50 transition-all duration-300"
                >
                  Contact Us
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
