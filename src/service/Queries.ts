import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {Satser, SatserType} from "../model";
import { PROD_ENVIRONMENT } from "../utils/environment";

const getBaseUrl = (environment: string): string => {
    if (environment === PROD_ENVIRONMENT) {
        return '';
    }
    return `https://pensjon-regler-${environment}.intern.dev.nav.no`;
};

interface FetchResponse {
    json: () => Promise<unknown>;
    text: () => Promise<string>;
}

const fetchSatsByTabellByMiljøAndType = async (environment: string, type: string, satstabell: string): Promise<SatserType> => {
    const response: FetchResponse = await fetch(`${getBaseUrl(environment)}/api/${type}?Satstabell=${satstabell}`,
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
    const response: FetchResponse = await fetch(`${getBaseUrl(environment)}/aktivTabell`,
        {
            headers: {
                'Content-Type': 'application/text',
                'Accept': 'application/text'
            }
        });
    return response.text();
};

export const fetchAlleSatstabellerByMiljø = async (environment: string): Promise<Satser> => {
    const response: FetchResponse = await fetch(`${getBaseUrl(environment)}/alleSatstabeller`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

    const data = await response.json()

    return { satser: data } as Satser;

}

export const querySatsTabellByMiljøAndType = (environment: string, type: string, satsTabell: string): UseQueryResult<SatserType, unknown> => useQuery({
    queryKey: ['satsTabell', environment, type, satsTabell],
    queryFn: () => fetchSatsByTabellByMiljøAndType(environment, type, satsTabell),
    throwOnError: true,
});