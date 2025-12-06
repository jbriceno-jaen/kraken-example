"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut, User, Settings, CalendarClock, Trophy, Dumbbell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoginModal } from "@/components/auth/login-modal";
import { RegisterModal } from "@/components/auth/register-modal";
import { ForgotPasswordModal } from "@/components/auth/forgot-password-modal";

const links = [
  { href: "#workouts", label: "Workouts" },
  { href: "#coaches", label: "Comunidad" },
  { href: "#pricing", label: "Pricing" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    name: string | null;
    email: string | null;
    subscriptionExpires: string | null;
    wodEnabled: boolean;
    image: string | null;
  } | null>(null);
  
  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Fetch user image and data
  const fetchUserImage = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch("/api/user-data");
      if (res.ok) {
        const data = await res.json();
        setUserImage(data.image || null);
        setUserData(data);
      }
    } catch (error) {
      console.error("Error fetching user image:", error);
    }
  };

  // Fetch image on mount and when session changes
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchUserImage();
    } else {
      setUserImage(null);
    }
  }, [status, session]);

  // Listen for profile image updates
  useEffect(() => {
    const handleImageUpdate = () => {
      fetchUserImage();
    };

    window.addEventListener("profileImageUpdated", handleImageUpdate);
    return () => {
      window.removeEventListener("profileImageUpdated", handleImageUpdate);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-red-500/20 bg-black/80 backdrop-blur-xl transition-all duration-300 shadow-lg shadow-black/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-white group">
          <span className="rounded-full bg-gradient-to-r from-red-500 to-red-600 px-3 py-1 text-xs font-bold uppercase tracking-tight font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/50 group-hover:shadow-red-500/70 transition-all duration-300 group-hover:scale-105">
            Kraken
          </span>
          <span className="text-lg font-bold font-[family-name:var(--font-orbitron)] group-hover:text-red-400 transition-colors">Elite Fitness</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-300 sm:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="py-2 transition-all duration-300 hover:text-white active:scale-95 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-red-500 after:to-red-600 after:transition-all after:duration-300 hover:after:w-full font-[family-name:var(--font-orbitron)]"
            >
              {link.label}
            </a>
          ))}
          {session && (
            <Link href="/dashboard" className="py-2 transition-all duration-300 hover:text-red-400 active:scale-95 font-[family-name:var(--font-orbitron)] relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-red-500 after:to-red-600 after:transition-all after:duration-300 hover:after:w-full">
              Dashboard
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {!session && (
            <div className="hidden items-center gap-2 sm:flex">
              <Button 
                onClick={() => setRegisterOpen(true)}
                className="min-h-[40px] bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:scale-[0.98] shadow-lg shadow-red-500/50 transition-all duration-300"
              >
                Registrarse
              </Button>
              <Button 
                onClick={() => setLoginOpen(true)}
                className="min-h-[40px] border border-red-500/30 text-white active:bg-red-500/10 active:border-red-500/50 active:scale-[0.98] transition-all duration-300"
              >
                Iniciar sesión
              </Button>
            </div>
          )}
          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative size-10 rounded-full border border-white/15 text-white hover:bg-white/10 active:scale-95 transition-all p-0"
                >
                  <Avatar className="size-10 border border-white/15">
                    <AvatarImage src={userImage || undefined} alt={userData?.name || "User"} />
                    <AvatarFallback className="bg-red-500/20 text-white border-0">
                      <User className="size-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 border-white/10 bg-black/95 backdrop-blur-xl text-white" align="end">
                <DropdownMenuLabel className="font-[family-name:var(--font-orbitron)]">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 border border-red-500/30">
                        <AvatarImage src={userImage || undefined} alt={userData?.name || "User"} />
                        <AvatarFallback className="bg-red-500/20 text-white border-0">
                          <User className="size-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{userData?.name || "Usuario"}</p>
                        <p className="text-xs text-zinc-400 truncate">{userData?.email}</p>
                      </div>
                    </div>
                    {userData?.subscriptionExpires && (
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-xs text-zinc-400">Suscripción</p>
                        <p className="text-xs text-white">
                          {(() => {
                            const expires = new Date(userData.subscriptionExpires);
                            const now = new Date();
                            const diffTime = expires.getTime() - now.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            
                            if (diffDays < 0) {
                              return "Expirada";
                            } else if (diffDays <= 7) {
                              return `Expira en ${diffDays} días`;
                            } else {
                              return `Expira: ${expires.toLocaleDateString("es-ES", { month: "short", day: "numeric" })}`;
                            }
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/reservas"
                    className="flex items-center cursor-pointer font-[family-name:var(--font-orbitron)] hover:bg-white/10"
                  >
                    <CalendarClock className="mr-2 size-4" />
                    Reservas
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/perfil"
                    className="flex items-center cursor-pointer font-[family-name:var(--font-orbitron)] hover:bg-white/10"
                  >
                    <Settings className="mr-2 size-4" />
                    Editar Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/prs"
                    className="flex items-center cursor-pointer font-[family-name:var(--font-orbitron)] hover:bg-white/10"
                  >
                    <Trophy className="mr-2 size-4" />
                    Mis PR's
                  </Link>
                </DropdownMenuItem>
                {userData?.wodEnabled && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/programacion"
                      className="flex items-center cursor-pointer font-[family-name:var(--font-orbitron)] hover:bg-white/10"
                    >
                      <Dumbbell className="mr-2 size-4" />
                      Programación
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer font-[family-name:var(--font-orbitron)]"
                >
                  <LogOut className="mr-2 size-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <button
            aria-label="Toggle navigation"
            onClick={toggle}
            className="flex size-11 items-center justify-center rounded-lg border border-white/15 text-white active:scale-95 active:bg-white/5 transition-all sm:hidden min-w-[44px] min-h-[44px]"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="sm:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl">
          <div className="mx-4 my-4 space-y-2 rounded-2xl border border-white/10 bg-black/80 p-4 text-sm text-zinc-200 shadow-lg">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={close}
                className="block rounded-lg px-4 py-3.5 min-h-[48px] flex items-center transition active:bg-white/10 active:text-white font-[family-name:var(--font-orbitron)]"
              >
                {link.label}
              </a>
            ))}
            {session && (
              <Link
                href="/dashboard"
                onClick={close}
                className="block rounded-lg px-4 py-3.5 min-h-[48px] flex items-center transition active:bg-white/10 active:text-white font-[family-name:var(--font-orbitron)]"
              >
                Dashboard
              </Link>
            )}
            {!session && (
              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  onClick={() => {
                    setRegisterOpen(true);
                    close();
                  }}
                  className="w-full min-h-[48px] text-base bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:scale-[0.98] shadow-lg shadow-red-500/50"
                >
                  Registrarse
                </Button>
                <Button 
                  onClick={() => {
                    setLoginOpen(true);
                    close();
                  }}
                  className="w-full min-h-[48px] text-base border border-white/20 text-white active:bg-white/10 active:scale-[0.98]"
                >
                  Iniciar sesión
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <LoginModal 
        open={loginOpen} 
        onOpenChange={setLoginOpen}
        onSwitchToRegister={() => setRegisterOpen(true)}
        onForgotPassword={() => setForgotPasswordOpen(true)}
      />
      <RegisterModal 
        open={registerOpen} 
        onOpenChange={setRegisterOpen}
        onSwitchToLogin={() => setLoginOpen(true)}
      />
      <ForgotPasswordModal 
        open={forgotPasswordOpen} 
        onOpenChange={setForgotPasswordOpen}
      />
    </header>
  );
}
