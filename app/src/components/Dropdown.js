import { Dropdown } from "react-bootstrap";
import React from "react";
import { DropdownButton } from "react-bootstrap";

class DropdownMenu extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            name: this.props.name,
            list: this.props.list,
            prevTabell: this.props.prevTabell, 
            currentTabell: "default",
            variant: this.props.variant
            
            }
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    

    handleSubmit(event) {
    this.setState({currentTabell: event.target.name});
    this.props.onTabellChange(event.target.name);
    }

    render(){
        return(
            <DropdownButton menualign = "left" id="dropdown-basic-button" size="lg" title={this.state.name} variant = {this.props.variant} key = {this.state.name + ': '+this.props.variant}>
                {this.state.list.map((listItem)=>
                    <Dropdown.Item key = {listItem} name = {listItem} onClick = {this.handleSubmit}>{listItem}</Dropdown.Item>
                )}
            </DropdownButton>
        );
    }
}

export default DropdownMenu