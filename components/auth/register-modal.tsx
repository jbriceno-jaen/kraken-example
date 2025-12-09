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
      newErrors.name = "Name is required";
    } else if (trimmedName.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (trimmedName.length > 255) {
      newErrors.name = "Name cannot exceed 255 characters";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(trimmedName)) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    } else if (formData.email.length > 255) {
      newErrors.email = "Email cannot exceed 255 characters";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (formData.password.length > 128) {
      newErrors.password = "Password cannot exceed 128 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
        let errorMessage = "Error creating account";
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
          showToast("Account created. Waiting for administrator approval.", "info");
        } else {
          showToast("Account created successfully!", "success");
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
        showToast(data.error || "Error creating account", "error");
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error instanceof Error ? error.message : "Error creating account. Please try again.";
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
      <DialogContent className="border border-red-500/50 bg-black text-white max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          <div className="text-center space-y-4 py-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-blue-500/20 p-3">
                <CheckCircle2 className="size-10 text-blue-400" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-[family-name:var(--font-orbitron)]">
              Account Created
            </h2>
            <div className="space-y-2">
              <p className="text-zinc-500 text-sm font-light">
                Your account has been created and is pending approval by the administrator.
              </p>
              <p className="text-zinc-600 text-xs font-light">
                You will receive a notification when your account is approved. Please try signing in later.
              </p>
            </div>
            <div className="pt-3">
              <Button
                onClick={() => {
                  onOpenChange(false);
                  setIsSuccess(false);
                  setFormData({ name: "", email: "", password: "", confirmPassword: "" });
                  setErrors({});
                  onSwitchToLogin?.();
                }}
                className="w-full bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white hover:from-red-600 hover:via-red-700 hover:to-red-600 shadow-lg shadow-red-500/50"
              >
                Got it
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <Logo variant="compact" showLink={false} className="justify-center mb-1" />
              <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs px-3 py-1 w-fit mx-auto">
                Create Account
              </Badge>
              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] text-white text-center pt-1">
                Join Venom
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-zinc-500 text-center font-light">
                Create your account to start your training
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-600 pointer-events-none z-10" />
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    placeholder="Your full name"
                    className={`!pl-11 bg-black/30 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-red-500/20 ${
                      errors.name ? "border-red-500 focus:border-red-500" : "border-red-500/50 focus:border-red-500/70"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-400">{errors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-600 pointer-events-none z-10" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    placeholder="your.email@example.com"
                    className={`!pl-11 bg-black/30 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-red-500/20 ${
                      errors.email ? "border-red-500 focus:border-red-500" : "border-red-500/50 focus:border-red-500/70"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-600 pointer-events-none z-10" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                    placeholder="Minimum 6 characters"
                    className={`!pl-11 bg-black/30 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-red-500/20 ${
                      errors.password ? "border-red-500 focus:border-red-500" : "border-red-500/50 focus:border-red-500/70"
                    }`}
                  />
                </div>
                {errors.password ? (
                  <p className="text-xs text-red-400">{errors.password}</p>
                ) : (
                  <p className="text-xs text-zinc-500">Password must be at least 6 characters</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-600 pointer-events-none z-10" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                    }}
                    placeholder="Confirm your password"
                    className={`min-h-[48px] !pl-11 text-base sm:text-sm bg-white/5 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-red-500/20 transition-all ${
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
                className="w-full gap-2 bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white hover:from-red-600 hover:via-red-700 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/50 hover:shadow-red-500/70"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="size-5 sm:size-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center space-y-2 pt-3">
              <p className="text-sm text-zinc-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onSwitchToLogin?.();
                  }}
                  className="text-red-500 hover:text-red-400 font-semibold transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

