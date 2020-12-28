'use strict';
import React, { Component } from "react";
import PatternElement, { PatternElementProperty } from "./patternElement.jsx";
import NamedElementProperty from "../namedElementProperty.jsx";
import UUIDGenerator from "../../../uuid.js";

export class BasicPatternModel {
  constructor(id, x, y) {
    this.id = id;
    this.uuid = UUIDGenerator.uuidv4();
    this.x = x;
    this.y = y;
    this.type = 'BasicPatternModel';
    this.name = 'Basic Pattern';
    this.isPositive = true;
    this.aggregation = [];
    this.sequence = [];
  }

  static getPropertiesType() {
    return <PatternElementProperty />;
  }

  render(selectedId, jsPlumb, handleElementClick, isCreatingConnection, currentScope, connectionCreated) {
    return <BasicPattern key={this.id} id={this.uuid} name={this.name} x={this.x} y={this.y}
    isSelected={this.uuid == selectedId} jsPlumb={jsPlumb} isPositive={this.isPositive}
    onElementClick={handleElementClick} isCreatingConnection={isCreatingConnection}
    relationScope={currentScope} sequence={this.sequence} aggregation={this.aggregation} connectionCreated={connectionCreated}/>;
  }
}

export default class BasicPattern extends PatternElement {
  constructor(props) {
    super(props);

    this.state.cssClass = this.state.cssClass + ' basicElement';
  }
}