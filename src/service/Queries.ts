import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {Satser, SatserType} from "../model";

interface FetchResponse {
    json: () => Promise<unknown>;
    text: () => Promise<string>;
}

const fetchSatsByTabellByMiljøAndTypeAndAktivAndSatstabell = async (environment: string, type: string, aktiv: boolean, satstabell: string): Promise<SatserType> => {
    const response: FetchResponse = await fetch(`https://pensjon-regler-${environment}.dev.adeo.no/api/${type}?Aktiv=${aktiv}&Satstabell=${satstabell}`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    const data = await response.json();
    return { satser: data } as SatserType;

}

export const fetchAktivSatsTabellByMiljø = async (environment: string): Promise<string> => {
    const response: FetchResponse = await fetch(`https://pensjon-regler-${environment}.dev.adeo.no/aktivTabell`,
        {
            headers: {
                'Content-Type': 'application/text',
                'Accept': 'application/text'
            }
        });
    return response.text();
};

export const fetchAlleSatstabellerByMiljø = async (environment: string): Promise<Satser> => {
    const response: FetchResponse = await fetch(`https://pensjon-regler-${environment}.dev.adeo.no/alleSatstabeller`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

    const data = await response.json()

    return { satser: data } as Satser;

}

export const querySatsTabellByMiljøAndTypeAndAktiv = (environment: string, type: string, aktiv: boolean, satsTabell: string): UseQueryResult<SatserType, unknown> => useQuery({
    queryKey: ['satsTabell', environment, type, aktiv, satsTabell],
    queryFn: () => fetchSatsByTabellByMiljøAndTypeAndAktivAndSatstabell(environment, type, aktiv, satsTabell),
    throwOnError: true,
});