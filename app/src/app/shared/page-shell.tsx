// Topplinje og innhold som i wireframes: logo og navn helt til venstre; på mobil ligger
// skjemaet rett på bakgrunnen, fra nettbrettbredde i et hvitt kort med tynn kant.
import type { ReactNode } from "react";

export const APP_NAME = "Studentmarked";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b border-hairline bg-surface">
        <div className="flex h-16 items-center gap-3 px-4 sm:h-[4.5rem] sm:px-12">
          <span aria-hidden="true" className="size-9 rounded-md border-2 border-line bg-paper sm:size-10" />
          <span className="text-lg font-bold">{APP_NAME}</span>
        </div>
      </header>
      <main className="px-6 pt-14 pb-16 sm:px-4 sm:pt-28">
        <div className="mx-auto w-full max-w-sm sm:max-w-[32.5rem] sm:rounded-xl sm:border sm:border-hairline sm:bg-surface sm:px-12 sm:py-12">
          {children}
        </div>
      </main>
    </>
  );
}
