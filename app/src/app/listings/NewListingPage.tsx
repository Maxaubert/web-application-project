// «Legg ut annonse» /listings/new (WF-05, mockup 13, #133). Beskyttet av requireUser; serverhandlingen
// sjekker økten på nytt. Innholdet ligger rett på bakgrunnen over hele bredden, som forsiden, uten kort rundt (Max 11.10, #135).
import { HeaderActions } from "@/app/shared/HeaderActions";
import { PageShell } from "@/app/shared/page-shell";
import { ListingForm } from "./ListingForm";

export function NewListingPage() {
  return (
    <PageShell title="Legg ut annonse" wide headerAction={<HeaderActions current="new-listing" />}>
      <h1 className="mb-8 text-4xl font-bold tracking-tight">Legg ut annonse</h1>
      <ListingForm />
    </PageShell>
  );
}
