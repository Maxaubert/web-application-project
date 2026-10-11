// Topplinje og innhold som i wireframes: logo og navn helt til venstre, eventuell handling til høyre.
// Smalt oppsett (innlogging): på mobil ligger skjemaet rett på bakgrunnen, fra nettbrettbredde i et
// hvitt kort med tynn kant. Bredt oppsett (annonser, #65): innholdet bruker hele bredden.
import type { ReactNode } from "react";

export const APP_NAME = "Studentmarkedet";

type PageShellProps = {
  // Fanetittelen; React 19 flytter <title> inn i <head>. Påkrevd, så ingen side glemmer den (#113).
  title: string;
  children: ReactNode;
  wide?: boolean;
  // Bredt oppsett der innholdet fyller resten av skjermhøyden, for et kort som skal gå helt ned (#135).
  fill?: boolean;
  headerAction?: ReactNode;
};

export function PageShell({ title, children, wide = false, fill = false, headerAction }: PageShellProps) {
  return (
    <div className={fill ? "flex min-h-dvh flex-col" : undefined}>
      <title>{`${title} – ${APP_NAME}`}</title>
      <header className="border-b border-hairline bg-surface">
        <div className="flex h-16 items-center gap-3 px-4 sm:h-[4.5rem] sm:px-12">
          {/* Logo og navn går til forsiden, som på de fleste nettsteder (#113). */}
          <a href="/" className="flex min-h-11 items-center gap-3 rounded-md transition-opacity hover:opacity-80">
            <span aria-hidden="true" className="size-9 rounded-md border-2 border-line bg-paper sm:size-10" />
            {/* På smale mobiler er det ikke plass til navnet ved siden av to knapper; da vises bare logoen,
                og navnet står igjen for skjermlesere (#133). */}
            <span className="text-lg font-bold max-[26rem]:sr-only">{APP_NAME}</span>
          </a>
          {headerAction && <div className="ml-auto">{headerAction}</div>}
        </div>
      </header>
      {fill ? (
        <main className="flex flex-1 flex-col px-4 pt-10 pb-10 sm:px-12 sm:pb-12">{children}</main>
      ) : wide ? (
        <main className="px-4 pt-10 pb-24 sm:px-12">{children}</main>
      ) : (
        <main className="px-6 pt-14 pb-16 sm:px-4 sm:pt-28">
          <div className="mx-auto w-full max-w-sm sm:max-w-[32.5rem] sm:rounded-xl sm:border sm:border-hairline sm:bg-surface sm:px-12 sm:py-12">
            {children}
          </div>
        </main>
      )}
    </div>
  );
}
