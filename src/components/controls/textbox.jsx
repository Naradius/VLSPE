'use strict';
import React, { Component } from "react";

export default class TextBox extends Component {
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
        <div>
        {this.props.label}
            <div className="ui input propBlock">
                <input id={this.props.id} type="text" onChange={this.handleValueChange} />
            </div>
        </div>
        
    );
  }
}