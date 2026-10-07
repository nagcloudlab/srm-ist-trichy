'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { CourseLesson } from './course-data';

export type SlideMeta = {
  kicker: string;
  title: string;
  kind: string;
  subtitle?: string;
  reveal?: boolean;
};

export type LessonSection = { label: string; at: number };
export type PresenterNote = { time: string; say: string; ask: string };

type RenderState = {
  index: number;
  revealed: boolean;
  slide: SlideMeta;
};

type PresentationShellProps = {
  children: (state: RenderState) => ReactNode;
  courseLessons: CourseLesson[];
  lessonNumber: string;
  notes: Record<string, PresenterNote>;
  sections: LessonSection[];
  slides: SlideMeta[];
};

const clamp = (value: number, maximum: number) => Math.max(0, Math.min(maximum, value));

export function PresentationShell({ children, courseLessons, lessonNumber, notes, sections, slides }: PresentationShellProps) {
  const [index, setIndex] = useState(0);
  const [notesOpen, setNotesOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [courseMap, setCourseMap] = useState(false);
  const [teachingMode, setTeachingMode] = useState(false);
  const touchStart = useRef<number | null>(null);
  const courseClose = useRef<HTMLButtonElement | null>(null);
  const storageKey = `gan-course-lesson-${lessonNumber}-slide`;

  const goTo = (nextIndex: number) => {
    setRevealed(false);
    setIndex(clamp(nextIndex, slides.length - 1));
  };

  useEffect(() => {
    const restorePosition = () => {
      const hashMatch = window.location.hash.match(/slide-(\d+)/);
      const saved = Number(window.localStorage.getItem(storageKey));
      const requested = hashMatch ? Number(hashMatch[1]) - 1 : saved;
      if (Number.isInteger(requested) && requested >= 0 && requested < slides.length) {
        window.requestAnimationFrame(() => {
          setRevealed(false);
          setIndex(requested);
        });
      }
    };
    restorePosition();
    window.addEventListener('hashchange', restorePosition);
    return () => window.removeEventListener('hashchange', restorePosition);
  }, [slides.length, storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, String(index));
    const nextHash = `#lesson-${lessonNumber}/slide-${index + 1}`;
    if (window.location.hash !== nextHash) window.history.replaceState(null, '', nextHash);
  }, [index, lessonNumber, storageKey]);

  useEffect(() => {
    if (courseMap) window.requestAnimationFrame(() => courseClose.current?.focus());
  }, [courseMap]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
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
        setRevealed(false);
        setIndex((value) => clamp(value + 1, slides.length - 1));
      }
      if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
        event.preventDefault();
        setRevealed(false);
        setIndex((value) => clamp(value - 1, slides.length - 1));
      }
      if (key === 'n') setNotesOpen((value) => !value);
      if (key === 'r' && slides[index].reveal) setRevealed((value) => !value);
      if (key === 't') setTeachingMode((value) => !value);
      if (key === 'f') {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [courseMap, index, slides]);

  const slide = slides[index];
  const activeSection = [...sections].reverse().find((section) => index >= section.at)?.label ?? sections[0]?.label ?? '';
  const presenterNote = notes[slide.kind];
  const currentLesson = courseLessons.find((lesson) => lesson.number === lessonNumber);

  return <main className={`deck-shell ${teachingMode ? 'teaching-mode' : ''}`} onTouchStart={(event) => {
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
      <button className="brand-mark" onClick={() => setCourseMap(true)} aria-label="Open course map">NN</button>
      <button className="deck-label" onClick={() => setCourseMap(true)}>Neural Networks · {courseLessons.length}-lesson course <span>⌄</span></button>
      <div className="top-actions">
        <button className="notes-toggle" onClick={() => setCourseMap(true)} title="Course map (M)">M&nbsp; Course</button>
        <button className="notes-toggle" onClick={() => setNotesOpen((value) => !value)} aria-pressed={notesOpen} title="Presenter notes (N)">N&nbsp; Notes</button>
        <button className={`notes-toggle ${teachingMode ? 'active' : ''}`} onClick={() => setTeachingMode((value) => !value)} aria-pressed={teachingMode} title="Teaching mode (T)">T&nbsp; Teach</button>
        <button className="notes-toggle fullscreen-toggle" onClick={() => document.fullscreenElement ? document.exitFullscreen?.() : document.documentElement.requestFullscreen?.()} title="Fullscreen (F)">F&nbsp; Fullscreen</button>
      </div>
      <div className="slide-count">{String(index + 1).padStart(2, '0')} / {slides.length}</div>
    </header>

    <section key={index} className={`slide slide-${slide.kind} slide-enter`} aria-live="polite" aria-label={`Slide ${index + 1}: ${slide.title}`}>
      <header className="slide-header"><span>{activeSection.toUpperCase()} · {slide.kicker}</span><span className="lesson-label">LESSON {lessonNumber}</span></header>
      {children({ index, revealed, slide })}
    </section>

    <footer className="controlbar">
      <nav className="lesson-rail" aria-label="Lesson sections">{sections.map((section, sectionIndex) => {
        const next = sections[sectionIndex + 1]?.at ?? slides.length;
        const active = index >= section.at && index < next;
        return <button key={section.label} onClick={() => goTo(section.at)} className={`rail-item ${active ? 'active' : ''}`}><span>{sectionIndex + 1}</span>{section.label}</button>;
      })}</nav>
      <div className="nav-buttons">
        <button onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous slide">←</button>
        <button className={`reveal-button ${revealed ? 'active' : ''}`} onClick={() => setRevealed((value) => !value)} disabled={!slide.reveal} aria-pressed={revealed} title="Reveal answer (R)">R</button>
        <button onClick={() => goTo(index + 1)} disabled={index === slides.length - 1} aria-label="Next slide">→</button>
      </div>
    </footer>

    {notesOpen && presenterNote && <aside className="speaker-notes">
      <div className="notes-heading"><small>PRESENTER GUIDE · {presenterNote.time}</small><button onClick={() => setNotesOpen(false)} aria-label="Close presenter notes">×</button></div>
      <p><b>Say</b>{presenterNote.say}</p>
      <p><b>Ask</b>{presenterNote.ask}</p>
      <div><kbd>←</kbd><kbd>→</kbd> navigate <kbd>R</kbd> reveal <kbd>T</kbd> teach <kbd>M</kbd> course</div>
    </aside>}

    {courseMap && <div className="course-overlay" role="dialog" aria-modal="true" aria-label="Course map" onClick={() => setCourseMap(false)}>
      <section className="course-panel" onClick={(event) => event.stopPropagation()}>
        <header className="course-panel-header">
          <div><small>NEURAL NETWORKS</small><h2>Course map</h2><p>One visual system from a single neuron to PyTorch.</p></div>
          <button ref={courseClose} onClick={() => setCourseMap(false)} aria-label="Close course map">×</button>
        </header>
        <div className="course-progress"><span style={{ width: `${(courseLessons.filter((lesson) => lesson.status === 'available').length / courseLessons.length) * 100}%` }} /><p>{currentLesson?.title} · Lesson {lessonNumber} of {courseLessons.length}</p></div>
        <div className="course-grid">
          {courseLessons.map((lesson) => <button key={lesson.number} className={`course-card ${lesson.number === lessonNumber ? 'current' : ''}`} disabled={lesson.status !== 'available'} onClick={() => {
            if (lesson.number === lessonNumber) {
              goTo(0);
              setCourseMap(false);
            } else if (lesson.href) {
              window.location.assign(lesson.href);
            }
          }}>
            <span>{lesson.number}</span><div><small>{lesson.module}</small><strong>{lesson.title}</strong></div><em>{lesson.status === 'available' ? 'OPEN' : 'PLANNED'}</em>
          </button>)}
        </div>
        <footer className="course-panel-footer"><span>Direct link: <b>#lesson-{lessonNumber}/slide-{index + 1}</b></span><span>Your place is saved automatically.</span></footer>
      </section>
    </div>}
  </main>;
}
