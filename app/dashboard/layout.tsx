"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, User, Trophy, Dumbbell, type LucideIcon } from "lucide-react";
import Navbar from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const navigationItems: Array<{ id: string; title: string; icon: LucideIcon; href: string }> = [
  {
    id: "reservas",
    title: "Reservas",
    icon: CalendarClock,
    href: "/dashboard/reservas",
  },
  {
    id: "perfil",
    title: "Perfil",
    icon: User,
    href: "/dashboard/perfil",
  },
  {
    id: "prs",
    title: "Mis PR's",
    icon: Trophy,
    href: "/dashboard/prs",
  },
  {
    id: "programacion",
    title: "Programación",
    icon: Dumbbell,
    href: "/dashboard/programacion",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
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
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.id} href={item.href}>
                  <Card
                    className={cn(
                      "group cursor-pointer border bg-gradient-to-br transition-all duration-500 active:scale-[0.98]",
                      "p-4 sm:p-6",
                      "min-h-[90px] sm:min-h-[100px]",
                      "sm:hover:scale-[1.02] sm:hover:shadow-xl",
                      isActive
                        ? "border-red-500/50 bg-gradient-to-br from-red-500/20 via-black to-black shadow-2xl shadow-red-500/30 ring-2 ring-red-500/20"
                        : "border-red-500/20 bg-gradient-to-br from-white/5 via-black/50 to-black active:border-red-500/40 active:bg-gradient-to-br active:from-red-500/10 active:via-black/50 active:to-black sm:hover:border-red-500/30"
                    )}
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                      <div
                        className={cn(
                          "flex items-center justify-center rounded-xl transition-all duration-300 shadow-lg flex-shrink-0",
                          "size-12 sm:size-14",
                          isActive
                            ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-500/50 animate-pulse"
                            : "bg-red-500/20 text-red-400 group-active:bg-red-500/30 group-active:shadow-red-500/30 sm:group-hover:bg-red-500/30"
                        )}
                      >
                        <Icon className="size-6 sm:size-7" />
                      </div>
                      <div className="space-y-1 flex-1 min-w-0 text-center sm:text-left">
                        <p className="text-base sm:text-lg font-semibold font-[family-name:var(--font-orbitron)] text-white">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
}

