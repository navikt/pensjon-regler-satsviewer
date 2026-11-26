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
import type {SatsHistoryEntry} from "./SatsHistoryService";

// Mockdata for lokal utvikling uten tilgang til pensjon-regler (VITE_MOCK=true).
// Tallene er konstruert, ikke ekte satser.

export const MOCK_SATSTABELLER = [
    "PROD_20260501",
    "PROD_20250501",
    "PROD_20240501",
    "TEST_REGULERING_2026",
    "TEST_G_150000",
    "SANDBOX_UFORE_2027",
];

export const MOCK_AKTIV: Record<string, string> = {
    q0: "PROD_20260501",
    q1: "TEST_REGULERING_2026",
    q2: "PROD_20260501",
    q5: "PROD_20250501",
    produksjon: "PROD_20260501",
};

type Dato = [number, number, number];
const ÅPEN_FOM: Dato = [-99999, 1, 1];
const ÅPEN_TOM: Dato = [99999, 12, 31];

const G_PER_ÅR: Record<number, number> = {
    2015: 90068, 2016: 92576, 2017: 93634, 2018: 96883, 2019: 99858, 2020: 101351,
    2021: 106399, 2022: 111477, 2023: 118620, 2024: 124028, 2025: 130160, 2026: 136500,
};

const sisteÅr = (sats: string) => {
    const år = sats.match(/(\d{4})/)?.[1];
    return Math.min(Number(år ?? 2026), 2026);
};

// Justerer siste års G for testtabeller, så sammenligning mot PROD gir forskjeller.
const g = (år: number, sats: string) => {
    if (år === 2026 && sats === "TEST_REGULERING_2026") return 137592;
    if (år === 2026 && sats === "TEST_G_150000") return 150000;
    return G_PER_ÅR[år];
};

const år = (sats: string, fra = 2015) => {
    const liste: number[] = [];
    for (let a = fra; a <= sisteÅr(sats); a++) liste.push(a);
    return liste;
};

const mai = (sats: string, verdi: (år: number) => Record<string, unknown>) => {
    const liste = år(sats);
    return liste.map((a, i) => ({
        satsFom: [a, 5, 1] as Dato,
        satsTom: (i === liste.length - 1 ? ÅPEN_TOM : [a + 1, 4, 30]) as Dato,
        ...verdi(a),
    }));
};

const kalenderår = (sats: string, fra: number, verdi: (år: number) => Record<string, unknown>) => {
    const liste = år(sats, fra);
    return liste.map((a, i) => ({
        satsFom: [a, 1, 1] as Dato,
        satsTom: (i === liste.length - 1 ? ÅPEN_TOM : [a, 12, 31]) as Dato,
        ...verdi(a),
    }));
};

const rund = (n: number, desimaler = 0) => Number(n.toFixed(desimaler));

const NORDISKE = ["DNK", "FIN", "ISL", "SWE", "FRO", "GRL", "ALA"];
const EØS: [string, Dato, Dato][] = [
    ["AUT", [1994, 1, 1], ÅPEN_TOM], ["BEL", [1994, 1, 1], ÅPEN_TOM], ["BGR", [2007, 1, 1], ÅPEN_TOM],
    ["CYP", [2004, 5, 1], ÅPEN_TOM], ["CZE", [2004, 5, 1], ÅPEN_TOM], ["DEU", [1994, 1, 1], ÅPEN_TOM],
    ["ESP", [1994, 1, 1], ÅPEN_TOM], ["EST", [2004, 5, 1], ÅPEN_TOM], ["FRA", [1994, 1, 1], ÅPEN_TOM],
    ["GBR", [1994, 1, 1], [2020, 12, 31]], ["GRC", [1994, 1, 1], ÅPEN_TOM], ["HRV", [2013, 7, 1], ÅPEN_TOM],
    ["HUN", [2004, 5, 1], ÅPEN_TOM], ["IRL", [1994, 1, 1], ÅPEN_TOM], ["ITA", [1994, 1, 1], ÅPEN_TOM],
    ["LIE", [1995, 5, 1], ÅPEN_TOM], ["LTU", [2004, 5, 1], ÅPEN_TOM], ["LUX", [1994, 1, 1], ÅPEN_TOM],
    ["LVA", [2004, 5, 1], ÅPEN_TOM], ["MLT", [2004, 5, 1], ÅPEN_TOM], ["NLD", [1994, 1, 1], ÅPEN_TOM],
    ["POL", [2004, 5, 1], ÅPEN_TOM], ["PRT", [1994, 1, 1], ÅPEN_TOM], ["ROU", [2007, 1, 1], ÅPEN_TOM],
    ["SVK", [2004, 5, 1], ÅPEN_TOM], ["SVN", [2004, 5, 1], ÅPEN_TOM], ["CHE", [2002, 6, 1], ÅPEN_TOM],
];

const MINSTEYTELSE: [boolean | undefined, boolean, boolean, boolean, string, number][] = [
    [undefined, false, false, false, "MINST_ORDINAER", 2.28],
    [undefined, true, false, false, "MINST_GIFT", 2.0],
    [undefined, true, false, true, "MINST_GIFT_FORSORGER", 2.4],
    [undefined, false, true, false, "MINST_UNG", 2.91],
    [undefined, true, true, false, "MINST_UNG_GIFT", 2.66],
    [true, false, false, false, "MINST_KONVERTERT", 2.33],
];

const tall = (sats: string, verdi: (årskull: number, alder: number, måned: number) => number) => {
    const sisteKull = sats === "PROD_20240501" ? 1972 : 1975;
    const rader = [];
    for (let årskull = 1943; årskull <= sisteKull; årskull++) {
        for (let alder = 62; alder <= 75; alder++) {
            for (let måned = 0; måned < 12; måned++) {
                rader.push({arskull: årskull, alder, måned, verdi: verdi(årskull, alder, måned)});
            }
        }
    }
    return rader;
};

// Testtabellen har justerte tall for de yngste årskullene fra 70 år.
const tallJustering = (sats: string, årskull: number, alder: number) =>
    (sats === "TEST_REGULERING_2026" && årskull >= 1965 && alder >= 70 ? 0.004 : 0);

const generatorer: Record<string, (sats: string) => unknown[]> = {
    [grunnbeløpSats]: (s) => mai(s, (a) => ({value: g(a, s)})),
    [veietGrunnbeløpSats]: (s) => kalenderår(s, 2016, (a) => ({value: rund((4 * g(a - 1, s) + 8 * (g(a, s) ?? g(a - 1, s))) / 12)})),
    [reguleringsFaktorSats]: (s) => mai(s, (a) => ({value: a === 2015 ? 1.0 : rund(g(a, s) / g(a - 1, s), 6)})),
    [lønnsvekstSats]: (s) => mai(s, (a) => ({value: a === 2015 ? 1.0 : rund(g(a, s) / g(a - 1, s) + 0.0012, 6)})),
    [grunnpensjonSats]: (s) => mai(s, (a) => ({value: g(a, s)})),
    [særtilleggSats]: () => [
        {satsFom: ÅPEN_FOM, satsTom: [2010, 12, 31], kodeMap: {Minste: 0.79, Ordinaer: 1.0, Forhoyet: 2.0}},
        {satsFom: [2011, 1, 1], satsTom: ÅPEN_TOM, kodeMap: {Minste: 0.8, Ordinaer: 1.0, Forhoyet: 2.0}},
    ],
    [minstePensjonsNivåSats]: (s) => mai(s, (a) => ({
        kodeMap: {
            LAV: rund(g(a, s) * 1.8975), ORDINAER: rund(g(a, s) * 1.9), HOY: rund(g(a, s) * 2.0),
            HOY_ENSLIG: rund(g(a, s) * 2.08), SAERSKILT: rund(g(a, s) * 2.3),
        },
    })),
    [garantiPensjonsNivåSats]: (s) => mai(s, (a) => ({kodeMap: {ORDINAER: rund(g(a, s) * 1.98), HOY: rund(g(a, s) * 2.18)}})),
    [skjermingstilleggSats]: () => [
        {satsFom: ÅPEN_FOM, satsTom: [2015, 12, 31], value: 0.25},
        {satsFom: [2016, 1, 1], satsTom: ÅPEN_TOM, value: 0.25},
    ],
    [uføretrygdMinsteytelseSats]: (s) => MINSTEYTELSE.map(([uftKonv, gift, ung, forsorger, satsType, sats]) => ({
        satsFom: [2015, 1, 1], satsTom: ÅPEN_TOM, uftKonv, beregnesSomGift: gift, ungUfor: ung, forsorgerEktefelleOver60: forsorger,
        satsMinsteytelse: {sats: s === "SANDBOX_UFORE_2027" && ung ? rund(sats + 0.05, 2) : sats, satsType},
    })),
    [rettsgebyrSats]: (s) => kalenderår(s, 2015, (a) => {
        const r = rund(1020 * Math.pow(1.028, a - 2015));
        return {kodeMap: {RETTSGEBYR: r, TOL_GR_EO_ETTERBET: r * 2, TOL_GR_EO_TILBAKEKR: r * 2, TERSKEL_FEILUTBET: r * 4}};
    }),
    [barnetilleggTak2016Sats]: () => [
        {satsFom: [2016, 1, 1], satsTom: [2019, 12, 31], kodeMap: {ORDINÆR: 0.95, OVERGANGSREGLER: 0.95}},
        {satsFom: [2020, 1, 1], satsTom: ÅPEN_TOM, kodeMap: {ORDINÆR: 0.95, OVERGANGSREGLER: 0.9}},
    ],
    [nordiskKonvensjonsLandSats]: () => NORDISKE.map((land) => ({satsFom: [1994, 1, 1], satsTom: ÅPEN_TOM, value: land})),
    [eøsKonvensjonsLandSats]: (s) => EØS
        .filter(([land]) => !(land === "CHE" && s === "PROD_20240501"))
        .map(([land, fom, tom]) => ({satsFom: fom, satsTom: tom, value: land})),
    [referansebeløpAfpSats]: (s) => kalenderår(s, 2018, (a) => ({
        kodeMap: Object.fromEntries([1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962].map((kull) =>
            [String(kull), rund((g(a, s) ?? g(a - 1, s)) * (4.1 - (kull - 1955) * 0.05))])),
    })),
    [forholdstallSats]: (s) => tall(s, (kull, alder, m) =>
        rund((1 + 0.0006 * (kull - 1943)) * (1 - 0.045 * (alder + m / 12 - 67)) + tallJustering(s, kull, alder), 3)),
    [delingstallSats]: (s) => tall(s, (kull, alder, m) =>
        rund(20 + 0.03 * (kull - 1943) - 0.85 * (alder + m / 12 - 62) + tallJustering(s, kull, alder) * 10, 2)),
};

export const mockSatser = (type: string, sats: string): unknown[] => generatorer[type]?.(sats) ?? [];

const dagerSiden = (dager: number, time = 10) => {
    const d = new Date();
    d.setDate(d.getDate() - dager);
    d.setHours(time, 12, 0, 0);
    return d.toISOString();
};

export const MOCK_HISTORIKK: SatsHistoryEntry[] = [
    {environment: "q1", satstabell: "TEST_REGULERING_2026", version: "2026.11.24-a1b2c3d", timestamp: dagerSiden(2, 14), actor: "ehellerslien", runId: 1},
    {environment: "q2", satstabell: "PROD_20260501", version: "2026.11.20-f00ba12", timestamp: dagerSiden(6, 9), actor: "pensjon-regler-bot", runId: 2},
    {environment: "q5", satstabell: "PROD_20250501", version: "2026.11.12-9e8d7c6", timestamp: dagerSiden(14, 13), actor: "kollega-a", runId: 3},
    {environment: "q1", satstabell: "PROD_20260501", version: "2026.11.02-1234abc", timestamp: dagerSiden(24, 11), actor: "kollega-b", runId: 4},
    {environment: "q2", satstabell: "TEST_G_150000", version: "2026.10.21-beef001", timestamp: dagerSiden(36, 15), actor: "ehellerslien", runId: 5},
    {environment: "q5", satstabell: "SANDBOX_UFORE_2027", version: "2026.10.03-c0ffee1", timestamp: dagerSiden(54, 10), actor: "kollega-a", runId: 6},
];
