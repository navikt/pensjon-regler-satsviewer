---
name: satshistorikk
description: Dokumentasjon for satshistorikk-featuren som henter deploy-historikk fra GitHub Actions. Bruk denne når du jobber med SatsHistoryService, HistoryPage, GitHub API-integrasjon, eller entrypoint/nginx-oppsettet for GitHub App auth.
---

# Satshistorikk

Viser hvilke satstabeller som har blitt deployet til Q1, Q2 og Q5 over tid.

Denne infoen finnes ikke lagret noe sted — vi henter den ved å lese GitHub Actions deploy-logger fra `navikt/pensjon-regler`.

## Hvordan det fungerer

### Datakilden

Deploy-jobbene i pensjon-regler har et Slack-notifikasjonssteg som printer:
```
Deploy av 2025.05.01-abc123 (satstabell: SAT2025) til Q2 FSS er ferdig.
```

Vi parser `satstabell: X` og `Deploy av X` fra disse loggene.

### Workflows vi leser fra

| Workflow | ID | Hva den gjør |
|---|---|---|
| bygg-og-deploy-sandbox | 200229765 | Bygger fra sandbox-branch, deployer til Q1/Q2/Q5 parallelt |
| deploy-q1 | 14297582 | Standalone deploy til Q1 (sjelden brukt) |
| deploy-q2 | 5007102 | Standalone deploy til Q2 (sjelden brukt) |
| deploy-q5 | 13932626 | Standalone deploy til Q5 (sjelden brukt) |

### API-flyten (per workflow)

1. Hent liste over runs (`/actions/workflows/{id}/runs`) — 1 kall
2. For hver run, hent jobber (`/actions/runs/{id}/jobs`) — 1 kall per run
3. For vellykkede deploy-jobber, hent logger (`/actions/jobs/{id}/logs`) — 1 kall per jobb

GitHub redirecter log-kall til Azure Blob Storage. Disse blob-kallene teller ikke mot rate limit.

### Antall API-kall

Med `RUNS_FULL_FETCH = 100` blir det ca. 370 kall mot GitHub (rate limit) + ca. 260 blob-downloads (gratis).
Standalone deploy-workflows er sjelden brukt, så i praksis er det nesten kun sandbox som koster.

GitHub App har 5000 kall/time — gir rom for ~13 fulle innlastinger per time.

## Caching-strategi

Bruker react-query med en "smart cache":

- **Første besøk**: Full fetch (RUNS_FULL_FETCH runs per workflow)
- **Etter 5 min (staleTime)**: Henter kun RUNS_REFRESH_FETCH siste runs og merger med cache
- **Etter 1 time (gcTime)**: Cache tømmes, neste besøk gjør full fetch

I tillegg holder vi en modul-level `cachedHistory`-variabel som skiller mellom "aldri hentet" og "har data, sjekk for nye".

## Autentisering

GitHub App: "pensjon-regler-tokens" (app_id: 2705960, installation_id: 105505840).

Flyten:
1. `entrypoint.sh` dekoder PEM-nøkkel (base64-kodet i NAIS-variabel)
2. Genererer JWT med openssl
3. Bytter JWT mot installation access token
4. Injiserer token i nginx-config
5. Refresher token hvert 50. minutt (token lever i 1 time)

Nginx proxyer `/github-api/*` til `api.github.com` med `Authorization: Bearer <token>`.

## Viktige begrensninger

- **90 dagers logger**: GitHub sletter jobb-logger etter 90 dager. Vi filtrerer med `created=>` for å unngå å hente runs med utløpte logger.
- **Kun dev**: Satshistorikk er skjult i prod (`isProduction()`). Route redirecter til `/` i prod.
- **Ingen prod-historikk**: Prod-deploys er vesentlig annerledes og hentes ikke.
- **`find()` på jobber**: Vi bruker `find()` (returnerer første match), ikke `filter()`. Betyr vi kun henter 1 logg per miljø per run fra sandbox.

## Nøkkelfiler

| Fil | Ansvar |
|---|---|
| `src/service/SatsHistoryService.ts` | All logikk: API-kall, parsing, caching |
| `src/components/HistoryPage.tsx` | UI: tabell, filter, summary-boks |
| `src/components/Header.tsx` | Navigasjon: lenke til historikk med env-param |
| `config/entrypoint.sh` | GitHub App token-generering |
| `config/nginx/nginx.conf` | Proxy til GitHub API |

## Konfigurerbare knobs

Disse ligger øverst i `SatsHistoryService.ts`:

- `RUNS_FULL_FETCH` — Antall runs ved første innlasting (default: 100, max: 100 per GitHub API page)
- `RUNS_REFRESH_FETCH` — Antall runs ved refresh (default: 10)
- `STALE_TIME` — Tid før react-query anser data som stale (default: 5 min)
- `GC_TIME` — Tid før cache garbage-collectes (default: 1 time)

## Vanlige endringer

### Legge til nytt miljø
1. Legg til workflow ID i `WORKFLOW_IDS`
2. Legg til jobb-pattern i `ENV_JOB_PATTERNS`
3. Legg til kall i `fetchSatsHistory()`

### Endre historikklengde
Juster `RUNS_FULL_FETCH`. Merk: GitHub API returnerer max 100 per page. For mer trenger du paginering.

### Endre hva som parses
Se `parseSatstabell()` og `parseVersion()` — regex som matcher Slack-notifikasjonsstringens format.
