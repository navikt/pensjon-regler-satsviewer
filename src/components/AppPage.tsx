import {FC, useState} from 'react';
import {Accordion, Alert, Box, Page} from "@navikt/ds-react";
import Header from './Header';
import VeietGrunnbeløpTabell from './satstabeller/VeietGrunnbeløpTabell';
import GrunnbeløpTabell from './satstabeller/GrunnbeløpTabell';
import ReguleringsfaktorTabell from './satstabeller/ReguleringsfaktorTabell';
import LønnsvekstTabell from './satstabeller/LønnsvekstTabell';
import GrunnpensjonTabell from './satstabeller/GrunnpensjonTabell';
import SærtilleggTabell from './satstabeller/SærtilleggTabell';
import MinstePensjonsnivåTabell from './satstabeller/MinstePensjonsnivåTabell';
import GarantiPensjonsnivåTabell from './satstabeller/GarantiPensjonsnivåTabell';
import SkjermingsTilleggTabell from './satstabeller/SkjermingsTilleggTabell';
import UføretrygdMinsteytelseTabell from './satstabeller/UføretrygdMinsteytelseTabell';
import RettsgebyrTabell from './satstabeller/RettsgebyrTabell';
import BarnetilleggTak2016Tabell from './satstabeller/BarnetilleggTak2016Tabell';
import NordiskKonvensjonslandTabell from './satstabeller/NordiskKonvensjonslandTabell';
import EØSKonvensjonslandTabell from './satstabeller/EØSKonvensjonslandTabell';
import {ErrorBoundary, FallbackProps} from 'react-error-boundary';
import {environments} from '../constants/Constants';
import AktivTabellKontroller from './AktivTabellKontroller';

const ErrorFallback: FC<FallbackProps> = ({error}) => {
    return (
        <Alert variant='error'>
            {`En feil har oppstått: ${error instanceof Error ? error.message : String(error)}`}
        </Alert>
    )
}

const AppPage: FC = () => {

    const [sats, setSats] = useState<string | undefined>();
    const [environment, setEnvironment] = useState<string>(environments[2]);

    const onChangedEnvironment = (event: React.MouseEvent<Element, MouseEvent>) => {
        // @ts-ignore
        setEnvironment(event && event.target ? event.target.innerText : undefined)
    }

    const onSatsChange = (sats: string) => {
        setSats(sats);
    }

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Page>
                <Header onChangedEnvironment={onChangedEnvironment}/>
                <Box
                    padding="space-32"
                    paddingBlock="space-64"
                    as="main"
                >
                    <Page.Block gutters width="2xl">
                        <AktivTabellKontroller environment={environment} onSatsChange={onSatsChange}/>
                        {sats &&
                            <Accordion>
                                <Accordion.Item>
                                    <Accordion.Header>
                                        Generelt
                                    </Accordion.Header>
                                    <Accordion.Content>
                                        <GrunnbeløpTabell environment={environment} satstabell={sats}/>
                                        <VeietGrunnbeløpTabell environment={environment} satstabell={sats}/>
                                        <ReguleringsfaktorTabell environment={environment} satstabell={sats}/>
                                        <LønnsvekstTabell environment={environment} satstabell={sats}/>
                                    </Accordion.Content>
                                </Accordion.Item>
                                <Accordion.Item>
                                    <Accordion.Header>
                                        Alderspensjon1967
                                    </Accordion.Header>
                                    <Accordion.Content>
                                        <GrunnpensjonTabell environment={environment} satstabell={sats}/>
                                        <SærtilleggTabell environment={environment} satstabell={sats}/>
                                    </Accordion.Content>
                                </Accordion.Item>
                                <Accordion.Item>
                                    <Accordion.Header>
                                        Alderspensjon2011
                                    </Accordion.Header>
                                    <Accordion.Content>
                                        <MinstePensjonsnivåTabell environment={environment} satstabell={sats}/>
                                        <GarantiPensjonsnivåTabell environment={environment} satstabell={sats}/>
                                        <SkjermingsTilleggTabell environment={environment} satstabell={sats}/>
                                    </Accordion.Content>
                                </Accordion.Item>
                                <Accordion.Item>
                                    <Accordion.Header>
                                        Uføretrygd
                                    </Accordion.Header>
                                    <Accordion.Content>
                                        <UføretrygdMinsteytelseTabell environment={environment} satstabell={sats}/>
                                        <RettsgebyrTabell environment={environment} satstabell={sats}/>
                                        <BarnetilleggTak2016Tabell environment={environment} satstabell={sats}/>
                                    </Accordion.Content>
                                </Accordion.Item>
                                <Accordion.Item>
                                    <Accordion.Header>
                                        Konvensjonsland
                                    </Accordion.Header>
                                    <Accordion.Content>
                                        <NordiskKonvensjonslandTabell environment={environment} satstabell={sats}/>
                                        <EØSKonvensjonslandTabell environment={environment} satstabell={sats}/>
                                    </Accordion.Content>
                                </Accordion.Item>
                            </Accordion>
                        }
                    </Page.Block>
                </Box>
            </Page>
        </ErrorBoundary>
    );
}

export default AppPage;