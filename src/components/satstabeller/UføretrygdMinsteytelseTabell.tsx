import { useEffect, FC } from "react";
import { Accordion, Loader, Table } from "@navikt/ds-react";
import { uføretrygdMinsteytelseSats } from "../../constants/Constants";
import { querySatsTabellByMiljøAndTypeAndAktiv } from "../../service/Queries";
import DefaultTable from "../DefaultTable";
import { useQueryClient } from '@tanstack/react-query';

interface UføretrygdMinsteytelseTabellProps {
    environment: string;
    satstabell: string;
}

interface SatsType {
    kode: string;
    er_gyldig: boolean;
}

interface SatsMinsteytelse {
    sats: number;
    satsType: SatsType;
    benyttetUngUfor: boolean;
    oppfyltUngUfor: boolean;
    eksportForbudUngUfor: boolean;
}

interface Rad {
    satsFom: number[];
    satsTom: number[];
    uftKonv: boolean;
    beregnesSomGift: boolean;
    ungUfor: boolean;
    forsorgerEktefelleOver60: boolean;
    satsMinsteytelse: SatsMinsteytelse;
}

const UføretrygdMinsteytelseTabell: FC<UføretrygdMinsteytelseTabellProps> = ({ environment, satstabell }) => {

    const type = uføretrygdMinsteytelseSats;
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
                    Uføretrygd minsteytelse
                </Accordion.Header>
                <Accordion.Content>
                    {isSuccess && data[1] ?
                        <Table size="small" zebraStripes>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell scope="col">FomDato</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">TomDato</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Uføretrygd konvertert</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Beregnes som gift</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Ung ufør</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Forsørger Ektefelle over 60</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Sats</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Kode</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {data[1]?.map((rad: Rad, key: number) => {
                                    return (
                                        <Table.Row key={key}>
                                            <Table.DataCell>{((rad?.satsFom[0]) < 0) ? 'N/A' : (rad?.satsFom[2] + '-' + rad?.satsFom[1] + '-' + rad?.satsFom[0])}</Table.DataCell>
                                            <Table.DataCell>{((rad?.satsTom[0]) > 10000) ? 'N/A' : (rad?.satsTom[2] + '-' + rad?.satsTom[1] + '-' + rad?.satsTom[0])}</Table.DataCell>
                                            <Table.DataCell>{(rad?.uftKonv !== undefined ? rad?.uftKonv.toString() : '*')}</Table.DataCell>
                                            <Table.DataCell>{(rad?.beregnesSomGift !== undefined ? rad?.beregnesSomGift.toString() : '*')}</Table.DataCell>
                                            <Table.DataCell>{(rad?.ungUfor !== undefined ? rad?.ungUfor.toString() : '*')}</Table.DataCell>
                                            <Table.DataCell>{(rad?.forsorgerEktefelleOver60 !== undefined ? rad?.forsorgerEktefelleOver60.toString() : '*')}</Table.DataCell>
                                            <Table.DataCell>{rad?.satsMinsteytelse?.sats}</Table.DataCell>
                                            <Table.DataCell>{rad?.satsMinsteytelse?.satsType?.kode}</Table.DataCell>
                                        </Table.Row>
                                    )
                                })}
                            </Table.Body>
                        </Table> :
                        <DefaultTable />
                    }
                </Accordion.Content>
            </Accordion.Item>
        </Accordion>
    );
};

export default UføretrygdMinsteytelseTabell;