"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react";

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
}

export function RegisterModal({ open, onOpenChange, onSwitchToLogin }: RegisterModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation - allow spaces and multiple words
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = "El nombre es requerido";
    } else if (trimmedName.length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    } else if (trimmedName.length > 255) {
      newErrors.name = "El nombre no puede exceder 255 caracteres";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(trimmedName)) {
      newErrors.name = "El nombre solo puede contener letras y espacios";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Ingresa un correo electrónico válido";
    } else if (formData.email.length > 255) {
      newErrors.email = "El correo no puede exceder 255 caracteres";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    } else if (formData.password.length > 128) {
      newErrors.password = "La contraseña no puede exceder 128 caracteres";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      if (firstError) {
        showToast(firstError, "error");
      }
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      // Check if response is ok before trying to parse JSON
      if (!res.ok) {
        let errorMessage = "Error al crear la cuenta";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, use status text
          errorMessage = res.statusText || errorMessage;
        }
        showToast(errorMessage, "error");
        setIsLoading(false);
        return;
      }

      const data = await res.json();

      if (data.message || data.user) {
        setIsSuccess(true);
        if (data.requiresApproval) {
          showToast("Cuenta creada. Esperando aprobación del administrador.", "info");
        } else {
          showToast("¡Cuenta creada exitosamente!", "success");
        }
        // Don't auto-close if approval is required, let user read the message
        if (!data.requiresApproval) {
          setTimeout(() => {
            onOpenChange(false);
            setIsSuccess(false);
            setFormData({ name: "", email: "", password: "", confirmPassword: "" });
            setErrors({});
            onSwitchToLogin?.();
          }, 2000);
        }
      } else {
        showToast(data.error || "Error al crear la cuenta", "error");
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al crear la cuenta. Por favor intenta de nuevo.";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form and errors when closing
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setErrors({});
      setIsSuccess(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black text-white max-w-md max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          <div className="text-center space-y-6 py-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-blue-500/20 p-4">
                <CheckCircle2 className="size-12 text-blue-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">
              Cuenta creada exitosamente
            </h2>
            <div className="space-y-3">
              <p className="text-zinc-300 text-base">
                Tu cuenta ha sido creada y está pendiente de aprobación por parte del administrador.
              </p>
              <p className="text-zinc-400 text-sm">
                Recibirás una notificación cuando tu cuenta sea aprobada. Por favor, intenta iniciar sesión más tarde.
              </p>
            </div>
            <div className="pt-4">
              <Button
                onClick={() => {
                  onOpenChange(false);
                  setIsSuccess(false);
                  setFormData({ name: "", email: "", password: "", confirmPassword: "" });
                  setErrors({});
                  onSwitchToLogin?.();
                }}
                className="w-full min-h-[48px] text-base sm:text-sm bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:scale-[0.98] shadow-lg shadow-red-500/50"
              >
                Entendido
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <Logo variant="compact" showLink={false} className="justify-center mb-2" />
              <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/30 w-fit mx-auto">
                Crear Cuenta
              </Badge>
              <DialogTitle className="text-3xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent text-center pt-2">
                Únete a Kraken
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-400 text-center">
                Crea tu cuenta para comenzar tu entrenamiento
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-6">
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
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    placeholder="Tu nombre completo"
                    className={`min-h-[48px] pl-10 text-base sm:text-sm bg-white/5 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-red-500/20 transition-all ${
                      errors.name ? "border-red-500 focus:border-red-500" : "border-red-500/20 focus:border-red-500/50"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-400">{errors.name}</p>
                )}
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
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    placeholder="tucorreo@ejemplo.com"
                    className={`min-h-[48px] pl-10 text-base sm:text-sm bg-white/5 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-red-500/20 transition-all ${
                      errors.email ? "border-red-500 focus:border-red-500" : "border-red-500/20 focus:border-red-500/50"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email}</p>
                )}
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
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                    placeholder="Mínimo 6 caracteres"
                    className={`min-h-[48px] pl-10 text-base sm:text-sm bg-white/5 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-red-500/20 transition-all ${
                      errors.password ? "border-red-500 focus:border-red-500" : "border-red-500/20 focus:border-red-500/50"
                    }`}
                  />
                </div>
                {errors.password ? (
                  <p className="text-xs text-red-400">{errors.password}</p>
                ) : (
                  <p className="text-xs text-zinc-500">La contraseña debe tener al menos 6 caracteres</p>
                )}
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
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                    }}
                    placeholder="Confirma tu contraseña"
                    className={`min-h-[48px] pl-10 text-base sm:text-sm bg-white/5 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-red-500/20 transition-all ${
                      errors.confirmPassword ? "border-red-500 focus:border-red-500" : "border-red-500/20 focus:border-red-500/50"
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[48px] text-base sm:text-sm gap-2 bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white hover:from-red-600 hover:via-red-700 hover:to-red-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/50 hover:shadow-red-500/70 transition-all duration-300"
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

            <div className="text-center space-y-3 pt-4">
              <p className="text-sm text-zinc-400">
                ¿Ya tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onSwitchToLogin?.();
                  }}
                  className="text-red-400 hover:text-red-300 font-semibold transition-colors"
                >
                  Inicia sesión aquí
                </button>
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

