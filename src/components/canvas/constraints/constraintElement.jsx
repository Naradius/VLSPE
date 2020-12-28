'use strict';
import React, { Component } from "react";
import LanguageElement from "../languageElement.jsx";
import ElementProperty from "../elementProperty.jsx";

export default class ConstraintElement extends LanguageElement {
  constructor(props) {
    super(props);

    this.state.cssClass = 'constraintEl';
  }
}

export class ConstraintElementProperty extends ElementProperty {
  constructor(props) {
    super(props);
    this.state = {  };
  }

  render() {
    return (      
      <div>
      </div>
    );
  }
}