import { useEffect, FC } from "react";
import { Accordion, Loader, Table } from "@navikt/ds-react";
import { minstePensjonsNivåSats } from "../../constants/Constants";
import { querySatsTabellByMiljøAndTypeAndAktiv } from "../../service/Queries";
import DefaultTable from "../DefaultTable";
import { useQueryClient } from '@tanstack/react-query';

interface MinstePensjonsnivåTabellProps {
    environment: string;
    satstabell: string;
}

interface KodeMap {
    LAV: number;
    ORDINAER: number;
    HOY: number;
    HOY_ENSLIG: number;
    SAERSKILT: number;
}

interface Rad {
    satsFom: number[];
    satsTom: number[];
    kodeMap: KodeMap[];
}

const MinstePensjonsnivåTabell: FC<MinstePensjonsnivåTabellProps> = ({ environment, satstabell }) => {

    const type = minstePensjonsNivåSats;
    const queryClient = useQueryClient();

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['satsTabell'] });
    }, [satstabell]);

    const { data, isError, isLoading, isSuccess, isFetching } = querySatsTabellByMiljøAndTypeAndAktiv(environment, type, true, satstabell);

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
                    Minstepensjonsnivå
                </Accordion.Header>
                <Accordion.Content>
                    {isSuccess && data ?
                        <Table size="small" zebraStripes>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell scope="col">FomDato</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">TomDato</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Lav</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Ordinær</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Høy</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Høy enslig</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Særskilt</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {data?.map((rad: Rad, key: number) => {
                                    return (
                                        <Table.Row key={key}>
                                            <Table.DataCell>{((rad?.satsFom[0]) < 0) ? 'N/A' : (rad?.satsFom[2] + '-' + rad?.satsFom[1] + '-' + rad?.satsFom[0])}</Table.DataCell>
                                            <Table.DataCell>{((rad?.satsTom[0]) > 10000) ? 'N/A' : (rad?.satsTom[2] + '-' + rad?.satsTom[1] + '-' + rad?.satsTom[0])}</Table.DataCell>
                                            <Table.DataCell>{rad?.kodeMap[1]?.LAV}</Table.DataCell>
                                            <Table.DataCell>{rad?.kodeMap[1]?.ORDINAER}</Table.DataCell>
                                            <Table.DataCell>{rad?.kodeMap[1]?.HOY}</Table.DataCell>
                                            <Table.DataCell>{rad?.kodeMap[1]?.HOY_ENSLIG}</Table.DataCell>
                                            <Table.DataCell>{rad?.kodeMap[1]?.SAERSKILT}</Table.DataCell>
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

export default MinstePensjonsnivåTabell;