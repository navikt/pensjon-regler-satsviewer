import {FC} from "react";
import TallTabell from "./TallTabell";
import {forholdstallSats} from "../../constants/Constants";

interface ForholdstallTabellProps {
    environment: string;
    satstabell: string;
}

const ForholdstallTabell: FC<ForholdstallTabellProps> = ({environment, satstabell}) => (
    <TallTabell environment={environment} satstabell={satstabell} type={forholdstallSats} tittel="Forholdstall"/>
);

export default ForholdstallTabell;
