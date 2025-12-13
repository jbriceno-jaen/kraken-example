"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
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
      showToast("Message sent! We'll contact you soon.", "success");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-24 pb-12 sm:px-6 lg:px-8 sm:pt-28 sm:pb-16 flex-1">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-red-500 transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>

        <div className="space-y-4">
          <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs sm:text-sm px-4 sm:px-5 py-1.5">
            Contact
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter font-[family-name:var(--font-orbitron)] text-white">
            CONTACT US
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 font-light">
            Have questions? We're here to help. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr,1.2fr]">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="bg-black p-6 sm:p-8 lg:p-10 shadow-2xl">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white font-[family-name:var(--font-orbitron)] mb-6">
                CONTACT
                <br />
                <span className="text-red-500">INFORMATION</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-black border border-red-500/20 text-red-500/80 flex-shrink-0">
                    <MapPin className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white font-[family-name:var(--font-orbitron)] mb-1">
                      Location
                    </h3>
                    <p className="text-zinc-500 leading-relaxed font-light">
                      Aguas Zarcas, Costa Rica
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-black border border-red-500/20 text-red-500/80 flex-shrink-0">
                    <Mail className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white font-[family-name:var(--font-orbitron)] mb-1">
                      Email
                    </h3>
                    <a
                      href="mailto:info@venomelitefitness.com"
                      className="text-red-500 hover:text-red-400 transition-colors font-medium"
                    >
                      info@venomelitefitness.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-black border border-red-500/20 text-red-500/80 flex-shrink-0">
                    <Phone className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white font-[family-name:var(--font-orbitron)] mb-1">
                      Phone
                    </h3>
                    <a
                      href="tel:+50600000000"
                      className="text-red-500 hover:text-red-400 transition-colors font-medium"
                    >
                      +506 0000-0000
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-red-500/50 bg-black/30 p-6">
                <h3 className="text-lg font-semibold text-white font-[family-name:var(--font-orbitron)] mb-2">
                  Business Hours
                </h3>
                <div className="space-y-2 text-zinc-500 font-light">
                  <p>Monday - Saturday: 5:00 AM - 8:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="bg-black p-6 sm:p-8 lg:p-10 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white font-[family-name:var(--font-orbitron)] mb-6">
              SEND US A
              <br />
              <span className="text-red-500">MESSAGE</span>
            </h2>
            {isSubmitted && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-400">
                <CheckCircle2 className="size-5" />
                <p className="text-sm font-medium">Message sent successfully!</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                    Full name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                    Phone (optional)
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
                    Subject
                  </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                    placeholder="What would you like to contact us about?"
                  className="min-h-[48px] sm:min-h-0 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                    Message
                  </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                    placeholder="Write your message here..."
                  rows={6}
                  className="min-h-[150px] sm:min-h-0 text-base sm:text-sm border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto gap-2 bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white hover:from-red-600 hover:via-red-700 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/50 hover:shadow-red-500/70"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="size-5 sm:size-4" />
                    Send message
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

