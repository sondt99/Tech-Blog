import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const contentRoot = path.join(process.cwd(), 'content');

const contentTypeByExtension: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.tiff': 'image/tiff',
  '.pdf': 'application/pdf',
};

function getContentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  return contentTypeByExtension[extension] || 'application/octet-stream';
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).end('Method Not Allowed')
    return
  }

  const pathParts = req.query.path;
  const segments = Array.isArray(pathParts) ? pathParts : pathParts ? [pathParts] : [];

  if (!segments.length) {
    res.status(400).end('Missing asset path');
    return;
  }

  const normalizedSegments = segments.map((segment) => segment.replace(/\\/g, '/'));
  const resolvedPath = path.resolve(contentRoot, ...normalizedSegments);
  const safeRoot = `${contentRoot}${path.sep}`;

  if (!resolvedPath.startsWith(safeRoot) && resolvedPath !== contentRoot) {
    res.status(400).end('Invalid asset path');
    return;
  }

  const extension = path.extname(resolvedPath).toLowerCase();
  if (extension === '.md' || extension === '.mdx') {
    res.status(404).end('Not found');
    return;
  }

  try {
    const stat = await fs.stat(resolvedPath);
    if (!stat.isFile()) {
      res.status(404).end('Not found');
      return;
    }

    if (stat.size > MAX_FILE_SIZE) {
      res.status(413).end('File too large');
      return;
    }

    const data = await fs.readFile(resolvedPath);
    res.setHeader('Content-Type', getContentType(resolvedPath));
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    res.status(200).send(data);
  } catch (error) {
    res.status(404).end('Not found');
  }
}
