import { FC, useMemo, useState } from 'react';
import { Alert, Box, Heading, Loader, Page, Select, Table, Tag } from "@navikt/ds-react";
import { SatsHistoryEntry, useSatsHistory } from '../service/SatsHistoryService';
import Header from './Header';
import { isProduction } from '../utils/environment';

const environmentColors: Record<string, "info" | "success" | "warning" | "error" | "neutral"> = {
    prod: 'error',
    q0: 'warning',
    q1: 'info',
    q2: 'success',
    q5: 'neutral',
};

const formatDate = (iso: string): string => {
    const date = new Date(iso);
    return date.toLocaleDateString('nb-NO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const HistoryPage: FC = () => {
    const { data, isLoading, error } = useSatsHistory();
    const [envFilter, setEnvFilter] = useState<string>('alle');
    const isProd = isProduction();

    const filteredData = useMemo(() => {
        if (!data) return [];
        if (envFilter === 'alle') return data;
        return data.filter(entry => entry.environment === envFilter);
    }, [data, envFilter]);

    const uniqueEnvironments = useMemo(() => {
        if (!data) return [];
        return [...new Set(data.map(e => e.environment))].sort();
    }, [data]);

    // Group by satstabell changes per environment
    const currentSatsPerEnv = useMemo(() => {
        if (!data) return new Map<string, SatsHistoryEntry>();
        const map = new Map<string, SatsHistoryEntry>();
        for (const entry of data) {
            if (!map.has(entry.environment)) {
                map.set(entry.environment, entry);
            }
        }
        return map;
    }, [data]);

    return (
        <Page>
            <Header onChangedEnvironment={() => {}} isProduction={isProd} showHistoryLink={false} showBackLink={true} />
            <Box padding="space-32" paddingBlock="space-64" as="main">
                <Page.Block gutters width="2xl">
                    <Heading size="large" spacing>Satshistorikk</Heading>

                    {currentSatsPerEnv.size > 0 && (
                        <Box padding="space-16" paddingBlock="space-16" borderRadius="8" background="sunken">
                            <Heading size="small" spacing>Nåværende satstabell per miljø</Heading>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {[...currentSatsPerEnv.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([env, entry]) => (
                                    <Tag key={env} variant={environmentColors[env] || 'neutral'} size="medium">
                                        {env.toUpperCase()}: {entry.satstabell}
                                    </Tag>
                                ))}
                            </div>
                        </Box>
                    )}

                    <Box paddingBlock="space-16">
                        <Select
                            label="Filtrer på miljø"
                            size="small"
                            value={envFilter}
                            onChange={e => setEnvFilter(e.target.value)}
                            style={{ maxWidth: '200px' }}
                        >
                            <option value="alle">Alle miljøer</option>
                            {uniqueEnvironments.map(env => (
                                <option key={env} value={env}>{env.toUpperCase()}</option>
                            ))}
                        </Select>
                    </Box>

                    {isLoading && (
                        <Box padding="space-32" style={{ display: 'flex', justifyContent: 'center' }}>
                            <Loader size="xlarge" title="Henter satshistorikk..." />
                        </Box>
                    )}

                    {error && (
                        <Alert variant="error">
                            Kunne ikke hente satshistorikk: {error.message}
                        </Alert>
                    )}

                    {filteredData.length > 0 && (
                        <Table size="small">
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Tidspunkt</Table.HeaderCell>
                                    <Table.HeaderCell>Miljø</Table.HeaderCell>
                                    <Table.HeaderCell>Satstabell</Table.HeaderCell>
                                    <Table.HeaderCell>Versjon</Table.HeaderCell>
                                    <Table.HeaderCell>Utført av</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {filteredData.map((entry, i) => (
                                    <Table.Row key={`${entry.environment}-${entry.timestamp}-${i}`}>
                                        <Table.DataCell>{formatDate(entry.timestamp)}</Table.DataCell>
                                        <Table.DataCell>
                                            <Tag variant={environmentColors[entry.environment] || 'neutral'} size="small">
                                                {entry.environment.toUpperCase()}
                                            </Tag>
                                        </Table.DataCell>
                                        <Table.DataCell>
                                            <strong>{entry.satstabell}</strong>
                                        </Table.DataCell>
                                        <Table.DataCell style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>
                                            {entry.runId > 0 ? (
                                                <a
                                                    href={`https://github.com/navikt/pensjon-regler/actions/runs/${entry.runId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {entry.version.substring(0, 30)}
                                                </a>
                                            ) : (
                                                entry.version
                                            )}
                                        </Table.DataCell>
                                        <Table.DataCell>{entry.actor}</Table.DataCell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    )}

                    {!isLoading && !error && filteredData.length === 0 && (
                        <Alert variant="info">
                            Ingen satshistorikk funnet. GitHub Actions-logger er kun tilgjengelig i 90 dager.
                        </Alert>
                    )}
                </Page.Block>
            </Box>
        </Page>
    );
};

export default HistoryPage;
