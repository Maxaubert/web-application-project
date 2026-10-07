// Norske visningsnavn for verdiene i listing-tabellen. Databasen lagrer de engelske verdiene;
// kort, skjema og filtre henter navnene herfra, så de alltid er like.
import type { listingCategories, listingConditions, listingTypes } from "@/db/schema";

type ListingType = (typeof listingTypes)[number];
type ListingCategory = (typeof listingCategories)[number];
type ListingCondition = (typeof listingConditions)[number];

export const typeLabels: Record<ListingType, string> = {
  sale: "Salg",
  loan: "Lån",
  giveaway: "Gis bort",
};

export const categoryLabels: Record<ListingCategory, string> = {
  books: "Bøker og pensum",
  electronics: "Elektronikk",
  furniture: "Møbler",
  clothing: "Klær og sko",
  sports: "Sport og friluft",
  bikes: "Sykler",
  household: "Kjøkken og hjem",
  other: "Annet",
};

export const conditionLabels: Record<ListingCondition, string> = {
  new: "Ny",
  like_new: "Som ny",
  used: "Brukt",
};
