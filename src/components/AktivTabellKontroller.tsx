import { useEffect, FC } from 'react';
import { Box, Heading, Loader } from '@navikt/ds-react';
import { fetchAktivSatsTabellByMiljø } from '../service/Queries';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

interface AktivTabellKontrollerProps {
    environment: string;
    onSatsChange: (data: string) => void;
}

const AktivTabellKontroller: FC<AktivTabellKontrollerProps> = ({ environment, onSatsChange }) => {

    const { data, isError, isLoading, isSuccess }: UseQueryResult<string, unknown> = useQuery({
        queryKey: ['environment', environment],
        queryFn: () => fetchAktivSatsTabellByMiljø(environment),
        throwOnError: true,
        enabled: !!environment
    });

    useEffect(() => {
        if (isSuccess) {
            onSatsChange(data as string);
        }
    }, [isSuccess, data, onSatsChange, environment]);

    if (isError) {
        throw new Error(`Det oppstod en feil ved henting av aktivTabell mot miljø`);
    }

    if (isLoading) {
        return <Loader size="3xlarge" title="Laster ..." />
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

export default AktivTabellKontroller