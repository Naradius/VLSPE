'use strict';
import React, { Component } from "react";
import TextAnalyzer from "../../../analyzers/textanalyzer.js";
import LSPLParser from "../../../analyzers/lsplParser.js";
import { Dropdown, Menu } from 'semantic-ui-react';
import CAFETIEREGenerator from "../../../analyzers/japeGenerator.js";
import JAPEGenerator from "../../../analyzers/japeGenerator.js";

export default class TransformationMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.state.currentType = "";

        this.handleFromCafetiere = this.handleFromCafetiere.bind(this);
        this.handleFromLspl = this.handleFromLspl.bind(this);
        this.handleToJape = this.handleToJape.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.handleFileDownload = this.handleFileDownload.bind(this);
    }

    handleFromCafetiere() {
        $('#transform-from').trigger('click');
        this.setState({ currentType: "cafetiere" });
    }

    handleFromLspl() {
        $('#transform-from').trigger('click');
        this.setState({ currentType: "lspl" });
    }

    handleToJape() {
        var element = document.createElement('a');
        const jgen = new JAPEGenerator(this.props.elements);
        const text = jgen.process();
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', 'result');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    runAnalysis(content) {
        const analyzer = new TextAnalyzer(content, this.state.currentType);
        var elements = analyzer.process();
        const hasErrors = analyzer.hasErrors;
        elements = (hasErrors) ? [] : elements;
        const listing = analyzer.exception;
        
        this.props.handleAnalyzeResult({listing: listing, elements: elements});
    }

    handleFileUpload(e) {
        const file = e.target.files[0]; 
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');

        reader.onload = readerEvent => {
            const content = readerEvent.target.result;
            this.runAnalysis(content);
        }

        $('#transform-from').val(null);
    }

    handleFileDownload(e) {
        // const file = e.target.files[0]; 
        // const reader = new FileWriter();
        // reader.readAsText(file, 'UTF-8');

        // reader.onload = readerEvent => {
        //     const content = readerEvent.target.result;
        //     this.runAnalysis(content);
        // }

        // $('#transform-from').val(null);
    }

    render() {
        return (
            <div>
                <input id="transform-from" type="file" name="name" style={{ display: "none" }} onChange={this.handleFileUpload} />
                <Dropdown text='Transformation' pointing className='link item'>
                    <Dropdown.Menu>
                        <Dropdown.Item>
                            <Dropdown text='From'>
                                <Dropdown.Menu>
                                    {/* <Dropdown.Item>JAPE</Dropdown.Item> */}
                                    <Dropdown.Item onClick={this.handleFromCafetiere}>CAFETIERE</Dropdown.Item>
                                    <Dropdown.Item onClick={this.handleFromLspl}>LSPL</Dropdown.Item>
                                    {/* <Dropdown.Item>WHISK</Dropdown.Item>
                                    <Dropdown.Item>HIEL</Dropdown.Item>
                                    
                                    <Dropdown.Item>DSTL</Dropdown.Item>
                                    <Dropdown.Item>Tomita</Dropdown.Item> */}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Dropdown.Item>
                        <Dropdown.Item>
                            <Dropdown text='To'>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={this.handleToJape}>JAPE</Dropdown.Item>
                                    {/* <Dropdown.Item>CAFETIERE</Dropdown.Item>
                                    <Dropdown.Item>WHISK</Dropdown.Item>
                                    <Dropdown.Item>HIEL</Dropdown.Item>
                                    <Dropdown.Item>LSPL</Dropdown.Item>
                                    <Dropdown.Item>DSTL</Dropdown.Item>
                                    <Dropdown.Item>Tomita</Dropdown.Item> */}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        );
    }
}