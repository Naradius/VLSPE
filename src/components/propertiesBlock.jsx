'use strict';
import React, { Component } from "react";

export default class PropertiesBlock extends Component {
  constructor(props) {
    super(props);
    this.state = {  };

    this.handlePropertyChange = this.handlePropertyChange.bind(this);
  }

  handlePropertyChange(property, value) {
    this.props.onPropertyChange(property, value);
  }

  render() {
    const currentElement = this.props.currentElement;
    if (currentElement) {
      const propertyComponent = currentElement.constructor.getPropertiesType();
      const property = React.cloneElement(propertyComponent, {
        onPropertyChange: this.handlePropertyChange,
        currentElement: currentElement
      });

      return (
        <div>
          <h4>Properties</h4>
          {property}
        </div>
      );
    } else {
      return (<div></div>)
    }    
  }
}