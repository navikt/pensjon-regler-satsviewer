import { FC, useState } from 'react';
import { Alert, Box, Heading, Loader, Page, Select, Table } from "@navikt/ds-react";
import { useSatsHistory } from '../service/SatsHistoryService';
import Header from './Header';
import { isProduction } from '../utils/environment';
import { useSearchParams } from 'react-router-dom';

const ENVIRONMENTS = ['q1', 'q2', 'q5'];

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
    const [selectedEnv, setSelectedEnv] = useState<string | null>(
        initialEnv && ENVIRONMENTS.includes(initialEnv) ? initialEnv : null
    );
    const { data, isLoading, error } = useSatsHistory(selectedEnv);
    const isProd = isProduction();

    return (
        <Page>
            <Header onChangedEnvironment={() => {}} isProduction={isProd} showHistoryLink={false} showBackLink={true} />
            <Box padding="space-32" paddingBlock="space-64" as="main">
                <Page.Block gutters width="2xl">
                    <Heading size="large" spacing>Satshistorikk</Heading>

                    <Box paddingBlock="space-16">
                        <Select
                            label="Velg miljø"
                            size="small"
                            value={selectedEnv || ''}
                            onChange={e => setSelectedEnv(e.target.value || null)}
                            style={{ maxWidth: '200px' }}
                        >
                            <option value="">— Velg miljø —</option>
                            {ENVIRONMENTS.map(env => (
                                <option key={env} value={env}>{env.toUpperCase()}</option>
                            ))}
                        </Select>
                    </Box>

                    {!selectedEnv && (
                        <Alert variant="info">
                            Velg et miljø for å se satshistorikk.
                        </Alert>
                    )}

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

                    {data && data.length > 0 && (
                        <Table size="small">
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Tidspunkt</Table.HeaderCell>
                                    <Table.HeaderCell>Satstabell</Table.HeaderCell>
                                    <Table.HeaderCell>Versjon</Table.HeaderCell>
                                    <Table.HeaderCell>Utført av</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {data.map((entry, i) => (
                                    <Table.Row key={`${entry.timestamp}-${i}`}>
                                        <Table.DataCell>{formatDate(entry.timestamp)}</Table.DataCell>
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

                    {selectedEnv && !isLoading && !error && data && data.length === 0 && (
                        <Alert variant="info">
                            Ingen satshistorikk funnet for {selectedEnv.toUpperCase()}. GitHub Actions-logger er kun tilgjengelig i 90 dager.
                        </Alert>
                    )}
                </Page.Block>
            </Box>
        </Page>
    );
};

export default HistoryPage;
