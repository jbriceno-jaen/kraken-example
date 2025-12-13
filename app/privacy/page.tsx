import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Venom Elite Fitness",
  description: "Privacy policy of Venom Elite Fitness",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 pt-24 pb-12 sm:px-6 lg:px-8 sm:pt-28 sm:pb-16 flex-1">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-red-500 transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>

        <div className="space-y-4">
          <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs sm:text-sm px-4 sm:px-5 py-1.5">
            Legal
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter font-[family-name:var(--font-orbitron)] text-white">
            PRIVACY
            <br />
            <span className="text-red-500">POLICY</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 font-light">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <Card className="bg-black p-6 sm:p-8 lg:p-10 shadow-2xl">
          <div className="prose prose-invert max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">1. Information We Collect</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                At Venom Elite Fitness, we collect information that helps us provide you with the best possible service:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-500 ml-4 font-light">
                <li>Profile information (name, email, phone, training goals)</li>
                <li>Personal records and training data</li>
                <li>Class reservations and schedule preferences</li>
                <li>User account authentication information</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">2. Use of Information</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                We use your information to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-500 ml-4 font-light">
                <li>Manage your class reservations and communicate with you about your training</li>
                <li>Record and track your progress and personal records</li>
                <li>Improve our services and personalize your experience</li>
                <li>Send important updates about the gym and schedule changes</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">3. Data Protection</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                We implement technical and organizational security measures to protect your personal information against unauthorized access, loss, or destruction. We use secure authentication services and store data in protected databases.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">4. Sharing Information</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                We do not sell, rent, or share your personal information with third parties, except:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-500 ml-4 font-light">
                <li>When necessary to provide our services (authorized service providers)</li>
                <li>When required by law or to protect our legal rights</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">5. Your Rights</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-500 ml-4 font-light">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Object to the processing of your information</li>
                <li>Withdraw your consent at any time</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">6. Cookies and Similar Technologies</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                We use cookies and similar technologies to improve your experience, analyze site usage, and personalize content. You can manage your cookie preferences through your browser settings.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">7. Changes to this Policy</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                We may update this privacy policy occasionally. We will notify you of significant changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">8. Contact</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                If you have questions about this privacy policy or how we handle your information, you can contact us through our <Link href="/contact" className="text-red-500 hover:text-red-400 underline font-medium">contact</Link> page.
              </p>
            </section>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

