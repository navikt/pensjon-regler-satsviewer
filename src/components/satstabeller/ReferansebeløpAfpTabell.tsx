import { useEffect, FC } from "react";
import { Accordion, Loader, Table } from "@navikt/ds-react";
import { referansebeløpAfpSats } from "../../constants/Constants";
import { querySatsTabellByMiljøAndType } from "../../service/Queries";
import DefaultTable from "../DefaultTable";
import { useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { ReferansebeløpAfpSats, ReferansebeløpAfpSatser } from "../../model";

interface ReferansebeløpAfpTabellProps {
    environment: string;
    satstabell: string;
}

const ReferansebeløpAfpTabell: FC<ReferansebeløpAfpTabellProps> = ({ environment, satstabell }) => {

    const type = referansebeløpAfpSats;
    const queryClient = useQueryClient();

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['satsTabell'] });
    }, [satstabell]);

    const { data, isError, isLoading, isSuccess, isFetching } = querySatsTabellByMiljøAndType(environment, type, satstabell) as UseQueryResult<ReferansebeløpAfpSatser>;

    if (isError) {
        throw new Error(`Det oppstod en feil ved henting av satsTabell mot miljø ${environment}.`);
    }

    if (isLoading) {
        return <Loader size="3xlarge" title="Laster ..." className="loader" />;
    }

    if (isFetching) {
        return <Loader size="3xlarge" title="Laster ..." className="loader" />;
    }

    const kulls = isSuccess && data && data.satser.length > 0
        ? Object.keys(data.satser[0].kodeMap).sort()
        : [];

    return (
        <Accordion>
            <Accordion.Item>
                <Accordion.Header>
                    Referansebeløp AFP
                </Accordion.Header>
                <Accordion.Content>
                    {isSuccess && data ?
                        <Table size="small" zebraStripes>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell scope="col">FomDato</Table.HeaderCell>
                                    {kulls.map(kull => (
                                        <Table.HeaderCell key={kull} scope="col">{kull}</Table.HeaderCell>
                                    ))}
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {data.satser.map((rad: ReferansebeløpAfpSats, key: number) => (
                                    <Table.Row key={key}>
                                        <Table.DataCell>{rad.satsFom[0] < 0 ? 'N/A' : `${rad.satsFom[2]}-${rad.satsFom[1]}-${rad.satsFom[0]}`}</Table.DataCell>
                                        {kulls.map(kull => (
                                            <Table.DataCell key={kull}>{rad.kodeMap[kull]}</Table.DataCell>
                                        ))}
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table> :
                        <DefaultTable />
                    }
                </Accordion.Content>
            </Accordion.Item>
        </Accordion>
    );
}

export default ReferansebeløpAfpTabell;
