import {useQuery} from "@tanstack/react-query";

const fetchSatsByTabellByMiljøAndTypeAndAktivAndSatstabell = async (environment, type, aktiv, satstabell) => {
    const response = await fetch(`https://pensjon-regler-${environment}.dev.adeo.no/api/${type}?Aktiv=${aktiv}&Satstabell=${satstabell}`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    return response.json();
}

export const fetchAktivSatsTabellByMiljø = async (environment) => {
    const response = await fetch(`https://pensjon-regler-${environment}.dev.adeo.no/aktivTabell`,
        {
            headers: {
                'Content-Type': 'application/text',
                'Accept': 'application/text'
            }
        });
    return response.text();
};

export const fetchAlleSatstabellerByMiljø = async (environment) => {
    const response = await fetch(`https://pensjon-regler-${environment}.dev.adeo.no/alleSatstabeller`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

    return response.json();

}

export const queryAktivSatsTabellByMiljø = (environment) => useQuery({
    queryKey: ['environment', environment],
    queryFn: () => fetchAktivSatsTabellByMiljø(environment),
    throwOnError: true,
    enabled: !!environment
});

export const querySatsTabellByMiljøAndTypeAndAktiv = (environment, type, aktiv, satsTabell) => useQuery({
    queryKey: ['satsTabell', environment, type, aktiv, satsTabell],
    queryFn: () => fetchSatsByTabellByMiljøAndTypeAndAktivAndSatstabell(environment, type, aktiv, satsTabell),
    throwOnError: true,
});