import {FC, useState} from "react";
import {BodyShort, Detail, Search, VStack} from "@navikt/ds-react";
import {KATEGORIER, TABELLER, TabellDef} from "../config/tabeller";

interface Props {
    valgt: TabellDef;
    onVelg: (id: string) => void;
}

const TabellNav: FC<Props> = ({valgt, onVelg}) => {
    const [søk, setSøk] = useState("");
    const treff = (t: TabellDef) => `${t.tittel} ${t.kategori}`.toLowerCase().includes(søk.trim().toLowerCase());

    const grupper = KATEGORIER
        .map((kategori) => ({kategori, tabeller: TABELLER.filter((t) => t.kategori === kategori && treff(t))}))
        .filter((g) => g.tabeller.length > 0);

    return (
        <nav aria-label="Satstabeller" className="tabell-nav">
            <Search label="Finn tabell" size="small" variant="simple" value={søk} onChange={setSøk} hideLabel={false}/>
            <VStack gap="space-16" className="tabell-nav-liste">
                {grupper.map(({kategori, tabeller}) => (
                    <div key={kategori}>
                        <Detail as="h2" weight="semibold" className="tabell-nav-kategori">{kategori}</Detail>
                        <ul>
                            {tabeller.map((t) => (
                                <li key={t.id}>
                                    <button
                                        type="button"
                                        className="tabell-nav-lenke"
                                        aria-current={t.id === valgt.id ? "page" : undefined}
                                        onClick={() => onVelg(t.id)}
                                    >
                                        {t.tittel}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
                {grupper.length === 0 && <BodyShort size="small" textColor="subtle">Ingen tabeller matcher «{søk}».</BodyShort>}
            </VStack>
        </nav>
    );
};

export default TabellNav;
