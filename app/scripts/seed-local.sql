-- Testannonser for lokal utvikling (#79). Kjøres med `npm run db:seed:local`, aldri mot skyen.
-- Kan kjøres flere ganger: testradene slettes og legges inn på nytt.

DELETE FROM listing WHERE owner_id = 'seed-user';
DELETE FROM user WHERE id = 'seed-user';

INSERT INTO user (id, name, email, email_verified, phone)
VALUES ('seed-user', 'Test Testesen', 'test.testesen@hiof.no', 1, '+4791234567');

-- Salg, gis bort, solgt og tatt ned. Drill og Telt for to er fjernet: passet ikke for siden (Max 11.10).
-- ID-ene er UUID-er, fordi bildeadressen bare godtar det formatet appen lager (#150). Bildene: seed-images.mjs.
INSERT INTO listing (id, owner_id, type, title, description, category, condition, price, status)
VALUES
  ('5eed0000-0000-4000-8000-000000000001', 'seed-user', 'sale', 'Matematikk for ingeniører', 'Pensumbok, noen understrekninger.', 'books', 'used', 350, 'active'),
  ('5eed0000-0000-4000-8000-000000000002', 'seed-user', 'giveaway', 'Kontorstol', 'Gis bort, må hentes.', 'furniture', 'used', NULL, 'active'),
  ('5eed0000-0000-4000-8000-000000000003', 'seed-user', 'sale', 'Grafisk kalkulator', 'Solgt, vises ikke i søket.', 'electronics', 'like_new', 400, 'sold'),
  ('5eed0000-0000-4000-8000-000000000004', 'seed-user', 'sale', 'Vinterjakke', 'Tatt ned av eieren.', 'clothing', 'used', 200, 'unpublished');
