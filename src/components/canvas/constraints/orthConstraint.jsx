'use strict';
import React, { Component } from "react";
import {Enum} from 'enumify';
import ConstraintElement, { ConstraintElementProperty } from "./constraintElement.jsx";
import { Dropdown } from 'semantic-ui-react';
import UUIDGenerator from "../../../uuid.js";

export class Orthography extends Enum {}
Orthography.initEnum(['Capitalized', 'Lowercase', 'Multicap', 'Uppercase']);

export class OrthographyConstraintModel {
  constructor(id, x, y) {
    this.id = id;
    this.uuid = UUIDGenerator.uuidv4();
    this.x = x;
    this.y = y;
    this.type = 'OrthographyConstraintModel';
    this.orthography = [ Orthography.Capitalized ];
    this.aggregation = [];
    this.sequence = [];
  }

  static getPropertiesType() {
    return <OrthographyConstraintProperty />;
  }

  render(selectedId, jsPlumb, handleElementClick, isCreatingConnection, currentScope, connectionCreated) {
    return <OrthographyConstraint key={this.id} id={this.uuid} x={this.x} y={this.y}
    isSelected={this.uuid == selectedId} jsPlumb={jsPlumb} orthography={this.orthography}
    onElementClick={handleElementClick} isCreatingConnection={isCreatingConnection}
    relationScope={currentScope} sequence={this.sequence} aggregation={this.aggregation} connectionCreated={connectionCreated}/>;
  }
}

export default class OrthographyConstraint extends ConstraintElement { 
  constructor(props) {
    super(props);
    
    this.state.cssClass = this.state.cssClass + ' orthConstraint';
  }

  render() {
    const name = (this.props.orthography != undefined) ? 
      this.props.orthography.map(x => x.name.replace(/([A-Z])/g, ' $1').trim()).join(', ') : 
      this.state.orthography.map(x => x.name.replace(/([A-Z])/g, ' $1').trim()).join(', ');
    return (
    <div id={this.state.id} className={"element " + this.state.cssClass + ((!!this.props.isSelected) ? " selected" : "")} onClick={this.handleElementClick}>{name}</div>
    );
  }
}

const orthOptions = [
  { key: Orthography.Capitalized, value: 'Capitalized', text: 'Capitalized' },
  { key: Orthography.Lowercase, value: 'Lowercase', text: 'Lowercase' },
  { key: Orthography.Multicap, value: 'Multicap', text: 'Multicap' },
  { key: Orthography.Uppercase, value: 'Uppercase', text: 'Uppercase' },
];


export class OrthographyConstraintProperty extends ConstraintElementProperty {
  constructor(props) {
    super(props);
    this.state = {  };

    this.handleDropdownChange = this.handleDropdownChange.bind(this);
  }

  handleDropdownChange(data, options, property) {
    const value = options.filter(function (opt) {
      return data.value.indexOf(opt.key) > -1 ||  data.value.indexOf(opt.value) > -1;
    }).map(function (opt) {
      return opt.key;
    });
    super.handleValueChange(property, value);
  }

  render() {
    return (      
      <div>
        {super.render()}
        Orthography
        <Dropdown fluid multiple selection options={orthOptions} value={this.props.currentElement.orthography.map((el) => el.name)}
          onChange={(e, data) => this.handleDropdownChange(data, orthOptions, 'orthography')} />
      </div>
    );
  }
}