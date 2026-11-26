import {FC, useState} from "react";
import {ActionMenu, HStack, InternalHeader, Spacer} from "@navikt/ds-react";
import {ChevronDownIcon, MonitorIcon, MoonIcon, SunIcon} from "@navikt/aksel-icons";
import {NavLink, useLocation} from "react-router-dom";
import {ThemePreference, useTheme} from "../theme/useTheme";
import {environments} from "../constants/Constants";
import {isProduction} from "../utils/environment";
import {useVisning} from "../utils/visning";
import {MOCK} from "../service/Queries";

// ActionMenu.RadioItem lukker ikke menyen ved valg, så den må lukkes eksplisitt.
const useLukkendeMeny = <T, >(vedValg: (verdi: T) => void) => {
    const [open, setOpen] = useState(false);
    const velg = (verdi: T) => {
        vedValg(verdi);
        setOpen(false);
    };
    return {menyProps: {open, onOpenChange: setOpen}, velg};
};

const TemaMeny: FC = () => {
    const {preference, resolved, setPreference} = useTheme();
    const Ikon = preference === "system" ? MonitorIcon : resolved === "dark" ? MoonIcon : SunIcon;
    const {menyProps, velg} = useLukkendeMeny((verdi: string) => setPreference(verdi as ThemePreference));

    return (
        <ActionMenu {...menyProps}>
            <ActionMenu.Trigger>
                <InternalHeader.Button aria-label="Velg fargetema">
                    <Ikon fontSize="1.5rem" aria-hidden/>
                </InternalHeader.Button>
            </ActionMenu.Trigger>
            <ActionMenu.Content>
                <ActionMenu.RadioGroup label="Fargetema" value={preference} onValueChange={velg}>
                    <ActionMenu.RadioItem value="system">
                        <HStack gap="space-8" align="center"><MonitorIcon aria-hidden/> Følg system</HStack>
                    </ActionMenu.RadioItem>
                    <ActionMenu.RadioItem value="light">
                        <HStack gap="space-8" align="center"><SunIcon aria-hidden/> Lyst</HStack>
                    </ActionMenu.RadioItem>
                    <ActionMenu.RadioItem value="dark">
                        <HStack gap="space-8" align="center"><MoonIcon aria-hidden/> Mørkt</HStack>
                    </ActionMenu.RadioItem>
                </ActionMenu.RadioGroup>
            </ActionMenu.Content>
        </ActionMenu>
    );
};

const MiljøMeny: FC = () => {
    const {visning, oppdater} = useVisning();
    const {menyProps, velg} = useLukkendeMeny((miljø: string) => oppdater({miljø}));

    return (
        <ActionMenu {...menyProps}>
            <ActionMenu.Trigger>
                <InternalHeader.Button className="header-select">
                    <span className="header-select-label">Miljø</span>
                    <span className="header-select-value">{visning.miljø.toUpperCase()}</span>
                    <ChevronDownIcon aria-hidden fontSize="1.25rem"/>
                </InternalHeader.Button>
            </ActionMenu.Trigger>
            <ActionMenu.Content>
                <ActionMenu.RadioGroup label="Hent satser fra" value={visning.miljø} onValueChange={velg}>
                    {environments.map((miljø) => (
                        <ActionMenu.RadioItem key={miljø} value={miljø}>{miljø.toUpperCase()}</ActionMenu.RadioItem>
                    ))}
                </ActionMenu.RadioGroup>
            </ActionMenu.Content>
        </ActionMenu>
    );
};

const AppHeader: FC = () => {
    const prod = isProduction();
    const påSatser = useLocation().pathname === "/";

    return (
        <InternalHeader className="app-header">
            <InternalHeader.Title as="h1">Satsviewer{prod ? " (PROD)" : MOCK ? " (mock)" : ""}</InternalHeader.Title>
            {!prod && (
                <nav aria-label="Hovedmeny" className="header-nav">
                    <InternalHeader.Button as={NavLink} to="/" end>Satser</InternalHeader.Button>
                    <InternalHeader.Button as={NavLink} to="/historikk">Historikk</InternalHeader.Button>
                </nav>
            )}
            <Spacer/>
            {!prod && påSatser && <MiljøMeny/>}
            <TemaMeny/>
        </InternalHeader>
    );
};

export default AppHeader;
