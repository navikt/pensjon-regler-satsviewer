import {useSearchParams} from "react-router-dom";
import {environments} from "../constants/Constants";
import {isProduction, PROD_ENVIRONMENT} from "./environment";

export interface Visning {
    miljø: string;
    sats?: string;
    tabell: string | null;
    mot?: string;
}

const standardMiljø = () => (isProduction() ? PROD_ENVIRONMENT : environments[2]);

// All visningstilstand ligger i URL-en, slik at lenker kan deles.
export const useVisning = () => {
    const [params, setParams] = useSearchParams();
    const miljøParam = params.get("miljo");
    const miljø = isProduction() ? PROD_ENVIRONMENT : (miljøParam && environments.includes(miljøParam) ? miljøParam : standardMiljø());

    const visning: Visning = {
        miljø,
        sats: params.get("sats") ?? undefined,
        tabell: params.get("tabell"),
        mot: params.get("mot") ?? undefined,
    };

    const oppdater = (endring: Partial<Visning>) => {
        const neste = {...visning, ...endring};
        // Satstabeller er per miljø, så valgene nullstilles når miljøet byttes.
        if (endring.miljø && endring.miljø !== visning.miljø) {
            neste.sats = undefined;
            neste.mot = undefined;
        }
        const ny = new URLSearchParams();
        if (!isProduction() && neste.miljø !== standardMiljø()) ny.set("miljo", neste.miljø);
        if (neste.sats) ny.set("sats", neste.sats);
        if (neste.tabell) ny.set("tabell", neste.tabell);
        if (neste.mot) ny.set("mot", neste.mot);
        setParams(ny);
    };

    return {visning, oppdater};
};
