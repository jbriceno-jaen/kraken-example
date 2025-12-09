import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions | Venom Elite Fitness",
  description: "Terms and conditions of use for Venom Elite Fitness",
};

export default function TermsPage() {
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
            Legal
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter font-[family-name:var(--font-orbitron)] text-white">
            TERMS AND
            <br />
            <span className="text-red-500">CONDITIONS</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 font-light">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <Card className="bg-black p-6 sm:p-8 lg:p-10 shadow-2xl">
          <div className="prose prose-invert max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">1. Acceptance of Terms</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                By accessing and using the website and services of Venom Elite Fitness, you agree to comply with these terms and conditions. If you do not agree with any part of these terms, you must not use our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">2. Use of Service</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                Our service allows you to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-500 ml-4 font-light">
                <li>Book CrossFit classes one day in advance</li>
                <li>Record and track your personal records</li>
                <li>Update your profile and training goals</li>
                <li>Access information about schedules and availability</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">3. Reservation Rules</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                When making a reservation, you agree to the following rules:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-500 ml-4 font-light">
                <li>You can only book one time slot per day</li>
                <li>You can only book one day in advance</li>
                <li>You cannot cancel with less than 1 hour notice</li>
                <li>You cannot select time slots that have already passed</li>
                <li>You must arrive on time for your reserved class</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">4. User Account</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-500 ml-4 font-light">
                <li>Maintaining the confidentiality of your account and password</li>
                <li>Providing accurate and up-to-date information</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Being responsible for all activities that occur under your account</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">5. User Conduct</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-500 ml-4 font-light">
                <li>Use the service for illegal or unauthorized purposes</li>
                <li>Interfere with the operation of the service</li>
                <li>Attempt to access restricted areas of the system</li>
                <li>Transmit viruses, malware, or malicious code</li>
                <li>Use bots or automated scripts without authorization</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">6. Intellectual Property</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                All content on the website, including texts, graphics, logos, images, and software, is the property of Venom Elite Fitness and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our written consent.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">7. Limitation of Liability</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                Venom Elite Fitness will not be responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-500 ml-4 font-light">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of data or information</li>
                <li>Service interruptions due to causes beyond our control</li>
                <li>Physical injuries that may occur during CrossFit classes</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">8. Service Modifications</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                We reserve the right to modify, suspend, or discontinue any aspect of the service at any time, with or without prior notice. We will not be liable to you or any third party for any modification, suspension, or discontinuation of the service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">9. Termination</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                We may terminate or suspend your access to the service immediately, without prior notice, for any reason, including if you violate these terms and conditions.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">10. Applicable Law</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                These terms are governed by the laws of Costa Rica. Any dispute related to these terms will be resolved in the competent courts of Costa Rica.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">11. Contact</h2>
              <p className="text-zinc-500 leading-relaxed font-light">
                If you have questions about these terms and conditions, you can contact us through our <Link href="/contact" className="text-red-500 hover:text-red-400 underline font-medium">contact</Link> page.
              </p>
            </section>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

