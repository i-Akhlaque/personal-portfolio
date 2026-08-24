# Akhlaque Nabi — Portfolio

Personal portfolio site for **Akhlaque Nabi** — final-year B.Tech CSE undergraduate at Integral University, Lucknow, working on Java backend development, Spring Boot / REST APIs, and full-stack MERN engineering. Smart India Hackathon 2025 Grand Finalist.

Hand-written HTML, CSS and JavaScript. **No framework, no build step, no dependencies** — clone it and open `index.html`.

<!-- Add a screenshot once deployed:  ![Portfolio](assets/img/preview.png)  -->

**Live:** https://i-Akhlaque.github.io/personal-portfolio/ · **Resume:** available on request · **Contact:** [akhlaquenabi333@gmail.com](mailto:akhlaquenabi333@gmail.com)

---

## Highlights

**Animated rope field.** The hero background is a canvas of ropes advected through a curl-noise flow field. Value noise is generated from an integer hash (`Math.imul`), and the velocity field is taken as the perpendicular gradient of a scalar potential — `v = (∂ψ/∂y, −∂ψ/∂x)` — which makes it divergence-free, so the ropes swirl instead of collapsing into sinks. Each rope is a follow-the-leader chain; the head samples the field and the body trails it. Blending is `lighter` on dark and `multiply` on light so the field reads correctly in both themes.

**Dark and light themes.** Every colour, shadow and radius is a CSS custom property. Light mode is a `[data-theme="light"]` override of the token block — not a second stylesheet. Choice persists in `localStorage`; the first visit follows `prefers-color-scheme`.

**Built to be read on a phone.** Fluid type via `clamp()`, `auto-fit` grids that reflow rather than squash, and layout that changes shape where it needs to: the CGPA readout is a right-hand rail on desktop and a stacked band under the degree on mobile; the hero facts become a spec sheet with hairline rules; the nav collapses to an opaque full sheet. Verified with zero horizontal overflow at 375 px.

**Accessibility isn't an afterthought.** Skip link, real landmarks, `aria-expanded` on the nav toggle, `aria-live` on the toast, focus-visible rings, `role="img"` with a label on the CGPA meter, and a full `prefers-reduced-motion` branch that stops the canvas and the reveals. Nav closes itself on `Escape` and on breakpoint change.

**Fast by construction.** One HTML file, one stylesheet, one script, one 60 KB image. Favicon is an inline SVG data URI, so it costs zero requests. Scroll handlers are `requestAnimationFrame`-throttled; resize is debounced; reveals and count-ups run off `IntersectionObserver` rather than scroll math.

**Findable.** JSON-LD `Person` schema, Open Graph and Twitter card meta, semantic headings, and print styles that turn the page into a clean CV.

## Sections

| # | Section | Contents |
|---|---|---|
| — | Hero | Name, rotating role, key facts, CTAs, dev-credential ID card |
| 01 | About | Professional summary, terminal-style profile block, live stats |
| 02 | Experience | ChiPi Technologies · GDG on Campus · Sipher Web Academy · Team Integralites |
| 03 | Education | B.Tech CSE 2023–2027, Integral University — CGPA 7.90 |
| 04 | Skills | Languages, Backend, Frontend, Databases, Core Concepts, Tools, AI/ML, Cloud |
| 05 | Projects | TwinSpark (SIH 2025), Smart Home IoT, Real-Time Chat, and more |
| 06 | Certifications | Oracle OCI GenAI Professional, OCI AI Foundations, IBM ML, MongoDB, AWS |
| 07 | Wins | SIH 2025 Grand Finalist, GenAI Study Jam, community work |
| 08 | Contact | GitHub, LinkedIn, email, phone, location — all clickable |

## Tech

`HTML5` · `CSS3` (custom properties, Grid, `clamp()`, `color-mix()`) · `JavaScript` (ES2020, no transpile) · `Canvas 2D` · `IntersectionObserver` · `matchMedia` · Google Fonts (Space Grotesk, Inter, JetBrains Mono)

## Structure

```
.
├── index.html                  # every section, SEO meta, JSON-LD schema
├── assets/
│   ├── css/style.css           # design tokens → base → components → responsive
│   ├── js/script.js            # rope field, theme, nav, reveals, clipboard
│   └── img/profile.jpg         # 800×800, 60 KB
├── .github/workflows/deploy.yml
├── .gitignore
├── LICENSE
└── README.md
```

`style.css` is ordered so it reads top to bottom: design tokens, reset, typography, then one block per component, then every media query grouped at the end — `1080px`, `980px` (hero stacks), `900px` (nav becomes a sheet), `760px` (timeline and education stack), `560px` (single column), `380px` (ID card rows).

## Running it locally

No install, no build. Open the file:

```bash
open index.html
```

Or serve it, which you'll want for testing the clipboard API and relative paths as they behave in production:

```bash
python3 -m http.server 8123
```

Then visit `http://localhost:8123`.

## Deploying

The included workflow deploys on every push to `main`. Enable it once:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. Push to `main`. The run appears under the **Actions** tab and publishes to `https://<username>.github.io/<repo>/`.

Prefer no Actions at all? Delete `.github/` and set **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**. A static site at the repo root works either way.

After the first deploy, point `og:image` at an absolute URL — social scrapers won't resolve a relative one:

```html
<meta property="og:image" content="https://i-Akhlaque.github.io/personal-portfolio/assets/img/profile.jpg">
```

## Making it yours

| Change | Where |
|---|---|
| Colours, spacing, radii, shadows | `:root` and `[data-theme="light"]` token blocks at the top of `assets/css/style.css` |
| Rotating role list | `ROLES` array in `assets/js/script.js` (~line 206) |
| Rope count, length, speed, field scale | `RopeField.build()` and `RopeField.resize()` in `assets/js/script.js` (~line 392); per-rope `speed` in `spawn()` |
| Copy, links, dates | `index.html` — sections are commented and numbered to match the nav |
| Portrait | Replace `assets/img/profile.jpg`, keep it square and under ~100 KB |

Resizing a new portrait to match:

```bash
ffmpeg -i portrait.jpg -vf "scale=800:800:flags=lanczos" -q:v 4 assets/img/profile.jpg
```

## Notes

- Fonts load from Google Fonts with `preconnect` and `display=swap`. To go fully offline, self-host the three `.woff2` files and drop the `<link>` tags.
- `color-mix()` declarations each have a plain-colour fallback on the line above, so engines without support get a solid token instead of dropping the rule.
- The rope canvas stops when the tab is hidden (`visibilitychange`), and under `prefers-reduced-motion` it paints one static frame instead of animating.
- Rope density scales with viewport area (`count` is clamped to 18–78), so the field reads the same on a phone and on a 5K display rather than thinning out.

## Contact

- **Email** — [akhlaquenabi333@gmail.com](mailto:akhlaquenabi333@gmail.com)
- **Phone** — [+91 91354 73003](tel:+919135473003)
- **GitHub** — [@i-Akhlaque](https://github.com/i-Akhlaque)
- **LinkedIn** — [akhlaque-nabi](https://linkedin.com/in/akhlaque-nabi-201a922a9)
- **Location** — Lucknow, Uttar Pradesh, India

Open to entry-level **Software Engineer**, **Java Backend Developer** and **Full-Stack Developer** roles.

## License

[MIT](LICENSE) — the code is free to reuse. Please swap in your own name, copy, portrait and links rather than shipping mine.
