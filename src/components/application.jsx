'use strict';
import React, { Component } from "react";
import TopMenu from "./topMenu.jsx";
import MainPane from "./mainPane.jsx";
import AnalyzeResult from "./analyzers/analyzeResult.jsx";

export default class Application extends Component {
  constructor(props) {
    super(props);    
    this.state = { 
      showAnalyzeResult: false,
      elements: [],
      clearElements: false,
      analyzeResult: {}
    };

    this.onAnalyzeResult = this.onAnalyzeResult.bind(this);
    this.onNewFile = this.onNewFile.bind(this);
    this.onElsCleared = this.onElsCleared.bind(this);
    this.handleElementDelete = this.handleElementDelete.bind(this);
    this.handleResultShowed = this.handleResultShowed.bind(this);
    this.handleElsClearedHere = this.handleElsClearedHere.bind(this);
  }

  onAnalyzeResult(result) {
    this.setState({analyzeResult: result, clearElements: true });
  }

  handleResultShowed() {
    this.setState({showAnalyzeResult: false, analyzeResult: {} });
  }

  onNewFile() {
    this.setState({clearElements: true});
  }

  onElsCleared() {
    this.setState({elements: [], clearElements: false});
  }

  handleElsClearedHere() {
    if (this.state.analyzeResult && this.state.analyzeResult.elements) {
      this.setState({elements: this.state.analyzeResult.elements, listing: this.state.analyzeResult.listing});
      if (!!this.state.analyzeResult.listing) {
        this.setState({showAnalyzeResult: true});
      } else {
        this.setState({showAnalyzeResult: false, analyzeResult: {}});
      }
    }
  }

  handleElementDelete(element) {
    const newEls = this.state.elements.filter((el) => {
      return el !== element;
    });
    this.setState({elements: newEls});
  }

  render() {
    return (
      <div> 
        <AnalyzeResult open={this.state.showAnalyzeResult} onResultShowed={this.handleResultShowed} listing={this.state.listing} symbols={this.state.symbols} />
        <TopMenu handleNewFile={this.onNewFile} handleAnalyzeResult={this.onAnalyzeResult} elements={this.state.elements} />
        <MainPane elements={this.state.elements} onElementDeleted={this.handleElementDelete} onElementsCleared={this.handleElsClearedHere} clearElements={this.state.clearElements} afterClear={this.onElsCleared} />
      </div>
    );
  }
}