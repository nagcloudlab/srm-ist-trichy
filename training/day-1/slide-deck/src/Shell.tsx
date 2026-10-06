import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DeckMeta, Part, Slide } from './types';

/**
 * Port of the phase-0 course deck's PresentationShell (backup/phase-0/phase-0-slide-deck/app/presentation-shell.tsx):
 * same chrome, same markup and class names, same keys. Each Day 1 part plays the role of a "lesson":
 * its sections drive the bottom rail, the counter is per part, and the course map lists the parts.
 */

type FlatSlide = Slide & { part: Part; index: number; inPart: number };

const clamp = (value: number, max: number) => Math.max(0, Math.min(max, value));

function readStorage(key: string): number | null {
  try {
    const value = Number(window.localStorage.getItem(key));
    return Number.isInteger(value) ? value : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: number) {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    /* storage unavailable — position just isn't remembered */
  }
}

/** Accepts #s2/slide-5 (canonical), #/42 (global number) or #slide-id. */
function indexFromHash(slides: FlatSlide[]): number | null {
  const hash = decodeURIComponent(window.location.hash.replace(/^#\/?/, ''));
  if (!hash) return null;
  const partMatch = hash.match(/^([a-z0-9]+)\/slide-(\d+)$/);
  if (partMatch) {
    const found = slides.find((s) => s.part.id === partMatch[1] && s.inPart === Number(partMatch[2]) - 1);
    return found ? found.index : null;
  }
  const numeric = Number(hash);
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= slides.length) return numeric - 1;
  const byId = slides.findIndex((slide) => slide.id === hash);
  return byId >= 0 ? byId : null;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function Shell({ parts, meta }: { parts: Part[]; meta: DeckMeta }) {
  const slides = useMemo<FlatSlide[]>(() => {
    const flat: FlatSlide[] = [];
    parts.forEach((part) => part.slides.forEach((slide, inPart) => flat.push({ ...slide, part, inPart, index: flat.length })));
    return flat;
  }, [parts]);

  const last = slides.length - 1;
  const [index, setIndex] = useState(() => clamp(indexFromHash(slides) ?? readStorage(meta.storageKey) ?? 0, last));
  const [revealed, setRevealed] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [courseMap, setCourseMap] = useState(false);
  const [teachingMode, setTeachingMode] = useState(false);
  const touchStart = useRef<number | null>(null);
  const courseClose = useRef<HTMLButtonElement | null>(null);

  const goTo = useCallback((next: number) => {
    setRevealed(false);
    setIndex(clamp(next, last));
  }, [last]);

  const slide = slides[index];
  const part = slide.part;

  useEffect(() => {
    writeStorage(meta.storageKey, index);
    const hash = `#${part.id}/slide-${slide.inPart + 1}`;
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
  }, [index, meta.storageKey, part.id, slide.inPart]);

  useEffect(() => {
    const onHash = () => {
      const next = indexFromHash(slides);
      if (next !== null) goTo(next);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [goTo, slides]);

  useEffect(() => {
    if (courseMap) window.requestAnimationFrame(() => courseClose.current?.focus());
  }, [courseMap]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (event.key === 'Escape') {
        setCourseMap(false);
        setNotesOpen(false);
        return;
      }
      const target = event.target as HTMLElement;
      if (target.matches('input, button, select, textarea')) return;
      if (key === 'm') {
        setCourseMap((value) => !value);
        return;
      }
      if (courseMap) return;
      if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].includes(event.key)) {
        event.preventDefault();
        goTo(index + 1);
      }
      if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
        event.preventDefault();
        goTo(index - 1);
      }
      if (event.key === 'Home') goTo(0);
      if (event.key === 'End') goTo(last);
      if (key === 'n') setNotesOpen((value) => !value);
      if (key === 'r' && slide.reveal) setRevealed((value) => !value);
      if (key === 't') setTeachingMode((value) => !value);
      if (key === 'f') {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => undefined);
        else document.exitFullscreen?.().catch(() => undefined);
      }
      if (/^[1-9]$/.test(event.key)) {
        const p = parts[Number(event.key) - 1];
        if (p) goTo(slides.findIndex((s) => s.part.id === p.id));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [courseMap, goTo, index, last, parts, slide.reveal, slides]);

  const partSlides = slides.filter((s) => s.part.id === part.id);
  const partStart = partSlides[0].index;
  const sections = partSlides.reduce<{ label: string; at: number }[]>((acc, s) => {
    if (!acc.length || acc[acc.length - 1].label !== s.section) acc.push({ label: s.section, at: s.index });
    return acc;
  }, []);
  const activeSection = [...sections].reverse().find((section) => index >= section.at)?.label ?? '';
  const layout = slide.layout ?? 'standard';
  const partNumber = parts.findIndex((p) => p.id === part.id);
  const lessonLabel = meta.lessonLabel(part);

  return <main className={`deck-shell part-${part.id} ${teachingMode ? 'teaching-mode' : ''}`} onTouchStart={(event) => {
    const target = event.target as HTMLElement;
    if (!courseMap && !target.closest('input, button, select, textarea')) touchStart.current = event.changedTouches[0].clientX;
  }} onTouchEnd={(event) => {
    if (courseMap || touchStart.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(distance) > 55) goTo(index + (distance < 0 ? 1 : -1));
    touchStart.current = null;
  }}>
    <div className="progress" aria-hidden="true"><span style={{ width: `${((index + 1) / slides.length) * 100}%` }} /></div>
    <header className="topbar">
      <button className="brand-mark" onClick={() => setCourseMap(true)} aria-label="Open map">{meta.brand}</button>
      <button className="deck-label" onClick={() => setCourseMap(true)}>{meta.label} · {parts.length} parts <span>⌄</span></button>
      <div className="top-actions">
        <button className="notes-toggle" onClick={() => setCourseMap(true)} title="Map (M)">M&nbsp; Map</button>
        <button className="notes-toggle" onClick={() => setNotesOpen((value) => !value)} aria-pressed={notesOpen} title="Presenter notes (N)">N&nbsp; Notes</button>
        <button className={`notes-toggle ${teachingMode ? 'active' : ''}`} onClick={() => setTeachingMode((value) => !value)} aria-pressed={teachingMode} title="Teaching mode (T)">T&nbsp; Teach</button>
        <button className="notes-toggle fullscreen-toggle" onClick={() => (document.fullscreenElement ? document.exitFullscreen?.() : document.documentElement.requestFullscreen?.())?.catch(() => undefined)} title="Fullscreen (F)">F&nbsp; Fullscreen</button>
      </div>
      <div className="slide-count">{pad(slide.inPart + 1)} / {pad(partSlides.length)}</div>
    </header>

    <section key={slide.id} className={`slide slide-${layout} slide-${slide.id} ${slide.lab ? 'slide-lab' : ''} slide-enter`} aria-live="polite" aria-label={`Slide ${index + 1}: ${slide.title}`}>
      <header className="slide-header">
        <span>{activeSection.toUpperCase()} · {slide.kicker}</span>
        <span className="lesson-label">{lessonLabel}{slide.lab ? ' · LIVE' : ''}</span>
      </header>
      {layout === 'standard' ? (
        <div className={`content-layout kit-layout ${slide.lab ? 'kit-lab' : ''}`}>
          <h1>{slide.title}</h1>
          {slide.lede && <p className="kit-lede">{slide.lede}</p>}
          <div className="kit-body">{slide.render({ revealed })}</div>
        </div>
      ) : slide.render({ revealed })}
    </section>

    <footer className="controlbar">
      <nav className="lesson-rail" aria-label="Session sections" style={{ gridTemplateColumns: `repeat(${Math.max(sections.length, 6)}, minmax(78px, 1fr))` }}>{sections.map((section, sectionIndex) => {
        const next = sections[sectionIndex + 1]?.at ?? partStart + partSlides.length;
        const active = index >= section.at && index < next;
        return <button key={section.label} onClick={() => goTo(section.at)} className={`rail-item ${active ? 'active' : ''}`}><span>{sectionIndex + 1}</span>{section.label}</button>;
      })}</nav>
      <div className="nav-buttons">
        <button onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous slide">←</button>
        <button className={`reveal-button ${revealed ? 'active' : ''}`} onClick={() => setRevealed((value) => !value)} disabled={!slide.reveal} aria-pressed={revealed} title="Reveal answer (R)">R</button>
        <button onClick={() => goTo(index + 1)} disabled={index === last} aria-label="Next slide">→</button>
      </div>
    </footer>

    {notesOpen && <aside className="speaker-notes">
      <div className="notes-heading"><small>PRESENTER GUIDE</small><button onClick={() => setNotesOpen(false)} aria-label="Close presenter notes">×</button></div>
      <p><b>Say</b>{slide.notes.say}</p>
      <p><b>Ask</b>{slide.notes.ask}</p>
      {slides[index + 1] && <p><b>Next</b>{slides[index + 1].title}</p>}
      <div><kbd>←</kbd><kbd>→</kbd> navigate <kbd>R</kbd> reveal <kbd>T</kbd> teach <kbd>M</kbd> day map <kbd>1–8</kbd> parts</div>
    </aside>}

    {courseMap && <div className="course-overlay" role="dialog" aria-modal="true" aria-label={meta.mapTitle} onClick={() => setCourseMap(false)}>
      <section className="course-panel" onClick={(event) => event.stopPropagation()}>
        <header className="course-panel-header">
          <div><small>{meta.mapKicker}</small><h2>{meta.mapTitle}</h2><p>{meta.mapBlurb} — {slides.length} slides in {parts.length} parts.</p></div>
          <button ref={courseClose} onClick={() => setCourseMap(false)} aria-label="Close map">×</button>
        </header>
        <div className="course-progress"><span style={{ width: `${((index + 1) / slides.length) * 100}%` }} /><p>{part.title} · slide {slide.inPart + 1} of {partSlides.length} · part {partNumber + 1} of {parts.length}</p></div>
        <div className="course-grid">
          {parts.flatMap((p) => {
            const own = slides.filter((s) => s.part.id === p.id);
            const secs = own.filter((s, i) => i === 0 || own[i - 1].section !== s.section);
            return secs.map((s, i) => <button key={s.id} className={`course-card ${p.id === part.id && s.section === activeSection ? 'current' : ''}`} onClick={() => { goTo(s.index); setCourseMap(false); }}>
              <span>{p.code}</span><div><small>{i === 0 ? `${own.length} slides` : p.title}</small><strong>{i === 0 ? p.title : s.section}</strong></div><em>{pad(s.inPart + 1)}</em>
            </button>);
          })}
        </div>
        <footer className="course-panel-footer"><span>Direct link: <b>#{part.id}/slide-{slide.inPart + 1}</b></span><span>Your place is saved automatically.</span></footer>
      </section>
    </div>}
  </main>;
}
