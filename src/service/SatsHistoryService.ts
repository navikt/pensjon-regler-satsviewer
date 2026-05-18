/**
 * Satshistorikk — parser deploy-historikk fra GitHub Actions logger.
 * Kun tilgjengelig i dev (logger utløper etter 90 dager).
 */

import { fetchWorkflowRuns, fetchJobsForRun, fetchJobLogs, WorkflowRun, WorkflowJob } from './githubApi';

// ─── Typer ───────────────────────────────────────────────────────────────────

export interface SatsHistoryEntry {
    environment: string;
    satstabell: string;
    version: string;
    timestamp: string;
    actor: string;
    runId: number;
}

// ─── Konfigurasjon ───────────────────────────────────────────────────────────

/** Antall runs å hente ved første innlasting (full historikk) */
const RUNS_FULL_FETCH = 150;

/** Antall runs å hente ved refresh (sjekke om noe nytt har skjedd) */
const RUNS_REFRESH_FETCH = 5;

const WORKFLOW_IDS = {
    sandbox: 200229765,
    deployQ1: 14297582,
    deployQ2: 5007102,
    deployQ5: 13932626,
};

/** Kun FSS — GCP deployer samme satstabell */
const SANDBOX_JOB_NAMES: Record<string, string> = {
    q1: 'Deploy Q1 FSS',
    q2: 'Deploy Q2 FSS',
    q5: 'Deploy Q5 FSS',
};

// ─── Parsing ─────────────────────────────────────────────────────────────────

/** Parser satstabell fra logg-tekst (Slack-steget: "satstabell: SAT2025") */
function parseSatstabell(log: string): string | null {
    const match = log.match(/satstabell:\s*([A-Za-z0-9_-]+)/)
        || log.match(/satstabell_type=([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
}

/** Parser versjon fra logg-tekst ("Deploy av 2025.05.01-abc123 ...") */
function parseVersion(log: string): string | null {
    const match = log.match(/Deploy av\s+(\S+)/);
    return match ? match[1] : null;
}

/** Bygger en SatsHistoryEntry fra en jobb-logg */
function parseEntryFromLog(log: string, env: string, run: WorkflowRun, job: WorkflowJob): SatsHistoryEntry | null {
    const satstabell = parseSatstabell(log);
    if (!satstabell) return null;

    return {
        environment: env,
        satstabell,
        version: parseVersion(log) || 'unknown',
        timestamp: job.completed_at || run.created_at,
        actor: run.actor.login,
        runId: run.id,
    };
}

// ─── Datahenting ─────────────────────────────────────────────────────────────

/** Henter jobber for alle runs parallelt */
async function fetchJobsForRuns(runs: WorkflowRun[]): Promise<{ run: WorkflowRun; jobs: WorkflowJob[] }[]> {
    return Promise.all(
        runs.map(async run => ({
            run,
            jobs: await fetchJobsForRun(run.id).catch(() => [] as WorkflowJob[]),
        }))
    );
}

/**
 * Sandbox-workflow: bygger og deployer til Q1/Q2/Q5 i parallelle jobber.
 * Vi finner FSS-deploy-jobben for hvert miljø og parser loggen.
 */
async function fetchSandboxHistory(perPage: number): Promise<SatsHistoryEntry[]> {
    const runs = await fetchWorkflowRuns(WORKFLOW_IDS.sandbox, perPage);
    const runsWithJobs = await fetchJobsForRuns(runs);

    const logFetches: Promise<SatsHistoryEntry | null>[] = [];

    for (const { run, jobs } of runsWithJobs) {
        for (const [env, jobName] of Object.entries(SANDBOX_JOB_NAMES)) {
            const job = jobs.find(j => j.name === jobName && j.conclusion === 'success');
            if (!job) continue;

            logFetches.push(
                fetchJobLogs(job.id)
                    .then(log => log ? parseEntryFromLog(log, env, run, job) : null)
                    .catch(() => null)
            );
        }
    }

    const results = await Promise.all(logFetches);
    return results.filter((x): x is SatsHistoryEntry => x !== null);
}

/**
 * Standalone deploy-workflow (deploy-q1, deploy-q2, deploy-q5).
 * Hver run har én jobb — vi henter loggen for den første vellykkede.
 */
async function fetchStandaloneHistory(workflowId: number, env: string, perPage: number): Promise<SatsHistoryEntry[]> {
    const runs = await fetchWorkflowRuns(workflowId, perPage);
    const runsWithJobs = await fetchJobsForRuns(runs);

    const toFetch = runsWithJobs
        .map(({ run, jobs }) => {
            const job = jobs.find(j => j.conclusion === 'success');
            return job ? { run, job } : null;
        })
        .filter((x): x is { run: WorkflowRun; job: WorkflowJob } => x !== null);

    const results = await Promise.all(
        toFetch.map(async ({ run, job }) => {
            const log = await fetchJobLogs(job.id);
            return log ? parseEntryFromLog(log, env, run, job) : null;
        })
    );

    return results.filter((x): x is SatsHistoryEntry => x !== null);
}

// ─── Orkestrering og cache ───────────────────────────────────────────────────

/** Sorterer nyest først og fjerner duplikater (samme satstabell innen 1 time) */
function deduplicateAndSort(entries: SatsHistoryEntry[]): SatsHistoryEntry[] {
    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return entries.filter((entry, i, arr) => {
        if (i === 0) return true;
        const prev = arr[i - 1];
        if (entry.environment !== prev.environment || entry.satstabell !== prev.satstabell) return true;
        const timeDiff = Math.abs(new Date(entry.timestamp).getTime() - new Date(prev.timestamp).getTime());
        return timeDiff >= 3600000;
    });
}

/** Henter historikk fra alle workflows parallelt */
async function fetchHistory(perPage: number): Promise<SatsHistoryEntry[]> {
    const [sandbox, q1, q2, q5] = await Promise.all([
        fetchSandboxHistory(perPage).catch(() => []),
        fetchStandaloneHistory(WORKFLOW_IDS.deployQ1, 'q1', perPage).catch(() => []),
        fetchStandaloneHistory(WORKFLOW_IDS.deployQ2, 'q2', perPage).catch(() => []),
        fetchStandaloneHistory(WORKFLOW_IDS.deployQ5, 'q5', perPage).catch(() => []),
    ]);

    return deduplicateAndSort([...sandbox, ...q1, ...q2, ...q5]);
}

/**
 * Smart cache: første kall henter full historikk.
 * Påfølgende kall henter kun de siste N runs og merger med eksisterende.
 */
let cachedHistory: SatsHistoryEntry[] | null = null;

export async function fetchAllSatsHistory(): Promise<SatsHistoryEntry[]> {
    if (cachedHistory === null) {
        cachedHistory = await fetchHistory(RUNS_FULL_FETCH);
    } else {
        const recent = await fetchHistory(RUNS_REFRESH_FETCH);
        const existingIds = new Set(cachedHistory.map(e => `${e.runId}-${e.environment}`));
        const newEntries = recent.filter(e => !existingIds.has(`${e.runId}-${e.environment}`));
        if (newEntries.length > 0) {
            cachedHistory = deduplicateAndSort([...newEntries, ...cachedHistory]);
        }
    }
    return cachedHistory;
}
