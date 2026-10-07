import fs from 'node:fs';
import path from 'node:path';

const project = process.cwd();
const sourceRoot = path.resolve(project, '..');
const lessons = [];

const clean = (value) => value
  .replace(/\*\*(.*?)\*\*/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/\$\$(.*?)\$\$/g, '$1')
  .replace(/\$(.*?)\$/g, '$1')
  .replace(/â†’/g, '→').replace(/â†/g, '←').replace(/â†“/g, '↓').replace(/â†‘/g, '↑').replace(/â†”/g, '↔')
  .replace(/â‰ˆ/g, '≈').replace(/â‰¤/g, '≤').replace(/â‰¥/g, '≥').replace(/â€”/g, '—').replace(/âˆ’/g, '−')
  .replace(/âœ“/g, '✓').replace(/Ã—/g, '×').replace(/Â/g, '')
  .trim();

function humanize(line) {
  const value = line.trim();
  if (/â[”–]/.test(value)) return null;
  if (!value || /^(import |from |print\(|plt\.|# -+)/.test(value)) return null;
  if (/^class\s/.test(value)) return `Define network: ${clean(value.replace(/:$/, ''))}`;
  if (/^def\s/.test(value)) return `Define operation: ${clean(value.replace(/:$/, ''))}`;
  if (/^return\b/.test(value)) return `Output: ${clean(value.replace(/^return\s+/, ''))}`;
  if (value.startsWith('#')) return clean(value.slice(1));
  if (/^for\s/.test(value)) return `Repeat: ${clean(value.replace(/:$/, ''))}`;
  if (/^if\s/.test(value)) return `Check: ${clean(value.replace(/:$/, ''))}`;
  if (/\.zero_grad\(\)/.test(value)) return 'Clear the old gradients';
  if (/\.backward\(\)/.test(value)) return 'Send the loss backward to calculate gradients';
  if (/\.step\(\)/.test(value)) return 'Update the learnable parameters';
  if (/\.detach\(\)/.test(value)) return 'Detach the fake sample while training the discriminator';
  const assignment = value.match(/^([A-Za-z_][\w.]*)\s*=\s*(.+)$/);
  if (assignment) return `${assignment[1].replaceAll('_', ' ')} ← ${clean(assignment[2])}`;
  return clean(value);
}

function parseTable(lines, start) {
  const rows = [];
  let cursor = start;
  while (cursor < lines.length && lines[cursor].trim().startsWith('|')) {
    const cells = lines[cursor].trim().replace(/^\||\|$/g, '').split('|').map(clean);
    if (!cells.every((cell) => /^:?-+:?$/.test(cell))) rows.push(cells);
    cursor += 1;
  }
  return { table: { type: 'table', headers: rows[0] ?? [], rows: rows.slice(1) }, cursor };
}

function parseSections(markdown) {
  const lines = markdown.split(/\r?\n/);
  const title = clean(lines.find((line) => line.startsWith('# '))?.slice(2) ?? 'Lesson');
  const sections = [];
  let section = null;
  let paragraph = [];
  let inCode = false;
  let code = [];

  const flushParagraph = () => {
    if (section && paragraph.length) {
      const text = clean(paragraph.join(' '));
      if (text) section.blocks.push({ type: 'text', text });
    }
    paragraph = [];
  };
  const flushCode = () => {
    if (!section || !code.length) { code = []; return; }
    const steps = code.map(humanize).filter(Boolean);
    if (steps.length) section.blocks.push({ type: 'steps', steps });
    code = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith('```')) {
      if (inCode) flushCode(); else flushParagraph();
      inCode = !inCode;
      continue;
    }
    if (inCode) { code.push(line); continue; }
    if (line.startsWith('## ')) {
      flushParagraph();
      section = { title: clean(line.slice(3)), blocks: [] };
      sections.push(section);
      continue;
    }
    if (line.startsWith('### ')) {
      flushParagraph();
      if (section) section.blocks.push({ type: 'callout', text: clean(line.slice(4)) });
      continue;
    }
    if (/^# /.test(line) || /^---+$/.test(line.trim())) continue;
    if (line.trim().startsWith('|') && section) {
      flushParagraph();
      const parsed = parseTable(lines, i);
      section.blocks.push(parsed.table);
      i = parsed.cursor - 1;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line) && section) {
      flushParagraph();
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(clean(lines[i].replace(/^\s*[-*]\s+/, '')));
        i += 1;
      }
      section.blocks.push({ type: 'list', items });
      i -= 1;
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line) && section) {
      flushParagraph();
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(clean(lines[i].replace(/^\s*\d+\.\s+/, '')));
        i += 1;
      }
      section.blocks.push({ type: 'list', items });
      i -= 1;
      continue;
    }
    if (!line.trim()) flushParagraph();
    else if (section) paragraph.push(line.trim());
  }
  flushParagraph();
  return { title, sections };
}

function chunkBlock(block) {
  if (block.type === 'table' && block.rows.length > 6) {
    return Array.from({ length: Math.ceil(block.rows.length / 6) }, (_, index) => ({ ...block, rows: block.rows.slice(index * 6, index * 6 + 6) }));
  }
  if (block.type === 'steps' && block.steps.length > 6) {
    return Array.from({ length: Math.ceil(block.steps.length / 6) }, (_, index) => ({ ...block, steps: block.steps.slice(index * 6, index * 6 + 6) }));
  }
  if (block.type === 'list' && block.items.length > 6) {
    return Array.from({ length: Math.ceil(block.items.length / 6) }, (_, index) => ({ ...block, items: block.items.slice(index * 6, index * 6 + 6) }));
  }
  return [block];
}

function makeSlides(parsed) {
  const slides = [{ title: parsed.title.replace(/^Lesson \d+:?\s*/, ''), section: 'OPEN', kind: 'cover', blocks: [] }];
  for (const section of parsed.sections) {
    const blocks = section.blocks.flatMap(chunkBlock);
    let current = [];
    let weight = 0;
    const add = () => {
      if (!current.length) return;
      slides.push({ title: section.title, section: section.title, kind: current.length === 1 ? current[0].type : 'mixed', blocks: current });
      current = [];
      weight = 0;
    };
    for (const block of blocks) {
      const nextWeight = block.type === 'table' || block.type === 'steps' || block.type === 'list' ? 3 : block.type === 'callout' ? 1 : 2;
      if (weight + nextWeight > 5) add();
      current.push(block);
      weight += nextWeight;
    }
    add();
  }
  return slides.map((slide, index) => ({ ...slide, id: `generated-${index + 1}` }));
}

for (let number = 5; number <= 14; number += 1) {
  const prefix = `lesson-${String(number).padStart(2, '0')}-`;
  const file = fs.readdirSync(sourceRoot).find((name) => name.startsWith(prefix) && name.endsWith('.md'));
  if (!file) throw new Error(`Missing source for lesson ${number}`);
  const parsed = parseSections(fs.readFileSync(path.join(sourceRoot, file), 'utf8'));
  lessons.push({ number: String(number).padStart(2, '0'), title: parsed.title.replace(/^Lesson \d+:?\s*/, ''), slides: makeSlides(parsed) });
}

fs.writeFileSync(path.join(project, 'app', 'generated-lessons.json'), `${JSON.stringify(lessons, null, 2)}\n`);
console.log(`Generated ${lessons.reduce((sum, lesson) => sum + lesson.slides.length, 0)} slides across ${lessons.length} lessons.`);
