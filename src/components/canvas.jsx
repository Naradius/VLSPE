'use strict';
import React, { Component } from "react";

export default class Canvas extends Component {
  constructor(props) {
    super(props);
    this.state = { };
  }

  render() {
    return (
        <div className="column">
            <div className="ui segment jtk-demo-canvas canvas-wide jtk-surface jtk-surface-nopan" id="canvas" style={{height: '850px'}}>
              {this.props.children}
            </div>
        </div>
    );
  }
}