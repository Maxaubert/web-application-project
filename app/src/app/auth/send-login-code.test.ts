import { describe, expect, it } from "vitest";
import { createResendSender, emailNotConfigured } from "./send-login-code";

// Uten LOGIN_CODE_DELIVERY feiler utsendingen, så en kode aldri havner i en produksjonslogg. Godkjent av Max 05.10.
describe("emailNotConfigured", () => {
  it("feiler i stedet for å sende koden", async () => {
    await expect(emailNotConfigured("prod@hiof.no", "123456")).rejects.toThrow();
  });
});

// Utsending via Resend med en falsk fetch som registrerer kallet. Godkjent av Max 07.10.
describe("createResendSender", () => {
  const apiKey = "re_testnokkel_som_ikke_er_ekte";
  const from = "Studentmarkedet <noreply@mail.studentmarkedet.org>";

  it("sender koden til Resend med nøkkel, avsender og mottaker", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const fetchFn = (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response("{}", { status: 200 });
    }) as typeof fetch;

    await createResendSender({ apiKey, from, fetchFn })("ola@hiof.no", "482193");

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://api.resend.com/emails");
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe(`Bearer ${apiKey}`);
    const body = JSON.parse(String(calls[0].init.body));
    expect(body.from).toBe(from);
    expect(body.to).toEqual(["ola@hiof.no"]);
    expect(body.text).toContain("482193");
  });

  it("kaster en feil uten nøkkel og kode når Resend svarer med feil", async () => {
    const fetchFn = (async () => new Response("{}", { status: 403 })) as unknown as typeof fetch;

    const error = await createResendSender({ apiKey, from, fetchFn })("ola@hiof.no", "482193").catch((e: Error) => e);

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain("403");
    expect((error as Error).message).not.toContain(apiKey);
    expect((error as Error).message).not.toContain("482193");
  });
});
