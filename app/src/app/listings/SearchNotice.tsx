// Stiplet boks når søket ikke gir annonser (WF-03, «Sok-tomt»), med vei tilbake til alle annonser.
export function SearchNotice({ title }: { title: string }) {
  return (
    <div className="mt-8 max-w-3xl rounded-xl border-2 border-dashed border-line px-6 py-8 text-center">
      <p className="text-xl font-bold">{title}</p>
      <a
        href="/"
        className="mt-4 inline-flex h-12 items-center rounded-md border-2 border-ink bg-surface px-5 text-lg font-semibold transition-colors hover:bg-paper"
      >
        Fjern søk
      </a>
    </div>
  );
}
