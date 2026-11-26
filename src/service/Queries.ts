import {useQuery} from "@tanstack/react-query";
import {PROD_ENVIRONMENT} from "../utils/environment";
import {MOCK_AKTIV, MOCK_SATSTABELLER, mockSatser} from "./mockData";

export const MOCK = import.meta.env.VITE_MOCK === "true";

const getBaseUrl = (environment: string): string =>
    environment === PROD_ENVIRONMENT ? "" : `https://pensjon-regler-${environment}.intern.dev.nav.no`;

const forsinket = <T, >(verdi: T): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(verdi), 300));

const hent = async (url: string, accept: string) => {
    const response = await fetch(url, {headers: {"Content-Type": accept, "Accept": accept}});
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response;
};

const hentAktivSatstabell = async (environment: string): Promise<string> => {
    if (MOCK) return forsinket(MOCK_AKTIV[environment] ?? MOCK_SATSTABELLER[0]);
    return (await hent(`${getBaseUrl(environment)}/aktivTabell`, "application/text")).text();
};

const hentAlleSatstabeller = async (environment: string): Promise<string[]> => {
    if (MOCK) return forsinket(MOCK_SATSTABELLER);
    return (await hent(`${getBaseUrl(environment)}/alleSatstabeller`, "application/json")).json();
};

const hentSatser = async <T, >(environment: string, type: string, satstabell: string): Promise<T[]> => {
    if (MOCK) return forsinket(mockSatser(type, satstabell) as T[]);
    return (await hent(`${getBaseUrl(environment)}/api/${type}?Satstabell=${encodeURIComponent(satstabell)}`, "application/json")).json();
};

export const useAktivSatstabell = (environment: string) => useQuery({
    queryKey: ["aktivTabell", environment],
    queryFn: () => hentAktivSatstabell(environment),
});

export const useAlleSatstabeller = (environment: string) => useQuery({
    queryKey: ["alleSatstabeller", environment],
    queryFn: () => hentAlleSatstabeller(environment),
});

// Satser for en gitt satstabell endres ikke, så de kan caches lenge.
export const useSatser = <T, >(environment: string, type: string, satstabell: string | undefined) => useQuery({
    queryKey: ["satser", environment, type, satstabell],
    queryFn: () => hentSatser<T>(environment, type, satstabell!),
    enabled: !!satstabell,
    staleTime: 10 * 60 * 1000,
});
