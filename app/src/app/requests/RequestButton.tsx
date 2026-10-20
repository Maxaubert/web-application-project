"use client";
// «Send forespørsel» på en gis bort-annonse (#186): én knapp, ingen felt. Feilen fra serverhandlingen vises under knappen.
import { useActionState } from "react";
import { asFormState, type ActionResult } from "@/app/auth/form-state";
import { FieldError, PrimaryButton } from "@/app/shared/form-controls";
import { sendRequest } from "./actions";

export function RequestButton({ listingId, label }: { listingId: string; label: string }) {
  const [result, action, pending] = useActionState<ActionResult, FormData>(sendRequest, {});
  const state = asFormState(result);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="listingId" value={listingId} />
      <PrimaryButton pending={pending}>{label}</PrimaryButton>
      <FieldError id="request-error" message={state.error} />
    </form>
  );
}
