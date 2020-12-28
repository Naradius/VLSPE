'use strict';
import React, { Component } from "react";
import { Dropdown, Menu } from 'semantic-ui-react';
import TransformationMenu from "./menu/topMenu/transformationMenu.jsx";

export default class TopMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {  };

    this.onAnalyzeResult = this.onAnalyzeResult.bind(this);
    this.onNewFile = this.onNewFile.bind(this);
  }

  onAnalyzeResult(result) {
    this.props.handleAnalyzeResult(result);
  }

  onNewFile() {
    this.props.handleNewFile();
  }

  render() {
    return (
      <Menu>
        <Dropdown text='File' pointing className='link item'>
          <Dropdown.Menu>
            <Dropdown.Item onClick={this.onNewFile}>New</Dropdown.Item>
            <Dropdown.Item>Open</Dropdown.Item>
            <Dropdown.Item>Save</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <TransformationMenu handleAnalyzeResult={this.onAnalyzeResult} elements={this.props.elements} />
      </Menu>
    );
  }
}