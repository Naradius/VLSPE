'use strict';
import React, { Component } from "react";
import ConstraintElement, { ConstraintElementProperty } from "./constraintElement.jsx";
import { Input, Checkbox } from "semantic-ui-react";
import UUIDGenerator from "../../../uuid.js";

export class TokenConstraintModel {
  constructor(id, x, y) {
    this.id = id;
    this.uuid = UUIDGenerator.uuidv4();
    this.x = x;
    this.y = y;
    this.value = "";
    this.type = 'TokenConstraintModel';
    this.isRegex = false;
    this.aggregation = [];
    this.sequence = [];
  }

  static getPropertiesType() {
    return <TokenConstraintProperty />;
  }

  render(selectedId, jsPlumb, handleElementClick, isCreatingConnection, currentScope, connectionCreated) {
    return <TokenConstraint key={this.id} id={this.uuid} value={this.value} x={this.x} y ={this.y}
    isSelected={this.uuid == selectedId} jsPlumb={jsPlumb} isRegex={this.isRegex}
    onElementClick={handleElementClick} isCreatingConnection={isCreatingConnection}
    relationScope={currentScope} sequence={this.sequence} aggregation={this.aggregation} connectionCreated={connectionCreated}/>;
  }
}

export default class TokenConstraint extends ConstraintElement {
  static getPropertiesType() {
    return <TokenConstraintProperty />
  }
  
  constructor(props) {
    super(props);

    this.state.cssClass = this.state.cssClass + ' tokenConstraint';
  }

  render() {
    const name = (this.props.value != undefined) ? this.props.value : this.state.value;
    return (
    <div id={this.state.id} className={"element " + this.state.cssClass + ((!!this.props.isSelected) ? " selected" : "")} onClick={this.handleElementClick}>{name}</div>
    );
  }
}

export class TokenConstraintProperty extends ConstraintElementProperty {
  constructor(props) {
    super(props);
    this.state = {  };
  }

  render() {
    return (
      <div>
        {super.render()}
        Value
        <Input id="valueProperty" value={this.props.currentElement.value} onChange={(event, val) => this.handleValueChange('value', val.value)} />
        <Checkbox id="isRegexProperty" label="Is RegEx" checked={this.props.currentElement.isRegex} onChange={(e, val) => this.handleValueChange('isRegex', val.checked)} />
      </div>
    );
  }
}