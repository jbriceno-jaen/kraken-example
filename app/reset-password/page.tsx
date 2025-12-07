"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import Navbar from "@/components/navbar";
import { Logo } from "@/components/logo";
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      verifyToken(tokenParam);
    } else {
      setIsValidating(false);
      setIsValid(false);
    }
  }, [searchParams]);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch("/api/auth/verify-reset-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: tokenToVerify }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setIsValid(true);
      } else {
        setIsValid(false);
        showToast(data.error || "Token inválido o expirado", "error");
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      setIsValid(false);
      showToast("Error al verificar el token", "error");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      showToast("Por favor completa todos los campos", "error");
      return;
    }

    if (password.length < 6) {
      showToast("La contraseña debe tener al menos 6 caracteres", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Las contraseñas no coinciden", "error");
      return;
    }

    if (!token) {
      showToast("Token no válido", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        showToast("Contraseña restablecida exitosamente", "success");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        showToast(data.error || "Error al restablecer la contraseña", "error");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      showToast("Error al restablecer la contraseña", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin text-red-500 text-4xl">⏳</div>
          <p className="text-zinc-400">Verificando token...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-500/20 p-4">
                <XCircle className="size-12 text-red-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-orbitron)]">
              Token Inválido o Expirado
            </h1>
            <p className="text-zinc-400">
              El enlace de restablecimiento de contraseña no es válido o ha expirado. Por favor, solicita un nuevo enlace.
            </p>
            <Link href="/login">
              <Button className="w-full min-h-[48px] bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white hover:from-red-600 hover:via-red-700 hover:to-red-600 shadow-lg shadow-red-500/50 hover:shadow-red-500/70 transition-all duration-300">
                Volver al Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-500/20 p-4">
                <CheckCircle2 className="size-12 text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-orbitron)]">
              Contraseña Restablecida
            </h1>
            <p className="text-zinc-400">
              Tu contraseña ha sido restablecida exitosamente. Serás redirigido al login en unos segundos.
            </p>
            <Link href="/login">
              <Button className="w-full min-h-[48px] bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white hover:from-red-600 hover:via-red-700 hover:to-red-600 shadow-lg shadow-red-500/50 hover:shadow-red-500/70 transition-all duration-300">
                Ir al Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-4">
            <Logo variant="compact" showLink={false} className="justify-center mb-2" />
            <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/30 w-fit mx-auto">
              Restablecer Contraseña
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent">
              Nueva Contraseña
            </h1>
            <p className="text-sm text-zinc-400">
              Ingresa tu nueva contraseña. Debe tener al menos 6 caracteres.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="min-h-[48px] pl-10 pr-10 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu contraseña"
                  className="min-h-[48px] pl-10 pr-10 text-base sm:text-sm border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
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
                  Restableciendo...
                </>
              ) : (
                <>
                  Restablecer Contraseña
                  <ArrowRight className="size-5 sm:size-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Volver al Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

