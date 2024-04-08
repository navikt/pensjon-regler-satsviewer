import { FC } from "react";
import { Table } from "@navikt/ds-react";

const DefaultTable: FC = () => {
    return (
        <Table zebraStripes size="small">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Ingen satstabell valgt</Table.HeaderCell>
                    <Table.HeaderCell>Ingen satstabell valgt</Table.HeaderCell>
                    <Table.HeaderCell>Ingen satstabell valgt</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
        </Table>
    );
}

export default DefaultTable;