// «Legg ut annonse» /listings/new (WF-05, mockup 13, #133). Beskyttet av requireUser; serverhandlingen
// sjekker økten på nytt. Et sentrert hvitt kort fra nettbrettbredde, rett på bakgrunnen på mobil.
import { HeaderActions } from "@/app/shared/HeaderActions";
import { PageShell } from "@/app/shared/page-shell";
import { ListingForm } from "./ListingForm";

export function NewListingPage() {
  return (
    <PageShell title="Legg ut annonse" wide headerAction={<HeaderActions current="new-listing" />}>
      <div className="mx-auto max-w-[45rem] sm:rounded-xl sm:border sm:border-hairline sm:bg-surface sm:px-12 sm:py-10">
        <h1 className="mb-8 text-4xl font-bold tracking-tight">Legg ut annonse</h1>
        <ListingForm />
      </div>
    </PageShell>
  );
}
