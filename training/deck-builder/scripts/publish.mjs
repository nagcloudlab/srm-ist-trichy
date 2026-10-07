/**
 * Build every deck in src/decks/ and publish each single-file HTML to its folder under training/.
 * Usage: node scripts/publish.mjs [deck-id …]   (no ids = all decks)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const training = path.resolve(root, '..');

const all = fs.readdirSync(path.join(root, 'src/decks'))
  .filter((file) => file.endsWith('.ts') && file !== 'meta.ts')
  .map((file) => {
    const text = fs.readFileSync(path.join(root, 'src/decks', file), 'utf8');
    const title = /unitMeta\(\d, '([^']+)'/.exec(text)?.[1] ?? /label: '([^']+)'/.exec(text)?.[1] ?? 'GAN Mastery';
    const unit = /unitMeta\((\d),/.exec(text)?.[1];
    return { id: /id: '([a-z0-9-]+)'/.exec(text)[1], out: /out: '([^']+)'/.exec(text)[1], title: unit ? `Unit ${unit} · ${title}` : title };
  })
  .sort((a, b) => a.out.localeCompare(b.out));

const wanted = process.argv.slice(2);
const targets = wanted.length ? all.filter((d) => wanted.includes(d.id)) : all;
if (!targets.length) throw new Error(`No deck matches ${wanted.join(', ')}. Known: ${all.map((d) => d.id).join(', ')}`);

for (const { id, out, title } of targets) {
  execFileSync('npx', ['vite', 'build', '--mode', id, '--logLevel', 'warn'], { cwd: root, stdio: ['ignore', 'ignore', 'inherit'] });
  const dest = path.join(training, out);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  // Stamp the deck's own title into the file (the shared index.html only says "GAN Mastery").
  const html = fs.readFileSync(path.join(root, '.out', id, 'index.html'), 'utf8')
    .replace(/<title>[^<]*<\/title>/, `<title>${title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</title>`);
  fs.writeFileSync(dest, html);
  console.log(`✓ ${id.padEnd(20)} → training/${out}  (${Math.round(fs.statSync(dest).size / 1024)} KB)`);
}
