import { useEffect, FC } from "react";
import { Accordion, Loader, Table } from "@navikt/ds-react";
import { lønnsvekstSats } from "../../constants/Constants";
import { querySatsTabellByMiljøAndTypeAndAktiv } from "../../service/Queries";
import DefaultTable from "../DefaultTable";
import {useQueryClient, UseQueryResult} from '@tanstack/react-query';
import {LonnsvekstSatser, Sats} from "../../model";

interface LønnsvekstTabellProps {
    environment: string;
    satstabell: string;
}

const LønnsvekstTabell: FC<LønnsvekstTabellProps> = ({ environment, satstabell }) => {

    const type = lønnsvekstSats;
    const queryClient = useQueryClient();

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['satsTabell'] });
    }, [satstabell]);

    const { data, isError, isLoading, isSuccess, isFetching } = querySatsTabellByMiljøAndTypeAndAktiv(environment, type, true, satstabell) as UseQueryResult<LonnsvekstSatser>;

    if (isError) {
        throw new Error(`Det oppstod en feil ved henting av satsTabell mot miljø ${environment}.`);
    }

    if (isLoading) {
        return <Loader size="3xlarge" title="Laster ..." className="loader" />
    }

    if (isFetching) {
        return <Loader size="3xlarge" title="Laster ..." className="loader" />;
    }

    return (
        <Accordion>
            <Accordion.Item>
                <Accordion.Header>
                    Lønnsvekst
                </Accordion.Header>
                <Accordion.Content>
                    {isSuccess && data ?
                        <Table size="small" zebraStripes>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell scope="col">FomDato</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">TomDato</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Verdi</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {data.satser.map((rad: Sats, key: number) => {
                                    return (
                                        <Table.Row key={key}>
                                            <Table.DataCell>{((rad.satsFom[0]) < 0) ? 'N/A' : (rad.satsFom[2] + '-' + rad.satsFom[1] + '-' + rad.satsFom[0])}</Table.DataCell>
                                            <Table.DataCell>{((rad.satsTom[0]) > 10000) ? 'N/A' : (rad.satsTom[2] + '-' + rad.satsTom[1] + '-' + rad.satsTom[0])}</Table.DataCell>
                                            <Table.DataCell>{rad.value}</Table.DataCell>
                                        </Table.Row>
                                    )
                                })}
                            </Table.Body>
                        </Table> :
                        <DefaultTable />}
                </Accordion.Content>
            </Accordion.Item>
        </Accordion>
    );
}

export default LønnsvekstTabell;