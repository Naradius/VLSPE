'use strict';
import React, { Component } from "react";

export default class Toggle extends Component {
  constructor(props) {
    super(props);
    this.state = {  };

    this.handleValueChange = this.handleValueChange.bind(this);
  }

  handleValueChange(e) {
      this.props.onValueChanged(e.target.value);
  }

  render() {
    return (
        <div className="ui slider checkbox">
            <input id={this.props.id} type="checkbox" onChange={this.handleValueChange} />
            <label>{this.props.label}</label>
        </div>
        
    );
  }
}