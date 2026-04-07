/**
 * Slide manifest — the canonical order, slugs, and metadata for the deck.
 *
 * Reordering = reordering this array.
 * Adding/removing a slide = updating this array + the corresponding .astro page.
 *
 * Used by:
 *   - DeckLayout for next/prev navigation
 *   - deck-controller for keyboard navigation
 *   - SlideCounter for "02 / 12" display
 */

export interface SlideMeta {
  /** 1-based slide number */
  index: number;
  /** URL path */
  slug: string;
  /** Human-readable title (used in nav, browser tab, slide counter) */
  title: string;
  /** Background color category (matches .bg-cream / .bg-forest) */
  bg: 'cream' | 'forest';
  /** Optional path to a GSAP animation script for this slide */
  animation?: string;
}

export const slides: SlideMeta[] = [
  { index: 1,  slug: '/',                     title: 'Cover',                bg: 'forest' },
  { index: 2,  slug: '/02-hook',              title: 'The Opportunity',      bg: 'cream',  animation: 'slide-02-hook' },
  { index: 3,  slug: '/03-problem-insight',   title: 'Problem & Insight',    bg: 'cream' },
  { index: 4,  slug: '/04-solution',          title: 'The Solution',         bg: 'cream',  animation: 'slide-04-solution' },
  { index: 5,  slug: '/05-operating-layer',   title: 'The Operating Layer',  bg: 'forest' },
  { index: 6,  slug: '/06-why-now',           title: 'Why Now',              bg: 'cream',  animation: 'slide-06-why-now' },
  { index: 7,  slug: '/07-market',            title: 'The Market',           bg: 'cream',  animation: 'slide-07-market' },
  { index: 8,  slug: '/08-model-economics',   title: 'Model & Economics',    bg: 'cream',  animation: 'slide-08-economics' },
  { index: 9,  slug: '/09-competition',       title: 'Competition',          bg: 'cream',  animation: 'slide-09-competition' },
  { index: 10, slug: '/10-beachhead',         title: 'The Beachhead',        bg: 'cream',  animation: 'slide-10-beachhead' },
  { index: 11, slug: '/11-team',              title: 'Team',                 bg: 'forest' },
  { index: 12, slug: '/12-vision-close',      title: 'Now Is The Time',     bg: 'forest', animation: 'slide-12-vision-close' },
];

export const TOTAL_SLIDES = slides.length;

/** Find a slide by URL pathname. */
export function getSlideBySlug(slug: string): SlideMeta | undefined {
  return slides.find(s => s.slug === slug);
}

/** Get the next slide, or undefined if at the end. */
export function getNextSlide(currentSlug: string): SlideMeta | undefined {
  const idx = slides.findIndex(s => s.slug === currentSlug);
  if (idx === -1 || idx === slides.length - 1) return undefined;
  return slides[idx + 1];
}

/** Get the previous slide, or undefined if at the beginning. */
export function getPrevSlide(currentSlug: string): SlideMeta | undefined {
  const idx = slides.findIndex(s => s.slug === currentSlug);
  if (idx <= 0) return undefined;
  return slides[idx - 1];
}
