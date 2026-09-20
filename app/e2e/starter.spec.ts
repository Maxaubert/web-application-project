import { expect, test } from "@playwright/test";

test("built starter renders and hydrates without browser errors", async ({ page, context }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  await expect(page.getByRole("heading", { name: "Welcome to RedwoodSDK", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Copy", exact: true }).click();
  await expect(page.getByRole("button", { name: "Copied!", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("unknown routes return HTTP 404", async ({ request }) => {
  const response = await request.get("/missing-setup-smoke-test");
  expect(response.status()).toBe(404);
});
