
export interface BaseSats {
    satsFom: [number, number, number];
    satsTom: [number, number, number];
}

export interface Sats extends BaseSats {
    value: number;
}

export interface GrunnbelopSatser {
    satser: Sats[];
}

export interface VeietGrunnbelopSatser {
    satser: Sats[];
}

export interface ReguleringsfaktorSatser {
    satser: Sats[];
}

export interface LonnsvekstSatser {
    satser: Sats[];
}

export interface GrunnpensjonSatser {
    satser: Sats[];
}

export interface SaertilleggSats extends BaseSats {
    kodeMap: {
        Minste: number;
        Ordinaer: number;
        Forhoyet: number;
    };
}

export interface SaertilleggSatser {
    satser: SaertilleggSats[];
}

export interface MinstePensjonsnivaaSats extends BaseSats {
    kodeMap: {
        LAV: number;
        ORDINAER: number;
        HOY: number;
        SAERSKILT: number;
        HOY_ENSLIG: number;
    };
}

export interface MinePensjonsnivaaSatser {
    satser: MinstePensjonsnivaaSats[];
}

export interface GarantitilleggSats extends BaseSats {
    kodeMap: {
        ORDINAER: number;
        HOY: number;
    };
}

export interface GarantitilleggSatser {
    satser: GarantitilleggSats[];
}

export interface SkjermingstilleggSats {
    satser: Sats[];
}

export interface SatsMinsteytelse {
    sats: number;
    satsType: string;
    benyttetUngUfor: boolean;
    oppfyltUngUfor: boolean;
    eksportForbudUngUfor: boolean;
}

export interface UforetrygdMinsteytelseSats extends BaseSats {
    uftKonv?: boolean;
    beregnesSomGift: boolean;
    ungUfor: boolean;
    forsorgerEktefelleOver60: boolean;
    satsMinsteytelse: SatsMinsteytelse;
}

export interface UforetrygdMinsteytelseSatser {
    satser: UforetrygdMinsteytelseSats[];
}

export interface RettsgebyrSats extends BaseSats {
    kodeMap: {
        RETTSGEBYR: number;
        TOL_GR_EO_ETTERBET: number;
        TOL_GR_EO_TILBAKEKR: number;
        TERSKEL_FEILUTBET: number;
    };
}

export interface RettsgebyrSatser {
    satser: RettsgebyrSats[];
}

export interface BarnetilleggTak2016Sats extends BaseSats {
    kodeMap: {
        ORDINÆR: number;
        OVERGANGSREGLER: number;
    };
}

export interface BarnetilleggTak2016Satser {
    satser: BarnetilleggTak2016Sats[];
}

export interface LandSats extends BaseSats {
    value: string;
}

export interface NordiskKonvensjonsLandSatser {
    satser: LandSats[];
}

export interface EosKonvensjonsLandSatser {
    satser: LandSats[];
}

export type SatserType =
    | GrunnbelopSatser
    | VeietGrunnbelopSatser
    | ReguleringsfaktorSatser
    | LonnsvekstSatser
    | GrunnpensjonSatser
    | SaertilleggSatser
    | MinePensjonsnivaaSatser
    | GarantitilleggSatser
    | SkjermingstilleggSats
    | UforetrygdMinsteytelseSatser
    | RettsgebyrSatser
    | BarnetilleggTak2016Satser
    | NordiskKonvensjonsLandSatser
    | EosKonvensjonsLandSatser;