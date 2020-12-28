'use strict';
import React, { Component } from "react";
import {Enum} from 'enumify';
import PatternElement, { PatternElementProperty } from "./patternElement.jsx";
import { Dropdown, Input } from 'semantic-ui-react';
import UUIDGenerator from "../../../uuid.js";

export class RepetitionType extends Enum {}
RepetitionType.initEnum(['None', 'OneOrZero', 'OneOrMore', 'ZeroOrMore']);

export class RepetitionPatternModel {
  constructor(id, x, y) {
    this.id = id;
    this.uuid = UUIDGenerator.uuidv4();
    this.x = x;
    this.y = y;
    this.type = 'RepetitionPatternModel';
    this.name = 'Repetition Pattern';
    this.isPositive = true;
    this.repetitionType = RepetitionType.OneOrZero;
    this.minRepetition = 0;
    this.maxRepetition = 0;
    this.aggregation = [];
    this.sequence = [];
  }

  static getPropertiesType() {
    return <RepetitionPatternProperty />;
  }

  render(selectedId, jsPlumb, handleElementClick, isCreatingConnection, currentScope, connectionCreated) {
    return <RepetitionPattern key={this.id} id={this.uuid} name={this.name} x={this.x} y={this.y}
    repetitionType={this.repetitionType} minRepetition={this.minRepetition} maxRepetition={this.maxRepetition}
    isSelected={this.uuid == selectedId} jsPlumb={jsPlumb} isPositive={this.isPositive}
    onElementClick={handleElementClick} isCreatingConnection={isCreatingConnection}
    relationScope={currentScope} sequence={this.sequence} aggregation={this.aggregation} connectionCreated={connectionCreated}/>;
  }
}

export default class RepetitionPattern extends PatternElement {
  constructor(props) {
    super(props);

    this.state.cssClass = this.state.cssClass + ' repetitionElement';
  }
}

const repetitionTypeOptions = [
  { key: RepetitionType.None, value: 'None', text: 'None' },
  { key: RepetitionType.OneOrZero, value: 'OneOrZero', text: '?' },
  { key: RepetitionType.OneOrMore, value: 'OneOrMore', text: '+' },
  { key: RepetitionType.ZeroOrMore, value: 'ZeroOrMore', text: '*' }];

export class RepetitionPatternProperty extends PatternElementProperty {
  constructor(props) {
    super(props);
    this.state = {  };

    this.handleDropdownChange = this.handleDropdownChange.bind(this);
  }

  handleDropdownChange(e, data) {
    const value = repetitionTypeOptions.find(function (opt) {
      return opt.value == data.value;
    }).key;
    super.handleValueChange('repetitionType', value);
  }

  render() {
    const repType = (this.props.currentElement.minRepetition != 0 || this.props.currentElement.maxRepetition != 0)
      ? <div></div>
      : <div>
        Repetition type
        <Dropdown placeholder="None" selection value={this.props.currentElement.repetitionType.name} options={repetitionTypeOptions} onChange={this.handleDropdownChange} />
      </div>;
    const userReps = (this.props.currentElement.repetitionType !== RepetitionType.None)
      ? <div></div>
      : <div>
        Min. repetition
        <Input id="repetitionMinProperty" value={this.props.currentElement.minRepetition} onChange={(event, val) => this.handleValueChange('minRepetition', val.value)} />
        Max. repetition
        <Input id="repetitionMaxProperty" value={this.props.currentElement.maxRepetition} onChange={(event, val) => this.handleValueChange('maxRepetition', val.value)} />
      </div>;
    return (
      <div>
        {super.render()}
        {repType}
        {userReps}
      </div>
    );
  }
}