"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-950 via-slate-900 to-black px-4">
      <div className="max-w-md space-y-4 text-center">
        <h2 className="text-2xl font-semibold text-white">Algo salió mal</h2>
        <p className="text-zinc-400">
          {error.message || "Ocurrió un error inesperado. Por favor, intenta de nuevo."}
        </p>
        <Button onClick={reset} className="bg-red-500 text-white hover:bg-red-400">
          Intentar de nuevo
        </Button>
      </div>
    </div>
  );
}


