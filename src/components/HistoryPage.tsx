import {FC, useMemo} from "react";
import {Alert, BodyShort, Box, Heading, HGrid, Link, Loader, Table, Tag, ToggleGroup, VStack} from "@navikt/ds-react";
import {Link as RouterLink, useSearchParams} from "react-router-dom";
import {SatsHistoryEntry} from "../service/SatsHistoryService";
import {useSatsHistory} from "../service/useSatsHistory";
import {formatTidspunkt} from "../utils/format";

const MILJØER = ["q1", "q2", "q5"];

const HistoryPage: FC = () => {
    const [params, setParams] = useSearchParams();
    const miljøParam = params.get("miljo");
    const valgtMiljø = miljøParam && MILJØER.includes(miljøParam) ? miljøParam : "alle";
    const {data, isLoading, error} = useSatsHistory();

    const filtrert = useMemo(
        () => (data ?? []).filter((e) => valgtMiljø === "alle" || e.environment === valgtMiljø),
        [data, valgtMiljø]
    );

    // Første entry per miljø (sortert nyest først) er satstabellen som er aktiv nå.
    const nåværende = useMemo(() => {
        const map = new Map<string, SatsHistoryEntry>();
        (data ?? []).forEach((e) => {
            if (!map.has(e.environment)) map.set(e.environment, e);
        });
        return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
    }, [data]);

    return (
        <main className="side-smal">
            <VStack gap="space-24">
                <div>
                    <Heading level="2" size="large">Satshistorikk</Heading>
                    <BodyShort textColor="subtle">Deploy av satstabeller til Q-miljøer, hentet fra GitHub Actions (siste 90 dager).</BodyShort>
                </div>

                {nåværende.length > 0 && (
                    <HGrid columns={{xs: 1, sm: 3}} gap="space-16">
                        {nåværende.map(([miljø, entry]) => (
                            <Box key={miljø} padding="space-16" borderRadius="12" background="sunken">
                                <BodyShort size="small" textColor="subtle">Aktiv i {miljø.toUpperCase()}</BodyShort>
                                <Link as={RouterLink} to={`/?miljo=${miljø}`} className="historikk-sats">{entry.satstabell}</Link>
                                <BodyShort size="small" textColor="subtle">siden {formatTidspunkt(entry.timestamp)}</BodyShort>
                            </Box>
                        ))}
                    </HGrid>
                )}

                <ToggleGroup size="small" label="Miljø" value={valgtMiljø}
                             onChange={(v) => setParams(v === "alle" ? {} : {miljo: v})}>
                    <ToggleGroup.Item value="alle">Alle</ToggleGroup.Item>
                    {MILJØER.map((m) => <ToggleGroup.Item key={m} value={m}>{m.toUpperCase()}</ToggleGroup.Item>)}
                </ToggleGroup>

                {isLoading && <div className="sentrert"><Loader size="xlarge" title="Henter satshistorikk …"/></div>}
                {error && <Alert variant="error">Kunne ikke hente satshistorikk: {error.message}</Alert>}

                {filtrert.length > 0 && (
                    <div className="tabell-ramme">
                        <Table size="small" className="sats-tabell">
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
                                {filtrert.map((e, i) => (
                                    <Table.Row key={`${e.environment}-${e.timestamp}-${i}`}>
                                        <Table.DataCell className="celle-dato">{formatTidspunkt(e.timestamp)}</Table.DataCell>
                                        <Table.DataCell><Tag variant="neutral" size="small">{e.environment.toUpperCase()}</Tag></Table.DataCell>
                                        <Table.DataCell>
                                            <Link as={RouterLink} to={`/?miljo=${e.environment}&sats=${e.satstabell}`}>{e.satstabell}</Link>
                                        </Table.DataCell>
                                        <Table.DataCell className="celle-mono">
                                            {e.runId > 0
                                                ? <Link href={`https://github.com/navikt/pensjon-regler/actions/runs/${e.runId}`} target="_blank">{e.version.substring(0, 30)}</Link>
                                                : e.version}
                                        </Table.DataCell>
                                        <Table.DataCell>{e.actor}</Table.DataCell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    </div>
                )}

                {!isLoading && !error && filtrert.length === 0 && (
                    <Alert variant="info">Ingen satshistorikk funnet. GitHub Actions-logger er kun tilgjengelig i 90 dager.</Alert>
                )}
            </VStack>
        </main>
    );
};

export default HistoryPage;
