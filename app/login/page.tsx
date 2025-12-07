"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import Navbar from "@/components/navbar";
import { Logo } from "@/components/logo";
import { Footer } from "@/components/footer";
import { Mail, Lock, ArrowRight, Flame, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Check if redirected due to expired subscription
  useEffect(() => {
    if (searchParams.get("subscriptionExpired") === "true") {
      showToast(
        "Tu suscripción ha expirado. Por favor contacta al administrador para renovar tu suscripción.",
        "error"
      );
      // Remove the query parameter from URL
      router.replace("/login");
    }
  }, [searchParams, router, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const normalizedEmail = formData.email.trim().toLowerCase();
      console.log("Attempting login for:", normalizedEmail);

      // Check if user is approved and subscription is valid before attempting login
      try {
        const approvalCheck = await fetch("/api/auth/check-approval", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail }),
        });

        if (approvalCheck.ok) {
          const approvalData = await approvalCheck.json();
          
          // Check approval status
          if (approvalData.role === "client" && !approvalData.approved) {
            showToast("Tu cuenta está pendiente de aprobación. Por favor espera a que el administrador apruebe tu cuenta.", "warning");
            setIsLoading(false);
            return;
          }

          // Check subscription expiration
          if (approvalData.role === "client" && approvalData.subscriptionExpired) {
            const expirationDate = approvalData.subscriptionExpires 
              ? new Date(approvalData.subscriptionExpires).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "fecha desconocida";
            showToast(
              `Tu suscripción ha expirado (expiró el ${expirationDate}). Por favor contacta al administrador para renovar tu suscripción.`,
              "error"
            );
            setIsLoading(false);
            return;
          }
        }
      } catch (approvalError) {
        // If approval check fails, continue with login attempt
        console.error("Error checking approval:", approvalError);
      }

      // Get callbackUrl from query params or default to dashboard
      const searchParams = new URLSearchParams(window.location.search);
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

      // Login with redirect: false to handle errors and show toast
      const result = await signIn("credentials", {
        email: normalizedEmail,
        password: formData.password,
        redirect: false,
        callbackUrl: callbackUrl,
      }) as any;

      console.log("SignIn result:", result);

      if (result?.error) {
        console.error("Login error:", result.error);
        // Check approval status again to provide specific error message
        try {
          const approvalCheck = await fetch("/api/auth/check-approval", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: normalizedEmail }),
          });

          if (approvalCheck.ok) {
            const approvalData = await approvalCheck.json();
            
            // If user is not approved, show specific message
            if (approvalData.role === "client" && !approvalData.approved) {
              showToast("Tu cuenta está pendiente de aprobación. Por favor espera a que el administrador apruebe tu cuenta.", "warning");
              setIsLoading(false);
              return;
            }

            // If subscription is expired, show specific message
            if (approvalData.role === "client" && approvalData.subscriptionExpired) {
              const expirationDate = approvalData.subscriptionExpires 
                ? new Date(approvalData.subscriptionExpires).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "fecha desconocida";
              showToast(
                `Tu suscripción ha expirado (expiró el ${expirationDate}). Por favor contacta al administrador para renovar tu suscripción.`,
                "error"
              );
              setIsLoading(false);
              return;
            }
          }
        } catch (checkError) {
          console.error("Error checking approval after login failure:", checkError);
        }

        // Handle generic error messages
        if (result.error.includes("CredentialsSignin")) {
          showToast("Credenciales incorrectas. Por favor verifica tu email y contraseña.", "error");
        } else {
          showToast("Error al iniciar sesión. Por favor intenta de nuevo.", "error");
        }
        return;
      }

      if (result?.ok) {
        showToast("¡Bienvenido de vuelta!", "success");
        
        // Wait for cookie to be set, then redirect
        // Using a longer delay to ensure cookie is available to middleware
        setTimeout(() => {
          // Decode the callbackUrl if it's encoded
          const decodedUrl = decodeURIComponent(callbackUrl);
          window.location.href = decodedUrl;
        }, 1000);
      } else {
        console.error("Unexpected result:", result);
        showToast("Error al iniciar sesión. Por favor intenta de nuevo.", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Error desconocido";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        // Handle JSON parsing errors specifically
        if (error.message.includes("JSON") || error.message.includes("Unexpected end")) {
          errorMessage = "Error de comunicación con el servidor. Por favor intenta de nuevo.";
        }
      }
      
      showToast(`Error al iniciar sesión: ${errorMessage}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white flex flex-col">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8 flex-1">
        <Card className="w-full max-w-md border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black p-8 shadow-2xl">
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Logo variant="compact" showLink={false} className="justify-center" />
              <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/30 w-fit mx-auto">
                Iniciar Sesión
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent">
                Bienvenido de vuelta
              </h1>
              <p className="text-sm text-zinc-400">
                Ingresa tus credenciales para acceder a tu cuenta
              </p>
              {searchParams.get("subscriptionExpired") === "true" && (
                <div className="mt-4 p-4 border border-red-500/30 bg-red-500/10 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="size-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-400 mb-1">
                        Suscripción Expirada
                      </p>
                      <p className="text-xs text-zinc-300">
                        Tu suscripción ha expirado. Por favor contacta al administrador para renovar tu suscripción y poder acceder nuevamente a tu cuenta.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder="Tu contraseña"
                    className="min-h-[48px] pl-10 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[48px] text-base sm:text-sm gap-2 bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white hover:from-red-600 hover:via-red-700 hover:to-red-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/50 hover:shadow-red-500/70 transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    Iniciar sesión
                    <ArrowRight className="size-5 sm:size-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center space-y-3">
              <p className="text-sm text-zinc-400">
                ¿No tienes una cuenta?{" "}
                <Link href="/register" className="text-red-400 hover:text-red-300 font-semibold transition-colors">
                  Regístrate aquí
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
      <Footer />
    </div>
  );
}

