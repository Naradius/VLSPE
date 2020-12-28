'use strict';
import React, { Component } from "react";
import {Enum} from 'enumify';
import PatternElement, { PatternElementProperty } from "./patternElement.jsx";
import { Dropdown } from 'semantic-ui-react';
import UUIDGenerator from "../../../uuid.js";

export class Operation extends Enum {}
Operation.initEnum(['Or', 'And']);

export class AlternativePatternModel {
  constructor(id, x, y) {
    this.id = id;
    this.uuid = UUIDGenerator.uuidv4();
    this.x = x;
    this.y = y;
    this.type = 'AlternativePatternModel';
    this.name = 'Alternative Pattern';
    this.operation = Operation.Or;
    this.isPositive = true;
    this.aggregation = [];
    this.sequence = [];
  }

  static getPropertiesType() {
    return <AlternativePatternProperty />;
  }

  render(selectedId, jsPlumb, handleElementClick, isCreatingConnection, currentScope, connectionCreated) {
    return <AlternativePattern key={this.id} id={this.uuid} x={this.x} y={this.y}
    name={this.name} operation={this.operation} isPositive={this.isPositive}
    isSelected={this.uuid == selectedId} jsPlumb={jsPlumb} 
    onElementClick={handleElementClick} isCreatingConnection={isCreatingConnection}
    relationScope={currentScope} sequence={this.sequence} aggregation={this.aggregation} connectionCreated={connectionCreated}/>;
  }
}

export default class AlternativePattern extends PatternElement {
  constructor(props) {
    super(props);

    this.state.cssClass = this.state.cssClass + ' alternativeElement';
  }
}

const operationOptions = [{ key: Operation.Or, value: 'Or', text: 'Or' }, 
  { key: Operation.And, value: 'And', text: 'And' }];

export class AlternativePatternProperty extends PatternElementProperty {
  constructor(props) {
    super(props);

    this.handleOperationChange = this.handleOperationChange.bind(this);
  }

  handleOperationChange(e, data) {
    const value = operationOptions.find(function (opt) {
      return opt.value == data.value;
    }).key;
    super.handleValueChange('operation', value);
  }

  render() {
    return (      
      <div>
        {super.render()}
        Operation
        <Dropdown placeholder="None" selection value={this.props.currentElement.operation.name} options={operationOptions} onChange={this.handleOperationChange} />
      </div>
    );
  }
}