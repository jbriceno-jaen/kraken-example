"use client";

import { useState } from "react";
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
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordModal({ open, onOpenChange }: ForgotPasswordModalProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        showToast(data.message || "Si el correo existe, recibirás instrucciones para restablecer tu contraseña.", "info");
        
        setTimeout(() => {
          onOpenChange(false);
          setIsSuccess(false);
          setEmail("");
        }, 3000);
      } else {
        showToast(data.error || "Error al procesar la solicitud. Por favor intenta de nuevo.", "error");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      showToast("Error al procesar la solicitud. Por favor intenta de nuevo.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black text-white max-w-md">
        {isSuccess ? (
          <div className="text-center space-y-6 py-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-500/20 p-4">
                <CheckCircle2 className="size-12 text-green-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron)]">
              Correo enviado
            </h2>
            <p className="text-zinc-400">
              Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <Logo variant="compact" showLink={false} className="justify-center mb-2" />
              <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/30 w-fit mx-auto">
                Recuperar Contraseña
              </Badge>
              <DialogTitle className="text-3xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent text-center pt-2">
                ¿Olvidaste tu contraseña?
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-400 text-center">
                Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-6">
              <div className="space-y-2">
                <label htmlFor="reset-email" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
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
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar instrucciones
                    <ArrowRight className="size-5 sm:size-4" />
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

