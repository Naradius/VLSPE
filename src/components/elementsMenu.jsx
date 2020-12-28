'use strict';
import React, { Component } from "react";
import { Dropdown, Menu } from 'semantic-ui-react';

export default class ElementsMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {  };

    this.createElement = this.createElement.bind(this);
  }

  createElement(type) {
    this.props.onCreateElement(type);
  }

  createRelationship(type) {
    this.props.onCreateRelationship(type);
  }

  render() {
    return (
      <Menu vertical>
        <Menu.Item onClick={(e) => this.createElement("rule")}>Rule</Menu.Item>
        <Dropdown text='Pattern Element' className='link item'>
          <Dropdown.Menu>
            <Dropdown.Item onClick={(e) => this.createElement("basicPattern")}>Basic</Dropdown.Item>
            <Dropdown.Item onClick={(e) => this.createElement("alternativePattern")}>Alternative</Dropdown.Item>
            <Dropdown.Item onClick={(e) => this.createElement("repetitionPattern")}>Repetition</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown text='Constraint' className='link item'>
          <Dropdown.Menu>
            <Dropdown.Item onClick={(e) => this.createElement("posConstraint")}>Part of speech</Dropdown.Item>
            <Dropdown.Item onClick={(e) => this.createElement("tokenConstraint")}>Token</Dropdown.Item>
            <Dropdown.Item onClick={(e) => this.createElement("ruleConstraint")}>Rule</Dropdown.Item>
            <Dropdown.Item onClick={(e) => this.createElement("orthConstraint")}>Orthography</Dropdown.Item>
            <Dropdown.Item onClick={(e) => this.createElement("morphConstraint")}>Morphology</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown text='Relationships' className='link item'>
          <Dropdown.Menu>
            <Dropdown.Item onClick={(e) => this.createRelationship("sequence")}>Sequence</Dropdown.Item>
            <Dropdown.Item onClick={(e) => this.createRelationship("aggregation")}>Aggregation</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Menu>
    );
  }
}