import {Table} from "react-bootstrap";
import React from "react";

const defaultTabellRender = () => (
    <div>
        <Table striped bordered hover>
            <thead className="th">
            <tr>
                <th>FomDato</th>
                <th>TomDato</th>
                <th>Verdi</th>
            </tr>
            </thead>
            <tbody className="tabell-body">
            <tr>
                <td>{'Ingen satstabell valgt'}</td>
                <td>{'Ingen satstabell valgt'}</td>
                <td>{'Ingen satstabell valgt'}</td>
            </tr>
            </tbody>
        </Table></div>
)

export default defaultTabellRender