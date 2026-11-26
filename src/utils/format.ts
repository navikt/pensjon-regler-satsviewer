import {BaseSats} from "../model";

type Dato = BaseSats["satsFom"];

const pad = (n: number) => String(n).padStart(2, "0");

// satsFom/satsTom kommer som [år, måned, dag]. Negativt år betyr «fra tidenes morgen», år > 10000 betyr «uten sluttdato».
export const erÅpenFom = (dato: Dato) => dato[0] < 0;
export const erÅpenTom = (dato: Dato) => dato[0] > 10000;

export const formatDato = (dato: Dato): string => `${dato[0]}-${pad(dato[1])}-${pad(dato[2])}`;

export const formatFom = (dato: Dato): string => (erÅpenFom(dato) ? "—" : formatDato(dato));
export const formatTom = (dato: Dato): string => (erÅpenTom(dato) ? "—" : formatDato(dato));

const tilTall = (dato: Dato) => dato[0] * 10000 + dato[1] * 100 + dato[2];

export const sammenlignFom = (a: BaseSats, b: BaseSats) => tilTall(b.satsFom) - tilTall(a.satsFom);

export const erGjeldende = (rad: BaseSats, idag = new Date()): boolean => {
    const nå = idag.getFullYear() * 10000 + (idag.getMonth() + 1) * 100 + idag.getDate();
    return tilTall(rad.satsFom) <= nå && nå <= tilTall(rad.satsTom);
};

export const formatVerdi = (verdi: unknown): string => {
    if (verdi === undefined || verdi === null) return "*";
    if (typeof verdi === "boolean") return verdi ? "Ja" : "Nei";
    return String(verdi);
};

export const formatTidspunkt = (iso: string): string => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
