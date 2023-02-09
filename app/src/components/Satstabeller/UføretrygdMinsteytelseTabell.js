import React from "react";
import { Table } from "react-bootstrap";
import  Satsheader  from "../Satsheader";

class UføretrygdMinsteytelseTabell extends React.Component {
    constructor(props){
        super(props)
        this.state = {   
            currentTabell: this.props.currentTabell,         
            error: null,
            isLoaded: false,
            verdier: [],
            show: false
        }
        this.handleClick = this.handleClick.bind(this);
    }
    componentDidMount() {
        let url;
        if (this.props.valgtMiljø === 'PROD') {
            url = 'https://pensjon-regler.intern.nav.no/api/uføretrygdMinsteytelseSats?Aktiv=' + this.props.aktiv + '&Satstabell=' + this.props.currentTabell
        } else {
            url = 'https://pensjon-regler-' + this.props.valgtMiljø + '.dev.adeo.no/api/uføretrygdMinsteytelseSats?Aktiv=' + this.props.aktiv + '&Satstabell=' + this.props.currentTabell
        }
        fetch(url
        ,{
          headers : { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
           }
        }
        )
          .then(res => res.json())
          .then(
            (result) => {
              this.setState({
                isLoaded: true,
                verdier: result[1]
              },
              console.log("VeietGrunnbeløp lastet"));
            },
            (error) => {
              this.setState({
                isLoaded: true,
                error
              });
            }
          )

      }
      handleClick(event){
        this.setState({show: !this.state.show})
      }

    render(){
      

      const TabellRender = () => (
        <div>
                      <Table striped bordered hover>
            <thead className = "th">   
                <tr>
                    <th>FomDato</th>
                    <th>TomDato</th>
                    <th>Beregnes Som Gift</th>
                    <th>Ung Ufør</th>
                    <th>Forsørger Ektefelle over 60</th>
                    <th>Sats</th>
                    <th>Kode</th>
                </tr>
            </thead> 
            <tbody className = "tabell-body"> 
            {this.state.verdier.map((data,key) => { 
                return(
 
                        <tr key = {key}>
                        <td>{((data.satsFom[0]) < 0) ? 'N/A' : (data.satsFom[2]+'-'+data.satsFom[1]+'-'+data.satsFom[0])}</td>
                        <td>{((data.satsTom[0]) > 10000) ? 'N/A' : (data.satsTom[2]+'-'+data.satsTom[1]+'-'+data.satsTom[0])}</td>
                        <td>{((data.beregnesSomGift) !== undefined) ? data.beregnesSomGift.toString() : 'udefinert'}</td>
                        <td>{((data.ungUfor) !== undefined) ? data.ungUfor.toString() : 'udefinert'}</td>
                        <td>{data.forsorgerEktefelleOver60.toString()}</td>
                        <td>{data.satsMinsteytelse.sats}</td>
                        <td>{data.satsMinsteytelse.satsType.kode}</td>
                        </tr>
            )})}
             </tbody>
            </Table>
        </div>
      )
        return(
            <div>
              <div onClick = {this.handleClick}>
                <Satsheader headline = "Uføretrygd Minsteytelse" show = {this.state.show}></Satsheader>
              </div>
              {this.state.show ? <TabellRender></TabellRender> : null}
            </div>
        );
    }
}

export default UføretrygdMinsteytelseTabell