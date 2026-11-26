import {Kolonne, PeriodeRad} from "../config/tabeller";
import {formatDato, formatVerdi, sammenlignFom} from "./format";
import {TallEntry} from "../model";

export type DiffStatus = "lik" | "endret" | "ny" | "fjernet";

export interface SammenlignetRad {
    rad: PeriodeRad;
    forrige?: PeriodeRad;
    status: DiffStatus;
    endredeFelt: Set<string>;
}

const nøkkel = (rad: PeriodeRad, kolonner: Kolonne[]) =>
    [formatDato(rad.satsFom), ...kolonner.filter((k) => k.nøkkel).map((k) => formatVerdi(k.verdi(rad)))].join("|");

export const TOM_FELT = "satsTom";

export const sammenlignPerioder = (rader: PeriodeRad[], forrige: PeriodeRad[] | undefined, kolonner: Kolonne[]): SammenlignetRad[] => {
    if (!forrige) {
        return [...rader].sort(sammenlignFom).map((rad) => ({rad, status: "lik", endredeFelt: new Set()}));
    }

    const forrigeEtterNøkkel = new Map(forrige.map((rad) => [nøkkel(rad, kolonner), rad]));
    const brukt = new Set<string>();

    const resultat: SammenlignetRad[] = rader.map((rad) => {
        const k = nøkkel(rad, kolonner);
        const gammel = forrigeEtterNøkkel.get(k);
        if (!gammel) return {rad, status: "ny", endredeFelt: new Set()};
        brukt.add(k);

        const endredeFelt = new Set<string>();
        if (formatDato(rad.satsTom) !== formatDato(gammel.satsTom)) endredeFelt.add(TOM_FELT);
        kolonner.filter((kol) => !kol.nøkkel).forEach((kol) => {
            if (formatVerdi(kol.verdi(rad)) !== formatVerdi(kol.verdi(gammel))) endredeFelt.add(kol.id);
        });
        return {rad, forrige: gammel, status: endredeFelt.size ? "endret" : "lik", endredeFelt};
    });

    forrige.forEach((rad) => {
        if (!brukt.has(nøkkel(rad, kolonner))) resultat.push({rad, status: "fjernet", endredeFelt: new Set()});
    });

    return resultat.sort((a, b) => sammenlignFom(a.rad, b.rad));
};

export const tallNøkkel = (t: Pick<TallEntry, "arskull" | "alder" | "måned">) => `${t.arskull}|${t.alder}|${t.måned}`;
