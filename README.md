# sondt's Blog

[![CI](https://github.com/sondt99/Tech-Blog/actions/workflows/ci.yml/badge.svg)](https://github.com/sondt99/Tech-Blog/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=111)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A markdown-first technical blog focused on security, systems, research, and software engineering. The site is built with the Next.js Pages Router, Tailwind CSS, and a repository-backed content workflow, so posts, pages, assets, and deployment configuration all live in version control.

Live site: [https://blog.nosiaht.com](https://blog.nosiaht.com)

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Content model](#content-model)
- [Markdown features](#markdown-features)
- [Configuration](#configuration)
- [Quality checks](#quality-checks)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Author](#author)
- [License](#license)

## Overview

This project is a personal technical publishing platform designed for long-form technical content. It favors a simple and auditable workflow:

1. Write Markdown files in the repository.
2. Commit content and configuration together.
3. Let CI and Vercel validate, build, and deploy the site.

The application uses static generation for posts and content pages where possible, while keeping server-side API routes for content assets, RSS, sitemap, robots, and optional repository status metadata.

## Features

- **Markdown-first publishing** with posts in `content/*.md` and pages in `content/pages/*.md`.
- **Next.js Pages Router** with statically generated posts, pages, tag archives, and pagination.
- **Technical writing support** including GFM tables, task lists, footnotes, emoji shortcodes, and KaTeX math.
- **Automatic table of contents** generated from `h2` to `h4` headings.
- **Article metadata** including estimated reading time, word count, headings, code blocks, and image count.
- **Syntax-highlighted code blocks** with Prism-powered rendering and copy-to-clipboard support.
- **Content asset pipeline** for images and downloadable files stored under `content/images` and `content/assets`.
- **RSS, sitemap, and robots routes** generated from repository content and site configuration.
- **Light/dark theme** with persisted user preference.
- **Optional open-source status widget** powered by the GitHub API.
- **Deterministic deployment setup** with `npm ci`, explicit Vercel config, and GitHub Actions CI.

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 15, Pages Router |
| UI | React 18, Tailwind CSS |
| Language | TypeScript |
| Content | Markdown, gray-matter, unified, remark, rehype |
| Code highlighting | Prism React Renderer |
| Testing | Jest, Testing Library, jsdom |
| CI/CD | GitHub Actions, Vercel |

## Requirements

- Node.js `22.x`
- npm

The Node.js version is declared in [package.json](package.json) through the `engines.node` field. CI and Vercel are configured to use Node 22.

## Getting started

```bash
git clone https://github.com/sondt99/Tech-Blog.git
cd Tech-Blog
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For day-to-day development:

```bash
npm run dev
```

For a production build:

```bash
npm run build
npm start
```

## Project structure

```text
.
├── .github/workflows/      # GitHub Actions workflows
├── content/                # Markdown content and content-owned assets
│   ├── assets/             # Downloadable/static content files
│   ├── images/             # Images referenced by Markdown/frontmatter
│   └── pages/              # Standalone pages such as About/Achievement
├── public/                 # Public static assets
├── src/
│   ├── __tests__/          # Tests kept outside Next.js route directories
│   ├── components/         # Reusable UI components
│   ├── layouts/            # Shared page/post layouts
│   ├── lib/                # Content, formatting, markdown, and utility logic
│   ├── pages/              # Next.js pages and API routes
│   └── styles/             # Global styles
├── site.config.ts          # Site metadata, navigation, labels, and feature config
├── next.config.mjs         # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── vercel.json             # Vercel build configuration
```

Important content rule: blog posts are read from `content/*.md`. Nested post folders are not treated as posts.

## Content model

### Posts

Posts live in `content/*.md` and are routed to `/posts/<slug>`.

Example:

```text
content/rsa-in-practice.md -> /posts/rsa-in-practice
```

Recommended frontmatter:

```yaml
---
title: "Your Post Title"
date: "YYYY-MM-DD"
excerpt: "A concise summary for listings, previews, and metadata."
featured: "/images/featured.jpg"
tags:
  - security
  - systems
---
```

Notes:

- `title` is used for page headings and metadata.
- `date` controls chronological sorting, newest first.
- `excerpt` is used in lists and previews.
- `featured` is optional and can point to an image in `content/images`.
- `tags` can be an array or a comma-separated string.

### Pages

Standalone pages live in `content/pages/*.md` and are routed to `/<slug>`.

Example:

```text
content/pages/about.md -> /about
```

Recommended frontmatter:

```yaml
---
title: "About"
lastUpdated: "YYYY-MM-DD"
---
```

Pages can also include a timeline block:

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
  - year: "2022"
    category: "Study"
    place: "University Name"
    role: "B.Sc. in Information Security"
---
```

### Tags

Tags are derived from post frontmatter and routed to `/tags/<tag>`. Use consistent tag names to avoid duplicate archives caused by spelling or casing differences.

### Assets and images

Place content-owned images in:

```text
content/images/
```

Place other content-owned files in:

```text
content/assets/
```

Reference them from Markdown or frontmatter with either absolute or relative-style paths:

```md
![Diagram](/images/diagram.png)
[Download notes](/assets/notes.pdf)
```

The content API rewrites and serves these files through `/api/content/<path>`. Markdown files are intentionally blocked by the API route.

## Markdown features

The Markdown pipeline supports:

- GitHub Flavored Markdown through `remark-gfm`
- Math syntax through `remark-math` and `rehype-katex`
- Emoji shortcodes through `remark-emoji`
- Sanitized HTML output through the rehype pipeline
- Prism-based syntax highlighting
- Automatic heading IDs and table of contents generation

Raw HTML in Markdown is not rendered by default. If raw HTML support is needed, enable it deliberately and keep sanitization requirements in mind.

## Configuration

Primary configuration lives in [site.config.ts](site.config.ts):

- Site URL, title, metadata, and author information
- Navigation links
- Home page hero labels
- Pagination labels
- Post statistics labels
- Date and number formatting locales
- Footer links
- Open-source status widget settings

Deployment behavior is configured in [vercel.json](vercel.json):

```json
{
  "framework": "nextjs",
  "installCommand": "npm ci",
  "buildCommand": "npm run build"
}
```

## Quality checks

Run the same checks used by CI before opening or merging changes:

```bash
npx tsc --noEmit
npx eslint . --quiet
npm test -- --runInBand
npm run build
```

Available npm scripts:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the production application |
| `npm start` | Start the production server after a build |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run test:coverage` | Run Jest with coverage reporting |
| `npm run lint` | Run the project lint command |
| `npm run clean` | Remove `.next` and `node_modules` |

## Deployment

The project is optimized for Vercel:

- Vercel installs dependencies with `npm ci`.
- Vercel builds with `npm run build`.
- GitHub Actions runs type-checking, linting, tests, and production build checks.
- Production deploys are created from the `main` branch.

This project uses Next.js server-side capabilities and API routes, so it should not be deployed with `next export`.

Useful environment variables:

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | Overrides the canonical site URL used by metadata and feeds |
| `GITHUB_TOKEN` | Raises GitHub API rate limits for the open-source status widget |
| `GITHUB_API_TOKEN` | Alternative GitHub token variable |
| `GH_TOKEN` | Alternative GitHub token variable |
| `VERCEL_GIT_COMMIT_SHA` | Commit SHA used by the open-source status widget on Vercel |
| `GIT_COMMIT_SHA` | Generic fallback commit SHA |

## Troubleshooting

| Problem | Check |
| --- | --- |
| A post is not visible | Ensure the file is directly under `content/` and ends with `.md` |
| Posts are ordered incorrectly | Check the `date` value in frontmatter |
| Images do not load | Place files under `content/images` and reference them with `/images/...` |
| Asset links do not work | Place files under `content/assets` and reference them with `/assets/...` |
| Tag pages look duplicated | Normalize tag spelling and casing in frontmatter |
| GitHub API status is rate-limited | Set `GITHUB_TOKEN`, `GITHUB_API_TOKEN`, or `GH_TOKEN` |
| Vercel status stays pending | Check the GitHub/Vercel integration and confirm the latest deployment status with `gh` |

## Author

Thai Son Dinh

- GitHub: [@sondt99](https://github.com/sondt99)
- X: [@_sondt_](https://x.com/_sondt_)

## License

This project is licensed under the [MIT License](LICENSE).
