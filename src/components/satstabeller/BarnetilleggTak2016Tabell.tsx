import { useEffect, FC } from "react";
import { Accordion, Loader, Table } from "@navikt/ds-react";
import { barnetilleggTak2016Sats } from "../../constants/Constants";
import { querySatsTabellByMiljøAndTypeAndAktiv } from "../../service/Queries";
import DefaultTable from "../DefaultTable";
import { useQueryClient } from '@tanstack/react-query';

interface BarnetilleggTak2016TabellProps {
    environment: string;
    satstabell: string;
}

interface Rad {
    satsFom: number[];
    satsTom: number[];
    kodeMap: {
        [key: number]: {
            ORDINÆR: number;
            OVERGANGSREGLER: number;
        };
    };
}

const BarnetilleggTak2016Tabell: FC<BarnetilleggTak2016TabellProps> = ({ environment, satstabell }) => {

    const type = barnetilleggTak2016Sats;
    const queryClient = useQueryClient();

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['satsTabell'] });
    }, [satstabell]);

    const { data, isError, isLoading, isSuccess, isFetching } = querySatsTabellByMiljøAndTypeAndAktiv(environment, type, false, satstabell);

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
                    Barnetillegg Tak 2016
                </Accordion.Header>
                <Accordion.Content>
                    {isSuccess && data[1] ?
                        <Table size="small" zebraStripes>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell scope="col">FomDato</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">TomDato</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Ordinær</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Overgangsregler</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {data[1]?.map((rad: Rad, key: number) => {
                                    return (
                                        <Table.Row key={key}>
                                            <Table.DataCell>{((rad?.satsFom[0]) < 0) ? 'N/A' : (rad?.satsFom[2] + '-' + rad?.satsFom[1] + '-' + rad?.satsFom[0])}</Table.DataCell>
                                            <Table.DataCell>{((rad?.satsTom[0]) > 10000) ? 'N/A' : (rad?.satsTom[2] + '-' + rad?.satsTom[1] + '-' + rad?.satsTom[0])}</Table.DataCell>
                                            <Table.DataCell>{rad?.kodeMap[1]?.ORDINÆR}</Table.DataCell>
                                            <Table.DataCell>{rad?.kodeMap[1]?.OVERGANGSREGLER}</Table.DataCell>
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

export default BarnetilleggTak2016Tabell;