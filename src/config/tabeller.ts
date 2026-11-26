import {BaseSats} from "../model";
import {
    barnetilleggTak2016Sats,
    delingstallSats,
    eøsKonvensjonsLandSats,
    forholdstallSats,
    garantiPensjonsNivåSats,
    grunnbeløpSats,
    grunnpensjonSats,
    lønnsvekstSats,
    minstePensjonsNivåSats,
    nordiskKonvensjonsLandSats,
    referansebeløpAfpSats,
    reguleringsFaktorSats,
    rettsgebyrSats,
    skjermingstilleggSats,
    særtilleggSats,
    uføretrygdMinsteytelseSats,
    veietGrunnbeløpSats,
} from "../constants/Constants";

export type PeriodeRad = BaseSats & Record<string, unknown>;

export interface Kolonne {
    id: string;
    label: string;
    verdi: (rad: PeriodeRad) => unknown;
    // Nøkkelkolonner identifiserer raden (sammen med fom) når to satstabeller sammenlignes.
    nøkkel?: boolean;
}

interface FellesDef {
    id: string;
    tittel: string;
    kategori: string;
    apiType: string;
}

export interface PeriodeTabellDef extends FellesDef {
    type: "periode";
    visTom: boolean;
    kolonner: (rader: PeriodeRad[]) => Kolonne[];
}

export interface TallTabellDef extends FellesDef {
    type: "tall";
}

export type TabellDef = PeriodeTabellDef | TallTabellDef;

const kode = (nøkkel: string) => (rad: PeriodeRad) => (rad.kodeMap as Record<string, unknown> | undefined)?.[nøkkel];

const kodeKolonner = (...par: [string, string][]): Kolonne[] =>
    par.map(([id, label]) => ({id, label, verdi: kode(id)}));

const verdiKolonne: Kolonne[] = [{id: "value", label: "Verdi", verdi: (rad) => rad.value}];

const periode = (id: string, tittel: string, kategori: string, apiType: string, kolonner: Kolonne[] | ((rader: PeriodeRad[]) => Kolonne[]), visTom = true): PeriodeTabellDef => ({
    id, tittel, kategori, apiType, visTom, type: "periode",
    kolonner: typeof kolonner === "function" ? kolonner : () => kolonner,
});

const minsteytelse = (rad: PeriodeRad) => rad.satsMinsteytelse as { sats?: number; satsType?: string } | undefined;

export const TABELLER: TabellDef[] = [
    periode("grunnbelop", "Grunnbeløp", "Generelt", grunnbeløpSats, verdiKolonne),
    periode("veiet-grunnbelop", "Veiet grunnbeløp", "Generelt", veietGrunnbeløpSats, verdiKolonne),
    periode("reguleringsfaktor", "Reguleringsfaktor", "Generelt", reguleringsFaktorSats, verdiKolonne),
    periode("lonnsvekst", "Lønnsvekst", "Generelt", lønnsvekstSats, verdiKolonne),

    periode("grunnpensjon", "Grunnpensjon", "Alderspensjon 1967", grunnpensjonSats, verdiKolonne),
    periode("sartillegg", "Særtillegg", "Alderspensjon 1967", særtilleggSats,
        kodeKolonner(["Minste", "Minste"], ["Ordinaer", "Ordinær"], ["Forhoyet", "Forhøyet"])),

    periode("minstepensjonsniva", "Minstepensjonsnivå", "Alderspensjon 2011", minstePensjonsNivåSats,
        kodeKolonner(["LAV", "Lav"], ["ORDINAER", "Ordinær"], ["HOY", "Høy"], ["HOY_ENSLIG", "Høy enslig"], ["SAERSKILT", "Særskilt"])),
    periode("garantipensjonsniva", "Garantipensjonsnivå", "Alderspensjon 2011", garantiPensjonsNivåSats,
        kodeKolonner(["ORDINAER", "Ordinær"], ["HOY", "Høy"])),
    periode("skjermingstillegg", "Skjermingstillegg", "Alderspensjon 2011", skjermingstilleggSats, verdiKolonne),

    periode("uforetrygd-minsteytelse", "Uføretrygd minsteytelse", "Uføretrygd", uføretrygdMinsteytelseSats, [
        {id: "uftKonv", label: "Konvertert", verdi: (rad) => rad.uftKonv, nøkkel: true},
        {id: "beregnesSomGift", label: "Beregnes som gift", verdi: (rad) => rad.beregnesSomGift, nøkkel: true},
        {id: "ungUfor", label: "Ung ufør", verdi: (rad) => rad.ungUfor, nøkkel: true},
        {id: "forsorgerEktefelleOver60", label: "Forsørger ektefelle over 60", verdi: (rad) => rad.forsorgerEktefelleOver60, nøkkel: true},
        {id: "satsType", label: "Kode", verdi: (rad) => minsteytelse(rad)?.satsType, nøkkel: true},
        {id: "sats", label: "Sats", verdi: (rad) => minsteytelse(rad)?.sats},
    ]),
    periode("rettsgebyr", "Rettsgebyr", "Uføretrygd", rettsgebyrSats,
        kodeKolonner(["RETTSGEBYR", "Rettsgebyr"], ["TOL_GR_EO_ETTERBET", "Toleransegrense etterbetaling"],
            ["TOL_GR_EO_TILBAKEKR", "Toleransegrense tilbakekreving"], ["TERSKEL_FEILUTBET", "Terskel feilutbetaling"])),
    periode("barnetillegg-tak-2016", "Barnetillegg tak 2016", "Uføretrygd", barnetilleggTak2016Sats,
        kodeKolonner(["ORDINÆR", "Ordinær"], ["OVERGANGSREGLER", "Overgangsregler"])),

    periode("nordisk-konvensjonsland", "Nordisk konvensjonsland", "Konvensjonsland", nordiskKonvensjonsLandSats,
        [{id: "value", label: "Land", verdi: (rad) => rad.value, nøkkel: true}]),
    periode("eos-konvensjonsland", "EØS-konvensjonsland", "Konvensjonsland", eøsKonvensjonsLandSats,
        [{id: "value", label: "Land", verdi: (rad) => rad.value, nøkkel: true}]),

    periode("referansebelop-afp", "Referansebeløp AFP", "AFP", referansebeløpAfpSats, (rader) => {
        const kull = new Set<string>();
        rader.forEach((rad) => Object.keys((rad.kodeMap as Record<string, number>) ?? {}).forEach((k) => kull.add(k)));
        return [...kull].sort().map((k) => ({id: k, label: k, verdi: kode(k)}));
    }, false),

    {id: "forholdstall", tittel: "Forholdstall", kategori: "Forholdstall og delingstall", apiType: forholdstallSats, type: "tall"},
    {id: "delingstall", tittel: "Delingstall", kategori: "Forholdstall og delingstall", apiType: delingstallSats, type: "tall"},
];

export const KATEGORIER = [...new Set(TABELLER.map((t) => t.kategori))];

export const finnTabell = (id: string | null): TabellDef => TABELLER.find((t) => t.id === id) ?? TABELLER[0];
