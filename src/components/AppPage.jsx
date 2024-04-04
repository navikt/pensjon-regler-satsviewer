import React from 'react';
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
import {ErrorBoundary} from 'react-error-boundary';
import {environments} from '../constants/Constants';
import AtkivTabellKontroller from './AktivTabellKontroller';

const AppPage = () => {

    const [sats, setSats] = React.useState();
    const [environment, setEnvironment] = React.useState(environments[2]);


    const onChangedEnvironment = (event) => {
        setEnvironment(event.target.value);
    }

    const onSatsChange = (sats) => {
        setSats(sats);
        console.log("satstabell endret til: " + sats)
    }

    const ErrorFallback = ({error}) => {
        return (
            <Alert variant='error'>
                {`En feil har oppstått: ${error.message}`}
            </Alert>
        )
    }


    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Page>
                <Box as="header" background="surface-inverted">
                    <Page.Block width="2xl">
                        <Header onChangedEnvironment={onChangedEnvironment}/>
                    </Page.Block>
                </Box>
                <Box

                    padding="8"
                    paddingBlock="16"
                    as="main"
                >
                    <Page.Block width="2xl">

                        {!!environment &&
                            <AtkivTabellKontroller environment={environment} onSatsChange={onSatsChange}/>
                        }
                        {!!sats &&
                            <>

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
                            </>
                        }
                    </Page.Block>
                </Box>
            </Page>
        </ErrorBoundary>
    );
};

export default AppPage;