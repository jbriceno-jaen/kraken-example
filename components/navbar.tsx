"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut, User, Settings, CalendarClock, Trophy, Dumbbell, Users, Clock, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Logo } from "@/components/logo";

const links = [
  { href: "#workouts", label: "Workouts" },
  { href: "#coaches", label: "Community" },
  { href: "#physical-changes", label: "Results" },
  { href: "#pricing", label: "Pricing" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
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
        // Handle both string and null image values
        const imageUrl = data.image && typeof data.image === 'string' ? data.image : null;
        setUserImage(imageUrl);
        setUserData({
          name: data.name,
          email: data.email,
          subscriptionExpires: data.subscriptionExpires,
          wodEnabled: data.wodEnabled,
          image: imageUrl,
        });
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
      setUserData(null);
    }
  }, [status, session]);

  // Listen for profile image updates
  useEffect(() => {
    const handleImageUpdate = () => {
      fetchUserImage();
    };

    window.addEventListener("profileImageUpdated", handleImageUpdate);
    // Also refresh periodically to catch updates
    const interval = setInterval(() => {
      if (status === "authenticated" && session?.user?.id) {
        fetchUserImage();
      }
    }, 5000); // Refresh every 5 seconds

    return () => {
      window.removeEventListener("profileImageUpdated", handleImageUpdate);
      clearInterval(interval);
    };
  }, [status, session]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-red-500/20 bg-black/80 backdrop-blur-xl transition-all duration-300 shadow-lg shadow-black/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Logo variant="default" />
        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-300 sm:flex">
          {session ? (
            <>
              {session.user?.role === "manager" ? (
                <>
                  <Link 
                    href="/manager/users" 
                    className={`py-2 transition-all duration-300 active:scale-95 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-red-500 after:to-red-600 after:transition-all after:duration-300 font-[family-name:var(--font-orbitron)] ${
                      pathname === "/manager/users"
                        ? "text-red-400 font-semibold after:w-full animate-pulse" 
                        : "hover:text-white after:w-0 hover:after:w-full"
                    }`}
                  >
                    Users
                  </Link>
                  <Link 
                    href="/manager/wod" 
                    className={`py-2 transition-all duration-300 active:scale-95 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-red-500 after:to-red-600 after:transition-all after:duration-300 font-[family-name:var(--font-orbitron)] ${
                      pathname === "/manager/wod" 
                        ? "text-red-400 font-semibold after:w-full animate-pulse" 
                        : "hover:text-white after:w-0 hover:after:w-full"
                    }`}
                  >
                    WOD
                  </Link>
                  <Link 
                    href="/manager/classes" 
                    className={`py-2 transition-all duration-300 active:scale-95 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-red-500 after:to-red-600 after:transition-all after:duration-300 font-[family-name:var(--font-orbitron)] ${
                      pathname === "/manager/classes"
                        ? "text-red-400 font-semibold after:w-full animate-pulse" 
                        : "hover:text-white after:w-0 hover:after:w-full"
                    }`}
                  >
                    Classes
                  </Link>
                  <Link 
                    href="/manager/schedules" 
                    className={`py-2 transition-all duration-300 active:scale-95 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-red-500 after:to-red-600 after:transition-all after:duration-300 font-[family-name:var(--font-orbitron)] ${
                      pathname === "/manager/schedules"
                        ? "text-red-400 font-semibold after:w-full animate-pulse" 
                        : "hover:text-white after:w-0 hover:after:w-full"
                    }`}
                  >
                    Schedules
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/dashboard/reservations" 
                    className={`py-2 transition-all duration-300 active:scale-95 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-red-500 after:to-red-600 after:transition-all after:duration-300 font-[family-name:var(--font-orbitron)] ${
                      pathname === "/dashboard/reservations"
                        ? "text-red-400 font-semibold after:w-full animate-pulse" 
                        : "hover:text-white after:w-0 hover:after:w-full"
                    }`}
                  >
                    Reservations
                  </Link>
                  <Link 
                    href="/dashboard/personal-records" 
                    className={`py-2 transition-all duration-300 active:scale-95 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-red-500 after:to-red-600 after:transition-all after:duration-300 font-[family-name:var(--font-orbitron)] ${
                      pathname === "/dashboard/personal-records"
                        ? "text-red-400 font-semibold after:w-full animate-pulse" 
                        : "hover:text-white after:w-0 hover:after:w-full"
                    }`}
                  >
                    My PR's
                  </Link>
                  {userData?.wodEnabled && (
                    <Link 
                      href="/dashboard/schedule" 
                      className={`py-2 transition-all duration-300 active:scale-95 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-red-500 after:to-red-600 after:transition-all after:duration-300 font-[family-name:var(--font-orbitron)] ${
                        pathname === "/dashboard/schedule"
                          ? "text-red-400 font-semibold after:w-full animate-pulse" 
                          : "hover:text-white after:w-0 hover:after:w-full"
                      }`}
                    >
                      Programming
                    </Link>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="py-2 transition-all duration-300 hover:text-white active:scale-95 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-red-500 after:to-red-600 after:transition-all after:duration-300 hover:after:w-full font-[family-name:var(--font-orbitron)]"
                >
                  {link.label}
                </a>
              ))}
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {!session && (
            <div className="hidden items-center gap-2 sm:flex">
              <Button 
                onClick={() => setRegisterOpen(true)}
                className="bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white hover:from-red-600 hover:via-red-700 hover:to-red-600 shadow-lg shadow-red-500/50 hover:shadow-red-500/70"
              >
                Sign Up
              </Button>
              <Button 
                onClick={() => setLoginOpen(true)}
                className="border border-red-500/30 text-white"
              >
                Sign In
              </Button>
            </div>
          )}
          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="relative size-10 rounded-full border border-red-500/30 text-white hover:bg-black/20 active:scale-95 transition-all p-0 focus:outline-none focus:ring-2 focus:ring-red-500/50 overflow-hidden"
                >
                  <Avatar className="size-10 border-0">
                    {userImage ? (
                      <AvatarImage 
                        src={userImage} 
                        alt={userData?.name || "User"}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="bg-red-500/20 text-white border-0">
                      <User className="size-5" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 border-black/50 bg-black/95 backdrop-blur-xl text-white" align="end">
                <DropdownMenuLabel className="font-[family-name:var(--font-orbitron)]">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 border border-red-500/30">
                        {userImage ? (
                          <AvatarImage 
                            src={userImage} 
                            alt={userData?.name || "User"}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="bg-red-500/20 text-white border-0">
                          <User className="size-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{userData?.name || "User"}</p>
                        <p className="text-xs text-zinc-400 truncate">{userData?.email}</p>
                      </div>
                    </div>
                    {userData?.subscriptionExpires && (
                      <div className="pt-2 border-t border-black/50">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-xs text-zinc-400">Subscription</p>
                          {(() => {
                            const expires = new Date(userData.subscriptionExpires);
                            const now = new Date();
                            const diffTime = expires.getTime() - now.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            
                            if (diffDays < 0) {
                              return (
                                <Badge className="bg-red-500/20 border border-red-500/30 text-red-400 font-[family-name:var(--font-orbitron)] text-xs px-2 py-0.5">
                                  Expired
                                </Badge>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        <p className="text-xs text-white">
                          {(() => {
                            const expires = new Date(userData.subscriptionExpires);
                            const now = new Date();
                            const diffTime = expires.getTime() - now.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            
                            if (diffDays < 0) {
                              return "Expired";
                            } else if (diffDays <= 7) {
                              return `Expires in ${diffDays} days`;
                            } else {
                              return `Expires: ${expires.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
                            }
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {session?.user?.role === "manager" ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/manager/users"
                        className={`flex items-center cursor-pointer font-[family-name:var(--font-orbitron)] hover:bg-white/10 ${
                          pathname === "/manager/users" ? "bg-red-500/20 text-red-400" : ""
                        }`}
                      >
                        <Users className="mr-2 size-4" />
                        Users
                        {(pathname === "/manager/users" || pathname === "/manager/usuarios") && (
                          <span className="ml-auto size-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/manager/wod"
                        className={`flex items-center cursor-pointer font-[family-name:var(--font-orbitron)] hover:bg-white/10 ${
                          pathname === "/manager/wod" ? "bg-red-500/20 text-red-400" : ""
                        }`}
                      >
                        <Dumbbell className="mr-2 size-4" />
                        Daily WOD
                        {pathname === "/manager/wod" && (
                          <span className="ml-auto size-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/manager/classes"
                        className={`flex items-center cursor-pointer font-[family-name:var(--font-orbitron)] hover:bg-white/10 ${
                          pathname === "/manager/classes" ? "bg-red-500/20 text-red-400" : ""
                        }`}
                      >
                        <CalendarClock className="mr-2 size-4" />
                        Classes
                        {pathname === "/manager/classes" && (
                          <span className="ml-auto size-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/manager/schedules"
                        className={`flex items-center cursor-pointer font-[family-name:var(--font-orbitron)] hover:bg-white/10 ${
                          pathname === "/manager/schedules" ? "bg-red-500/20 text-red-400" : ""
                        }`}
                      >
                        <Clock className="mr-2 size-4" />
                        Schedules
                        {pathname === "/manager/schedules" && (
                          <span className="ml-auto size-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/profile"
                        className={`flex items-center cursor-pointer font-[family-name:var(--font-orbitron)] hover:bg-white/10 ${
                          pathname === "/dashboard/profile" ? "bg-red-500/20 text-red-400" : ""
                        }`}
                      >
                        <User className="mr-2 size-4" />
                        Profile
                        {pathname === "/dashboard/profile" && (
                          <span className="ml-auto size-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/reservations"
                        className={`flex items-center cursor-pointer font-[family-name:var(--font-orbitron)] hover:bg-white/10 ${
                          pathname === "/dashboard/reservations" ? "bg-red-500/20 text-red-400" : ""
                        }`}
                      >
                        <CalendarClock className="mr-2 size-4" />
                        Reservations
                        {pathname === "/dashboard/reservations" && (
                          <span className="ml-auto size-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/profile"
                        className={`flex items-center cursor-pointer font-[family-name:var(--font-orbitron)] hover:bg-white/10 ${
                          pathname === "/dashboard/profile" ? "bg-red-500/20 text-red-400" : ""
                        }`}
                      >
                        <User className="mr-2 size-4" />
                        Profile
                        {pathname === "/dashboard/profile" && (
                          <span className="ml-auto size-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/personal-records"
                        className={`flex items-center cursor-pointer font-[family-name:var(--font-orbitron)] hover:bg-white/10 ${
                          pathname === "/dashboard/personal-records" ? "bg-red-500/20 text-red-400" : ""
                        }`}
                      >
                        <Trophy className="mr-2 size-4" />
                        My PR's
                        {pathname === "/dashboard/personal-records" && (
                          <span className="ml-auto size-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                    {userData?.wodEnabled && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/schedule"
                          className={`flex items-center cursor-pointer font-[family-name:var(--font-orbitron)] hover:bg-white/10 ${
                            pathname === "/dashboard/schedule" ? "bg-red-500/20 text-red-400" : ""
                          }`}
                        >
                          <Dumbbell className="mr-2 size-4" />
                          Programming
                          {pathname === "/dashboard/schedule" && (
                            <span className="ml-auto size-2 rounded-full bg-red-500 animate-pulse" />
                          )}
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild>
                  <Link
                    href="/"
                    className="flex items-center cursor-pointer font-[family-name:var(--font-orbitron)] hover:bg-white/10"
                  >
                    <Home className="mr-2 size-4" />
                    Back to Home
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer font-[family-name:var(--font-orbitron)]"
                >
                  <LogOut className="mr-2 size-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {!session && (
            <button
              aria-label="Toggle navigation"
              onClick={toggle}
              className="flex size-11 items-center justify-center rounded-lg border border-black/50 text-white active:scale-95 active:bg-black/20 transition-all sm:hidden min-w-[44px] min-h-[44px]"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          )}
        </div>
      </div>
      {open && !session && (
        <div className="sm:hidden border-t border-black/50 bg-black/95 backdrop-blur-xl">
          <div className="mx-4 my-4 space-y-2 rounded-2xl border border-black/50 bg-black/80 p-4 text-sm text-zinc-200 shadow-lg">
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
                  className="w-full min-h-[48px] text-base bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white hover:from-red-600 hover:via-red-700 hover:to-red-600 active:scale-[0.98] shadow-lg shadow-red-500/50 hover:shadow-red-500/70 transition-all duration-300"
                >
                  Sign Up
                </Button>
                <Button 
                  onClick={() => {
                    setLoginOpen(true);
                    close();
                  }}
                  className="w-full min-h-[48px] text-base border border-black/50 text-white active:bg-black/20 active:scale-[0.98]"
                >
                  Sign In
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
