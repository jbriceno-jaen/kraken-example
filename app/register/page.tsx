"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import Navbar from "@/components/navbar";
import { Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showToast("Las contraseñas no coinciden", "error");
      return;
    }

    if (formData.password.length < 6) {
      showToast("La contraseña debe tener al menos 6 caracteres", "error");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        showToast("¡Cuenta creada exitosamente! Redirigiendo...", "success");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        showToast(data.error || "Error al crear la cuenta", "error");
      }
    } catch (error) {
      console.error("Registration error:", error);
      showToast("Error al crear la cuenta. Por favor intenta de nuevo.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white">
        <Navbar />
        <main className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8 min-h-[calc(100vh-80px)]">
          <Card className="w-full max-w-md border border-green-500/20 bg-gradient-to-br from-black via-slate-950 to-black p-8 shadow-2xl">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-500/20 p-4">
                  <CheckCircle2 className="size-12 text-green-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">
                ¡Cuenta creada exitosamente!
              </h2>
              <p className="text-zinc-400">
                Redirigiendo al inicio de sesión...
              </p>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8 min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black p-8 shadow-2xl">
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <span className="rounded-full bg-gradient-to-r from-red-500 to-red-600 px-3 py-1 text-xs font-bold uppercase tracking-tight font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/50">
                  Kraken
                </span>
                <span className="text-lg font-bold font-[family-name:var(--font-orbitron)]">Elite Fitness</span>
              </div>
              <Badge className="bg-red-500/20 border border-red-500/30 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/20">
                Crear Cuenta
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent">
                Únete a Kraken
              </h1>
              <p className="text-sm text-zinc-400">
                Crea tu cuenta para comenzar tu entrenamiento
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tu nombre completo"
                    className="min-h-[48px] pl-10 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tucorreo@ejemplo.com"
                    className="min-h-[48px] pl-10 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className="min-h-[48px] pl-10 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>
                <p className="text-xs text-zinc-500">La contraseña debe tener al menos 6 caracteres</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirma tu contraseña"
                    className="min-h-[48px] pl-10 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[48px] text-base sm:text-sm gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/50 transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    Crear cuenta
                    <ArrowRight className="size-5 sm:size-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center space-y-3">
              <p className="text-sm text-zinc-400">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="text-red-400 hover:text-red-300 font-semibold transition-colors">
                  Inicia sesión aquí
                </Link>
              </p>
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-400 transition-colors">
                <ArrowRight className="size-4 rotate-180" />
                Volver al inicio
              </Link>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

