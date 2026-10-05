import { expect, test } from "@playwright/test";

test("login page renders, validates email and hydrates without browser errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  await expect(page.getByRole("heading", { name: "logg inn", exact: true })).toBeVisible();
  const email = page.getByPlaceholder("e-post addresse");
  await email.fill("ikke-epost");
  await expect(page.getByText("Invalid email")).toBeVisible();
  await email.fill("ola@hiof.no");
  await expect(page.getByText("Invalid email")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("unknown routes return HTTP 404", async ({ request }) => {
  const response = await request.get("/missing-setup-smoke-test");
  expect(response.status()).toBe(404);
});
