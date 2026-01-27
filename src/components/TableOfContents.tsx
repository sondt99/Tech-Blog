import { useEffect, useState } from 'react'
import { siteConfig } from '@site-config'
import type { TocItem } from '@/types/toc'

interface TableOfContentsProps {
  headings: TocItem[]
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-100px 0% -80% 0%',
        threshold: 0.25
      }
    )

    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [headings])

  return (
    <nav className="hidden xl:block sticky top-24 ml-8 w-72 max-h-[calc(100vh-8rem)] overflow-y-auto toc-scrollbar">
      <div className="surface-panel rounded-xl p-7">
        <h3 className="text-xs font-mono uppercase tracking-widest mb-4 text-neutral-500 dark:text-neutral-400">
          {siteConfig.toc.title}
        </h3>
        <ul className="space-y-0.5 text-sm leading-tight list-disc list-outside pl-4 marker:text-neutral-400 dark:marker:text-neutral-500">
          {headings.map((heading) => (
            <li
              key={heading.id}
              style={{ marginLeft: `${(heading.level - 2) * 1}rem` }}
              className="transition-colors duration-200"
            >
              <a
                href={`#${heading.id}`}
                className={`block py-0 transition-colors duration-200 ${
                  activeId === heading.id
                    ? 'text-neutral-900 font-semibold dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
