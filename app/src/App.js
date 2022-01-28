import logo_bubblegum from './logo_bubblegum.png';
import logo_light from './logo_light.png';
import logo_dark from './logo_dark.png';
import logo_matrix from './logo_matrix.png';
import './App.css';
import ReactDOM from 'react-dom';
import DropdownMenu from './components/Dropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from "react";
import Satsvindu  from './components/Satsvindu';
import HentMiljøtabell from "./components/HentMiljøtabell";

export var ProdTabeller = []
export var TestTabeller = []
export var AndreTabeller = []


class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
        error: null,
        isLoaded: false,
        tabeller: [],
        andreTabeller: [],
        prodTabeller: [],
        testTabeller: [],
        valgtTabell: 'PROD',
        valgtMiljø: 'Q4',
        aktiv: false,
        displayTabell: 'PROD',
        buttonVariant: 'secondary',
        logo: logo_dark
    }

    this.handleTabellChange = this.handleTabellChange.bind(this);
    this.handleMiljøChange = this.handleMiljøChange.bind(this);
    this.setTheme = this.setTheme.bind(this);
  }

  setTheme(theme) {
    if(theme == "light"){
      document.documentElement.style.setProperty("--background", "#e0e0e0");
      document.documentElement.style.setProperty("--border", "#c9c5c5" );
      document.documentElement.style.setProperty("--tabell-background","#d1cece");
      document.documentElement.style.setProperty("--hover", "#bcbdb9");
      document.documentElement.style.setProperty("--text", "#000000");
      document.documentElement.style.setProperty("--headline", "#000000");
      this.setState({buttonVariant: 'light'});
      this.setState({logo: logo_light});
    } else if (theme == "dark"){
      document.documentElement.style.setProperty("--background", "#282c34");
      document.documentElement.style.setProperty("--border", "#797575" );
      document.documentElement.style.setProperty("--tabell-background","#a7a79d");
      document.documentElement.style.setProperty("--hover", "#e0e0d2");
      document.documentElement.style.setProperty("--text", "#000000");
      document.documentElement.style.setProperty("--headline", "#ffffff");
      this.setState({buttonVariant: 'secondary'});
      this.setState({logo: logo_dark});
    } else if (theme == "matrix"){
      document.documentElement.style.setProperty("--background", "#000000");
      document.documentElement.style.setProperty("--border", "#03A062" );
      document.documentElement.style.setProperty("--tabell-background","#000000");
      document.documentElement.style.setProperty("--hover", "#0faf4c");
      document.documentElement.style.setProperty("--text", "#03A062");
      document.documentElement.style.setProperty("--headline", "#03A062");
      this.setState({buttonVariant: 'secondary'});
      console.log(this.state.buttonVariant);
      this.setState({logo: logo_matrix});
    } else if (theme == "bubblegum"){
      document.documentElement.style.setProperty("--background", "#e790cd");
      document.documentElement.style.setProperty("--border", "#be5da1" );
      document.documentElement.style.setProperty("--tabell-background","#cf72b3");
      document.documentElement.style.setProperty("--hover", "#f15ed9");
      document.documentElement.style.setProperty("--text", "#500844");
      document.documentElement.style.setProperty("--headline", "#500844");
      this.setState({buttonVariant: 'light'});
      this.setState({logo: logo_bubblegum});
      console.log(this.state.buttonVariant);
    }
}
  componentDidMount() {
    fetch('https://pensjon-regler-q4.dev.adeo.no/alleSatstabeller'
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
          tabeller: result[1],
        },
        console.log("tabell lastet"));
        {
          this.state.tabeller.map((tabell) => {
            var navn = String(tabell)
            if(navn.startsWith("PROD")){
                ProdTabeller.push(navn);
            } else if( navn.startsWith("SYSTEMTEST_") || navn.startsWith("TEST")){
              TestTabeller.push(navn);
            } else {
              AndreTabeller.push(navn);
            };
          })
        }
        this.setState({
          prodTabeller: ProdTabeller,
          testTabeller: TestTabeller,
          andreTabeller: AndreTabeller 
        })
      },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
    ) //TODO vil helst ha dette i en egen metode
  }
  
  handleTabellChange(name) {
    this.setState({valgtTabell: name, valgtMiljø: 'Q4', aktiv: false, displayTabell: name})
  }

 
  handleMiljøChange(name) {
    this.setState({valgtMiljø: name, aktiv: true, displayTabell: name})
  }

  render(){
    return (
      <div class = "App"> 

        <div class = "top-bar">
          <div class = "top-filler"></div>
          <div class = "headline"> PENSJON REGLER SATSVIEWER  </div>
            <div class = "button-container">
            <button class = "matrix-theme-button" onClick={() => this.setTheme("matrix")}></button>
            <button class = "light-theme-button" onClick={() => this.setTheme("light")}></button>
            <button class = "dark-theme-button" onClick={() => this.setTheme("dark")}></button> 
            <button class = "bubblegum-theme-button" onClick={() => this.setTheme("bubblegum")}></button>
          </div>
        </div>

        <div>{<img src={this.state.logo} alt="Logo" width="500" height="300"/>}</div>

        <div class = "menu-container" >
          <DropdownMenu href = {"ProdTabeller"} name = "PROD Tabeller" list = {ProdTabeller} prevTabell = {this.state.valgtTabell} onTabellChange = {this.handleTabellChange} variant = {this.state.buttonVariant}>PROD Tabeller</DropdownMenu>
          <DropdownMenu href = {"TestTabeller"} name = "Test Tabeller" list = {TestTabeller} prevTabell = {this.state.valgtTabell} onTabellChange = {this.handleTabellChange} variant = {this.state.buttonVariant}>Test Tabeller</DropdownMenu>
          <DropdownMenu href = {"AndreTabeller"} name = "Andre Tabeller" list = {AndreTabeller} prevTabell = {this.state.valgtTabell} onTabellChange = {this.handleTabellChange} variant = {this.state.buttonVariant}>Andre Tabeller</DropdownMenu>
          <DropdownMenu href = {"MiljøTabeller"} name = "Aktiv Tabell i Miljø" list = {["T0","Q0","Q1","Q2","Q4","Q5","PROD"]} onTabellChange = {this.handleMiljøChange} variant = {this.state.buttonVariant}>Aktiv Tabell i Miljø</DropdownMenu>
        </div>

        <div class = "valgt-tabell">
          <HentMiljøtabell key = {"miljøtabell: "+this.state.displayTabell} aktiv = {this.state.aktiv} displayTabell = {this.state.displayTabell} valgtMiljø = {this.state.valgtMiljø}></HentMiljøtabell>
        </div>

        <div class = "satsvindu-container">
          <Satsvindu currentTabell = {this.state.valgtTabell} valgtMiljø = {this.state.valgtMiljø} aktiv = {this.state.aktiv} displayTabell = {this.state.displayTabell}></Satsvindu>
        </div>

        <div class = "app-footer" height = '15%'></div>
      </div>
    );
  }
}
ReactDOM.render(App,document.getElementById('root'))
export default App;
