import type { NextApiRequest, NextApiResponse } from 'next';
import { siteConfig } from '@/config/site';

type ComparisonStatus = 'identical' | 'ahead' | 'behind' | 'diverged' | 'unknown';

type OpenSourceStatusResponse = {
  repo: {
    owner: string;
    repo: string;
    branch: string;
    url: string;
  };
  latestCommit: {
    sha: string;
    url: string;
    message: string;
    date: string | null;
  };
  siteCommit: string | null;
  comparison: {
    status: ComparisonStatus;
    aheadBy: number | null;
    behindBy: number | null;
    url: string | null;
  } | null;
  checkedAt: string;
};

const API_BASE = 'https://api.github.com';

function getAuthToken() {
  return process.env.GITHUB_TOKEN || process.env.GITHUB_API_TOKEN || process.env.GH_TOKEN || null;
}

function isLikelySha(value: string) {
  return /^[0-9a-f]{7,40}$/i.test(value);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OpenSourceStatusResponse | { error: string }>
) {
  const { owner, repo, branch, repoUrl } = siteConfig.openSource;
  const siteCommit = typeof req.query.siteCommit === 'string' && isLikelySha(req.query.siteCommit)
    ? req.query.siteCommit.trim()
    : null;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Tech-Blog'
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const latestRes = await fetch(`${API_BASE}/repos/${owner}/${repo}/commits/${branch}`, { headers });
    if (!latestRes.ok) {
      res.status(502).json({ error: 'Failed to fetch latest commit' });
      return;
    }

    const latestData = await latestRes.json();
    const latestCommit = {
      sha: latestData.sha as string,
      url: latestData.html_url as string,
      message: (latestData.commit?.message as string) || '',
      date: (latestData.commit?.committer?.date as string) || (latestData.commit?.author?.date as string) || null
    };

    let comparison: OpenSourceStatusResponse['comparison'] = null;

    if (siteCommit) {
      const compareRes = await fetch(
        `${API_BASE}/repos/${owner}/${repo}/compare/${siteCommit}...${branch}`,
        { headers }
      );

      if (compareRes.ok) {
        const compareData = await compareRes.json();
        comparison = {
          status: (compareData.status as ComparisonStatus) || 'unknown',
          aheadBy: typeof compareData.ahead_by === 'number' ? compareData.ahead_by : null,
          behindBy: typeof compareData.behind_by === 'number' ? compareData.behind_by : null,
          url: (compareData.html_url as string) || null
        };
      } else {
        comparison = {
          status: 'unknown',
          aheadBy: null,
          behindBy: null,
          url: null
        };
      }
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({
      repo: {
        owner,
        repo,
        branch,
        url: repoUrl
      },
      latestCommit,
      siteCommit,
      comparison,
      checkedAt: new Date().toISOString()
    });
  } catch {
    res.status(502).json({ error: 'Failed to fetch open-source status' });
  }
}
