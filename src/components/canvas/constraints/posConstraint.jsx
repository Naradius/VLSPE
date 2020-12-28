'use strict';
import React, { Component } from "react";
import {Enum} from 'enumify';
import ConstraintElement, { ConstraintElementProperty } from "./constraintElement.jsx";
import { Dropdown } from 'semantic-ui-react';
import UUIDGenerator from "../../../uuid.js";

export class PartOfSpeech extends Enum {}
PartOfSpeech.initEnum(['Adjective', 'Adverb', 'Number', 'Noun', 'Particle', 'PersonalPronoun', 'PosessivePronoun', 'Verb', 'Prepositional', 'Participle', 'AdvParticiple', 'Conjunction', 'Interjection']);

export class POSConstraintModel {
  constructor(id, x, y) {
    this.id = id;
    this.uuid = UUIDGenerator.uuidv4();
    this.x = x;
    this.y = y;
    this.type = 'POSConstraintModel';
    this.partOfSpeech = [ PartOfSpeech.Noun ];
    this.aggregation = [];
    this.sequence = [];
  }

  static getPropertiesType() {
    return <POSConstraintProperty />;
  }

  render(selectedId, jsPlumb, handleElementClick, isCreatingConnection, currentScope, connectionCreated) {
    return <POSConstraint key={this.id} id={this.uuid} partOfSpeech={this.partOfSpeech}
    isSelected={this.uuid == selectedId} jsPlumb={jsPlumb} x={this.x} y={this.y}
    onElementClick={handleElementClick} isCreatingConnection={isCreatingConnection}
    relationScope={currentScope} sequence={this.sequence} aggregation={this.aggregation} connectionCreated={connectionCreated}/>;
  }
}

export default class POSConstraint extends ConstraintElement {
  constructor(props) {
    super(props);

    this.state.cssClass = this.state.cssClass + ' posConstraint';
  }

  render() {
    const name = (this.props.partOfSpeech != undefined) ? 
      this.props.partOfSpeech.map(x => x.name.replace(/([A-Z])/g, ' $1').trim()).join(', ') : 
      this.state.partOfSpeech.map(x => x.name.replace(/([A-Z])/g, ' $1').trim()).join(', ');
    return (
    <div id={this.state.id} className={"element " + this.state.cssClass + ((!!this.props.isSelected) ? " selected" : "")} onClick={this.handleElementClick}>{name}</div>
    );
  }
}

const posOptions = [
  { key: PartOfSpeech.Adjective, value: 'Adjective', text: 'Adjective' },
  { key: PartOfSpeech.Adverb, value: 'Adverb', text: 'Adverb' },
  { key: PartOfSpeech.Number, value: 'Number', text: 'Number' },
  { key: PartOfSpeech.Noun, value: 'Noun', text: 'Noun' },
  { key: PartOfSpeech.Particle, value: 'Particle', text: 'Particle' },
  { key: PartOfSpeech.PersonalPronoun, value: 'PersonalPronoun', text: 'Personal pronoun' },
  { key: PartOfSpeech.PosessivePronoun, value: 'PosessivePronoun', text: 'Posessive pronoun' },
  { key: PartOfSpeech.Verb, value: 'Verb', text: 'Verb' },
];

export class POSConstraintProperty extends ConstraintElementProperty {
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
        Part of speech
        <Dropdown fluid multiple selection options={posOptions} value={this.props.currentElement.partOfSpeech.map((el) => el.name)}
          onChange={(e, data) => this.handleDropdownChange(data, posOptions, 'partOfSpeech')} />
      </div>
    );
  }
}