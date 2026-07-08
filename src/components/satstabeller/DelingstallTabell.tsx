import {FC} from "react";
import TallTabell from "./TallTabell";
import {delingstallSats} from "../../constants/Constants";

interface DelingstallTabellProps {
    environment: string;
    satstabell: string;
}

const DelingstallTabell: FC<DelingstallTabellProps> = ({environment, satstabell}) => (
    <TallTabell environment={environment} satstabell={satstabell} type={delingstallSats} tittel="Delingstall"/>
);

export default DelingstallTabell;
