import {useEffect} from 'react';
import {Box, HGrid, Loader, Select} from '@navikt/ds-react';
import {useQuery} from '@tanstack/react-query';
import {fetchAlleSatstabellerByMiljø} from '../service/Queries';

const SatsKontroller = ({environment, onSatsChange}) => {

    const prodFilter = (tabellsats) => tabellsats.includes("PROD");
    const testFilter = (tabellsats) => tabellsats.includes("TEST");
    const andreFilter = (tabellsats) => !prodFilter(tabellsats) && !testFilter(tabellsats);


    const {data, isError, isLoading} = useQuery({
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
        return <Loader size="3xlarge" title="Laster ..." className="loader"/>
    }

    return (
        <HGrid gap="10" columns={3}>

            <Box>
                <Select label="PROD satser" onChange={(event) => {
                    onSatsChange(event.target.value);
                }}>
                    <option value="">Velg PROD sats</option>
                    {data[1].filter(prodFilter).map((sats) => (
                        <option key={sats} value={sats}>
                            {sats}
                        </option>
                    ))}
                </Select>
            </Box>

            <Box>
                <Select label="TEST satser" onChange={(event) => {
                    onSatsChange(event.target.value);
                }}>
                    <option value="">Velg TEST sats</option>
                    {data[1].filter(testFilter).map((sats) => (
                        <option key={sats} value={sats}>
                            {sats}
                        </option>
                    ))}
                </Select>
            </Box>

            <Box>
                <Select label="Øvrige satser" onChange={(event) => {
                    onSatsChange(event.target.value);
                }}>
                    <option value="">Velg Øvrige sats</option>
                    {data[1].filter(andreFilter).map((sats) => (
                        <option key={sats} value={sats}>
                            {sats}
                        </option>
                    ))}
                </Select>
            </Box>
        </HGrid>

    );
};

export default SatsKontroller;