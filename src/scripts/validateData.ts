import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { buildRoster, validateRoster } from '../lib/roster';
import type { Character } from '../lib/types';

function load<T>(rel: string): T {
  const p = fileURLToPath(new URL(rel, import.meta.url));
  return JSON.parse(readFileSync(p, 'utf8')) as T;
}

const strict = process.argv.includes('--strict');

const characters = load<Character[]>('../../public/data/characters.json');
const children = load<Character[]>('../../public/data/children.json');
const roster = buildRoster(characters, children);
const issues = validateRoster(roster, { strict });

const errors = issues.filter((i) => i.level === 'error');
const warnings = issues.filter((i) => i.level === 'warning');

console.log(
  `\nValidated ${roster.all.length} units (${strict ? 'strict' : 'incremental'} mode)`
);
console.log(`  ${errors.length} error(s), ${warnings.length} warning(s)\n`);

for (const e of errors) console.log(`  ✗ ERROR   ${e.message}`);
for (const w of warnings) console.log(`  • todo    ${w.message}`);

if (errors.length > 0) {
  console.log('\nValidation failed.');
  process.exit(1);
}
console.log('\nNo errors. Data is consistent.');
