import {FC, useEffect} from "react";
import {Alert, BodyShort, CopyButton, Detail, Heading, HStack} from "@navikt/ds-react";
import {finnTabell} from "../config/tabeller";
import {useAktivSatstabell, useAlleSatstabeller} from "../service/Queries";
import {useVisning} from "../utils/visning";
import TabellNav from "./TabellNav";
import SatsVelger from "./SatsVelger";
import PeriodeTabell from "./PeriodeTabell";
import TallMatrise from "./TallMatrise";

const SatsPage: FC = () => {
    const {visning, oppdater} = useVisning();
    const {miljø, mot} = visning;
    const aktiv = useAktivSatstabell(miljø);
    const alle = useAlleSatstabeller(miljø);
    const def = finnTabell(visning.tabell);
    // Uten valgt satstabell i URL-en vises den som er aktiv i miljøet.
    const sats = visning.sats ?? aktiv.data;

    useEffect(() => {
        document.title = `${def.tittel} · Satsviewer`;
    }, [def]);

    const innhold = () => {
        if (aktiv.isError || alle.isError) {
            return <Alert variant="error">Klarte ikke å hente satstabeller fra {miljø.toUpperCase()}. Sjekk at du er på naisdevice.</Alert>;
        }
        if (!sats) return null;
        return def.type === "tall"
            ? <TallMatrise key={def.id} def={def} miljø={miljø} sats={sats} mot={mot}/>
            : <PeriodeTabell key={def.id} def={def} miljø={miljø} sats={sats} mot={mot}/>;
    };

    return (
        <div className="sats-layout">
            <aside className="sats-sidebar">
                <TabellNav valgt={def} onVelg={(tabell) => oppdater({tabell})}/>
            </aside>
            <main className="sats-main" id="hovedinnhold">
                <div className="sats-toolbar">
                    <SatsVelger
                        miljø={miljø}
                        satstabeller={alle.data}
                        aktiv={aktiv.data}
                        valgt={sats}
                        mot={mot}
                        onVelg={(s) => oppdater({sats: s === aktiv.data ? undefined : s, mot: mot === s ? undefined : mot})}
                        onSammenlign={(m) => oppdater({mot: m})}
                        onBytt={() => mot && oppdater({sats: mot === aktiv.data ? undefined : mot, mot: sats})}
                    />
                </div>
                <section className="sats-innhold" aria-labelledby="tabell-tittel">
                    <HStack justify="space-between" align="start" gap="space-16" wrap>
                        <div>
                            <Detail textColor="subtle">{def.kategori}</Detail>
                            <Heading level="2" size="large" id="tabell-tittel">{def.tittel}</Heading>
                            {sats && (
                                <BodyShort size="small" textColor="subtle">
                                    {mot ? <>Viser <strong>{sats}</strong>, sammenlignet med <strong>{mot}</strong></> : <>Fra <strong>{sats}</strong></>} i {miljø.toUpperCase()}
                                </BodyShort>
                            )}
                        </div>
                        <CopyButton size="small" copyText={window.location.href} text="Kopier lenke" activeText="Lenke kopiert"/>
                    </HStack>
                    {innhold()}
                </section>
            </main>
        </div>
    );
};

export default SatsPage;
