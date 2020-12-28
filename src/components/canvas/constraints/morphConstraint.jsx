'use strict';
import React, { Component } from "react";
import {Enum} from 'enumify';
import ConstraintElement, { ConstraintElementProperty } from "./constraintElement.jsx";
import { Dropdown } from 'semantic-ui-react';
import UUIDGenerator from "../../../uuid.js";

export class MorphTense extends Enum {}
MorphTense.initEnum(['Infinitive', 'Future', 'Past', 'Present']);

export class MorphPerson extends Enum {}
MorphPerson.initEnum(['First', 'Second', 'Third']);

export class MorphNumber extends Enum {}
MorphNumber.initEnum(['Plural', 'Singular']);

export class MorphGender extends Enum {}
MorphGender.initEnum(['Femine', 'Masculine', 'Neuter']);

export class MorphCase extends Enum {}
MorphCase.initEnum(['Accusative', 'Dative', 'Genetive', 'Instrumental', 'Nominative', 'Prepositional', 'Uninflicted']);

export class MorphAnima extends Enum {}
MorphAnima.initEnum(['Animate', 'Inanimate']);

export class MorphologyConstraintModel {
  constructor(id, x, y) {
    this.id = id;
    this.uuid = UUIDGenerator.uuidv4();
    this.x = x;
    this.y = y;
    this.type = 'MorphologyConstraintModel';
    this.tense = [ MorphTense.Infinitive ];
    this.person = [ MorphPerson.First ];
    this.number = [ MorphNumber.Singular ];
    this.gender = [ MorphGender.Masculine ];
    this.case = [ MorphCase.Accusative ];
    this.anima = [ MorphAnima.Animate ];
    this.aggregation = [];
    this.sequence = [];
  }

  static getPropertiesType() {
    return <MorphologyConstraintProperty />;
  }

  render(selectedId, jsPlumb, handleElementClick, isCreatingConnection, currentScope, connectionCreated) {
    return <MorphologyConstraint key={this.id} id={this.uuid} x={this.x} y={this.y}
    tense={this.tense} person={this.person} number={this.number} gender={this.gender}
    case={this.case} anima={this.anima} isSelected={this.uuid == selectedId} jsPlumb={jsPlumb}
    onElementClick={handleElementClick} isCreatingConnection={isCreatingConnection}
    relationScope={currentScope} sequence={this.sequence} aggregation={this.aggregation} connectionCreated={connectionCreated}/>;
  }
}

export default class MorphologyConstraint extends ConstraintElement {   
  constructor(props) {
    super(props);
    
    this.state.cssClass = this.state.cssClass + ' morphConstraint';
  }

  render() {
    const tense = (this.props.tense != undefined) ? 
      this.props.tense.map(x => x.name.replace(/([A-Z])/g, ' $1').trim()).join(', ') : 
      this.state.tense.map(x => x.name.replace(/([A-Z])/g, ' $1').trim()).join(', ');
    const person = (this.props.tense != undefined) ? 
      this.props.person.map(x => x.name.replace(/([A-Z])/g, ' $1').trim()).join(', ') : 
      this.state.person.map(x => x.name.replace(/([A-Z])/g, ' $1').trim()).join(', ');
    const number = (this.props.tense != undefined) ? 
      this.props.number.map(x => x.name.replace(/([A-Z])/g, ' $1').trim()).join(', ') : 
      this.state.number.map(x => x.name.replace(/([A-Z])/g, ' $1').trim()).join(', ');
    const gender = (this.props.tense != undefined) ? 
      this.props.gender.map(x => x.name.replace(/([A-Z])/g, ' $1').trim()).join(', ') : 
      this.state.gender.map(x => x.name.replace(/([A-Z])/g, ' $1').trim()).join(', ');
    const cased = (this.props.tense != undefined) ? 
      this.props.case.map(x => x.name.replace(/([A-Z])/g, ' $1').trim()).join(', ') : 
      this.state.case.map(x => x.name.replace(/([A-Z])/g, ' $1').trim()).join(', ');
    const anima = (this.props.tense != undefined) ? 
      this.props.anima.map(x => x.name.replace(/([A-Z])/g, ' $1').trim()).join(', ') : 
      this.state.anima.map(x => x.name.replace(/([A-Z])/g, ' $1').trim()).join(', ');
    return (
    <div id={this.state.id} className={"element " + this.state.cssClass + ((!!this.props.isSelected) ? " selected" : "")} onClick={this.handleElementClick}>
    <div>{tense}</div>
    <div>{person}</div>
    <div>{number}</div>
    <div>{gender}</div>
    <div>{cased}</div>
    <div>{anima}</div>
    </div>
    );
  }
}

const tenseOptions = [
  { key: MorphTense.Infinitive, value: 'Infinitive', text: 'Infinitive' },
  { key: MorphTense.Future, value: 'Future', text: 'Future' },
  { key: MorphTense.Past, value: 'Past', text: 'Past' },
  { key: MorphTense.Present, value: 'Present', text: 'Present' },
];

const personOptions = [
  { key: MorphPerson.First, value: 'First', text: 'First' },
  { key: MorphPerson.Second, value: 'Second', text: 'Second' },
  { key: MorphPerson.Third, value: 'Third', text: 'Third' },
];

const numberOptions = [
  { key: MorphNumber.Plural, value: 'Plural', text: 'Plural' },
  { key: MorphNumber.Singular, value: 'Singular', text: 'Singular' },
];

const genderOptions = [
  { key: MorphGender.Femine, value: 'Femine', text: 'Femine' },
  { key: MorphGender.Masculine, value: 'Masculine', text: 'Masculine' },
  { key: MorphGender.Neuter, value: 'Neuter', text: 'Neuter' },
];

const caseOptions = [
  { key: MorphCase.Accusative, value: 'Accusative', text: 'Accusative' },
  { key: MorphCase.Dative, value: 'Dative', text: 'Dative' },
  { key: MorphCase.Genetive, value: 'Genetive', text: 'Genetive' },
  { key: MorphCase.Instrumental, value: 'Instrumental', text: 'Instrumental' },
  { key: MorphCase.Nominative, value: 'Nominative', text: 'Nominative' },
  { key: MorphCase.Prepositional, value: 'Prepositional', text: 'Prepositional' },
];

const animaOptions = [
  { key: MorphAnima.Animate, value: 'Animate', text: 'Animate' },
  { key: MorphAnima.Inanimate, value: 'Inanimate', text: 'Inanimate' },
];

export class MorphologyConstraintProperty extends ConstraintElementProperty {
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
        Tense
        <Dropdown fluid multiple selection value={this.props.currentElement.tense.map((el) => el.name)} options={tenseOptions} 
          onChange={(e, data) => this.handleDropdownChange(data, tenseOptions, 'tense')} />
        Person
        <Dropdown fluid multiple selection value={this.props.currentElement.person.map((el) => el.name)} options={personOptions} 
          onChange={(e, data) => this.handleDropdownChange(data, personOptions, 'person')} />
        Number
        <Dropdown fluid multiple selection value={this.props.currentElement.number.map((el) => el.name)} options={numberOptions} 
          onChange={(e, data) => this.handleDropdownChange(data, numberOptions, 'number')} />
        Gender
        <Dropdown fluid multiple selection value={this.props.currentElement.gender.map((el) => el.name)} options={genderOptions} 
          onChange={(e, data) => this.handleDropdownChange(data, genderOptions, 'gender')} />
        Case
        <Dropdown fluid multiple selection value={this.props.currentElement.case.map((el) => el.name)} options={caseOptions} 
          onChange={(e, data) => this.handleDropdownChange(data, caseOptions, 'case')} />
        Anima
        <Dropdown fluid multiple selection value={this.props.currentElement.anima.map((el) => el.name)} options={animaOptions} 
          onChange={(e, data) => this.handleDropdownChange(data, animaOptions, 'anima')} />
      </div>
    );
  }
}