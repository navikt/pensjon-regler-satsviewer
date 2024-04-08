import { useQuery, UseQueryResult } from "@tanstack/react-query";

interface FetchResponse {
    json: () => Promise<any>;
    text: () => Promise<string>;
}

const fetchSatsByTabellByMiljøAndTypeAndAktivAndSatstabell = async (environment: string, type: string, aktiv: boolean, satstabell: string): Promise<any> => {
    const response: FetchResponse = await fetch(`https://pensjon-regler-${environment}.dev.adeo.no/api/${type}?Aktiv=${aktiv}&Satstabell=${satstabell}`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    console.log(response);
    return response.json();
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

export const fetchAlleSatstabellerByMiljø = async (environment: string): Promise<any> => {
    const response: FetchResponse = await fetch(`https://pensjon-regler-${environment}.dev.adeo.no/alleSatstabeller`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

    return response.json();

}

export const queryAktivSatsTabellByMiljø = (environment: string): UseQueryResult<any, unknown> => useQuery({
    queryKey: ['environment', environment],
    queryFn: () => fetchAktivSatsTabellByMiljø(environment),
    throwOnError: true,
    enabled: !!environment
});

export const querySatsTabellByMiljøAndTypeAndAktiv = (environment: string, type: string, aktiv: boolean, satsTabell: string): UseQueryResult<any, unknown> => useQuery({
    queryKey: ['satsTabell', environment, type, aktiv, satsTabell],
    queryFn: () => fetchSatsByTabellByMiljøAndTypeAndAktivAndSatstabell(environment, type, aktiv, satsTabell),
    throwOnError: true,
});