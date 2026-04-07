/**
 * Slide-fitter — Fixed-canvas responsive scaling (resize handler).
 *
 * Each slide is a fixed 1920×1080 div. The *initial* fit for every page is
 * computed by an inline `<script is:inline>` in DeckLayout.astro so the slide
 * is sized correctly on the very first painted frame. This module exists only
 * to refit on viewport changes after that.
 */

const SLIDE_W = 1920;
const SLIDE_H = 1080;

function fitSlide(): void {
  const scale = Math.min(window.innerWidth / SLIDE_W, window.innerHeight / SLIDE_H);
  const offsetX = (window.innerWidth - SLIDE_W * scale) / 2;
  const offsetY = (window.innerHeight - SLIDE_H * scale) / 2;
  const root = document.documentElement.style;
  root.setProperty('--slide-scale', String(scale));
  root.setProperty('--slide-x', `${offsetX}px`);
  root.setProperty('--slide-y', `${offsetY}px`);
}

window.addEventListener('resize', fitSlide);
window.addEventListener('orientationchange', fitSlide);
