import {FC, useMemo, useState} from "react";
import {Alert, BodyShort, HStack, Switch, Table, Tag} from "@navikt/ds-react";
import {PeriodeRad, PeriodeTabellDef} from "../config/tabeller";
import {useSatser} from "../service/Queries";
import {erGjeldende, formatFom, formatTom, formatVerdi} from "../utils/format";
import {SammenlignetRad, sammenlignPerioder, TOM_FELT} from "../utils/sammenligning";
import TabellLaster from "./TabellLaster";

interface Props {
    def: PeriodeTabellDef;
    miljø: string;
    sats: string;
    mot?: string;
}

const Celle: FC<{ ny: string; gammel?: string; endret: boolean; tall: boolean }> = ({ny, gammel, endret, tall}) => (
    <Table.DataCell align={tall ? "right" : "left"} className={endret ? "celle-endret" : undefined}>
        {ny}
        {endret && <span className="celle-gammel"><span className="visually-hidden">Var </span>{gammel}</span>}
    </Table.DataCell>
);

const STATUS_TEKST: Record<SammenlignetRad["status"], string> = {lik: "", endret: "Endret", ny: "Ny", fjernet: "Fjernet"};

const PeriodeTabell: FC<Props> = ({def, miljø, sats, mot}) => {
    const gjeldende = useSatser<PeriodeRad>(miljø, def.apiType, sats);
    const sammenlign = useSatser<PeriodeRad>(miljø, def.apiType, mot);
    const [bareEndringer, setBareEndringer] = useState(false);

    const rader = gjeldende.data;
    const kolonner = useMemo(() => def.kolonner([...(rader ?? []), ...(sammenlign.data ?? [])]), [def, rader, sammenlign.data]);
    const sammenlignet = useMemo(
        () => (rader ? sammenlignPerioder(rader, mot ? sammenlign.data : undefined, kolonner) : []),
        [rader, mot, sammenlign.data, kolonner]
    );

    if (gjeldende.isError || sammenlign.isError) {
        return <Alert variant="error">Klarte ikke å hente {def.tittel.toLowerCase()} fra {miljø.toUpperCase()}.</Alert>;
    }
    if (!rader || (mot && !sammenlign.data)) return <TabellLaster/>;

    const antall = {
        endret: sammenlignet.filter((r) => r.status === "endret").length,
        ny: sammenlignet.filter((r) => r.status === "ny").length,
        fjernet: sammenlignet.filter((r) => r.status === "fjernet").length,
    };
    const antallEndringer = antall.endret + antall.ny + antall.fjernet;
    const synlige = mot && bareEndringer ? sammenlignet.filter((r) => r.status !== "lik") : sammenlignet;
    const erTall = (k: { verdi: (r: PeriodeRad) => unknown }) => rader.some((r) => typeof k.verdi(r) === "number");

    return (
        <>
            <div className="tabell-meta">
                <HStack gap="space-8" align="center" wrap>
                    <BodyShort size="small" textColor="subtle">{rader.length} rader · nyeste først</BodyShort>
                    {mot && (
                        <>
                            {antallEndringer === 0
                                ? <Tag size="small" variant="neutral">Ingen forskjeller mot {mot}</Tag>
                                : <>
                                    {antall.endret > 0 && <Tag size="small" variant="warning">{antall.endret} endret</Tag>}
                                    {antall.ny > 0 && <Tag size="small" variant="success">{antall.ny} {antall.ny === 1 ? "ny" : "nye"}</Tag>}
                                    {antall.fjernet > 0 && <Tag size="small" variant="error">{antall.fjernet} fjernet</Tag>}
                                </>}
                            <Switch size="small" checked={bareEndringer} onChange={(e) => setBareEndringer(e.target.checked)} disabled={antallEndringer === 0}>
                                Vis bare endringer
                            </Switch>
                        </>
                    )}
                </HStack>
            </div>
            <div className="tabell-ramme">
                <Table size="small" className="sats-tabell">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell scope="col">Fra og med</Table.HeaderCell>
                            {def.visTom && <Table.HeaderCell scope="col">Til og med</Table.HeaderCell>}
                            {kolonner.map((k) => (
                                <Table.HeaderCell key={k.id} scope="col" align={erTall(k) ? "right" : "left"}>{k.label}</Table.HeaderCell>
                            ))}
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {synlige.map(({rad, forrige, status, endredeFelt}, i) => {
                            const aktivNå = status !== "fjernet" && erGjeldende(rad);
                            return (
                                <Table.Row key={i} data-diff={mot ? status : undefined} data-gjeldende={aktivNå || undefined}>
                                    <Table.DataCell className="celle-dato">
                                        <HStack gap="space-8" align="center" wrap={false}>
                                            {formatFom(rad.satsFom)}
                                            {aktivNå && <Tag size="xsmall" variant="info">Gjeldende</Tag>}
                                            {mot && status !== "lik" && status !== "endret" && <span className="visually-hidden">{STATUS_TEKST[status]}</span>}
                                        </HStack>
                                    </Table.DataCell>
                                    {def.visTom && (
                                        <Celle ny={formatTom(rad.satsTom)} gammel={forrige && formatTom(forrige.satsTom)}
                                               endret={endredeFelt.has(TOM_FELT)} tall={false}/>
                                    )}
                                    {kolonner.map((k) => (
                                        <Celle key={k.id} ny={formatVerdi(k.verdi(rad))} gammel={forrige && formatVerdi(k.verdi(forrige))}
                                               endret={endredeFelt.has(k.id)} tall={erTall(k)}/>
                                    ))}
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table>
                {synlige.length === 0 && <BodyShort className="tabell-tom">Ingen rader å vise.</BodyShort>}
            </div>
        </>
    );
};

export default PeriodeTabell;
