import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@site-config$': '<rootDir>/site.config.ts',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
  ],
  // Allow transforming ESM-only packages used by the remark/rehype ecosystem
  transformIgnorePatterns: [
    '/node_modules/(?!(unified|vfile|vfile-message|unist-util-stringify-position|remark-parse|remark-rehype|remark-gfm|remark-math|remark-emoji|remark-html|rehype-sanitize|rehype-stringify|rehype-katex|rehype-raw|mdast-util-.*|micromark.*|hast-util-.*|unist-util-.*|property-information|comma-separated-tokens|space-separated-tokens|zwitch|html-void-elements|stringify-entities|character-entities|ccount|decode-named-character-reference|is-plain-obj|trim-lines|devlop|bail|trough|extend)/)',
  ],
}

export default createJestConfig(config)
