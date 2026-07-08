import {FC, useEffect, useMemo, useState} from "react";
import {Accordion, BodyShort, Detail, Loader, Select, Table, UNSAFE_Combobox} from "@navikt/ds-react";
import {querySatsTabellByMiljøAndType} from "../../service/Queries";
import DefaultTable from "../DefaultTable";
import {useQueryClient, UseQueryResult} from "@tanstack/react-query";
import {TallEntry, TallSatser} from "../../model";

interface TallTabellProps {
    environment: string;
    satstabell: string;
    type: string;
    tittel: string;
}

// Grupperer rader for valgt årskull på aldersår, sortert på måned innad i hver gruppe.
const grupperPåAlder = (rader: TallEntry[]): Map<number, TallEntry[]> => {
    const gruppert = new Map<number, TallEntry[]>();
    rader.forEach((rad) => {
        const gruppe = gruppert.get(rad.alder) ?? [];
        gruppe.push(rad);
        gruppert.set(rad.alder, gruppe);
    });
    gruppert.forEach((gruppe) => gruppe.sort((a, b) => a.måned - b.måned));
    return gruppert;
};

// Enkel inline "sparkline" (uten ekstern chart-avhengighet) som viser verdi ved 0 måneder
// for hvert aldersår i valgt årskull, slik at man kan se trenden på tvers av aldersgruppene.
const TrendIndikator: FC<{ verdi: number; min: number; max: number }> = ({verdi, min, max}) => {
    const spenn = max - min || 1;
    const prosent = Math.round(((verdi - min) / spenn) * 100);
    return (
        <span
            aria-hidden="true"
            style={{
                display: "inline-block",
                width: 60,
                height: 8,
                background: "var(--ax-bg-neutral-moderate, #E9E9E9)",
                borderRadius: 4,
                marginLeft: 8,
                verticalAlign: "middle",
                position: "relative",
            }}
        >
            <span
                style={{
                    display: "block",
                    width: `${Math.max(prosent, 4)}%`,
                    height: "100%",
                    background: "var(--ax-bg-accent-strong, #0067C5)",
                    borderRadius: 4,
                }}
            />
        </span>
    );
};

const TallTabell: FC<TallTabellProps> = ({environment, satstabell, type, tittel}) => {
    const queryClient = useQueryClient();

    // Brukerens eksplisitte valg. `undefined`/verdier som ikke lenger finnes i datasettet
    // (f.eks. etter bytte av satstabell) faller automatisk tilbake til fornuftige defaults under.
    const [valgtArskullOverride, setValgtArskullOverride] = useState<number | undefined>(undefined);
    const [alderFraOverride, setAlderFraOverride] = useState<number | undefined>(undefined);
    const [alderTilOverride, setAlderTilOverride] = useState<number | undefined>(undefined);

    useEffect(() => {
        queryClient.invalidateQueries({queryKey: ["satsTabell"]});
    }, [satstabell, queryClient]);

    const {
        data,
        isError,
        isLoading,
        isSuccess,
        isFetching,
    } = querySatsTabellByMiljøAndType(environment, type, satstabell) as UseQueryResult<TallSatser>;

    const alleRader = useMemo(() => data?.satser ?? [], [data]);

    const arskullListe = useMemo(
        () => Array.from(new Set(alleRader.map((rad) => rad.arskull))).sort((a, b) => a - b),
        [alleRader]
    );

    // Avledet valg: bruk brukerens valg dersom det fortsatt finnes i datasettet, ellers nyeste årskull.
    const valgtArskull = valgtArskullOverride !== undefined && arskullListe.includes(valgtArskullOverride)
        ? valgtArskullOverride
        : arskullListe[arskullListe.length - 1];

    const raderForArskull = useMemo(
        () => alleRader.filter((rad) => rad.arskull === valgtArskull),
        [alleRader, valgtArskull]
    );

    const alderListe = useMemo(
        () => Array.from(new Set(raderForArskull.map((rad) => rad.alder))).sort((a, b) => a - b),
        [raderForArskull]
    );

    // Avledet aldersspenn: bruk brukerens valg dersom gyldig for kohorten, ellers hele spennet.
    const alderFra = alderFraOverride !== undefined && alderListe.includes(alderFraOverride)
        ? alderFraOverride
        : alderListe[0];
    const alderTil = alderTilOverride !== undefined && alderListe.includes(alderTilOverride)
        ? alderTilOverride
        : alderListe[alderListe.length - 1];

    const filtrerteRader = useMemo(() => {
        if (alderFra === undefined || alderTil === undefined) {
            return raderForArskull;
        }
        return raderForArskull.filter((rad) => rad.alder >= alderFra && rad.alder <= alderTil);
    }, [raderForArskull, alderFra, alderTil]);

    const gruppertPåAlder = useMemo(() => grupperPåAlder(filtrerteRader), [filtrerteRader]);

    const verdierVedNullMåneder = useMemo(
        () => filtrerteRader.filter((rad) => rad.måned === 0).map((rad) => rad.verdi),
        [filtrerteRader]
    );
    const minVerdi = verdierVedNullMåneder.length ? Math.min(...verdierVedNullMåneder) : 0;
    const maxVerdi = verdierVedNullMåneder.length ? Math.max(...verdierVedNullMåneder) : 0;

    if (isError) {
        throw new Error(`Det oppstod en feil ved henting av ${type} mot miljø ${environment}.`);
    }

    if (isLoading || isFetching) {
        return <Loader size="3xlarge" title="Laster ..." className="loader"/>;
    }

    return (
        <Accordion>
            <Accordion.Item>
                <Accordion.Header>
                    {tittel}
                </Accordion.Header>
                <Accordion.Content>
                    {isSuccess && data && arskullListe.length > 0 ? (
                        <>
                            <div style={{display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem"}}>
                                <div style={{minWidth: 220}}>
                                    <UNSAFE_Combobox
                                        label="Årskull"
                                        options={arskullListe.map((arskull) => String(arskull))}
                                        selectedOptions={valgtArskull !== undefined ? [String(valgtArskull)] : []}
                                        onToggleSelected={(option, isSelected) => {
                                            if (isSelected) {
                                                setValgtArskullOverride(Number(option));
                                            }
                                        }}
                                        size="small"
                                    />
                                </div>
                                <Select
                                    label="Alder fra (år)"
                                    size="small"
                                    value={alderFra ?? ""}
                                    onChange={(event) => setAlderFraOverride(Number(event.target.value))}
                                    style={{minWidth: 140}}
                                >
                                    {alderListe.map((alder) => (
                                        <option key={alder} value={alder}>{alder} år</option>
                                    ))}
                                </Select>
                                <Select
                                    label="Alder til (år)"
                                    size="small"
                                    value={alderTil ?? ""}
                                    onChange={(event) => setAlderTilOverride(Number(event.target.value))}
                                    style={{minWidth: 140}}
                                >
                                    {alderListe.map((alder) => (
                                        <option key={alder} value={alder}>{alder} år</option>
                                    ))}
                                </Select>
                            </div>

                            {valgtArskull !== undefined && (
                                <>
                                    <Detail style={{marginBottom: "0.5rem"}}>
                                        Viser {filtrerteRader.length} av {alleRader.length} rader totalt
                                        (årskull {valgtArskull}, alder {alderFra}–{alderTil} år)
                                    </Detail>
                                    <Accordion>
                                        {Array.from(gruppertPåAlder.entries()).map(([alder, rader]) => {
                                            const verdiVedNullMåneder = rader.find((r) => r.måned === 0)?.verdi;
                                            return (
                                                <Accordion.Item key={alder}>
                                                    <Accordion.Header>
                                                        <BodyShort as="span">
                                                            {alder} år
                                                            {verdiVedNullMåneder !== undefined && (
                                                                <>
                                                                    {" "}({verdiVedNullMåneder})
                                                                    <TrendIndikator
                                                                        verdi={verdiVedNullMåneder}
                                                                        min={minVerdi}
                                                                        max={maxVerdi}
                                                                    />
                                                                </>
                                                            )}
                                                        </BodyShort>
                                                    </Accordion.Header>
                                                    <Accordion.Content>
                                                        <Table size="small" zebraStripes>
                                                            <Table.Header>
                                                                <Table.Row>
                                                                    <Table.HeaderCell scope="col">Måned</Table.HeaderCell>
                                                                    <Table.HeaderCell scope="col">Verdi</Table.HeaderCell>
                                                                </Table.Row>
                                                            </Table.Header>
                                                            <Table.Body>
                                                                {rader.map((rad) => (
                                                                    <Table.Row key={`${rad.arskull}-${rad.alder}-${rad.måned}`}>
                                                                        <Table.DataCell>{rad.måned}</Table.DataCell>
                                                                        <Table.DataCell>{rad.verdi}</Table.DataCell>
                                                                    </Table.Row>
                                                                ))}
                                                            </Table.Body>
                                                        </Table>
                                                    </Accordion.Content>
                                                </Accordion.Item>
                                            );
                                        })}
                                    </Accordion>
                                </>
                            )}
                        </>
                    ) : (
                        <DefaultTable/>
                    )}
                </Accordion.Content>
            </Accordion.Item>
        </Accordion>
    );
};

export default TallTabell;
