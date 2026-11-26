import {FC} from "react";
import {Button, HStack, Select, Skeleton, Tag} from "@navikt/ds-react";
import {ArrowsSquarepathIcon, XMarkIcon} from "@navikt/aksel-icons";

interface Props {
    miljø: string;
    satstabeller: string[] | undefined;
    aktiv: string | undefined;
    valgt: string | undefined;
    mot: string | undefined;
    onVelg: (sats: string) => void;
    onSammenlign: (sats: string | undefined) => void;
    onBytt: () => void;
}

const grupper = (satstabeller: string[]) => [
    {label: "PROD", satser: satstabeller.filter((s) => s.includes("PROD"))},
    {label: "TEST", satser: satstabeller.filter((s) => s.includes("TEST"))},
    {label: "Øvrige", satser: satstabeller.filter((s) => !s.includes("PROD") && !s.includes("TEST"))},
].filter((g) => g.satser.length > 0);

const Valg: FC<{ satstabeller: string[]; aktiv?: string; utelat?: string }> = ({satstabeller, aktiv, utelat}) => (
    <>
        {grupper(satstabeller.filter((s) => s !== utelat)).map((g) => (
            <optgroup key={g.label} label={g.label}>
                {g.satser.map((s) => <option key={s} value={s}>{s}{s === aktiv ? " (aktiv)" : ""}</option>)}
            </optgroup>
        ))}
    </>
);

const SatsVelger: FC<Props> = ({miljø, satstabeller, aktiv, valgt, mot, onVelg, onSammenlign, onBytt}) => {
    if (!satstabeller || !valgt) {
        return <HStack gap="space-16"><Skeleton variant="rounded" width={280} height={60}/><Skeleton variant="rounded" width={280} height={60}/></HStack>;
    }

    return (
        <HStack gap="space-16" align="end" wrap className="sats-velger">
            <Select label="Satstabell" size="small" value={valgt} onChange={(e) => onVelg(e.target.value)} className="sats-select">
                <Valg satstabeller={satstabeller} aktiv={aktiv}/>
            </Select>
            {aktiv && valgt === aktiv && <Tag variant="success" size="small" className="sats-tag">Aktiv i {miljø.toUpperCase()}</Tag>}
            {aktiv && valgt !== aktiv && (
                <Button size="small" variant="tertiary" onClick={() => onVelg(aktiv)}>Vis aktiv ({aktiv})</Button>
            )}

            <div className="sats-velger-skille" aria-hidden/>

            <Select
                label="Sammenlign med"
                size="small"
                value={mot ?? ""}
                onChange={(e) => onSammenlign(e.target.value || undefined)}
                className="sats-select"
            >
                <option value="">Ingen sammenligning</option>
                <Valg satstabeller={satstabeller} aktiv={aktiv} utelat={valgt}/>
            </Select>
            {mot ? (
                <HStack gap="space-4">
                    <Button size="small" variant="tertiary" icon={<ArrowsSquarepathIcon aria-hidden/>}
                            onClick={onBytt}>Bytt</Button>
                    <Button size="small" variant="tertiary-neutral" icon={<XMarkIcon aria-hidden/>} onClick={() => onSammenlign(undefined)}>
                        Avslutt
                    </Button>
                </HStack>
            ) : null}
        </HStack>
    );
};

export default SatsVelger;
