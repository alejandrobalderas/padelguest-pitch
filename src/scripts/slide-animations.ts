/**
 * slide-animations.ts — All deck animations in one global script.
 *
 * Loaded once per page (each slide is a hard navigation). Reads the current
 * slide's `data-slide-anim` attribute and dispatches to a per-slide function.
 *
 * Conventions:
 *   - Selectors are scoped to the slide root via `$(root, ...)`
 *   - Use `gsap.set()` + `gsap.to()` (idempotent) instead of `gsap.from()`
 *   - Animations only play once per session per slide; revisits get an
 *     instant `.slide-seen` reveal. A page refresh clears the seen state.
 */

import gsap from 'gsap';

function $(root: ParentNode, sel: string): HTMLElement[] {
  const result: HTMLElement[] = [];
  root.querySelectorAll<HTMLElement>(sel).forEach((el) => result.push(el));
  return result;
}

/* ─────────────────────────────────────────────────────────────────────
 * Session-aware animation skipping.
 *
 * Animations play once per session per slide. On revisit (e.g., scrolling
 * backward through the deck), the slide is added to the `.slide-seen` class
 * which makes the [data-anim] elements visible immediately via CSS — no
 * animation replay, no distraction.
 *
 * A page refresh (Cmd+R) detected via PerformanceNavigationTiming clears
 * the seen-state for a fresh experience on every reload.
 * ───────────────────────────────────────────────────────────────────── */

const SEEN_KEY_PREFIX = 'pg-deck-seen:';

function isReload(): boolean {
  try {
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    return entries[0]?.type === 'reload';
  } catch {
    return false;
  }
}

function clearSeenSession(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.indexOf(SEEN_KEY_PREFIX) === 0) keys.push(k);
    }
    keys.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    /* sessionStorage may be blocked; ignore */
  }
}

function hasBeenSeen(slideKey: string): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY_PREFIX + slideKey) === '1';
  } catch {
    return false;
  }
}

function markSeen(slideKey: string): void {
  try {
    sessionStorage.setItem(SEEN_KEY_PREFIX + slideKey, '1');
  } catch {
    /* sessionStorage may be blocked; ignore */
  }
}

// On script init: if this is a reload, wipe all seen state so animations
// play fresh. Normal navigations (Astro view transitions, browser back/forward,
// or our own deck-controller link assigns) preserve the seen state.
if (isReload()) {
  clearSeenSession();
}

/* ─────────────────────────────────────────────────────────────────────
 * Slide-specific animation functions
 * Each receives the slide root element. All selectors scoped to root.
 * ───────────────────────────────────────────────────────────────────── */

function animateCover(root: HTMLElement): void {
  const wordmark = $(root, '[data-anim="wordmark"]');
  const rule = $(root, '[data-anim="rule"]');
  const tagline = $(root, '[data-anim="tagline"]');
  const footer = $(root, '[data-anim="footer"]');

  gsap.set(wordmark, { opacity: 0, y: 60 });
  gsap.set(rule, { opacity: 0, scaleX: 0, transformOrigin: 'left center' });
  gsap.set(tagline, { opacity: 0, y: 20 });
  gsap.set(footer, { opacity: 0 });

  const tl = gsap.timeline({ delay: 0.1 });
  tl.to(wordmark, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' })
    .to(rule, { opacity: 1, scaleX: 1, duration: 0.8, ease: 'power3.out' }, '-=0.6')
    .to(tagline, { opacity: 0.88, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.4')
    .to(footer, { opacity: 1, duration: 0.6 }, '-=0.2');
}

function animateHook(root: HTMLElement): void {
  const lede = $(root, '[data-anim="lede"]');
  const stats = $(root, '[data-anim="stat"]');
  const punch = $(root, '[data-anim="punch"]');

  gsap.set(lede, { opacity: 0, y: 16 });
  gsap.set(stats, { opacity: 0, y: 40 });
  gsap.set(punch, { opacity: 0, y: 16 });

  const tl = gsap.timeline({ delay: 0.2 });
  tl.to(lede, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
    .to(stats, {
      opacity: 1,
      y: 0,
      stagger: 0.16,
      duration: 0.85,
      ease: 'power3.out',
    }, '-=0.3')
    .to(punch, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.2');
}

function animateProblem(root: HTMLElement): void {
  const left = $(root, '[data-anim="left"]');
  const right = $(root, '[data-anim="right"]');
  const pilot = $(root, '[data-anim="pilot"]');
  gsap.set(left, { opacity: 0, x: -30 });
  gsap.set(right, { opacity: 0, scale: 0.96 });
  gsap.set(pilot, { opacity: 0, y: 16 });
  const tl = gsap.timeline({ delay: 0.2 });
  tl.to(left, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' })
    .to(right, { opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' }, '-=0.5')
    .to(pilot, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.3');
}

function animateSolution(root: HTMLElement): void {
  // The signature animation. Each step column reveals as one cohesive unit
  // (number + rule + name + description + phone all together), then the
  // next column starts. The eye follows a "story" being told step by step,
  // not a row-by-row cascade.
  const columns = $(root, '.col');
  const footerCaption = $(root, '[data-anim="footer-caption"]');

  // Initial state: hide every animated element inside every column
  columns.forEach((col) => {
    const els = col.querySelectorAll<HTMLElement>('[data-anim]');
    els.forEach((el) => {
      const role = el.getAttribute('data-anim');
      if (role === 'rule') {
        gsap.set(el, { opacity: 0, scaleX: 0, transformOrigin: 'left center' });
      } else if (role === 'phone') {
        gsap.set(el, { opacity: 0, y: 40 });
      } else {
        gsap.set(el, { opacity: 0, y: 20 });
      }
    });
  });
  gsap.set(footerCaption, { opacity: 0 });

  const tl = gsap.timeline({ delay: 0.2 });

  // Time between when one column starts animating and the next column starts.
  // Smaller = punchier rapid-fire reveal. Larger = more deliberate pacing.
  const COLUMN_STAGGER = 0.22;

  columns.forEach((col, i) => {
    const els = col.querySelectorAll<HTMLElement>('[data-anim]');
    const start = i * COLUMN_STAGGER;

    // Animate all elements in this column together with a tiny intra-column
    // stagger (0.05s) — they feel like one moment but with subtle layering.
    tl.to(els, {
      opacity: 1,
      y: 0,
      scaleX: 1,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.05,
    }, start);
  });

  // Footer caption fades in after all columns have settled
  tl.to(footerCaption, {
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out',
  }, '+=0.05');

}

function animateOperating(root: HTMLElement): void {
  const sub = $(root, '[data-anim="sub"]');
  const hero = $(root, '[data-anim="hero"]');
  gsap.set(sub, { opacity: 0, y: 16 });
  gsap.set(hero, { opacity: 0, y: 40, scale: 0.97 });
  const tl = gsap.timeline({ delay: 0.2 });
  tl.to(sub, { opacity: 0.7, y: 0, duration: 0.7, ease: 'power2.out' })
    .to(hero, { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: 'power3.out' }, '-=0.4');
}

function animateWhyNow(root: HTMLElement): void {
  const cols = $(root, '[data-anim="col"]');
  gsap.set(cols, { opacity: 0, y: 30 });
  const tl = gsap.timeline({ delay: 0.2 });
  tl.to(cols, {
    opacity: 1,
    y: 0,
    stagger: 0.18,
    duration: 0.85,
    ease: 'power3.out',
  });
}

function animateMarket(root: HTMLElement): void {
  const sub = $(root, '[data-anim="sub"]');
  const rows = $(root, '[data-anim="row"]');
  gsap.set(sub, { opacity: 0, y: 16 });
  gsap.set(rows, { opacity: 0, y: 16 });
  const tl = gsap.timeline({ delay: 0.15 });
  tl.to(sub, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
    .to(rows, {
      opacity: 1,
      y: 0,
      stagger: 0.08,
      duration: 0.5,
      ease: 'power2.out',
    }, '-=0.3');
}

function animateEconomics(root: HTMLElement): void {
  // After the asset-light rework, slide 8 has:
  //   [data-anim="trow"] — 3 flow steps (top row)
  //   [data-anim="card"] — the stats container (bottom row)
  // We animate the flow steps first with a left-to-right cascade,
  // then the stats container fades up.
  const flowSteps = $(root, '[data-anim="trow"]');
  const statsContainer = $(root, '[data-anim="card"]');

  gsap.set(flowSteps, { opacity: 0, y: 24 });
  gsap.set(statsContainer, { opacity: 0, y: 24 });

  const tl = gsap.timeline({ delay: 0.2 });
  tl.to(flowSteps, {
      opacity: 1,
      y: 0,
      stagger: 0.18,
      duration: 0.7,
      ease: 'power3.out',
    })
    .to(statsContainer, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.3');

}

function animateCompetition(root: HTMLElement): void {
  // Choreography:
  //   1. Horizontal axis draws left-to-right; each dot drops in as the line
  //      sweeps past its x position (sorted by x, so it feels like the line
  //      is *placing* them).
  //   2. Vertical axis draws bottom-to-top to close the cross.
  //   3. Axis labels fade in alongside their respective lines.
  //   4. Pull quote lands last.
  //
  // FOUC note: the .matrix wrapper carries [data-anim="matrix"] so the CSS
  // `html.js [data-anim] { opacity: 0 }` rule hides everything inside it
  // (lines, labels, dots) until we set their from-states and reveal the wrapper.
  const matrix = $(root, '[data-anim="matrix"]');
  const hLine = $(root, '.h-line');
  const vLine = $(root, '.v-line');
  const xLabels = $(root, '.axis-label.x-left, .axis-label.x-right');
  const yLabels = $(root, '.axis-label.y-top, .axis-label.y-bottom');
  const dots = $(root, '[data-anim="dot"]');
  const pull = $(root, '[data-anim="pull"]');

  // Sort dots by their inline `left` percentage so they reveal in the order
  // the horizontal line sweeps past them.
  const sortedDots = dots.slice().sort((a, b) => {
    const ax = parseFloat(a.style.left) || 0;
    const bx = parseFloat(b.style.left) || 0;
    return ax - bx;
  });

  // From-states (set while .matrix is still opacity:0 via CSS)
  gsap.set(hLine, { scaleX: 0, transformOrigin: 'left center' });
  gsap.set(vLine, { scaleY: 0, transformOrigin: 'center bottom' });
  gsap.set(xLabels, { opacity: 0 });
  gsap.set(yLabels, { opacity: 0 });
  gsap.set(dots, { opacity: 0, scale: 0.3 });
  gsap.set(pull, { opacity: 0, y: 20 });
  // Reveal the wrapper — children remain invisible because of their own states
  gsap.set(matrix, { opacity: 1 });

  const tl = gsap.timeline({ delay: 0.2 });

  const H_DUR = 1.15;
  const V_DUR = 0.9;

  // 1. Horizontal axis sweeps left → right
  tl.to(hLine, { scaleX: 1, duration: H_DUR, ease: 'power2.inOut' }, 0)
    .to(xLabels, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.1);

  // Drop each dot in as the sweep reaches its x position
  sortedDots.forEach((dot) => {
    const xPct = parseFloat(dot.style.left) || 50;
    const dropTime = (xPct / 100) * H_DUR;
    const isHighlight = dot.classList.contains('highlight');
    tl.to(dot, {
      opacity: 1,
      scale: 1,
      duration: 0.55,
      ease: isHighlight ? 'back.out(2.2)' : 'back.out(1.6)',
    }, dropTime);
  });

  // 2. Vertical axis draws bottom → top to close the cross
  tl.to(vLine, { scaleY: 1, duration: V_DUR, ease: 'power2.inOut' }, H_DUR + 0.15)
    .to(yLabels, { opacity: 1, duration: 0.5, ease: 'power2.out' }, H_DUR + 0.25);

  // 3. Pull quote
  tl.to(pull, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power3.out',
  }, '+=0.1');

}

function animateBeachhead(root: HTMLElement): void {
  const sub = $(root, '[data-anim="sub"]');
  const hotels = $(root, '[data-anim="hotel"]');
  const caption = $(root, '[data-anim="caption"]');
  gsap.set(sub, { opacity: 0, y: 16 });
  gsap.set(hotels, { opacity: 0, x: -16 });
  gsap.set(caption, { opacity: 0, y: 16 });
  const tl = gsap.timeline({ delay: 0.15 });
  tl.to(sub, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
    .to(hotels, {
      opacity: 1,
      x: 0,
      stagger: 0.05,
      duration: 0.4,
      ease: 'power2.out',
    }, '-=0.3')
    .to(caption, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
    }, '-=0.2');
}

function animateTeam(root: HTMLElement): void {
  const cards = $(root, '[data-anim="card"]');
  const advantage = $(root, '[data-anim="advantage"]');
  gsap.set(cards, { opacity: 0, y: 30, scale: 0.97 });
  gsap.set(advantage, { opacity: 0, y: 16 });
  const tl = gsap.timeline({ delay: 0.2 });
  tl.to(cards, {
    opacity: 1,
    y: 0,
    scale: 1,
    stagger: 0.15,
    duration: 0.85,
    ease: 'power3.out',
  })
    .to(advantage, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
    }, '-=0.3');
}

function animateVision(root: HTMLElement): void {
  const left = $(root, '[data-anim="left"]');
  const right = $(root, '[data-anim="right"]');
  const footer = $(root, '[data-anim="footer"]');
  gsap.set(left, { opacity: 0, x: -30 });
  gsap.set(right, { opacity: 0, x: 30 });
  gsap.set(footer, { opacity: 0 });
  const tl = gsap.timeline({ delay: 0.2 });
  tl.to(left, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' })
    .to(right, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, '-=0.6')
    .to(footer, { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.3');
}

/* ─────────────────────────────────────────────────────────────────────
 * Dispatcher
 * ───────────────────────────────────────────────────────────────────── */

const animators: Record<string, (root: HTMLElement) => void> = {
  cover: animateCover,
  hook: animateHook,
  problem: animateProblem,
  solution: animateSolution,
  operating: animateOperating,
  whynow: animateWhyNow,
  market: animateMarket,
  economics: animateEconomics,
  competition: animateCompetition,
  beachhead: animateBeachhead,
  team: animateTeam,
  vision: animateVision,
};

function runAnimation(): void {
  // Single rAF defers GSAP reads until after the browser has committed layout
  // for the freshly-parsed body. Each slide is a hard navigation, so the DOM
  // is brand-new every time — there's no stale state to worry about.
  requestAnimationFrame(() => {
    const root = document.querySelector<HTMLElement>('[data-slide-anim]');
    if (!root) return;
    const slideId = root.getAttribute('data-slide-anim') || '';
    const slideKey = window.location.pathname || slideId;

    // Already animated this session: skip and reveal via .slide-seen CSS.
    if (hasBeenSeen(slideKey)) {
      root.classList.add('slide-seen');
      return;
    }

    markSeen(slideKey);
    const animator = animators[slideId];
    if (animator) animator(root);
  });
}

runAnimation();
