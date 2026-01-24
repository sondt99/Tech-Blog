import { useEffect, useMemo, useState } from 'react';
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

type StatusTone = 'neutral' | 'ok' | 'warn';

type StatusState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  data: OpenSourceStatusResponse | null;
};

const statusToneClasses: Record<StatusTone, { dot: string; text: string }> = {
  neutral: {
    dot: 'bg-neutral-400 dark:bg-neutral-500',
    text: 'text-neutral-500 dark:text-neutral-400'
  },
  ok: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400'
  },
  warn: {
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-400'
  }
};

const shortSha = (sha?: string | null) => (sha ? sha.slice(0, 7) : 'unknown');

const formatDate = (iso?: string | null) => {
  if (!iso) return 'unknown';
  return new Date(iso).toLocaleDateString(
    siteConfig.formatting.dateLocale,
    siteConfig.formatting.dateOptions
  );
};

export default function OpenSourceStatus({ siteCommit }: { siteCommit?: string | null }) {
  const [state, setState] = useState<StatusState>({ status: 'idle', data: null });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const query = siteCommit ? `?siteCommit=${encodeURIComponent(siteCommit)}` : '';

    const load = async () => {
      setState({ status: 'loading', data: null });
      try {
        const res = await fetch(`/api/open-source-status${query}`, {
          signal: controller.signal
        });
        if (!res.ok) {
          throw new Error('Request failed');
        }
        const data = (await res.json()) as OpenSourceStatusResponse;
        if (!cancelled) {
          setState({ status: 'ready', data });
        }
      } catch {
        if (!cancelled) {
          setState({ status: 'error', data: null });
        }
      }
    };

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [siteCommit]);

  const summary = useMemo(() => {
    if (state.status === 'loading' || state.status === 'idle') {
      return { label: 'Checking updates', tone: 'neutral' as StatusTone };
    }
    if (state.status === 'error' || !state.data) {
      return { label: 'Status unknown', tone: 'neutral' as StatusTone };
    }

    const comparison = state.data.comparison;

    if (!comparison) {
      if (state.data.siteCommit) {
        const isSame = state.data.latestCommit.sha === state.data.siteCommit;
        return {
          label: isSame ? 'Up to date' : 'Outdated',
          tone: isSame ? ('ok' as StatusTone) : ('warn' as StatusTone)
        };
      }
      return { label: 'Status unknown', tone: 'neutral' as StatusTone };
    }

    const isOutdated =
      comparison.status === 'behind' ||
      comparison.status === 'diverged' ||
      (comparison.aheadBy ?? 0) > 0;

    return {
      label: isOutdated ? 'Outdated' : 'Up to date',
      tone: isOutdated ? ('warn' as StatusTone) : ('ok' as StatusTone)
    };
  }, [state]);

  const detailLines = useMemo(() => {
    if (!state.data) {
      return {
        statusText: 'Comparison unavailable',
        compareUrl: null
      };
    }

    const { comparison } = state.data;

    if (!comparison) {
      if (state.data.siteCommit) {
        const isSame = state.data.latestCommit.sha === state.data.siteCommit;
        return {
          statusText: isSame ? 'Matches latest commit' : 'Update status unknown',
          compareUrl: null
        };
      }
      return {
        statusText: 'Comparison unavailable',
        compareUrl: null
      };
    }

    if (comparison.status === 'identical') {
      return { statusText: 'Identical to upstream', compareUrl: comparison.url };
    }

    if (comparison.status === 'behind') {
      const aheadBy = comparison.aheadBy ?? 0;
      return {
        statusText: `Behind by ${aheadBy} commit${aheadBy === 1 ? '' : 's'}`,
        compareUrl: comparison.url
      };
    }

    if (comparison.status === 'ahead') {
      const behindBy = comparison.behindBy ?? 0;
      return {
        statusText: `Ahead by ${behindBy} commit${behindBy === 1 ? '' : 's'}`,
        compareUrl: comparison.url
      };
    }

    if (comparison.status === 'diverged') {
      const aheadBy = comparison.aheadBy ?? 0;
      const behindBy = comparison.behindBy ?? 0;
      return {
        statusText: `Diverged (behind ${aheadBy}, ahead ${behindBy})`,
        compareUrl: comparison.url
      };
    }

    return {
      statusText: 'Comparison unknown',
      compareUrl: comparison.url
    };
  }, [state.data]);

  const summaryTone = statusToneClasses[summary.tone];
  const repoSlug = `${siteConfig.openSource.owner}/${siteConfig.openSource.repo}`;
  const repoUrl = siteConfig.openSource.repoUrl;
  const repoBranch = siteConfig.openSource.branch;
  const upstreamRemote = `${repoUrl}.git`;

  return (
    <details className="mt-6">
      <summary className="cursor-pointer list-none">
        <span className="inline-flex items-center gap-3 rounded-full border border-neutral-300/70 bg-neutral-100/70 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-400">
          <span className={`h-2 w-2 rounded-full ${summaryTone.dot}`} />
          <span className="text-neutral-500 dark:text-neutral-400">Open-source status</span>
          <span className={summaryTone.text}>{summary.label}</span>
        </span>
      </summary>

      <div className="mt-4 max-w-2xl rounded-2xl border border-neutral-200/70 bg-neutral-50/70 p-5 text-xs text-neutral-600 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-300">
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          <span>Upstream</span>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-neutral-300 underline-offset-4 hover:text-neutral-800 dark:hover:text-neutral-100"
          >
            {repoSlug}
          </a>
          <span className="text-neutral-400 dark:text-neutral-500">branch {repoBranch}</span>
        </div>

        <div className="mt-4 space-y-2">
          <div>
            Latest commit:{' '}
            {state.data ? (
              <a
                href={state.data.latestCommit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-neutral-800 underline decoration-neutral-300 underline-offset-4 dark:text-neutral-200"
              >
                {shortSha(state.data.latestCommit.sha)}
              </a>
            ) : (
              <span className="font-mono">unknown</span>
            )}
            <span className="text-neutral-400 dark:text-neutral-500">
              {state.data ? ` - ${formatDate(state.data.latestCommit.date)}` : ''}
            </span>
          </div>
          <div>
            Site commit:{' '}
            <span className="font-mono">
              {siteCommit ? shortSha(siteCommit) : 'not set'}
            </span>
            {!siteCommit && (
              <span className="text-neutral-400 dark:text-neutral-500">
                {' '}
                (set NEXT_PUBLIC_SITE_COMMIT to enable compare)
              </span>
            )}
          </div>
          <div>
            Status: <span className="font-mono">{detailLines.statusText}</span>
          </div>
          {detailLines.compareUrl && (
            <a
              href={detailLines.compareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              View compare
            </a>
          )}
          <div className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Last checked {state.data ? formatDate(state.data.checkedAt) : 'unknown'}
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-neutral-200/70 bg-white/70 p-4 text-[11px] text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-300">
          <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Sync and merge
          </p>
          <pre className="mt-3 whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
{`git remote add upstream ${upstreamRemote}
git fetch upstream
git checkout ${repoBranch}
git merge upstream/${repoBranch}`}
          </pre>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            Resolve conflicts if needed, then push to your fork.
          </p>
        </div>
      </div>
    </details>
  );
}
