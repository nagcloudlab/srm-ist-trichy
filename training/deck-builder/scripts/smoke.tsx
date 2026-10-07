/**
 * Smoke test: validates the deck contract and renders every slide (hidden and revealed)
 * on the server, so a slide that throws or a missing note fails the build.
 * Run with `npm run check`.
 */
import { renderToString } from 'react-dom/server';
import { decks as registry, validateDeck } from '../src/decks';

const decks = Object.fromEntries(registry.map((d) => [d.id, d.parts]));
const problems = Object.values(decks).flatMap((d) => validateDeck(d));
let count = 0;
for (const [name, parts] of Object.entries(decks)) {
  for (const part of parts) {
    for (const slide of part.slides) {
      for (const revealed of [false, true]) {
        try {
          const html = renderToString(<>{slide.render({ revealed })}</>);
          if (!html.trim() && slide.layout !== 'divider') problems.push(`${name} ${part.code}/${slide.id}: renders nothing`);
        } catch (error) {
          problems.push(`${name} ${part.code}/${slide.id} (revealed=${revealed}): ${(error as Error).message}`);
        }
      }
      count++;
    }
  }
  const all = parts.flatMap((p) => p.slides);
  console.log(`\n${name}`);
  console.log(parts.map((p) => `  ${p.code.padEnd(5)} ${String(p.slides.length).padStart(3)} slides  ${p.title}`).join('\n'));
  console.log(`  ${all.length} slides · labs: ${all.filter((s) => s.lab).length} · reveals: ${all.filter((s) => s.reveal).length}`);
}
const ids = Object.values(decks).flat().flatMap((p) => p.slides.map((s) => s.id));
ids.filter((id, i) => ids.indexOf(id) !== i).forEach((id) => problems.push(`duplicate id across decks: ${id}`));
console.log(`\n${count} slides checked`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n` + problems.join('\n'));
  (globalThis as unknown as { process: { exit(code: number): never } }).process.exit(1);
}
console.log('✓ deck contract OK');
