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
        showToast(data.message || "If the email exists, you will receive instructions to reset your password.", "info");
        
        setTimeout(() => {
          onOpenChange(false);
          setIsSuccess(false);
          setEmail("");
        }, 3000);
      } else {
        showToast(data.error || "Error processing request. Please try again.", "error");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      showToast("Error processing request. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-red-500/50 bg-black text-white max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          <div className="text-center space-y-4 py-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-500/20 p-3">
                <CheckCircle2 className="size-10 text-green-400" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-[family-name:var(--font-orbitron)]">
              Email Sent
            </h2>
            <p className="text-sm text-zinc-500 font-light">
              If the email exists in our system, you will receive instructions to reset your password.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <Logo variant="compact" showLink={false} className="justify-center mb-1" />
              <Badge className="bg-black border border-red-500/30 text-red-500/90 backdrop-blur-sm font-[family-name:var(--font-orbitron)] text-xs px-3 py-1 w-fit mx-auto">
                Recover Password
              </Badge>
              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight font-[family-name:var(--font-orbitron)] text-white text-center pt-1">
                Forgot Password?
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-zinc-500 text-center font-light">
                Enter your email address and we'll send you instructions to reset your password
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <label htmlFor="reset-email" className="text-xs sm:text-sm font-medium text-white font-[family-name:var(--font-orbitron)]">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-600 pointer-events-none z-10" />
                  <Input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="!pl-11 border-red-500/50 bg-black/30 text-white placeholder:text-zinc-500 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full gap-2 bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white hover:from-red-600 hover:via-red-700 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/50"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Sending...
                  </>
                ) : (
                  <>
                    Send instructions
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

