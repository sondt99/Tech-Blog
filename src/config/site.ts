const siteName = "sondt's Blog"

export const siteConfig = {
  name: siteName,
  metaDescription: 'A professional blog about software development and technology',
  nav: {
    links: [
      {
        label: 'Github',
        href: 'https://github.com/sondt99/Tech-Blog'
      },
      {
        label: 'About',
        href: '/about'
      },
      {
        label: 'Archivement',
        href: '/archivement'
      }
    ]
  },
  home: {
    pageTitle: 'Home',
    badgeText: 'Security | Systems | Research',
    title: `Welcome to ${siteName}`,
    subtitle: 'Something about infosec!...',
    readMoreLabel: 'Read more',
    noDateLabel: 'No date',
    featuredAlt: 'Featured image'
  },
  pagination: {
    previousLabel: 'Previous Page',
    nextLabel: 'Next Page',
    pageLabel: 'Page'
  },
  post: {
    backToHomeLabel: 'Back to home',
    statsTitle: 'Article stats',
    statsLabels: {
      readTime: 'Read time',
      words: 'Words',
      headings: 'Headings',
      codeBlocks: 'Code blocks',
      images: 'Images',
      minutes: 'min'
    },
    copyButtonLabel: 'Copy',
    copyButtonCopiedLabel: 'Copied!',
    copyErrorLabel: 'Failed to copy'
  },
  toc: {
    title: 'Contents'
  },
  page: {
    lastUpdatedLabel: 'Last updated:',
    lastUpdatedLocale: 'vi-VN'
  },
  formatting: {
    dateLocale: 'en-EN',
    dateOptions: {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    },
    numberLocale: 'en-US'
  },
  footer: {
    aboutTitle: `About ${siteName}`,
    aboutText: 'Sharing In-Depth Insights About Security, CTF Challenges, and Tech Architecture.',
    connectTitle: 'Connect',
    social: {
      githubUrl: 'https://github.com/sondt99',
      xUrl: 'https://x.com/_sondt_'
    }
  },
  openSource: {
    owner: 'sondt99',
    repo: 'Tech-Blog',
    branch: 'main',
    repoUrl: 'https://github.com/sondt99/Tech-Blog'
  },
  api: {
    helloName: 'sondt'
  }
} as const
