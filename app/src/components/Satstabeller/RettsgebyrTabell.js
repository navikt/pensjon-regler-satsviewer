import React from "react";
import { Table } from "react-bootstrap";
import  Satsheader  from "../Satsheader";

class RettsgebyrTabell extends React.Component {
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
            url = 'https://pensjon-regler.intern.nav.no/api/rettsgebyrSats?Aktiv=' + this.props.aktiv + '&Satstabell=' + this.props.currentTabell
        } else {
            url = 'https://pensjon-regler-' + this.props.valgtMiljø + '.dev.adeo.no/api/rettsgebyrSats?Aktiv=' + this.props.aktiv + '&Satstabell=' + this.props.currentTabell
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
              console.log("Rettsgebyr lastet"));
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
        <div><Table striped bordered hover>
        <thead className = "th">   
            <tr>
                <th>FomDato</th>
                <th>TomDato</th>
                <th>Rettsgebyr</th>
                <th>TOL_GR_EO_ETTERBET</th>
                <th>TOL_GR_EO_TILBAKEKR</th>
                <th>TERSKEL_FEILUTBET</th>
            </tr>
        </thead> 
        <tbody className = "tabell-body"> 
        {this.state.verdier.map((data,key) => {
            return(
                    <tr key = {key}>
                    <td>{((data.satsFom[0]) < 0) ? 'N/A' : (data.satsFom[2]+'-'+data.satsFom[1]+'-'+data.satsFom[0])}</td>
                    <td>{((data.satsTom[0]) > 10000) ? 'N/A' : (data.satsTom[2]+'-'+data.satsTom[1]+'-'+data.satsTom[0])}</td>
                    <td>{data.kodeMap[1].RETTSGEBYR}</td>
                    <td>{data.kodeMap[1].TOL_GR_EO_ETTERBET}</td>
                    <td>{data.kodeMap[1].TOL_GR_EO_TILBAKEKR}</td>
                    <td>{data.kodeMap[1].TERSKEL_FEILUTBET}</td>
                    </tr>
        )})}
         </tbody>
        </Table></div>
      )
        return(
            <div>
              <div onClick = {this.handleClick}>
                <Satsheader headline = "Rettsgebyr" show = {this.state.show}></Satsheader>
              </div>
              {this.state.show ? <TabellRender></TabellRender> : null}
            </div>
        );
    }
}

export default RettsgebyrTabell