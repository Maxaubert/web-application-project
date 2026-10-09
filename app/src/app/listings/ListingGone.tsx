// Visningen når annonsen er tatt ned eller ikke finnes (WF-04, «Annonse-borte»). Samme tekst for
// begge, så ingen kan se om en nedtatt annonse finnes. Solgte annonser vises som vanlig med merke.
export function ListingGone() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border-2 border-dashed border-line px-6 py-6">
        <h1 className="text-2xl font-bold">Annonsen er ikke lenger tilgjengelig</h1>
        <p className="mt-2 text-lg">Den kan være tatt ned, eller lenken er feil.</p>
      </div>
      <a
        href="/"
        className="mt-5 flex h-12 w-full items-center justify-center rounded-md bg-action text-lg font-semibold text-white transition-colors hover:bg-action-hover"
      >
        Til annonser
      </a>
    </div>
  );
}
