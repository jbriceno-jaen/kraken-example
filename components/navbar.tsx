"use client";

import { useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const links = [
  { href: "#workouts", label: "Workouts" },
  { href: "#coaches", label: "Comunidad" },
  { href: "#pricing", label: "Pricing" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur transition-all duration-300">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-white">
          <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase tracking-tight">
            Kraken
          </span>
          <span className="text-lg font-semibold">Elite Fitness</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-300 sm:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-all duration-200 hover:text-white hover:scale-105 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-red-500 after:transition-all after:duration-200 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
          <SignedIn>
            <Link href="/dashboard" className="transition hover:text-white">
              Dashboard
            </Link>
          </SignedIn>
        </nav>
        <div className="flex items-center gap-3">
          <SignedOut>
            <div className="hidden items-center gap-2 sm:flex">
              <SignUpButton mode="modal">
                <Button className="bg-red-500 text-white hover:bg-red-400">Registrarse</Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button className="border border-white/20 text-white hover:bg-white/10">Iniciar sesión</Button>
              </SignInButton>
            </div>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <button
            aria-label="Toggle navigation"
            onClick={toggle}
            className="flex size-10 items-center justify-center rounded-lg border border-white/15 text-white sm:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="sm:hidden">
          <div className="mx-4 mb-4 space-y-3 rounded-2xl border border-white/10 bg-black/80 p-4 text-sm text-zinc-200 shadow-lg">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={close}
                className="block rounded-lg px-3 py-2 transition hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <SignedIn>
              <Link
                href="/dashboard"
                onClick={close}
                className="block rounded-lg px-3 py-2 transition hover:bg-white/5 hover:text-white"
              >
                Dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <div className="space-y-2">
                <SignUpButton mode="modal">
                  <Button className="w-full bg-red-500 text-white hover:bg-red-400">Registrarse</Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <Button className="w-full border border-white/20 text-white hover:bg-white/10">Iniciar sesión</Button>
                </SignInButton>
              </div>
            </SignedOut>
          </div>
        </div>
      )}
    </header>
  );
}
