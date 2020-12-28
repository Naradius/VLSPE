'use strict';
import React, { Component } from "react";
import TextBox from "../controls/textbox.jsx";
import ElementProperty from "./elementProperty.jsx";
import { Input } from "semantic-ui-react";

export default class NamedElementProperty extends ElementProperty {
  constructor(props) {
    super(props);
    this.state = {  };
  }

  render() {
    return (
      <div>
        Name
        <Input id="nameProperty" value={this.props.currentElement.name} onChange={(event, val) => this.handleValueChange('name', val.value)} />
      </div>
    );
  }
}