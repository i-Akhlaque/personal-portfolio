/* ==========================================================================
   AKHLAQUE NABI — PORTFOLIO v3 · script.js
   --------------------------------------------------------------------------
   01 helpers            06 role rotator
   02 theme              07 pointer spotlight + card tilt
   03 navigation         08 copy to clipboard + toast
   04 scroll driver      09 misc
   05 reveal + counters  10 RopeField — curl-noise rope / Turing backdrop
   ========================================================================== */
(() => {
  'use strict';

  /* ============================= 01 · HELPERS ============================ */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let reduceMotion  = motionQuery.matches;

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const lerp  = (a, b, t) => a + (b - a) * t;

  /** Coalesce bursts of events into one rAF callback. */
  function rafThrottle(fn) {
    let queued = false;
    return (...args) => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; fn(...args); });
    };
  }

  function debounce(fn, wait = 150) {
    let id;
    return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), wait); };
  }

  /* ============================== 02 · THEME ============================= */
  const THEME_KEY = 'an-theme';
  const root = document.documentElement;
  const themeToggle = $('#themeToggle');

  function applyTheme(theme, persist = true) {
    root.setAttribute('data-theme', theme);
    if (persist) {
      try { localStorage.setItem(THEME_KEY, theme); } catch { /* private mode */ }
    }
    if (themeToggle) {
      const next = theme === 'dark' ? 'light' : 'dark';
      themeToggle.setAttribute('aria-label', `Switch to ${next} theme`);
      themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
    }
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  (function initTheme() {
    let stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch { /* ignore */ }
    const system = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    applyTheme(stored || system, false);

    // Follow the OS only while the user hasn't picked a theme themselves.
    matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      let hasChoice = false;
      try { hasChoice = !!localStorage.getItem(THEME_KEY); } catch { /* ignore */ }
      if (!hasChoice) applyTheme(e.matches ? 'light' : 'dark', false);
    });
  })();

  themeToggle?.addEventListener('click', () => {
    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  /* =========================== 03 · NAVIGATION =========================== */
  const nav       = $('#siteNav');
  const navLinks  = $('#navLinks');
  const navToggle = $('#navToggle');
  const links     = $$('a', navLinks);

  function setMenu(open) {
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('nav-open', open);
  }

  navToggle?.addEventListener('click', () => {
    setMenu(!navLinks.classList.contains('open'));
  });

  links.forEach((a) => a.addEventListener('click', () => setMenu(false)));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      setMenu(false);
      navToggle.focus();
    }
  });

  // Close the sheet if the viewport grows past the mobile breakpoint.
  matchMedia('(min-width: 901px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
  });

  /* ========================== 04 · SCROLL DRIVER ========================= */
  const progressBar = $('#progressBar');
  const toTop       = $('#toTop');
  const sections    = $$('main section[id]');

  const onScroll = rafThrottle(() => {
    const y = window.scrollY || document.documentElement.scrollTop;

    // reading progress
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = `${max > 0 ? clamp((y / max) * 100, 0, 100) : 0}%`;

    // nav hairline + back-to-top
    nav?.classList.toggle('scrolled', y > 8);
    toTop?.classList.toggle('show', y > 520);

    // scroll spy — the section currently owning the upper third of the viewport
    const probe = y + window.innerHeight * 0.32;
    let current = sections[0];
    for (const s of sections) {
      if (s.offsetTop <= probe) current = s;
    }
    // clamp to the last section once we hit the bottom of the page
    if (max - y < 4) current = sections[sections.length - 1];

    const id = current?.id;
    links.forEach((a) => {
      const active = a.hash === `#${id}`;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', debounce(onScroll, 120));
  onScroll();

  toTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ======================= 05 · REVEAL + COUNTERS ======================== */
  const revealables = $$('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      // Stagger siblings that enter together for a cascade rather than a pop.
      const shown = entries.filter((e) => e.isIntersecting);
      shown.forEach((entry, i) => {
        entry.target.style.setProperty('--d', `${Math.min(i, 6) * 80}ms`);
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealables.forEach((el) => io.observe(el));
  }

  // count-up stats
  const counters = $$('[data-count]');
  if (counters.length) {
    const runCounter = (el) => {
      const target = Number(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || '';
      const pad    = Number(el.dataset.pad) || 0;
      const format = (n) => String(n).padStart(pad, '0') + suffix;

      if (reduceMotion) { el.textContent = format(target); return; }

      const DURATION = 1300;
      let start = null;
      const tick = (ts) => {
        if (start === null) start = ts;
        const p = clamp((ts - start) / DURATION, 0, 1);
        const eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
        el.textContent = format(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(runCounter);
    } else {
      const cio = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          runCounter(e.target);
          obs.unobserve(e.target);
        });
      }, { threshold: 0.6 });
      counters.forEach((el) => cio.observe(el));
    }
  }

  /* =========================== 06 · ROLE ROTATOR ========================= */
  const rotator = $('#roleRotator');
  if (rotator) {
    const ROLES = [
      'Java Backend Developer',
      'Software Engineer',
      'Full-Stack Developer',
      'MERN Stack Engineer',
      'Spring Boot · REST APIs',
      'SIH 2025 Grand Finalist'
    ];

    if (reduceMotion) {
      rotator.textContent = ROLES[0];
    } else {
      let roleIndex = 0;
      let charIndex = 0;
      let deleting = false;

      const step = () => {
        const word = ROLES[roleIndex];
        charIndex += deleting ? -1 : 1;
        rotator.textContent = word.slice(0, charIndex);

        let delay = deleting ? 28 : 62;
        if (!deleting && charIndex === word.length) {
          deleting = true;
          delay = 1900;                       // hold the finished word
        } else if (deleting && charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % ROLES.length;
          delay = 340;
        }
        setTimeout(step, delay);
      };

      rotator.textContent = '';
      setTimeout(step, 900);
    }
  }

  /* ================== 07 · POINTER SPOTLIGHT + CARD TILT ================= */
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (finePointer && !reduceMotion) {
    // radial spotlight that tracks the cursor across cards
    $$('.spot, .idcard').forEach((el) => {
      el.addEventListener('pointermove', rafThrottle((e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
      }));
    });

    // 3D tilt on the credential card
    const card = $('#idCard');
    if (card) {
      const MAX = 8; // degrees
      card.addEventListener('pointermove', rafThrottle((e) => {
        const r = card.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width  - 0.5;
        const ny = (e.clientY - r.top)  / r.height - 0.5;
        card.style.setProperty('--ry', `${nx * MAX * 2}deg`);
        card.style.setProperty('--rx', `${-ny * MAX * 2}deg`);
      }));
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    }
  }

  /* ==================== 08 · COPY TO CLIPBOARD + TOAST =================== */
  const toast = $('#toast');
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      throw new Error('clipboard api unavailable');
    } catch {
      // Fallback for non-secure contexts / older browsers
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:-1000px;opacity:0;';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
      } catch {
        return false;
      }
    }
  }

  $$('[data-copy]').forEach((btn) => {
    const label = $('.btn-label', btn);
    const original = label?.textContent ?? '';

    btn.addEventListener('click', async () => {
      const value = btn.dataset.copy;
      const ok = await copyText(value);

      if (ok) {
        showToast(`Copied ${value}`);
        btn.classList.add('copied');
        if (label) label.textContent = 'Copied!';
        setTimeout(() => {
          btn.classList.remove('copied');
          if (label) label.textContent = original;
        }, 2000);
      } else {
        showToast('Copy failed — select the address instead');
      }
    });
  });

  /* ============================== 09 · MISC ============================== */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  motionQuery.addEventListener('change', (e) => { reduceMotion = e.matches; });

  /* ======================================================================
     10 · ROPEFIELD
     A backdrop of long filaments advected through a curl-noise field.
     Because curl noise is divergence-free, streamlines never collapse into
     one another — they braid, which is what produces the banded,
     Turing/reaction-diffusion look. Each rope samples the field only at its
     head; the body follows via distance constraints, so cost stays flat.
     ====================================================================== */
  class RopeField {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: true });
      if (!this.ctx) return;

      this.ropes   = [];
      this.time    = 0;
      this.running = false;
      this.visible = true;
      this.lastTs  = 0;
      this.pointer = { x: -9999, y: -9999, active: false };

      this.readColors();
      this.resize();
      this.bind();

      if (reduceMotion) this.renderStatic();
      else this.start();
    }

    /* ---- theme-driven colours ---- */
    readColors() {
      const cs = getComputedStyle(document.documentElement);
      const read = (name, fallback) => (cs.getPropertyValue(name).trim() || fallback);
      this.colorA = read('--rope-a', '#6f8cff');
      this.colorB = read('--rope-b', '#ffb454');
      this.alpha  = parseFloat(read('--rope-alpha', '0.5')) || 0.5;
      this.blend  = read('--rope-blend', 'lighter');
    }

    /* ---- sizing ---- */
    resize() {
      const { canvas } = this;
      const w = canvas.clientWidth  || canvas.parentElement.clientWidth  || 1;
      const h = canvas.clientHeight || canvas.parentElement.clientHeight || 1;

      // Cap DPR: past 2x the extra pixels buy nothing for soft 1px strokes.
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = Math.round(w * this.dpr);
      canvas.height = Math.round(h * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      this.w = w;
      this.h = h;
      // Field scale: bigger number => longer, lazier waves.
      this.scale = 1 / Math.max(300, Math.min(w, h) * 0.9);

      this.build();
    }

    build() {
      // Density scales with area so the field reads the same on any screen.
      const count  = clamp(Math.round((this.w * this.h) / 11500), 18, 78);
      const length = clamp(Math.round(this.h / 16), 22, 52);
      this.segment = clamp(this.h / 80, 7, 13);

      this.ropes = [];
      for (let i = 0; i < count; i++) {
        this.ropes.push(this.spawn(length, i / count));
      }

      // Pre-roll so ropes are already extended on the first painted frame.
      const warm = reduceMotion ? 260 : 90;
      for (let i = 0; i < warm; i++) this.step(1 / 60);
    }

    /**
     * Respawn anywhere in the (slightly padded) field rather than at an edge —
     * edge spawning lets the curl field bunch every rope into the same eddy.
     */
    spawn(length, tint) {
      const x = lerp(-40, this.w + 40, Math.random());
      const y = lerp(-40, this.h + 40, Math.random());
      const pts = new Float32Array(length * 2);
      for (let i = 0; i < length; i++) { pts[i * 2] = x; pts[i * 2 + 1] = y; }

      return {
        pts,
        length,
        angle: Math.random() * Math.PI * 2,
        speed: lerp(26, 52, Math.random()),
        tint: tint ?? Math.random(),
        width: lerp(0.8, 1.9, Math.random()),
        life: 0,
        maxLife: lerp(9, 20, Math.random()),
        phase: Math.random() * Math.PI * 2
      };
    }

    /* ---- noise ---- */
    // Integer hash → [0,1). Math.imul keeps the multiplies in 32-bit space.
    static hash(i, j, k) {
      let n = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(k, 1274126177);
      n = Math.imul(n ^ (n >>> 13), 1274126177);
      return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
    }

    // Trilinear value noise with smoothstep fade.
    static vnoise(x, y, z) {
      const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
      const xf = x - xi, yf = y - yi, zf = z - zi;
      const u = xf * xf * (3 - 2 * xf);
      const v = yf * yf * (3 - 2 * yf);
      const w = zf * zf * (3 - 2 * zf);
      const H = RopeField.hash;

      const c00 = lerp(H(xi, yi,     zi),     H(xi + 1, yi,     zi),     u);
      const c10 = lerp(H(xi, yi + 1, zi),     H(xi + 1, yi + 1, zi),     u);
      const c01 = lerp(H(xi, yi,     zi + 1), H(xi + 1, yi,     zi + 1), u);
      const c11 = lerp(H(xi, yi + 1, zi + 1), H(xi + 1, yi + 1, zi + 1), u);

      return lerp(lerp(c00, c10, v), lerp(c01, c11, v), w);
    }

    /** Scalar stream function. Two octaves is plenty at this scale. */
    potential(x, y, t) {
      const s = this.scale;
      return RopeField.vnoise(x * s * 2.0, y * s * 2.0, t) * 1.0
           + RopeField.vnoise(x * s * 4.7, y * s * 4.7, t * 1.5) * 0.42;
    }

    /**
     * Curl of the stream function: v = (∂ψ/∂y, −∂ψ/∂x).
     * Divergence-free by construction, so filaments braid instead of pooling.
     */
    flow(x, y, t) {
      const e = 14;
      const p0 = this.potential(x, y, t);
      const px = this.potential(x + e, y, t);
      const py = this.potential(x, y + e, t);
      let vx =  (py - p0) / e;
      let vy = -(px - p0) / e;
      const m = Math.hypot(vx, vy) || 1;
      return { x: vx / m, y: vy / m };
    }

    /* ---- simulation ---- */
    step(dt) {
      this.time += dt * 0.06;
      const { pointer, segment } = this;

      for (let r = 0; r < this.ropes.length; r++) {
        const rope = this.ropes[r];
        const pts = rope.pts;
        rope.life += dt;

        // --- head: steer toward the local field direction
        const hx = pts[0], hy = pts[1];
        const f = this.flow(hx, hy, this.time);
        let target = Math.atan2(f.y, f.x);

        // --- pointer pushes filaments aside
        if (pointer.active) {
          const dx = hx - pointer.x;
          const dy = hy - pointer.y;
          const d = Math.hypot(dx, dy);
          const R = 190;
          if (d < R && d > 0.001) {
            const push = (1 - d / R) ** 2;
            const away = Math.atan2(dy, dx);
            let delta = away - target;
            while (delta >  Math.PI) delta -= Math.PI * 2;
            while (delta < -Math.PI) delta += Math.PI * 2;
            target += delta * push * 0.85;
          }
        }

        // shortest-arc angular easing
        let diff = target - rope.angle;
        while (diff >  Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        rope.angle += diff * clamp(dt * 4.2, 0, 1);

        // gentle rope sway so filaments breathe rather than glide rigidly
        const sway = Math.sin(this.time * 6 + rope.phase) * 0.16;
        const a = rope.angle + sway;
        const advance = rope.speed * dt;
        pts[0] = hx + Math.cos(a) * advance;
        pts[1] = hy + Math.sin(a) * advance;

        // --- body: follow-the-leader distance constraint
        for (let i = 1; i < rope.length; i++) {
          const ix = i * 2, px_ = ix - 2;
          const dx = pts[px_] - pts[ix];
          const dy = pts[px_ + 1] - pts[ix + 1];
          const d = Math.hypot(dx, dy);
          if (d > segment) {
            const k = (d - segment) / d;
            pts[ix]     += dx * k;
            pts[ix + 1] += dy * k;
          }
        }

        // --- recycle ropes that wander off or grow old
        const m = 90;
        const out = pts[0] < -m || pts[0] > this.w + m || pts[1] < -m || pts[1] > this.h + m;
        if (out || rope.life > rope.maxLife) {
          this.ropes[r] = this.spawn(rope.length, rope.tint);
        }
      }
    }

    /* ---- rendering ---- */
    draw() {
      const { ctx, w, h } = this;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = this.blend;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const rope of this.ropes) {
        const pts = rope.pts;
        const n = rope.length;

        // fade in on spawn, fade out at end of life
        const fadeIn  = clamp(rope.life / 1.5, 0, 1);
        const fadeOut = clamp((rope.maxLife - rope.life) / 2.2, 0, 1);
        const a = this.alpha * fadeIn * fadeOut;
        if (a <= 0.01) continue;

        // Gradient tail→head fakes a taper far cheaper than per-segment strokes.
        const grad = ctx.createLinearGradient(
          pts[(n - 1) * 2], pts[(n - 1) * 2 + 1], pts[0], pts[1]
        );
        const color = rope.tint < 0.5 ? this.colorA : this.colorB;
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.35, this.rgba(color, a * 0.45));
        grad.addColorStop(1, this.rgba(color, a));

        // smooth the polyline through segment midpoints
        ctx.beginPath();
        ctx.moveTo(pts[(n - 1) * 2], pts[(n - 1) * 2 + 1]);
        for (let i = n - 2; i > 0; i--) {
          const cx = pts[i * 2], cy = pts[i * 2 + 1];
          const mx = (cx + pts[(i - 1) * 2]) / 2;
          const my = (cy + pts[(i - 1) * 2 + 1]) / 2;
          ctx.quadraticCurveTo(cx, cy, mx, my);
        }
        ctx.lineTo(pts[0], pts[1]);

        // wide soft halo, then the crisp core — reads as a glowing filament
        ctx.strokeStyle = grad;
        ctx.lineWidth = rope.width * 5.5;
        ctx.globalAlpha = 0.16;
        ctx.stroke();

        ctx.lineWidth = rope.width;
        ctx.globalAlpha = 1;
        ctx.stroke();

        // bright node at the head
        ctx.beginPath();
        ctx.arc(pts[0], pts[1], rope.width * 1.25, 0, Math.PI * 2);
        ctx.fillStyle = this.rgba(color, a * 0.9);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    /** #rrggbb (or any css colour) → rgba() with the alpha we want. */
    rgba(color, alpha) {
      if (color.startsWith('#')) {
        let hex = color.slice(1);
        if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
        const int = parseInt(hex, 16);
        const r = (int >> 16) & 255, g = (int >> 8) & 255, b = int & 255;
        return `rgba(${r},${g},${b},${alpha})`;
      }
      // already a functional colour — let canvas parse it, alpha via globalAlpha
      return color;
    }

    renderStatic() { this.draw(); }

    /* ---- loop ---- */
    frame = (ts) => {
      if (!this.running) return;
      const dt = this.lastTs ? Math.min((ts - this.lastTs) / 1000, 1 / 20) : 1 / 60;
      this.lastTs = ts;
      this.step(dt);
      this.draw();
      this.raf = requestAnimationFrame(this.frame);
    };

    start() {
      if (this.running || reduceMotion) return;
      this.running = true;
      this.lastTs = 0;
      this.raf = requestAnimationFrame(this.frame);
    }

    stop() {
      this.running = false;
      if (this.raf) cancelAnimationFrame(this.raf);
    }

    /* ---- wiring ---- */
    bind() {
      const hero = this.canvas.closest('section') || this.canvas.parentElement;

      // Don't burn frames on a hero that's scrolled out of view.
      if ('IntersectionObserver' in window && hero) {
        new IntersectionObserver((entries) => {
          this.visible = entries[0].isIntersecting;
          if (this.visible && !document.hidden) this.start();
          else this.stop();
        }, { threshold: 0 }).observe(hero);
      }

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.stop();
        else if (this.visible) this.start();
      });

      window.addEventListener('resize', debounce(() => {
        const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
        // Ignore the address-bar-height wobble on mobile scroll.
        if (Math.abs(w - this.w) < 2 && Math.abs(h - this.h) < 90) return;
        this.resize();
        if (reduceMotion) this.renderStatic();
      }, 180));

      document.addEventListener('themechange', () => {
        this.readColors();
        if (reduceMotion) this.renderStatic();
      });

      // pointer interaction (canvas itself is pointer-events:none)
      if (hero) {
        hero.addEventListener('pointermove', (e) => {
          const r = this.canvas.getBoundingClientRect();
          this.pointer.x = e.clientX - r.left;
          this.pointer.y = e.clientY - r.top;
          this.pointer.active = true;
        }, { passive: true });

        hero.addEventListener('pointerleave', () => { this.pointer.active = false; });
      }

      motionQuery.addEventListener('change', (e) => {
        if (e.matches) { this.stop(); this.renderStatic(); }
        else this.start();
      });
    }
  }

  const fieldCanvas = $('#fieldCanvas');
  if (fieldCanvas) {
    // requestAnimationFrame inside the constructor is fine, but wait for
    // layout so clientWidth/Height are real numbers.
    requestAnimationFrame(() => new RopeField(fieldCanvas));
  }
})();
