// Builds src/theme/tokens.css and src/theme/colors.js from src/theme/palette.json.
//   node scripts/generate-tokens.mjs           write the files
//   node scripts/generate-tokens.mjs --check   fail if they are out of date (used by the build)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const palette = JSON.parse(readFileSync(join(root, 'src/theme/palette.json'), 'utf8'));
const decl = (obj) => Object.entries(obj).map(([name, value]) => `  --color-${name}: ${value};`);

const css = [
  '/* GENERATED from palette.json by scripts/generate-tokens.mjs — edit the palette, not this file. */',
  ':root {', ...decl(palette.light), ...decl(palette.constants), '}', '',
  '[data-theme="dark"] {', ...decl(palette.dark), '}', '',
].join('\n');

const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const js = [
  '// GENERATED from palette.json by scripts/generate-tokens.mjs — edit the palette, not this file.',
  '// Use these where CSS variables cannot reach (chart libraries, canvas). Everywhere else prefer var(--color-<name>).',
  `export const colors = ${JSON.stringify(Object.fromEntries(Object.entries({ ...palette.light, ...palette.constants }).map(([k, v]) => [camel(k), v])), null, 2)};`,
  `export const darkColors = ${JSON.stringify(Object.fromEntries(Object.entries(palette.dark).map(([k, v]) => [camel(k), v])), null, 2)};`,
  '/** The colour as a CSS variable reference, e.g. cssVar("primary") → "var(--color-primary)". */',
  'export const cssVar = (name) => `var(--color-${name})`;',
  '/** A colour with transparency that still follows the theme. */',
  'export const alpha = (name, percent) => `color-mix(in srgb, var(--color-${name}) ${percent}%, transparent)`;',
  '/** Series colours for charts, in order. */',
  'export const chartColors = [colors.chart1, colors.chart2, colors.chart3, colors.chart4, colors.chart5, colors.chart6];',
  '',
].join('\n');

const files = [[join(root, 'src/theme/tokens.css'), css], [join(root, 'src/theme/colors.js'), js]];
if (process.argv.includes('--check')) {
  const stale = files.filter(([p, c]) => !existsSync(p) || readFileSync(p, 'utf8') !== c);
  if (stale.length) { console.error('Theme files are out of date — run `npm run tokens`.'); process.exit(1); }
  console.log('theme files are up to date');
} else { for (const [p, c] of files) writeFileSync(p, c); console.log('wrote src/theme/tokens.css and colors.js'); }
