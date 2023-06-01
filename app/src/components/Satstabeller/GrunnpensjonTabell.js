import React from "react";
import { Table } from "react-bootstrap";
import  Satsheader  from "../Satsheader";

class GrunnpensjonTabell extends React.Component {
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
            let url = 'https://pensjon-regler-' + this.props.valgtMiljø + '.dev.adeo.no/api/grunnpensjonSats?Aktiv=' + this.props.aktiv + '&Satstabell=' + this.props.currentTabell
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
                  console.log("grunnpensjonSats lastet"));
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
          const TabellRender = () => (<div><Table striped bordered hover>
            <thead className = "th">   
                <tr>
                    <th>FomDato</th>
                    <th>TomDato</th>
                    <th>Verdi</th>
                </tr>
            </thead> 
            <tbody className = "tabell-body"> 
            {this.state.verdier.map((data,key) => {
                return(
                        <tr key = {key}>
                        <td>{((data.satsFom[0]) < 0) ? 'N/A' : (data.satsFom[2]+'-'+data.satsFom[1]+'-'+data.satsFom[0])}</td>
                        <td>{((data.satsTom[0]) > 10000) ? 'N/A' : (data.satsTom[2]+'-'+data.satsTom[1]+'-'+data.satsTom[0])}</td>
                        <td>{data.value}</td>
                        </tr>
            )})}
             </tbody>
            </Table></div>)
            return(
                <div>
              <div onClick = {this.handleClick}>
                <Satsheader headline = "Grunnpensjon" show = {this.state.show}></Satsheader>
              </div>
                  {this.state.show ? <TabellRender></TabellRender> : null}
                </div>
            );
        }
    }

export default GrunnpensjonTabell