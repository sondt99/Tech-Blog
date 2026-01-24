import { execSync } from 'child_process';

const ENV_KEYS = ['NEXT_PUBLIC_SITE_COMMIT', 'VERCEL_GIT_COMMIT_SHA', 'GIT_COMMIT_SHA'] as const;

export function getSiteCommitFromEnv(): string | null {
  for (const key of ENV_KEYS) {
    const value = process.env[key];
    if (value && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

export function getSiteCommit({ allowGit = false }: { allowGit?: boolean } = {}): string | null {
  const envCommit = getSiteCommitFromEnv();
  if (envCommit) {
    return envCommit;
  }

  if (!allowGit) {
    return null;
  }

  try {
    const result = execSync('git rev-parse HEAD', {
      stdio: ['ignore', 'pipe', 'ignore']
    })
      .toString()
      .trim();
    return result || null;
  } catch {
    return null;
  }
}
