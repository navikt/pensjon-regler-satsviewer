import { useEffect, FC, ChangeEvent } from 'react';
import { Box, HGrid, Loader, Select } from '@navikt/ds-react';
import { useQuery } from '@tanstack/react-query';
import { fetchAlleSatstabellerByMiljø } from '../service/Queries';

interface SatsKontrollerProps {
    environment: string;
    onSatsChange: (sats: string) => void;
}

const SatsKontroller: FC<SatsKontrollerProps> = ({ environment, onSatsChange }) => {

    const prodFilter = (tabellsats: string) => tabellsats.includes("PROD");
    const testFilter = (tabellsats: string) => tabellsats.includes("TEST");
    const andreFilter = (tabellsats: string) => !prodFilter(tabellsats) && !testFilter(tabellsats);

    const { data, isError, isLoading } = useQuery({
        queryKey: ['alleTabeller', environment],
        queryFn: () => fetchAlleSatstabellerByMiljø(environment),
        throwOnError: true,
        enabled: !!environment
    });

    useEffect(() => {

    }, [data]);

    if (isError) {
        throw new Error(`Det oppstod en feil ved henting av tabeller mot miljø`);
    }

    if (isLoading) {
        return <Loader size="3xlarge" title="Laster ..." className="loader" />
    }

    return (
        <HGrid gap="10" columns={3}>

            <Box>
                <Select label="PROD satser" onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                    onSatsChange(event.target.value);
                }}>
                    <option value="">Velg PROD sats</option>
                    {data[1].filter(prodFilter).map((sats: string) => (
                        <option key={sats} value={sats}>
                            {sats}
                        </option>
                    ))}
                </Select>
            </Box>

            <Box>
                <Select label="TEST satser" onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                    onSatsChange(event.target.value);
                }}>
                    <option value="">Velg TEST sats</option>
                    {data[1].filter(testFilter).map((sats: string) => (
                        <option key={sats} value={sats}>
                            {sats}
                        </option>
                    ))}
                </Select>
            </Box>
        </HGrid>
    );
}

export default SatsKontroller;