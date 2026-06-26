# Fire Emblem Awakening Matchmaker

An interactive matchmaking infographic for *Fire Emblem Awakening*. Pair two
characters, see whether they can marry, and explore their support
conversations, personality dynamic, children, family tree, and gameplay
strengths. Built to be useful to newcomers and optimization players alike.

> Personal fan project. Game art (portraits, sprites, skill/class/seal icons)
> is property of Nintendo / Intelligent Systems and is **not** included in this
> repository — drop your own sourced files into `public/assets/`. The app runs
> fully with built-in placeholders until you do.

## Stack

- **Vite** + **React 18** + **TypeScript** (strict)
- **Tailwind CSS** with a Fire Emblem Awakening token palette
- **@dnd-kit** for accessible drag-and-drop (+ tap and keyboard fallbacks)
- **Zustand** for the small shared match state
- **vite-plugin-pwa** for offline support
- Self-hosted fonts (Cinzel + Spline Sans, bundled — no external CDN)

## Scripts

```bash
npm install      # install dependencies
npm run dev      # local dev server
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build
```

## Project layout

```
public/
  assets/portraits/   your {id}.webp character portraits
  assets/sprites/     your {id}.png map sprites
  assets/icons/       PWA icons (placeholders included)
  data/               characters/pairings/children/supports JSON
src/
  components/  gallery · match · result · child · ui
  store/       Zustand match store
  lib/         pure game logic (compatibility, children, search) + types
  hooks/       data + interaction hooks
  styles/      Tailwind entry + color tokens
```

## Deploying to GitHub Pages

For a project page at `https://<user>.github.io/<repo>/`, the app must be built
with a matching base path. The included workflow
(`.github/workflows/deploy.yml`) does this automatically using the repo name.

To build locally with the right base path:

```bash
BASE_PATH="/<repo-name>/" npm run build
```

In your repo settings, set **Pages → Build and deployment → Source** to
**GitHub Actions**, then push to `main`.

## Build status

Built in reviewable steps. Done so far: scaffold (toolchain, palette, dark
mode, PWA), the pure game logic (compatibility, child derivation, search), the
verified Chrom-line data slice, the asset/placeholder system, the character
gallery (search · filters · detail), the Match Zone (drag · tap · keyboard ·
heart/X feedback), the inline result panel (relationship · support accordion ·
gameplay notes), the family tree + contextual child detail, and a verified
offline-capable PWA deployed to GitHub Pages. Remaining: full-roster data.
and full-roster data.
