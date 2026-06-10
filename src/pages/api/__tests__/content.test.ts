import { createMocks } from 'node-mocks-http'
import type { NextApiRequest, NextApiResponse } from 'next'

jest.mock('fs/promises', () => ({
  stat: jest.fn(),
  readFile: jest.fn(),
}))

import * as fs from 'fs/promises'
import handler from '../content/[...path]'

const mockStat = fs.stat as jest.Mock
const mockReadFile = fs.readFile as jest.Mock

describe('GET /api/content/[...path]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 when no path provided', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { path: [] },
    })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(400)
  })

  it('returns 400 for path traversal attempt', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { path: ['..', '..', 'etc', 'passwd'] },
    })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(400)
  })

  it('returns 404 for .md files', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { path: ['some-post.md'] },
    })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(404)
  })

  it('returns 404 for .mdx files', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { path: ['some-post.mdx'] },
    })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(404)
  })

  it('returns 404 when file does not exist', async () => {
    mockStat.mockRejectedValue(new Error('ENOENT'))
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { path: ['images', 'photo.png'] },
    })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(404)
  })

  it('returns 404 when path is a directory', async () => {
    mockStat.mockResolvedValue({ isFile: () => false, size: 0 })
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { path: ['images'] },
    })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(404)
  })

  it('serves a valid image file with correct content-type', async () => {
    const fakeImageData = Buffer.from('fake-image-data')
    mockStat.mockResolvedValue({ isFile: () => true, size: fakeImageData.length })
    mockReadFile.mockResolvedValue(fakeImageData)

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { path: ['images', 'photo.png'] },
    })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(200)
    expect(res.getHeader('Content-Type')).toBe('image/png')
  })
})
