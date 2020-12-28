'use strict';
import React, { Component } from "react";
import LanguageElement from "../languageElement.jsx";

import NamedElementProperty from "../namedElementProperty.jsx";
import { Checkbox } from "semantic-ui-react";

export default class PatternElement extends LanguageElement {
  constructor(props) {
    super(props);

    this.state.name = 'Pattern';
    this.state.isPositive = true;
    this.state.cssClass = 'patternEl';
  }
}

export class PatternElementProperty extends NamedElementProperty {
  constructor(props) {
    super(props);
    this.state = {  };
  }

  render() {
    return (      
      <div>
        {super.render()}
        <Checkbox id="isPositiveProperty" label="Is positive" checked={this.props.currentElement.isPositive} onChange={(e, val) => this.handleValueChange('isPositive', val.checked)} />
      </div>
    );
  }
}