import { Dropdown, InternalHeader, Spacer } from "@navikt/ds-react";
import { environments } from "../constants/Constants";
import { FC } from 'react';
import { Link } from "react-router-dom";

interface HeaderProps {
    onChangedEnvironment: (event:  React.MouseEvent<Element, MouseEvent>) => void;
    isProduction: boolean;
    showHistoryLink?: boolean;
    showBackLink?: boolean;
    currentEnvironment?: string;
}

const Header: FC<HeaderProps> = ({ onChangedEnvironment, isProduction, showHistoryLink = true, showBackLink = false, currentEnvironment }) => {

    return (
        <InternalHeader>
            <InternalHeader.Title as="h1">pensjon-regler-satsviewer</InternalHeader.Title>
            <Spacer />
            {showHistoryLink && (
                <Link to={`/historikk${currentEnvironment ? `?env=${currentEnvironment}` : ''}`} style={{ color: 'white', textDecoration: 'none', padding: '0 1rem', display: 'flex', alignItems: 'center' }}>
                    Satshistorikk
                </Link>
            )}
            {showBackLink && (
                <Link to="/" style={{ color: 'white', textDecoration: 'none', padding: '0 1rem', display: 'flex', alignItems: 'center' }}>
                    ← Tilbake
                </Link>
            )}
            {!isProduction && (
                <Dropdown onSelect={(event: React.MouseEvent<Element, MouseEvent>) => onChangedEnvironment(event)}>
                    <InternalHeader.Button as={Dropdown.Toggle}>
                        Velg miljø
                    </InternalHeader.Button>
                    <Dropdown.Menu>
                        <Dropdown.Menu.List>
                            {environments.map((environment) => (
                                <Dropdown.Menu.List.Item key={environment}>{environment}</Dropdown.Menu.List.Item>
                            ))}
                        </Dropdown.Menu.List>
                    </Dropdown.Menu>
                </Dropdown>
            )}
        </InternalHeader>
    );
};

export default Header;