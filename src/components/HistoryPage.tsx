import { FC, useMemo, useState } from 'react';
import { Alert, BodyShort, Box, Heading, HStack, Loader, Link, Page, Select, Table, Tag } from "@navikt/ds-react";
import { SatsHistoryEntry } from '../service/SatsHistoryService';
import { useSatsHistory } from '../service/useSatsHistory';
import Header from './Header';
import { isProduction } from '../utils/environment';
import { useSearchParams } from 'react-router-dom';

const ENVIRONMENTS = ['q1', 'q2', 'q5'];

const environmentColors: Record<string, "info" | "success" | "warning" | "neutral"> = {
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
    const [searchParams] = useSearchParams();
    const initialEnv = searchParams.get('env');
    const [selectedEnv, setSelectedEnv] = useState<string>(
        initialEnv && ENVIRONMENTS.includes(initialEnv) ? initialEnv : 'alle'
    );
    const { data, isLoading, error } = useSatsHistory();
    const isProd = isProduction();

    const filteredData = useMemo(() => {
        if (!data) return [];
        if (selectedEnv === 'alle') return data;
        return data.filter(entry => entry.environment === selectedEnv);
    }, [data, selectedEnv]);

    // Første entry per miljø (sortert nyest først) = nåværende aktiv satstabell
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
                        <Box padding="space-16" borderRadius="12" background="sunken">
                            <Heading size="small" spacing>Nåværende satstabell per miljø</Heading>
                            <HStack gap="space-16" wrap>
                                {[...currentSatsPerEnv.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([env, entry]) => (
                                    <Tag key={env} variant={environmentColors[env] || 'neutral'} size="medium">
                                        {env.toUpperCase()}: {entry.satstabell}
                                    </Tag>
                                ))}
                            </HStack>
                        </Box>
                    )}

                    <Box paddingBlock="space-16">
                        <Select
                            label="Filtrer på miljø"
                            size="small"
                            value={selectedEnv}
                            onChange={e => setSelectedEnv(e.target.value)}
                            style={{ maxWidth: '200px' }}
                        >
                            <option value="alle">Alle miljøer</option>
                            {ENVIRONMENTS.map(env => (
                                <option key={env} value={env}>{env.toUpperCase()}</option>
                            ))}
                        </Select>
                    </Box>

                    {isLoading && (
                        <Box padding="space-32" style={{ display: 'flex', justifyContent: 'center' }}>
                            <Loader size="xlarge" title="Henter satshistorikk…" />
                        </Box>
                    )}

                    {error && (
                        <Alert variant="error">
                            Kunne ikke hente satshistorikk: {error.message}
                        </Alert>
                    )}

                    {filteredData.length > 0 && (
                        <Table size="small">
                            <BodyShort as="caption" visuallyHidden>Historikk over satstabeller deployet til Q-miljøer</BodyShort>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell scope="col">Tidspunkt</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Miljø</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Satstabell</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Versjon</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Utført av</Table.HeaderCell>
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
                                                <Link
                                                    href={`https://github.com/navikt/pensjon-regler/actions/runs/${entry.runId}`}
                                                    target="_blank"
                                                >
                                                    {entry.version.substring(0, 30)}
                                                </Link>
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
