import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export interface SearchPost {
  slug: string
  title: string | null
  excerpt: string | null
  tags: string[]
}

interface SearchModalProps {
  posts: SearchPost[]
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ posts, isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Autofocus input when opened; reset query when closed
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    } else {
      setQuery('')
    }
  }, [isOpen])

  // Close on Esc
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const q = query.trim().toLowerCase()

  const results = q
    ? posts.filter((post) => {
        if (post.title?.toLowerCase().includes(q)) return true
        if (post.excerpt?.toLowerCase().includes(q)) return true
        if (post.tags.some((tag) => tag.toLowerCase().includes(q))) return true
        return false
      })
    : []

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Search"
    >
      {/* Dimmed overlay */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal panel */}
      <div
        className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <svg
            className="h-4 w-4 shrink-0 text-neutral-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search posts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Results area */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!q && (
            <p className="px-5 py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
              Type to search by title, excerpt, or tag.
            </p>
          )}

          {q && results.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
              No results for &ldquo;{query.trim()}&rdquo;.
            </p>
          )}

          {results.length > 0 && (
            <ul>
              {results.map((post) => (
                <li key={post.slug} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                  <Link
                    href={`/posts/${post.slug}`}
                    onClick={onClose}
                    className="flex flex-col gap-1 px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {post.title ?? post.slug}
                    </span>
                    {post.excerpt && (
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                        {post.excerpt}
                      </span>
                    )}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
