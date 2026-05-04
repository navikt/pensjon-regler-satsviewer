import { useQuery, UseQueryResult } from "@tanstack/react-query";

/**
 * Henter satshistorikk ved å parse GitHub Actions deploy-logger.
 *
 * - Q1/Q2/Q5: Parses fra Slack-notifikasjonssteget i deploy-jobb-logger (inneholder "satstabell: X")
 *
 * Krever GitHub App "pensjon-regler-tokens" med actions:read.
 * Logger er kun tilgjengelig i 90 dager.
 * Kun tilgjengelig i dev-miljø.
 */

const GITHUB_API_PROXY = '/github-api';

export interface SatsHistoryEntry {
    environment: string;
    satstabell: string;
    version: string;
    timestamp: string;
    actor: string;
    runId: number;
}

interface WorkflowRun {
    id: number;
    name: string;
    created_at: string;
    actor: { login: string };
    conclusion: string;
    status: string;
}

interface WorkflowRunsResponse {
    workflow_runs: WorkflowRun[];
}

interface WorkflowJob {
    id: number;
    name: string;
    conclusion: string;
    completed_at: string | null;
    steps: { name: string; conclusion: string }[];
}

interface WorkflowJobsResponse {
    jobs: WorkflowJob[];
}

// Antall workflow-runs å hente per workflow (mer = lengre historikk, men tregere)
const RUNS_PER_WORKFLOW = 100;

const WORKFLOW_IDS = {
    sandbox: 200229765,
    deployQ1: 14297582,
    deployQ2: 5007102,
    deployQ5: 13932626,
};

// Kun FSS — GCP deployer samme satstabell, så vi slipper å hente begge logger
const ENV_JOB_PATTERNS: Record<string, string[]> = {
    q1: ['Deploy Q1 FSS'],
    q2: ['Deploy Q2 FSS'],
    q5: ['Deploy Q5 FSS'],
};
async function fetchFromGitHub(path: string): Promise<Response> {
    return fetch(`${GITHUB_API_PROXY}${path}`, {
        headers: { 'Accept': 'application/json' },
    });
}

async function fetchWorkflowRuns(workflowId: number, perPage = 30): Promise<WorkflowRun[]> {
    // GitHub beholder jobb-logger i kun 90 dager — unngår å hente eldre runs
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const response = await fetchFromGitHub(
        `/repos/navikt/pensjon-regler/actions/workflows/${workflowId}/runs?status=completed&conclusion=success&per_page=${perPage}&created=>${since}`
    );
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    const data: WorkflowRunsResponse = await response.json();
    return data.workflow_runs;
}

async function fetchJobLogs(jobId: number): Promise<string | null> {
    const response = await fetchFromGitHub(`/repos/navikt/pensjon-regler/actions/jobs/${jobId}/logs`);
    if (response.status === 410) return null; // 410 Gone = logger utløpt (eldre enn 90 dager)
    if (!response.ok) return null;
    return response.text();
}

async function fetchJobsForRun(runId: number): Promise<WorkflowJob[]> {
    const response = await fetchFromGitHub(`/repos/navikt/pensjon-regler/actions/runs/${runId}/jobs`);
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    const data: WorkflowJobsResponse = await response.json();
    return data.jobs;
}

function parseSatstabell(logContent: string): string | null {
    // Slack-steget printer: "Deploy av X (satstabell: SAT2025) til env er ferdig."
    const match = logContent.match(/satstabell:\s*([A-Za-z0-9_-]+)/);
    if (match) return match[1];

    const match2 = logContent.match(/satstabell_type=([A-Za-z0-9_-]+)/);
    if (match2) return match2[1];

    return null;
}

function parseVersion(logContent: string): string | null {
    const match = logContent.match(/Deploy av\s+(\S+)/);
    return match ? match[1] : null;
}

/** Henter alle Q-miljøer fra sandbox-workflowen i ett pass */
async function fetchSandboxHistory(): Promise<SatsHistoryEntry[]> {
    const runs = await fetchWorkflowRuns(WORKFLOW_IDS.sandbox, RUNS_PER_WORKFLOW);

    // Hent alle jobber parallelt
    const runsWithJobs = await Promise.all(
        runs.map(async run => ({
            run,
            jobs: await fetchJobsForRun(run.id).catch(() => [] as WorkflowJob[]),
        }))
    );

    // For hver run, finn deploy-jobb for hvert miljø
    const logFetches: Promise<SatsHistoryEntry | null>[] = [];

    for (const { run, jobs } of runsWithJobs) {
        for (const [env, patterns] of Object.entries(ENV_JOB_PATTERNS)) {
            const job = jobs.find(j => patterns.some(p => j.name === p) && j.conclusion === 'success');
            if (job) {
                logFetches.push(
                    fetchJobLogs(job.id).then(logs => {
                        if (!logs) return null;
                        const satstabell = parseSatstabell(logs);
                        const version = parseVersion(logs);
                        if (!satstabell) return null;
                        return {
                            environment: env,
                            satstabell,
                            version: version || 'unknown',
                            // Bruker jobb-ferdigtidspunkt, ikke workflow-start (inkluderer byggetid)
                            timestamp: job.completed_at || run.created_at,
                            actor: run.actor.login,
                            runId: run.id,
                        } as SatsHistoryEntry;
                    }).catch(() => null)
                );
            }
        }
    }

    const results = await Promise.all(logFetches);
    return results.filter((x): x is SatsHistoryEntry => x !== null);
}

/** Henter historikk fra en standalone deploy-workflow (deploy-q1, deploy-q2, deploy-q5) */
async function fetchStandaloneDeployHistory(workflowId: number, env: string): Promise<SatsHistoryEntry[]> {
    const runs = await fetchWorkflowRuns(workflowId, RUNS_PER_WORKFLOW);

    // Hent alle jobber parallelt
    const runsWithJobs = await Promise.all(
        runs.map(async run => ({
            run,
            jobs: await fetchJobsForRun(run.id).catch(() => [] as WorkflowJob[]),
        }))
    );

    // Finn matching jobb per run, hent logger parallelt
    const jobsToFetch = runsWithJobs
        .map(({ run, jobs }) => {
            const job = jobs.find(j => j.conclusion === 'success');
            return job ? { run, job } : null;
        })
        .filter((x): x is { run: WorkflowRun; job: WorkflowJob } => x !== null);

    const results = await Promise.all(
        jobsToFetch.map(async ({ run, job }) => {
            const logs = await fetchJobLogs(job.id);
            if (!logs) return null;
            const satstabell = parseSatstabell(logs);
            const version = parseVersion(logs);
            if (!satstabell) return null;
            return {
                environment: env,
                satstabell,
                version: version || 'unknown',
                timestamp: job.completed_at || run.created_at,
                actor: run.actor.login,
                runId: run.id,
            } as SatsHistoryEntry;
        })
    );

    return results.filter((x): x is SatsHistoryEntry => x !== null);
}

/** Henter all satshistorikk for alle Q-miljøer */
export async function fetchAllSatsHistory(): Promise<SatsHistoryEntry[]> {
    const [sandbox, q1, q2, q5] = await Promise.all([
        fetchSandboxHistory().catch(() => []),
        fetchStandaloneDeployHistory(WORKFLOW_IDS.deployQ1, 'q1').catch(() => []),
        fetchStandaloneDeployHistory(WORKFLOW_IDS.deployQ2, 'q2').catch(() => []),
        fetchStandaloneDeployHistory(WORKFLOW_IDS.deployQ5, 'q5').catch(() => []),
    ]);

    const all = [...sandbox, ...q1, ...q2, ...q5];
    all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Dedupliser: om samme satstabell ble deployet flere ganger på kort tid, vis kun én entry
    return all.filter((entry, i, arr) => {
        if (i === 0) return true;
        const prev = arr[i - 1];
        if (entry.environment === prev.environment && entry.satstabell === prev.satstabell) {
            const timeDiff = Math.abs(new Date(entry.timestamp).getTime() - new Date(prev.timestamp).getTime());
            if (timeDiff < 3600000) return false;
        }
        return true;
    });
}

// Cache i 1 time — unngår unødvendige GitHub API-kall ved navigering/refresh
const CACHE_TTL = 60 * 60 * 1000;

export const useSatsHistory = (): UseQueryResult<SatsHistoryEntry[], Error> =>
    useQuery({
        queryKey: ['satsHistory'],
        queryFn: fetchAllSatsHistory,
        staleTime: CACHE_TTL,
        gcTime: CACHE_TTL,
        retry: 1,
    });
