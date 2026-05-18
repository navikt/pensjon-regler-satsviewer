/**
 * Lavnivå GitHub Actions API-kall via nginx-proxy.
 * Alle kall går gjennom /github-api/ som proxyer til api.github.com med token.
 */

const GITHUB_API_PROXY = '/github-api';
const REPO = 'navikt/pensjon-regler';

export interface WorkflowRun {
    id: number;
    name: string;
    created_at: string;
    actor: { login: string };
    conclusion: string;
    status: string;
}

export interface WorkflowJob {
    id: number;
    name: string;
    conclusion: string;
    completed_at: string | null;
    steps: { name: string; conclusion: string }[];
}

interface WorkflowRunsResponse {
    workflow_runs: WorkflowRun[];
}

interface WorkflowJobsResponse {
    jobs: WorkflowJob[];
}

async function fetchFromGitHub(path: string): Promise<Response> {
    return fetch(`${GITHUB_API_PROXY}${path}`, {
        headers: { 'Accept': 'application/json' },
    });
}

/**
 * Henter vellykkede workflow-runs fra siste 90 dager.
 * GitHub sletter logger etter 90 dager, så eldre runs er ubrukelige.
 */
export async function fetchWorkflowRuns(workflowId: number, perPage: number): Promise<WorkflowRun[]> {
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const response = await fetchFromGitHub(
        `/repos/${REPO}/actions/workflows/${workflowId}/runs?status=completed&conclusion=success&per_page=${perPage}&created=>${since}`
    );
    if (!response.ok) throw new Error(`GitHub API feil: ${response.status}`);
    const data: WorkflowRunsResponse = await response.json();
    return data.workflow_runs;
}

/** Henter alle jobber for en gitt workflow-run. */
export async function fetchJobsForRun(runId: number): Promise<WorkflowJob[]> {
    const response = await fetchFromGitHub(`/repos/${REPO}/actions/runs/${runId}/jobs`);
    if (!response.ok) throw new Error(`GitHub API feil: ${response.status}`);
    const data: WorkflowJobsResponse = await response.json();
    return data.jobs;
}

/** Henter rå logg-tekst for en jobb. Returnerer null hvis loggen er utløpt (410 Gone). */
export async function fetchJobLogs(jobId: number): Promise<string | null> {
    const response = await fetchFromGitHub(`/repos/${REPO}/actions/jobs/${jobId}/logs`);
    if (response.status === 410) return null;
    if (!response.ok) return null;
    return response.text();
}
