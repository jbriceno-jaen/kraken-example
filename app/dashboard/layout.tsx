"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscriptionStatus, setSubscriptionStatus] = useState<{ expired: boolean; expires: string | null } | null>(null);

  // Check subscription status
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "client") {
      const checkSubscription = async () => {
        try {
          const res = await fetch("/api/user-data");
          const data = await res.json();
          
          if (data.subscriptionExpires) {
            const now = new Date();
            const expirationDate = new Date(data.subscriptionExpires);
            expirationDate.setHours(23, 59, 59, 999);
            const expired = now > expirationDate;
            setSubscriptionStatus({ expired, expires: data.subscriptionExpires });
            
            if (expired) {
              // Sign out and redirect to login with message
              await signOut({ redirect: false });
              router.push("/login?subscriptionExpired=true");
            }
          } else {
            setSubscriptionStatus({ expired: false, expires: null });
          }
        } catch (error) {
          console.error("Error checking subscription:", error);
        }
      };
      
      checkSubscription();
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role === "manager") {
      router.push("/manager");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative size-16">
            <div className="size-full animate-spin rounded-full border-4 border-red-500/30 border-t-red-500" />
            <User className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-red-400 animate-pulse" />
          </div>
          <p className="mt-4 text-sm font-semibold text-zinc-400 font-[family-name:var(--font-orbitron)]">
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || (session?.user?.role === "manager")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black flex flex-col">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

