'use strict';
import React, { Component } from "react";

export default class ElementProperty extends Component {
  constructor(props) {
    super(props);
    this.state = {  };
    this.handleValueChange = this.handleValueChange.bind(this);
  }

  handleValueChange(property, value) {
    this.props.onPropertyChange(property, value);
  }

  render() {
    return (
      <div>
      </div>
    );
  }
}