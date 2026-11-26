import {FC, useMemo, useState} from "react";
import {Alert, BodyShort, HStack, Select, Table, Tag} from "@navikt/ds-react";
import {TallTabellDef} from "../config/tabeller";
import {TallEntry} from "../model";
import {useSatser} from "../service/Queries";
import {tallNøkkel} from "../utils/sammenligning";
import TabellLaster from "./TabellLaster";

interface Props {
    def: TallTabellDef;
    miljø: string;
    sats: string;
    mot?: string;
}

const MÅNEDER = Array.from({length: 12}, (_, i) => i);

const TallMatrise: FC<Props> = ({def, miljø, sats, mot}) => {
    const gjeldende = useSatser<TallEntry>(miljø, def.apiType, sats);
    const sammenlign = useSatser<TallEntry>(miljø, def.apiType, mot);
    const [valgtKull, setValgtKull] = useState<number>();

    const rader = useMemo(() => gjeldende.data ?? [], [gjeldende.data]);
    const årskull = useMemo(() => [...new Set(rader.map((r) => r.arskull))].sort((a, b) => b - a), [rader]);

    const forrige = useMemo(() => {
        if (!mot || !sammenlign.data) return undefined;
        return new Map(sammenlign.data.map((r) => [tallNøkkel(r), r.verdi]));
    }, [mot, sammenlign.data]);

    const endringerPerKull = useMemo(() => {
        const antall = new Map<number, number>();
        if (!forrige) return antall;
        rader.forEach((r) => {
            if (forrige.get(tallNøkkel(r)) !== r.verdi) antall.set(r.arskull, (antall.get(r.arskull) ?? 0) + 1);
        });
        return antall;
    }, [rader, forrige]);

    if (gjeldende.isError || sammenlign.isError) {
        return <Alert variant="error">Klarte ikke å hente {def.tittel.toLowerCase()} fra {miljø.toUpperCase()}.</Alert>;
    }
    if (!gjeldende.data || (mot && !sammenlign.data)) return <TabellLaster/>;

    const kull = valgtKull !== undefined && årskull.includes(valgtKull) ? valgtKull : årskull[0];
    const verdier = new Map(rader.filter((r) => r.arskull === kull).map((r) => [`${r.alder}|${r.måned}`, r.verdi]));
    const aldre = [...new Set(rader.filter((r) => r.arskull === kull).map((r) => r.alder))].sort((a, b) => a - b);
    const totaltEndret = [...endringerPerKull.values()].reduce((a, b) => a + b, 0);

    return (
        <>
            <div className="tabell-meta">
                <HStack gap="space-16" align="end" wrap>
                    <Select label="Årskull" size="small" value={kull} onChange={(e) => setValgtKull(Number(e.target.value))} className="kull-select">
                        {årskull.map((k) => {
                            const endret = endringerPerKull.get(k);
                            return <option key={k} value={k}>{k}{endret ? ` · ${endret} endret` : ""}</option>;
                        })}
                    </Select>
                    <BodyShort size="small" textColor="subtle" className="tall-info">
                        Rader er alder i år, kolonner er måneder i tillegg.
                    </BodyShort>
                    {mot && (
                        totaltEndret === 0
                            ? <Tag size="small" variant="neutral">Ingen forskjeller mot {mot}</Tag>
                            : <Tag size="small" variant="warning">{totaltEndret} verdier endret i {endringerPerKull.size} årskull</Tag>
                    )}
                </HStack>
            </div>
            <div className="tabell-ramme">
                <Table size="small" className="sats-tabell tall-matrise">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell scope="col">Alder</Table.HeaderCell>
                            {MÅNEDER.map((m) => <Table.HeaderCell key={m} scope="col" align="right">+{m} mnd</Table.HeaderCell>)}
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {aldre.map((alder) => (
                            <Table.Row key={alder}>
                                <Table.HeaderCell scope="row">{alder} år</Table.HeaderCell>
                                {MÅNEDER.map((måned) => {
                                    const verdi = verdier.get(`${alder}|${måned}`);
                                    const gammel = forrige?.get(tallNøkkel({arskull: kull, alder, måned}));
                                    const endret = !!forrige && verdi !== gammel;
                                    return (
                                        <Table.DataCell key={måned} align="right" className={endret ? "celle-endret" : undefined}
                                                        title={endret ? `Var ${gammel ?? "—"} i ${mot}` : undefined}>
                                            {verdi ?? "—"}
                                            {endret && <span className="visually-hidden"> (var {gammel ?? "tom"})</span>}
                                        </Table.DataCell>
                                    );
                                })}
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>
        </>
    );
};

export default TallMatrise;
