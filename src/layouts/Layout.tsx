import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { siteConfig } from '@site-config'

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored === 'dark' || (!stored && prefersDark);
    if (isDark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`

export default function Layout({ children, title = 'Blog' }: LayoutProps) {
  const [isDark, setIsDark] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const isExternalLink = (href: string) =>
    href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const currentYear = new Date().getFullYear()
  const themeUrl = 'https://github.com/sondt99/Tech-Blog'
  const authorName = siteConfig.author.name


  const toggleDarkMode = () => {
    setIsDark(!isDark)
    if (!isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200 text-neutral-900 dark:text-white">
      <div className="flex-grow">
        <Head>
          <title>{title} - {siteConfig.name}</title>
          <link rel="icon" href="/favicon.ico" />
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content={siteConfig.metaDescription} />
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        </Head>

        <header className={`sticky top-0 z-50 transition-all duration-200 surface-bar ${isScrolled ? 'shadow-sm' : ''}`}>
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-mono tracking-widest text-neutral-900 dark:text-white">
                  {siteConfig.name}
                </span>
              </Link>
              
              <div className="flex items-center space-x-6">
                {/* <Link href="/" className="nav-link">Home</Link> */}
                {siteConfig.nav.links.map((link) =>
                  isExternalLink(link.href) ? (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nav-link"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.label} href={link.href} className="nav-link">
                      {link.label}
                    </Link>
                  )
                )}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-md border border-transparent hover:border-neutral-300 hover:bg-neutral-100 dark:hover:border-neutral-700 dark:hover:bg-neutral-900 transition-colors"
                >
                  {isDark ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 12.5A8.5 8.5 0 0 1 11.5 3.1a7 7 0 1 0 9.5 9.4z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {children}
        </main>
      </div>

      <footer className="surface-footer">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-3">
              <h3 className="text-xl font-semibold mb-3">{siteConfig.footer.aboutTitle}</h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                {siteConfig.footer.aboutText}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">{siteConfig.footer.connectTitle}</h3>
              <div className="flex space-x-4 text-neutral-700 dark:text-neutral-300">
                <a href={siteConfig.footer.social.githubUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href={siteConfig.footer.social.xUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-neutral-200/70 dark:border-neutral-800 text-center text-neutral-500 dark:text-neutral-400">
            <div className="flex flex-col items-center gap-1">
              <a
                href={themeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-neutral-400/70 underline-offset-4 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Theme by sondt
              </a>
              <div>content by © {authorName} {currentYear}</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
