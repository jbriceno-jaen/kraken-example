"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Lock, ArrowRight } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
}

export function LoginModal({ open, onOpenChange, onSwitchToRegister, onForgotPassword }: LoginModalProps) {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email.trim() || !formData.password) {
      showToast("Por favor completa todos los campos", "error");
      return;
    }

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
        setFormData({ email: "", password: "" });
        onOpenChange(false);
        
        // Update session state
        await updateSession();
        
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-red-500/50 bg-black text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <Logo variant="compact" showLink={false} className="justify-center mb-2" />
          <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs sm:text-sm px-4 sm:px-5 py-1.5 w-fit mx-auto">
            Iniciar Sesión
          </Badge>
          <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tighter font-[family-name:var(--font-orbitron)] text-white text-center pt-2">
            BIENVENIDO
            <br />
            <span className="text-red-500">DE VUELTA</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500 text-center font-light">
            Ingresa tus credenciales para acceder a tu cuenta
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-600" />
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tucorreo@ejemplo.com"
                className="min-h-[48px] pl-10 text-base sm:text-sm border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onForgotPassword?.();
                }}
                className="text-xs text-red-400 hover:text-red-300 font-semibold transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-600" />
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Tu contraseña"
                className="min-h-[48px] pl-10 text-base sm:text-sm border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 transition-all"
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

        <div className="text-center space-y-3 pt-4">
          <p className="text-sm text-zinc-500">
            ¿No tienes una cuenta?{" "}
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onSwitchToRegister?.();
              }}
              className="text-red-500 hover:text-red-400 font-semibold transition-colors"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

