# Quickstart

This guide helps you run the project quickly, add posts/pages, and customize the main pieces.

## Requirements

- Node.js 22.x (per `package.json` engines)
- npm

## Install

```bash
git clone https://github.com/sondt99/Tech-Blog.git
cd Tech-Blog
npm install
```

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Build & run production

```bash
npm run build
npm start
```

## Lint & cleanup

```bash
npm run lint
npm run clean
```

## Content layout

- `content/*.md`: posts (route: `/posts/<slug>`)
- `content/pages/*.md`: static pages (route: `/<slug>`)
- `content/images/*`: images (served via `/api/content/images`, referenced as `/images/...`)
- `content/assets/*`: files (served via `/api/content/assets`, referenced as `/assets/...`)

Slug comes from the filename. Example: `content/hello-world.md` -> `/posts/hello-world`.

## Post frontmatter

`content/*.md` needs these fields:

```yaml
---
title: "Your Post Title"
date: "YYYY-MM-DD"
excerpt: "Short description for the post"
featured: "/images/featured.jpg"
tags:
  - security
  - systems
---
```

Notes:
- `date` is used for sorting (newest first). Use `YYYY-MM-DD`.
- `featured` is optional; if missing, the post renders without a hero image.
- `tags` can be an array or a comma-separated string.

## Page frontmatter

`content/pages/*.md` needs these fields:

```yaml
---
title: "About"
lastUpdated: "YYYY-MM-DD"
---
```

### Optional timeline block

```yaml
---
title: "About"
lastUpdated: "YYYY-MM-DD"
timeline:
  - year: "2024"
    category: "Work"
    place: "Company Name"
    role: "Security Engineer"
    detail: "Team focus and highlights."
---
```

## Markdown pipeline & features

Markdown is processed in:

- `src/pages/posts/[slug].tsx`
- `src/pages/[slug].tsx`

Current pipeline:
- `remark-gfm` (tables, task lists, strikethrough, footnotes)
- `remark-math` + `rehype-katex` (math)
- `remark-emoji`
- Prism-based syntax highlighting

Notes:
- TOC is generated from `h2`, `h3`, `h4` headings.
- Code blocks include a copy button. Language comes from the fence: ```js, ```python, etc.
- Raw HTML in Markdown (e.g. `<details>`) is not rendered; enable `allowDangerousHtml` + `rehype-raw` if you need it (and keep sanitization in mind).

## Quick customization

- Home hero content: `src/pages/index.tsx`
- Posts per page: `POSTS_PER_PAGE` in `src/pages/index.tsx`
- Header/footer/meta: `src/layouts/Layout.tsx`
- Theme, fonts, animations: `src/styles/globals.css` and `tailwind.config.ts`
- Site labels, nav links, TOC title: `site.config.ts`

## Deploy

`/page/[page]` uses `getServerSideProps`, so you need a Node runtime (no `next export`).
Standard Next.js deployment: `npm run build` + `npm start` or Vercel.

## Troubleshooting

- Post not showing: ensure the file is in `content/` (not a subfolder) and ends with `.md`.
- Wrong order: check `date` in frontmatter.
- Images not loading: use `/images/...` and put files in `content/images/`.
- Assets not loading: use `/assets/...` and put files in `content/assets/`.
- Tags not linking: ensure `tags` is a list or comma-separated string.
