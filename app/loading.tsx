import { Clock } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      <div className="flex flex-col items-center justify-center py-16 sm:py-20">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Clock className="size-6 sm:size-8 text-red-500 animate-pulse" />
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-lg sm:text-xl font-bold font-[family-name:var(--font-orbitron)] text-white mb-2">
            Cargando
          </p>
          <p className="text-sm sm:text-base text-zinc-400">
            Por favor espera un momento...
          </p>
        </div>
      </div>
    </div>
  );
}


