/* ============================================================
   GAN Course Slide Deck — Navigation Engine v2

   Features:
   - Keyboard/touch/click navigation
   - Incremental builds (press → to reveal next .step)
   - Presenter notes (N key)
   - Fullscreen (F key)
   - Reveal answers (R key or click .revealable)
   - Help overlay (H key)
   - Progress bar + slide counter
   - Auto-save position per lesson
   ============================================================ */

(function () {
  'use strict';

  let currentSlide = 0;
  let notesOpen = false;
  let helpOpen = false;

  const slides = () => document.querySelectorAll('.slide');
  const total = () => slides().length;
  const progressBar = () => document.querySelector('.progress-bar');
  const counter = () => document.querySelector('.slide-counter');
  const notesPanel = () => document.querySelector('.notes-panel');
  const helpOverlay = () => document.querySelector('.help-overlay');

  /* --- Incremental Build System ---
     Elements with class .step are hidden initially.
     Pressing → reveals them one at a time before advancing to next slide.
  */
  function getSteps(slide) {
    return slide.querySelectorAll('.step:not(.shown)');
  }

  function resetSteps(slide) {
    slide.querySelectorAll('.step').forEach(s => s.classList.remove('shown'));
  }

  function showNextStep(slide) {
    const pending = getSteps(slide);
    if (pending.length > 0) {
      pending[0].classList.add('shown');
      return true; // consumed the keypress
    }
    return false; // no more steps, advance slide
  }

  function showAllSteps(slide) {
    slide.querySelectorAll('.step').forEach(s => s.classList.add('shown'));
  }

  /* --- Slide Navigation --- */
  function goTo(index) {
    const n = total();
    if (n === 0) return;

    const oldSlide = slides()[currentSlide];
    currentSlide = Math.max(0, Math.min(n - 1, index));
    const newSlide = slides()[currentSlide];

    // Toggle active
    slides().forEach((s, i) => {
      s.classList.toggle('active', i === currentSlide);
      if (i !== currentSlide) resetSteps(s);
    });

    // Trigger enter animations
    if (newSlide) {
      newSlide.querySelectorAll('.animate-in').forEach((el, i) => {
        el.style.animationDelay = (i * 0.1) + 's';
      });
    }

    // Progress bar
    const bar = progressBar();
    if (bar) bar.style.width = ((currentSlide + 1) / n * 100) + '%';

    // Counter
    const c = counter();
    if (c) c.textContent = (currentSlide + 1) + ' / ' + n;

    // Notes
    updateNotes();

    // No position saving — always start from slide 1

    // Hash
    history.replaceState(null, '', '#slide-' + (currentSlide + 1));
  }

  function next() {
    const slide = slides()[currentSlide];
    // Try to show next incremental step first
    if (slide && showNextStep(slide)) return;
    goTo(currentSlide + 1);
  }

  function prev() {
    goTo(currentSlide - 1);
  }

  /* --- Presenter Notes --- */
  function updateNotes() {
    const panel = notesPanel();
    if (!panel) return;
    const slide = slides()[currentSlide];
    if (!slide) return;

    const say = slide.dataset.say || '';
    const ask = slide.dataset.ask || '';
    const time = slide.dataset.time || '';

    panel.querySelector('.note-say').textContent = say || 'No notes for this slide.';
    panel.querySelector('.note-ask').textContent = ask ? 'Ask: ' + ask : '';
    panel.querySelector('.note-time').textContent = '';  // timing intentionally not shown
  }

  function toggleNotes() {
    notesOpen = !notesOpen;
    const panel = notesPanel();
    if (panel) panel.classList.toggle('open', notesOpen);
  }

  /* --- Help --- */
  function toggleHelp() {
    helpOpen = !helpOpen;
    const overlay = helpOverlay();
    if (overlay) overlay.classList.toggle('open', helpOpen);
  }

  /* --- Fullscreen --- */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }

  /* --- Reveal (answers) --- */
  function handleReveal() {
    const slide = slides()[currentSlide];
    if (!slide) return;
    // Reveal all revealables on current slide
    const revs = slide.querySelectorAll('.revealable:not(.revealed)');
    if (revs.length > 0) {
      revs[0].classList.add('revealed');
    }
  }

  /* --- Keyboard --- */
  document.addEventListener('keydown', function (e) {
    if (helpOpen && e.key === 'Escape') { toggleHelp(); return; }
    if (notesOpen && e.key === 'Escape') { toggleNotes(); return; }

    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case ' ': case 'PageDown':
        e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
        e.preventDefault(); prev(); break;
      case 'Home': e.preventDefault(); goTo(0); break;
      case 'End': e.preventDefault(); goTo(total() - 1); break;
      case 'n': case 'N': toggleNotes(); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case 'r': case 'R': handleReveal(); break;
      case 'h': case 'H': case '?': toggleHelp(); break;
      case 'Escape': break;
    }
  });

  /* --- Touch --- */
  let touchStartX = 0, touchStartY = 0;
  document.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      dx < 0 ? next() : prev();
    }
  }, { passive: true });

  /* --- Click on revealables --- */
  document.addEventListener('click', function (e) {
    const rev = e.target.closest('.revealable');
    if (rev) rev.classList.toggle('revealed');
  });

  /* --- Init --- */
  document.addEventListener('DOMContentLoaded', function () {
    const hashMatch = location.hash.match(/slide-(\d+)/);
    const startAt = hashMatch ? parseInt(hashMatch[1], 10) - 1 : 0;
    goTo(startAt);
  });
})();
