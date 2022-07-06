import React from "react";
import SkjermingstilleggTabell from "./Satstabeller/SkjermingstilleggTabell";
import VeietGrunnbeløpTabell from "./Satstabeller/VeietGrunnbeløpTabell";
import UføretrygdMinsteytelseTabell from "./Satstabeller/UføretrygdMinsteytelseTabell";
import SærtilleggTabell from "./Satstabeller/SærtilleggTabell";
import RettsgebyrTabell from "./Satstabeller/RettsgebyrTabell";
import ReguleringsfaktorTabell from "./Satstabeller/ReguleringsfaktorTabell";
import NordiskKonvensjonslandTabell from "./Satstabeller/NordiskKonvensjonslandTabell";
import MinstePensjonsnivåTabell from "./Satstabeller/MinstePensjonsnivåTabell";
import LønnsvekstTabell from "./Satstabeller/LønnsvekstTabell";
import GrunnpensjonTabell from "./Satstabeller/GrunnpensjonTabell";
import GrunnbeløpTabell from "./Satstabeller/GrunnbeløpTabell";
import GarantiPensjonsnivåTabell from "./Satstabeller/GarantiPensjonsnivåTabell";
import EØSKonvensjonslandTabell from "./Satstabeller/EØSKonvensjonslandTabell";
import BarnetilleggTak2016Tabell from "./Satstabeller/BarnetilleggTak2016Tabell";
import "../App.css";
import Satsheader from "./Satsheader";

class Satsvindu extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            error: null,
            isLoaded: false,
            verdier: [],
            showGenerelt: false,
            showAlderspensjon1967: false,
            showAlderspensjon2011: false,
            showUføretrygd: false,
            showKonvensjonsland: false
        }
        this.handleClickGenerelt = this.handleClickGenerelt.bind(this);
        this.handleClickAlderspensjon1967 = this.handleClickAlderspensjon1967.bind(this);
        this.handleClickAlderspensjon2011 = this.handleClickAlderspensjon2011.bind(this);
        this.handleClickUføretrygd = this.handleClickUføretrygd.bind(this);
        this.handleClickKonvensjonsland = this.handleClickKonvensjonsland.bind(this)
    }

    handleClickGenerelt() {
        this.setState({ showGenerelt: !this.state.showGenerelt })
    }

    handleClickAlderspensjon1967() {
        this.setState({ showAlderspensjon1967: !this.state.showAlderspensjon1967 })
    }

    handleClickAlderspensjon2011() {
        this.setState({ showAlderspensjon2011: !this.state.showAlderspensjon2011 })
    }

    handleClickUføretrygd() {
        this.setState({ showUføretrygd: !this.state.showUføretrygd })
    }

    handleClickKonvensjonsland() {
        this.setState({ showKonvensjonsland: !this.state.showKonvensjonsland })
    }

    render() {

        const Generelt = () => {
            return (
                <div className="kategori-container">
                    <div className="kategori-delimiter" style={{ width: '5%' }}></div>
                    <div className="sats-container" style={{ width: '95%' }}>
                        <GrunnbeløpTabell
                            key={"Grunnbeløp: " + this.props.currentTabell + this.props.valgtMiljø + this.props.aktiv}
                            currentTabell={this.props.currentTabell}
                            valgtMiljø={this.props.valgtMiljø}
                            aktiv={this.props.aktiv}>
                        </GrunnbeløpTabell>

                        <VeietGrunnbeløpTabell
                            key={"veietGrunnbeløp: " + this.props.currentTabell + this.props.valgtMiljø + this.props.aktiv}
                            currentTabell={this.props.currentTabell}
                            valgtMiljø={this.props.valgtMiljø}
                            aktiv={this.props.aktiv}>
                        </VeietGrunnbeløpTabell>

                        <ReguleringsfaktorTabell
                            key={"Reguleringsfaktor: " + this.props.currentTabell + this.props.valgtMiljø + this.props.aktiv}
                            currentTabell={this.props.currentTabell}
                            valgtMiljø={this.props.valgtMiljø}
                            aktiv={this.props.aktiv}>
                        </ReguleringsfaktorTabell>

                        <LønnsvekstTabell
                            key={"Lønnsvekst: " + this.props.currentTabell + this.props.valgtMiljø + this.props.aktiv}
                            currentTabell={this.props.currentTabell}
                            valgtMiljø={this.props.valgtMiljø}
                            aktiv={this.props.aktiv}>
                        </LønnsvekstTabell>
                    </div>
                </div>
            );
        }

        const Alderspensjon1967 = () => {
            return (
                <div className="kategori-container">
                    <div className="kategori-delimiter" style={{ width: '5%' }}></div>
                    <div className="sats-container" style={{ width: '95%' }}>
                        <GrunnpensjonTabell
                            key={"Grunnpensjon: " + this.props.currentTabell + this.props.valgtMiljø + this.props.aktiv}
                            currentTabell={this.props.currentTabell}
                            valgtMiljø={this.props.valgtMiljø}
                            aktiv={this.props.aktiv}>
                        </GrunnpensjonTabell>

                        <SærtilleggTabell
                            key={"Særtillegg: " + this.props.currentTabell + this.props.valgtMiljø + this.props.aktiv}
                            currentTabell={this.props.currentTabell}
                            valgtMiljø={this.props.valgtMiljø}
                            aktiv={this.props.aktiv}>
                        </SærtilleggTabell>

                    </div>
                </div>
            );
        }

        const Alderspensjon2011 = () => {
            return (
                <div className="kategori-container">
                    <div className="kategori-delimiter" style={{ width: '5%' }}></div>

                    <div className="sats-container" style={{ width: '95%' }}>

                        <MinstePensjonsnivåTabell
                            key={"MinstePensjonsnivå: " + this.props.currentTabell + this.props.valgtMiljø + this.props.aktiv}
                            currentTabell={this.props.currentTabell}
                            valgtMiljø={this.props.valgtMiljø}
                            aktiv={this.props.aktiv}>
                        </MinstePensjonsnivåTabell>

                        <GarantiPensjonsnivåTabell
                            key={"GarantiPensjonsnivå: " + this.props.currentTabell + this.props.valgtMiljø + this.props.aktiv}
                            currentTabell={this.props.currentTabell}
                            valgtMiljø={this.props.valgtMiljø}
                            aktiv={this.props.aktiv}>
                        </GarantiPensjonsnivåTabell>

                        <SkjermingstilleggTabell
                            key={"Skjermingstillegg: " + this.props.currentTabell + this.props.valgtMiljø + this.props.aktiv}
                            currentTabell={this.props.currentTabell}
                            valgtMiljø={this.props.valgtMiljø}
                            aktiv={this.props.aktiv}>
                        </SkjermingstilleggTabell>

                    </div>
                </div>
            );
        }

        const Uføretrygd = () => {
            return (
                <div className="kategori-container">
                    <div className="kategori-delimiter" style={{ width: '5%' }}></div>

                    <div className="sats-container" style={{ width: '95%' }}>

                        <UføretrygdMinsteytelseTabell
                            key={"UføretrygdMinsteytelse: " + this.props.currentTabell + this.props.valgtMiljø + this.props.aktiv}
                            currentTabell={this.props.currentTabell}
                            valgtMiljø={this.props.valgtMiljø}
                            aktiv={this.props.aktiv}>
                        </UføretrygdMinsteytelseTabell>

                        <RettsgebyrTabell
                            key={"Rettsgebyr: " + this.props.currentTabell + this.props.valgtMiljø + this.props.aktiv}
                            currentTabell={this.props.currentTabell}
                            valgtMiljø={this.props.valgtMiljø}
                            aktiv={this.props.aktiv}>
                        </RettsgebyrTabell>

                        <BarnetilleggTak2016Tabell
                            key={"BarnetilleggTak2016: " + this.props.currentTabell + this.props.valgtMiljø + this.props.aktiv}
                            currentTabell={this.props.currentTabell}
                            valgtMiljø={this.props.valgtMiljø}
                            aktiv={this.props.aktiv}>
                        </BarnetilleggTak2016Tabell>

                    </div>
                </div>
            );
        }

        const Konvensjonsland = () => {
            return (
                <div className="kategori-container">
                    <div className="kategori-delimiter" style={{ width: '5%' }}></div>

                    <div className="sats-container" style={{ width: '95%' }}>

                        <NordiskKonvensjonslandTabell
                            key={"NordiskKonvensjonsland: " + this.props.currentTabell + this.props.valgtMiljø + this.props.aktiv}
                            currentTabell={this.props.currentTabell}
                            valgtMiljø={this.props.valgtMiljø}
                            aktiv={this.props.aktiv}>
                        </NordiskKonvensjonslandTabell>

                        <EØSKonvensjonslandTabell
                            key={"EØSKonvensjonsland: " + this.props.currentTabell + this.props.valgtMiljø + this.props.aktiv}
                            currentTabell={this.props.currentTabell}
                            valgtMiljø={this.props.valgtMiljø}
                            aktiv={this.props.aktiv}>
                        </EØSKonvensjonslandTabell>

                    </div>
                </div>
            );
        }
        return (
            <div className="satstabell-container">

                <div className="tabell-wrapper">
                    <div onClick={this.handleClickGenerelt}>
                        <Satsheader headline="Generelt" show={this.state.showGenerelt}></Satsheader>
                    </div>
                    {this.state.showGenerelt ? <Generelt></Generelt> : null}
                </div>

                <div className="tabell-wrapper">
                    <div onClick={this.handleClickAlderspensjon1967}>
                        <Satsheader headline="Alderspensjon1967" show={this.state.showAlderspensjon1967}></Satsheader>
                    </div>
                    {this.state.showAlderspensjon1967 ? <Alderspensjon1967></Alderspensjon1967> : null}
                </div>

                <div className="tabell-wrapper">
                    <div onClick={this.handleClickAlderspensjon2011}>
                        <Satsheader headline="Alderspensjon2011" show={this.state.showAlderspensjon2011}></Satsheader>
                    </div>
                    {this.state.showAlderspensjon2011 ? <Alderspensjon2011></Alderspensjon2011> : null}
                </div>

                <div className="tabell-wrapper">
                    <div onClick={this.handleClickUføretrygd}>
                        <Satsheader headline="Uføretrygd" show={this.state.showUføretrygd}></Satsheader>
                    </div>
                    {this.state.showUføretrygd ? <Uføretrygd></Uføretrygd> : null}
                </div>

                <div className="tabell-wrapper">
                    <div onClick={this.handleClickKonvensjonsland}>
                        <Satsheader headline="Konvensjonsland" show={this.state.showKonvensjonsland}></Satsheader>
                    </div>
                    {this.state.showKonvensjonsland ? <Konvensjonsland></Konvensjonsland> : null}
                </div>

            </div>
        );
    }
}

export default Satsvindu