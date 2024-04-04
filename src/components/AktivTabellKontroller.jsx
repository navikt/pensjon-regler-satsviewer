import {Box, Heading, Loader} from '@navikt/ds-react';
import {fetchAktivSatsTabellByMiljø} from '../service/Queries';
import {useQuery} from '@tanstack/react-query';

const AtkivTabellKontroller = ({environment, onSatsChange}) => {

    const {data, isError, isLoading, isSuccess} = useQuery({
        queryKey: ['environment', environment],
        queryFn: () => fetchAktivSatsTabellByMiljø(environment),
        throwOnError: true,
        enabled: !!environment
    });

    if (isError) {
        throw new Error(`Det oppstod en feil ved henting av aktivTabell mot miljø`);
    }

    if (isLoading) {
        return <Loader size="3xlarge" title="Laster ..."/>
    }

    if (isSuccess) {
        onSatsChange(data);
    }

    return (
        <Box>
            <Heading align="start" size="medium">
                Valgt miljø: {environment}
            </Heading>
            <Heading align="start" size="medium">
                Aktiv satstabell: {data}
            </Heading>
        </Box>
    );


}

export default AtkivTabellKontroller