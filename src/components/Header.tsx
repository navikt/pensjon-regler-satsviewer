import { Dropdown, InternalHeader, Spacer } from "@navikt/ds-react";
import { environments } from "../constants/Constants";
import { FC } from 'react';

interface HeaderProps {
    onChangedEnvironment: (event:  React.MouseEvent<Element, MouseEvent>) => void;
}

const Header: FC<HeaderProps> = ({ onChangedEnvironment }) => {

    return (
        <InternalHeader>
            <InternalHeader.Title as="h1">pensjon-regler-satsviewer</InternalHeader.Title>
            <Spacer />
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
        </InternalHeader>
    );
};

export default Header;