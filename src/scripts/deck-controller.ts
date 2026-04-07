/**
 * Deck controller — keyboard nav, swipe, URL routing.
 *
 * Loaded globally via DeckLayout. Reads slide manifest, listens for input events,
 * and navigates between slides via hard navigation (window.location.assign).
 *
 * Base path: when deployed to GitHub Pages, every slide URL is prefixed with
 * `/padelguest-pitch/`. This module owns the conversion between app-level
 * slugs (`/`, `/02-hook`) — which the manifest stores — and real URL paths
 * (`/padelguest-pitch/`, `/padelguest-pitch/02-hook`). The slide manifest
 * stays base-agnostic.
 */

import { slides, getNextSlide, getPrevSlide, TOTAL_SLIDES } from '../lib/slides';

const BASE = import.meta.env.BASE_URL;            // '/padelguest-pitch/'
const BASE_NO_TRAIL = BASE.replace(/\/$/, '');    // '/padelguest-pitch'

/** Convert an app-level slug ('/', '/02-hook') to the real URL path. */
function withBase(slug: string): string {
  if (slug === '/') return BASE;
  return BASE_NO_TRAIL + slug;
}

/** Strip the base from window.location.pathname to get the app-level slug. */
function withoutBase(pathname: string): string {
  let p = pathname;
  if (BASE_NO_TRAIL && p.indexOf(BASE_NO_TRAIL) === 0) p = p.slice(BASE_NO_TRAIL.length);
  if (p === '' || p === '/') return '/';
  // Trim trailing slash so '/02-hook/' matches the manifest's '/02-hook'
  if (p.length > 1 && p.charAt(p.length - 1) === '/') p = p.slice(0, -1);
  return p;
}

function getCurrentSlug(): string {
  return withoutBase(window.location.pathname);
}

function go(slug: string): void {
  const target = withBase(slug);
  if (target !== window.location.pathname) {
    window.location.assign(target);
  }
}

function goNext(): void {
  const next = getNextSlide(getCurrentSlug());
  if (next) go(next.slug);
}

function goPrev(): void {
  const prev = getPrevSlide(getCurrentSlug());
  if (prev) go(prev.slug);
}

function goFirst(): void {
  go(slides[0].slug);
}

function goLast(): void {
  go(slides[slides.length - 1].slug);
}

// === Keyboard navigation ===
function handleKey(e: KeyboardEvent): void {
  // Don't intercept when user is typing in an input
  const target = e.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

  switch (e.key) {
    case 'ArrowRight':
    case ' ':
    case 'PageDown':
      e.preventDefault();
      goNext();
      break;
    case 'ArrowLeft':
    case 'PageUp':
      e.preventDefault();
      goPrev();
      break;
    case 'Home':
      e.preventDefault();
      goFirst();
      break;
    case 'End':
      e.preventDefault();
      goLast();
      break;
  }
}

// === Touch swipe navigation ===
let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 50;

function handleTouchStart(e: TouchEvent): void {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function handleTouchEnd(e: TouchEvent): void {
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;

  // Horizontal swipes only — ignore vertical scrolls
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
    if (dx < 0) goNext();
    else goPrev();
  }
}

// === Slide counter overlay ===
function updateCounter(): void {
  const counterEl = document.getElementById('slide-counter');
  if (!counterEl) return;
  const slug = getCurrentSlug();
  const current = slides.find(s => s.slug === slug);
  if (current) {
    counterEl.textContent = `${String(current.index).padStart(2, '0')} / ${String(TOTAL_SLIDES).padStart(2, '0')}`;
  }
}

// === Wire up listeners ===
function init(): void {
  document.addEventListener('keydown', handleKey);
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchend', handleTouchEnd, { passive: true });
  updateCounter();
}

init();
document.addEventListener('astro:page-load', updateCounter);
