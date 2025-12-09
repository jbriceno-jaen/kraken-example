import { Instagram, Facebook } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-black/50 bg-black">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 mb-6 sm:mb-8">
          <div className="space-y-3 min-w-0 col-span-2 sm:col-span-1">
            <div className="flex flex-col gap-0.5">
              <span className="font-black uppercase tracking-tight font-[family-name:var(--font-orbitron)] text-sm sm:text-base text-white">
                VENOM
              </span>
              <span className="font-bold uppercase font-[family-name:var(--font-orbitron)] text-xs sm:text-sm text-red-500">
                ELITE FITNESS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed break-words">
              Where limits are broken and dreams are built. Every workout is a story of overcoming written with sweat and determination.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">Links</h3>
            <nav className="flex flex-col gap-2 sm:gap-1.5">
              <Link href="/privacy" className="text-sm sm:text-sm text-zinc-600 hover:text-red-500 active:text-red-500 transition-colors min-h-[32px] sm:min-h-[28px] flex items-center font-medium hover:underline">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm sm:text-sm text-zinc-600 hover:text-red-500 active:text-red-500 transition-colors min-h-[32px] sm:min-h-[28px] flex items-center font-medium hover:underline">
                Terms
              </Link>
              <Link href="/contact" className="text-sm sm:text-sm text-zinc-600 hover:text-red-500 active:text-red-500 transition-colors min-h-[32px] sm:min-h-[28px] flex items-center font-medium hover:underline">
                Contact
              </Link>
            </nav>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">About CrossFit</h3>
            <nav className="flex flex-col gap-2 sm:gap-1.5">
              <Link href="/what-is-crossfit" className="text-sm sm:text-sm text-zinc-600 hover:text-red-500 active:text-red-500 transition-colors min-h-[32px] sm:min-h-[28px] flex items-center font-medium hover:underline">
                What is CrossFit?
              </Link>
            </nav>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">Location</h3>
            <div className="space-y-1 text-xs sm:text-sm text-zinc-600">
              <p className="leading-relaxed">Aguas Zarcas</p>
              <p className="leading-relaxed">Costa Rica</p>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">Hours</h3>
            <div className="space-y-1 text-xs sm:text-sm text-zinc-600">
              <p>Monday - Saturday</p>
              <p>5:00 AM - 8:00 PM</p>
              <p className="text-zinc-700">Sunday: Closed</p>
            </div>
          </div>
        </div>
        <div className="border-t border-black/50 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-zinc-600 font-[family-name:var(--font-orbitron)] text-center sm:text-left">
              &copy; {new Date().getFullYear()} <span className="font-black uppercase tracking-tight text-white">VENOM</span> <span className="text-red-500 font-bold uppercase">ELITE FITNESS</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center size-10 rounded-lg border border-red-500/30 bg-black/30 text-red-500/70 hover:border-red-500/50 hover:text-red-500 hover:bg-black/50 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center size-10 rounded-lg border border-red-500/30 bg-black/30 text-red-500/70 hover:border-red-500/50 hover:text-red-500 hover:bg-black/50 transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="size-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

