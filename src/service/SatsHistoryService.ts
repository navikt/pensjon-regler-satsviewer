import { useQuery, UseQueryResult } from "@tanstack/react-query";

/**
 * Henter satshistorikk ved å parse GitHub Actions deploy-logger.
 *
 * - Q1/Q2/Q5: Parses fra Slack-notifikasjonssteget i deploy-jobb-logger (inneholder "satstabell: X")
 * - Prod/Q0: Parses fra git-historikk til SatsServiceInitializer.kt (PROD_SATSTABELL-konstanten)
 *
 * Krever GitHub App "pensjon-regler-tokens" med actions:read og contents:read.
 * Logger er kun tilgjengelig i 90 dager.
 */

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
    steps: { name: string; conclusion: string }[];
}

interface WorkflowJobsResponse {
    jobs: WorkflowJob[];
}

const GITHUB_API_PROXY = '/github-api';

const WORKFLOW_IDS = {
    sandbox: 200229765,
    prod: 27819037,
    deployQ1: 14297582,
    deployQ2: 5007102,
    deployQ5: 13932626,
};

const ENV_JOB_PATTERNS: Record<string, string[]> = {
    q0: ['Deploy Q0 FSS', 'Deploy Q0 GCP'],
    q1: ['Deploy Q1 FSS', 'Deploy Q1 GCP'],
    q2: ['Deploy Q2 FSS', 'Deploy Q2 GCP'],
    q5: ['Deploy Q5 FSS', 'Deploy Q5 GCP'],
    prod: ['Deploy prod FSS', 'Deploy prod GCP'],
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

async function fetchSandboxHistory(): Promise<SatsHistoryEntry[]> {
    // Sandbox-workflowen deployer alle Q-miljøer (q1/q2/q5) i én kjøring
    const runs = await fetchWorkflowRuns(WORKFLOW_IDS.sandbox);
    const entries: SatsHistoryEntry[] = [];

    for (const run of runs) {
        const jobs = await fetchJobsForRun(run.id);

        for (const [env, patterns] of Object.entries(ENV_JOB_PATTERNS)) {
            // Prod/Q0 bruker git-historikk i stedet (hardkodet konstant)
            if (env === 'prod' || env === 'q0') continue;

            const envJob = jobs.find(j =>
                patterns.some(p => j.name === p) && j.conclusion === 'success'
            );

            if (envJob) {
                try {
                    const logs = await fetchJobLogs(envJob.id);
                    if (!logs) continue;
                    const satstabell = parseSatstabell(logs);
                    const version = parseVersion(logs);

                    if (satstabell) {
                        entries.push({
                            environment: env,
                            satstabell,
                            version: version || 'unknown',
                            timestamp: run.created_at,
                            actor: run.actor.login,
                            runId: run.id,
                        });
                    }
                } catch {
                    // Hopp over hvis logger er utilgjengelige
                }
            }
        }
    }

    return entries;
}

async function fetchProdHistory(): Promise<SatsHistoryEntry[]> {
    // Prod/Q0 satstabell er hardkodet i SatsServiceInitializer.kt (PROD_SATSTABELL).
    // Sporer endringer via git-historikken til filen.
    const response = await fetchFromGitHub(
        '/repos/navikt/pensjon-regler/commits?path=repository/nav-sats-pensjon/src/main/kotlin/no/nav/sats/pensjon/config/SatsServiceInitializer.kt&per_page=30'
    );
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

    const commits: Array<{
        sha: string;
        commit: { message: string; author: { name: string; date: string } };
        author: { login: string } | null;
    }> = await response.json();

    const entries: SatsHistoryEntry[] = [];

    for (const commit of commits) {
        try {
            const fileResponse = await fetchFromGitHub(
                `/repos/navikt/pensjon-regler/contents/repository/nav-sats-pensjon/src/main/kotlin/no/nav/sats/pensjon/config/SatsServiceInitializer.kt?ref=${commit.sha}`
            );
            if (!fileResponse.ok) continue;

            const fileData: { content: string } = await fileResponse.json();
            const content = atob(fileData.content.replace(/\n/g, ''));

            const match = content.match(/PROD_SATSTABELL\s*=\s*"([^"]+)"/);
            if (match) {
                entries.push({
                    environment: 'prod',
                    satstabell: match[1],
                    version: commit.sha.substring(0, 12),
                    timestamp: commit.commit.author.date,
                    actor: commit.author?.login || commit.commit.author.name,
                    runId: 0,
                });
            }
        } catch {
            // Hopp over hvis filen ikke finnes på denne committen
        }
    }

    // Mange commits endrer filen uten å endre satstabell — behold kun faktiske endringer
    return entries.filter((entry, i, arr) =>
        i === 0 || entry.satstabell !== arr[i - 1].satstabell
    );
}

async function fetchStandaloneDeployHistory(workflowId: number, env: string): Promise<SatsHistoryEntry[]> {
    const runs = await fetchWorkflowRuns(workflowId, 15);
    const entries: SatsHistoryEntry[] = [];

    for (const run of runs) {
        const jobs = await fetchJobsForRun(run.id);
        const successJob = jobs.find(j => j.conclusion === 'success');

        if (successJob) {
            try {
                const logs = await fetchJobLogs(successJob.id);
                if (!logs) continue;
                const satstabell = parseSatstabell(logs);
                const version = parseVersion(logs);

                if (satstabell) {
                    entries.push({
                        environment: env,
                        satstabell,
                        version: version || 'unknown',
                        timestamp: run.created_at,
                        actor: run.actor.login,
                        runId: run.id,
                    });
                }
            } catch {
                // Skip
            }
        }
    }

    return entries;
}

export async function fetchAllSatsHistory(): Promise<SatsHistoryEntry[]> {
    const [sandbox, prod, q1, q2, q5] = await Promise.all([
        fetchSandboxHistory().catch(() => []),
        fetchProdHistory().catch(() => []),
        fetchStandaloneDeployHistory(WORKFLOW_IDS.deployQ1, 'q1').catch(() => []),
        fetchStandaloneDeployHistory(WORKFLOW_IDS.deployQ2, 'q2').catch(() => []),
        fetchStandaloneDeployHistory(WORKFLOW_IDS.deployQ5, 'q5').catch(() => []),
    ]);

    const all = [...sandbox, ...prod, ...q1, ...q2, ...q5];

    all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Dedupliser: sandbox og standalone kan logge samme deploy — fjern duplikater innen 1 time
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

export const useSatsHistory = (): UseQueryResult<SatsHistoryEntry[], Error> =>
    useQuery({
        queryKey: ['satsHistory'],
        queryFn: fetchAllSatsHistory,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
