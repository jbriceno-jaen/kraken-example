export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 animate-spin rounded-full border-4 border-red-500/30 border-t-red-500" />
        <p className="text-sm text-zinc-400">Cargando...</p>
      </div>
    </div>
  );
}


