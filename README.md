# Tech Blog

A minimalist, markdown-driven personal blog built with Next.js and Tailwind CSS. Content lives in the repo, so you can ship without a CMS.

## Highlights

- Next.js 15 Pages Router with static posts/pages
- Server-side pagination at `/page/[page]`
- Markdown with GFM tables, task lists, footnotes, emoji shortcodes, and math (KaTeX)
- Auto table of contents for `h2` to `h4` headings
- Copy-to-clipboard buttons on code blocks
- Light and dark themes with persisted preference
- Content asset pipeline for `/content/images` and `/content/assets`

## Requirements

- Node.js 20.x
- npm (lockfile present)

## Quick start

```bash
git clone https://github.com/sondt99/Tech-Blog.git
cd Tech-Blog
npm install
npm run dev
```

Open `http://localhost:3000`.

## Project structure

```
content/
  images/
  pages/
public/
src/
  components/
  config/
  layouts/
  lib/
  pages/
  styles/
```

Note: `content/` is not recursive. Only `content/*.md` are treated as posts. Subfolders like `content/archive` are ignored unless you move files to the root.

## Content and routing

- Posts: `content/*.md` -> `/posts/<slug>`
- Pages: `content/pages/*.md` -> `/<slug>`
- Assets: `content/images/*` and `content/assets/*` -> `/api/content/<path>`

## Post frontmatter

```yaml
---
title: "Your Post Title"
date: "YYYY-MM-DD"
excerpt: "Short description for the post"
featured: "/images/featured.jpg"
---
```

Notes:
- `date` controls sorting (newest first).
- `featured` is optional and powers the hero image on the home list.

## Page frontmatter

```yaml
---
title: "About"
lastUpdated: "YYYY-MM-DD"
---
```

## Assets and images

Place images in `content/images/` and other files in `content/assets/`.
You can reference them in Markdown or frontmatter using any of:

- `/images/...` or `images/...`
- `/assets/...` or `assets/...`

The pipeline rewrites those to `/api/content/...` and serves them from disk.
Markdown files are blocked by the API route.

## Markdown pipeline

Markdown is processed in:

- `src/pages/posts/[slug].tsx`
- `src/pages/[slug].tsx`

Enabled features:
- `remark-gfm` (tables, task lists, footnotes)
- `remark-math` + `rehype-katex` (math)
- `remark-emoji`
- Custom asset rewriting for images

Raw HTML in Markdown is not rendered. If you need it, add `rehype-raw` and enable `allowDangerousHtml` in the pipeline.

## Configuration

- Site metadata, nav, and footer: `site.config.ts`
- Global styles and theme tokens: `src/styles/globals.css`
- Typography defaults: `tailwind.config.ts`
- Header, footer, and theme toggle: `src/layouts/Layout.tsx`
- Home hero and pagination size: `src/pages/index.tsx`

## Scripts

- `npm run dev`: start dev server
- `npm run build`: build for production
- `npm start`: run production server
- `npm run lint`: lint
- `npm run clean`: remove `.next` and `node_modules`

## Deployment

`/page/[page]` uses `getServerSideProps`, so you need a Node runtime (no `next export`). Standard Next.js deployments work: `npm run build` then `npm start`, or deploy on Vercel with SSR enabled.

## License

[MIT License](LICENSE)

## Author

- Thai Son Dinh ([@_sondt_](https://x.com/_sondt_))
