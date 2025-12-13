"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Users } from "lucide-react";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "manager") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] pt-24">
          <div className="relative size-16">
            <div className="size-full animate-spin rounded-full border-4 border-red-500/20 border-t-red-500" />
            <Users className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-red-400 animate-pulse" />
          </div>
          <p className="mt-4 text-sm font-semibold text-zinc-400 font-[family-name:var(--font-orbitron)]">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || (session?.user?.role !== "manager")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black flex flex-col">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pt-24 pb-6 sm:px-6 lg:px-8 lg:pt-8 lg:pb-8 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

