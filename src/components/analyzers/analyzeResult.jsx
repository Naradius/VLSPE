'use strict';
import React, { Component } from "react";
import { Modal, Header, Button } from 'semantic-ui-react';

export default class AnalyzeResult extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };

    this.close = this.close.bind(this);
  }

  close() {
    this.setState({ open: false });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.open && !prevState.open) {
      this.setState({open: true});
      this.props.onResultShowed();
    }
  }

  render() {
    return (
        <Modal open={this.state.open}>
          <Modal.Header>Analysis Result</Modal.Header>
          <Modal.Content scrolling>
            <Modal.Description>
              <Header>Listing</Header>
              <div id="listing" className="description" style={{whiteSpace: "pre-wrap", fontFamily: "monospace"}}>{this.props.listing}</div>
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button negative onClick={this.close}>
              Close
            </Button>
          </Modal.Actions>
        </Modal>
    );
  }
}