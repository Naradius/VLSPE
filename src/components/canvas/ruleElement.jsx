'use strict';
import React, { Component } from "react";
import LanguageElement from "./languageElement.jsx";
import NamedElementProperty from "./namedElementProperty.jsx";
import UUIDGenerator from "../../uuid.js";

export class RuleElementModel {
  constructor(id, x, y) {
    this.name = 'Rule';
    this.uuid = UUIDGenerator.uuidv4();
    this.id = id;
    this.x = x;
    this.y = y;
    this.aggregation = [];
    this.sequence = [];
  }

  static getPropertiesType() {
    return <NamedElementProperty />;
  }

  render(selectedId, jsPlumb, handleElementClick, isCreatingConnection, currentScope) {
    return <RuleElement key={this.id} id={this.uuid} name={this.name}
    isSelected={this.uuid == selectedId} jsPlumb={jsPlumb} x={this.x} y={this.y}
    onElementClick={handleElementClick} sequence={this.sequence} aggregation={this.aggregation} isCreatingConnection={isCreatingConnection}
    relationScope={currentScope}/>;
  }
}

export default class RuleElement extends LanguageElement {  
  constructor(props) {
    super(props);

    this.state.cssClass = 'ruleEl';
  }
}