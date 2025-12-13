"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
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
        showToast(data.error || "Invalid or expired token", "error");
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      setIsValid(false);
      showToast("Error verifying token", "error");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      showToast("Please complete all fields", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    if (!token) {
      showToast("Invalid token", "error");
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
        showToast("Password reset successfully", "success");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        showToast(data.error || "Error resetting password", "error");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      showToast("Error resetting password", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin text-red-500 text-4xl">⏳</div>
          <p className="text-zinc-400">Verifying token...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-20 flex items-center justify-center flex-1">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-500/20 p-4">
                <XCircle className="size-12 text-red-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-orbitron)]">
              Invalid or Expired Token
            </h1>
            <p className="text-zinc-400">
              The password reset link is invalid or has expired. Please request a new link.
            </p>
            <Link href="/login">
              <Button className="w-full bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white hover:from-red-600 hover:via-red-700 hover:to-red-600 shadow-lg shadow-red-500/50 hover:shadow-red-500/70">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-20 flex items-center justify-center flex-1">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-500/20 p-4">
                <CheckCircle2 className="size-12 text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-orbitron)]">
              Password Reset
            </h1>
            <p className="text-zinc-400">
              Your password has been reset successfully. You will be redirected to login in a few seconds.
            </p>
            <Link href="/login">
              <Button className="w-full bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white hover:from-red-600 hover:via-red-700 hover:to-red-600 shadow-lg shadow-red-500/50 hover:shadow-red-500/70">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex items-center justify-center flex-1">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-4">
            <Logo variant="compact" showLink={false} className="justify-center mb-2" />
            <Badge className="bg-gradient-to-r from-red-500/30 via-red-600/25 to-red-500/30 border border-red-500/40 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/30 w-fit mx-auto">
              Reset Password
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent">
              New Password
            </h1>
            <p className="text-sm text-zinc-400">
              Enter your new password. It must be at least 6 characters.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="pl-10 pr-10 border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
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
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10 border-red-500/20 bg-white/5 text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
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
              className="w-full gap-2 bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white hover:from-red-600 hover:via-red-700 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/50 hover:shadow-red-500/70"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="size-5 sm:size-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

