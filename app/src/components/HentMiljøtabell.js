import React from "react"


class HentMiljøtabell extends React.Component {
  constructor(props){
    super(props)
      this.state = {
        displayTabell: 'Ingen tabell i miljø'
      }
    
  }

  componentDidMount(){
    if(this.props.aktiv && this.props.valgtMiljø !== 'PROD'){
      fetch('https://pensjon-regler-'+this.props.valgtMiljø+'.dev.adeo.no/aktivTabell'
      ,{
        headers : { 
        'Content-Type': 'application/text',
        'Accept': 'application/text'
        } 
      }   
      )    
      .then(res => res.text())
      .then(
      (result) => {
        this.setState({displayTabell: result})
      }
      )
    } else if (this.props.aktiv && this.props.valgtMiljø === 'PROD'){
      fetch('https://pensjon-regler.intern.nav.no/aktivTabell'
      ,{
        headers : { 
        'Content-Type': 'application/text',
        'Accept': 'application/text'
        } 
      }   
      )    
      .then(res => res.text())
      .then(
      (result) => {
        this.setState({displayTabell: result})
      }
      )
    } else {
      this.setState({displayTabell: this.props.displayTabell})
    }
  }
  render() {
    return(
    <div>
      <h1> Valgt Tabell: {this.state.displayTabell}</h1>
      <h1>{this.props.aktiv ? '   Miljø: '+this.props.valgtMiljø : ''}</h1>
    </div>
    )
  }


}

export default HentMiljøtabell;