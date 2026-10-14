-- Testbrukeren for /dev/login lokalt (#79, #106). Kjøres av `npm run db:seed:local`, aldri mot skyen.
-- Testannonsene er demoannonsene i seed-listings.json, lagt inn av seed.mjs (#152).
-- Kan kjøres flere ganger: testradene slettes og legges inn på nytt.

DELETE FROM listing WHERE owner_id = 'seed-user';
DELETE FROM user WHERE id = 'seed-user';

INSERT INTO user (id, name, email, email_verified, phone)
VALUES ('seed-user', 'Test Testesen', 'test.testesen@hiof.no', 1, '+4791234567');
