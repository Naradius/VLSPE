'use strict';
import React, { Component } from "react";
import ConstraintElement, { ConstraintElementProperty } from "./constraintElement.jsx";
import TextBox from "../../controls/textbox.jsx";
import { Input } from "semantic-ui-react";
import UUIDGenerator from "../../../uuid.js";

export class RuleConstraintModel {
  constructor(id, x, y) {
    this.id = id;
    this.uuid = UUIDGenerator.uuidv4();
    this.x = x;
    this.y = y;
    this.rule = "";
    this.type = 'RuleConstraintModel';
    this.aggregation = [];
    this.sequence = [];
  }

  static getPropertiesType() {
    return <RuleConstraintProperty />;
  }

  render(selectedId, jsPlumb, handleElementClick, isCreatingConnection, currentScope, connectionCreated) {
    return <RuleConstraint key={this.id} id={this.uuid} rule={this.rule}
    isSelected={this.uuid == selectedId} jsPlumb={jsPlumb} x={this.x} y={this.y}
    onElementClick={handleElementClick} isCreatingConnection={isCreatingConnection}
    relationScope={currentScope} sequence={this.sequence} aggregation={this.aggregation} connectionCreated={connectionCreated}/>;
  }
}

export default class RuleConstraint extends ConstraintElement {
  static getPropertiesType() {
    return <RuleConstraintProperty />
  }
  
  constructor(props) {
    super(props);

    this.state.cssClass = this.state.cssClass + ' ruleConstraint';
  }

  render() {
    const name = (this.props.rule != undefined) ? this.props.rule : this.state.rule;
    return (
    <div id={this.state.id} className={"element " + this.state.cssClass + ((!!this.props.isSelected) ? " selected" : "")} onClick={this.handleElementClick}>{name}</div>
    );
  }
}

export class RuleConstraintProperty extends ConstraintElementProperty {
  constructor(props) {
    super(props);
    this.state = {  };
  }

  render() {
    return (
      <div>
        {super.render()}
        Rule
        <Input id="ruleProperty" value={this.props.currentElement.rule} onChange={(event, val) => this.handleValueChange('rule', val.value)} />
      </div>
    );
  }
}