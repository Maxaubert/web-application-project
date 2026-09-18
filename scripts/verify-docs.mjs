import { readFileSync, statSync, existsSync } from 'node:fs';
import { dirname, resolve, relative, isAbsolute, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

// Lokal dokumentkontroll. Ingen nettverk, pakker eller tilgang til kursarkiv.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (message) => errors.push(message);
const read = (name) => readFileSync(resolve(root, name), 'utf8').replace(/^\uFEFF/, '');
const required = [
  'README.md', 'AGENTS.md', 'CLAUDE.md', 'KI-AVTALE.md', '.gitignore',
  'docs/emnekrav.md', 'docs/kilder.md', 'docs/kildemanifest.json',
  'docs/prosjekt.md', 'docs/ideer-til-diskusjon.md', 'docs/teknikk.md', 'docs/samarbeid.md',
  'docs/arbeidslogg.md', 'docs/laering.md', 'docs/leveranse.md',
  'docs/assistentbruk.md', 'docs/review.md', 'docs/verifikasjon.md',
  '.github/PULL_REQUEST_TEMPLATE.md',
];

for (const name of required) {
  if (!existsSync(resolve(root, name))) fail(`Mangler fil: ${name}`);
}
if (errors.length) finish();

let names;
try {
  names = [...new Set(execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
    { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean))];
} catch {
  fail('Kan ikke lese Git-filoversikt. Kjør i et initialisert repo med Git tilgjengelig.');
  finish();
}

const textExtensions = new Set(['.md', '.mjs', '.json', '.yml', '.yaml', '.txt']);
let linksChecked = 0;
let textFilesChecked = 0;
for (const name of names) {
  const normalized = name.replaceAll('\\', '/');
  if (/(^|\/)(node_modules|kursmateriell|canvas|local-sources|private|transkript)(\/|$)/i.test(normalized)) {
    fail(`Fil fra avgrenset mappe i Git-utvalget: ${name}`);
  }
  const base = normalized.split('/').at(-1);
  if ((/^\.env(?:\.|$)/.test(base) || /^\.dev\.vars(?:\.|$)/.test(base)) && !base.endsWith('.example')) {
    fail(`Mulig hemmelighetsfil i Git-utvalget: ${name}`);
  }
  if (/\.(pem|key|p12|pfx)$/i.test(name) || /^(reference_canvas_token|webapp-202[56]-journey)/i.test(base)) {
    fail(`Privat kilde eller nøkkelfil i Git-utvalget: ${name}`);
  }
  if (!textExtensions.has(extname(name)) && !['.gitignore', '.gitattributes'].includes(name)) continue;
  const path = resolve(root, name);
  if (!existsSync(path)) {
    fail(`Fil i Git-utvalget mangler på disk: ${name}`);
    continue;
  }
  if (statSync(path).size > 1024 * 1024) {
    fail(`Tekstfil over kontrollgrensen på 1 MiB: ${name}`);
    continue;
  }
  const content = read(name);
  textFilesChecked++;
  if (content.includes('\u2014')) fail(`Em dash i ${name}`);
  if (/(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{20,}|\b\d+~[A-Za-z0-9_-]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content)) {
    fail(`Mulig hemmelighet i ${name}; verdien skrives ikke ut.`);
  }
  if (extname(name) !== '.md') continue;
  const outsideCode = content.replace(/```[\s\S]*?```/g, '');
  for (const match of outsideCode.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].trim().replace(/^<|>$/g, '');
    if (/^(?:https?:|mailto:)/i.test(target)) continue;
    const [linkPath, anchor] = target.split('#');
    let decoded;
    try { decoded = decodeURIComponent(linkPath); } catch {
      fail(`Ugyldig lenkekoding i ${name}`); continue;
    }
    const destination = decoded ? resolve(dirname(path), decoded) : path;
    const rel = relative(root, destination);
    if (rel === '..' || rel.startsWith('../') || rel.startsWith('..\\') || isAbsolute(rel)) {
      fail(`Lokal lenke utenfor repo i ${name}: ${target}`); continue;
    }
    linksChecked++;
    if (!existsSync(destination)) {
      fail(`Brutt lokal lenke i ${name}: ${target}`); continue;
    }
    if (anchor) {
      // Repoet bruker nå ingen lokale ankerlenker. Nye må ha eksplisitt HTML-id.
      const linkedText = readFileSync(destination, 'utf8');
      if (!linkedText.includes(`id="${anchor}"`)) fail(`Anker må ha eksplisitt id i ${name}: ${target}`);
    }
  }
}

for (const name of ['AGENTS.md', 'CLAUDE.md']) {
  if (read(name).split(/\r?\n/).length > 200) fail(`${name} er over 200 linjer.`);
}
if (!/^@AGENTS\.md\s*$/m.test(read('CLAUDE.md'))) fail('CLAUDE.md mangler felles AGENTS-import.');

const requirements = read('docs/emnekrav.md');
for (const id of ['A0','A1','A2','A3','A4','A5','E1','E2','T01','T02','T03','T04','T05','T06','T07','T08','P01','P02','P03','P04','P05','P06']) {
  if (!requirements.includes(`| ${id} |`)) fail(`Mangler stabil kravrad ${id}.`);
}
const guards = [
  ['AGENTS.md', 'autorisasjon i skrivehandler', 'Tilgangskontroll'],
  ['AGENTS.md', 'første versjon av minst to tester uten KI', 'Egen testøving'],
  ['AGENTS.md', 'egen arkitekturbegrunnelse', 'Egen vurderingstekst'],
  ['AGENTS.md', 'Ikke dikt bidrag', 'Autentisk dokumentasjon'],
  ['AGENTS.md', 'Bare Oves eksplisitte godkjenning', 'Mergegate'],
  ['README.md', 'Ingen applikasjonsidé', 'Ærlig appstatus'],
  ['KI-AVTALE.md', 'ikke bekreftet av studentene', 'Avtalestatus'],
  ['docs/emnekrav.md', 'etter uke 42', 'Datokonflikt'],
  ['docs/emnekrav.md', 'fremtidig pensum', 'Retrospektpresisering'],
  ['docs/laering.md', 'prinsippene er pensum', 'Eksamensfordypning'],
  ['docs/verifikasjon.md', 'ikke en sikkerhetsrevisjon', 'Kontrollbegrensning'],
];
for (const [name, phrase, label] of guards) {
  if (!read(name).includes(phrase)) fail(`Kontrollpunkt mangler: ${label} i ${name}.`);
}

try {
  const manifest = JSON.parse(read('docs/kildemanifest.json'));
  if (manifest.course_id !== 11084 || !/^\d{4}-\d{2}-\d{2}$/.test(manifest.checked_on)) fail('Ugyldig kurs/kontrolldato i manifest.');
  const source = manifest.sources.find((item) => item.id === 'U26');
  if (!source || !/^[a-f0-9]{64}$/.test(source.sha256) || source.page_markers !== 374 || source.included_in_repo !== false) {
    fail('U26-manifestet mangler forventet hash/sideantall/avgrensning.');
  }
} catch {
  fail('Kildemanifest er ikke gyldig JSON med forventet struktur.');
}

finish();
function finish() {
  if (errors.length) {
    for (const error of errors) console.error(`FEIL: ${error}`);
    process.exit(1);
  }
  console.log(`OK: ${names.length} Git-filer, ${textFilesChecked} tekstfiler og ${linksChecked} lokale lenker kontrollert.`);
  console.log('Dette er dokumentkontroll, ikke godkjenning av app, emnekrav eller studentenes forståelse.');
}
