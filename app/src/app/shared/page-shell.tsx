// Topplinje og sentrert innhold, som i wireframes. Appnavnet er en plassholder til appen får navn.
import type { ReactNode } from "react";

export const APP_NAME = "Studentmarked";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b border-hairline bg-surface">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
          <span aria-hidden="true" className="size-9 rounded-md border-2 border-line bg-paper" />
          <span className="text-lg font-bold">{APP_NAME}</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-sm px-6 pt-14 pb-16">{children}</main>
    </>
  );
}
