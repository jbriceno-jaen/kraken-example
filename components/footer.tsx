export function Footer() {
  return (
    <footer className="border-t border-black/50 bg-black">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <div className="space-y-3 min-w-0 col-span-2 sm:col-span-1">
            <div className="flex flex-col gap-0.5">
              <span className="font-black uppercase tracking-tight font-[family-name:var(--font-orbitron)] text-sm sm:text-base text-white">
                KRAKEN
              </span>
              <span className="font-bold uppercase font-[family-name:var(--font-orbitron)] text-xs sm:text-sm text-red-500">
                ELITE FITNESS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed break-words">
              Creado para atletas que quieren moverse mejor, levantar más y llegar más lejos.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">Enlaces</h3>
            <nav className="flex flex-col gap-1">
              <a href="/privacy" className="text-xs sm:text-sm text-zinc-600 hover:text-red-500 active:text-red-500 transition-colors min-h-[24px] sm:min-h-0 flex items-center">
                Privacidad
              </a>
              <a href="/terms" className="text-xs sm:text-sm text-zinc-600 hover:text-red-500 active:text-red-500 transition-colors min-h-[24px] sm:min-h-0 flex items-center">
                Términos
              </a>
              <a href="/contact" className="text-xs sm:text-sm text-zinc-600 hover:text-red-500 active:text-red-500 transition-colors min-h-[24px] sm:min-h-0 flex items-center">
                Contacto
              </a>
            </nav>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">Ubicación</h3>
            <div className="space-y-1 text-xs sm:text-sm text-zinc-600">
              <p className="leading-relaxed">Aguas Zarcas</p>
              <p className="leading-relaxed">Costa Rica</p>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-semibold text-white font-[family-name:var(--font-orbitron)]">Horarios</h3>
            <div className="space-y-1 text-xs sm:text-sm text-zinc-600">
              <p>Lunes - Sábado</p>
              <p>5:00 AM - 8:00 PM</p>
              <p className="text-zinc-700">Domingo: Cerrado</p>
            </div>
          </div>
        </div>
        <div className="border-t border-black/50 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-zinc-600 font-[family-name:var(--font-orbitron)]">
            &copy; {new Date().getFullYear()} <span className="font-black uppercase tracking-tight text-white">KRAKEN</span> <span className="text-red-500 font-bold uppercase">ELITE FITNESS</span>. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

