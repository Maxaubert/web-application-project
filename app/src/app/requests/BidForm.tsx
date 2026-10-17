"use client";
// Skjemaet på budsiden (WF-06, #185): annonsekortet, «Ditt bud (kr)» og «Send bud». Alt valideres på nytt i
// serverhandlingen sendBid; feilene derfra vises under feltet.
import { useActionState } from "react";
import { asFormState, type ActionResult } from "@/app/auth/form-state";
import { FieldError, PrimaryButton, TextField } from "@/app/shared/form-controls";
import { ListingImage } from "@/app/listings/ListingImage";
import { sendBid } from "./actions";

type BidFormProps = {
  listingId: string;
  title: string;
  typeAndPrice: string;
  ownerName: string;
  thumb: string | null;
  // Det gjeldende budet når man endrer, ellers tomt.
  initialPrice: string;
};

export function BidForm({ listingId, title, typeAndPrice, ownerName, thumb, initialPrice }: BidFormProps) {
  const [result, action, pending] = useActionState<ActionResult, FormData>(sendBid, {});
  const state = asFormState(result);

  return (
    <form action={action} noValidate className="space-y-6">
      <input type="hidden" name="listingId" value={listingId} />
      <div className="flex gap-4 rounded-xl border-2 border-hairline bg-surface p-3">
        <ListingImage src={thumb} className="size-[4.5rem] shrink-0 rounded-lg" iconClassName="size-8" />
        <div className="min-w-0">
          <p className="font-bold [overflow-wrap:anywhere]">{title}</p>
          <p>{typeAndPrice}</p>
          <p className="text-sm text-muted">Selger: {ownerName}</p>
        </div>
      </div>
      <TextField
        id="bid-price"
        name="price"
        label="Ditt bud (kr)"
        inputMode="numeric"
        autoComplete="off"
        defaultValue={state.values?.price ?? initialPrice}
        error={state.fieldErrors?.price}
      />
      <FieldError id="bid-error" message={state.error} />
      <PrimaryButton pending={pending}>Send bud</PrimaryButton>
    </form>
  );
}
