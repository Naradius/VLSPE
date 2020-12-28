'use strict';
import React, { Component } from "react";
import {Enum} from 'enumify';

export class ConnectionType extends Enum {}
ConnectionType.initEnum(['Sequence', 'Aggregation']);

export default class LanguageElement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: `element_${this.props.id}`
    };

    this.handleElementClick = this.handleElementClick.bind(this);
    this.sequenceRelationBeforeDrop = this.sequenceRelationBeforeDrop.bind(this);
    this.aggregationRelationBeforeDrop = this.aggregationRelationBeforeDrop.bind(this);
  }

  componentDidMount() {
    const $element = $(`#${this.state.id}`);

    if (this.props.x) {
      $element.css('left', this.props.x);
    }
    if (this.props.y) {
      $element.css('top', this.props.y);
    }
    
    this.initJsPlumb();   
  }

  componentDidUpdate(prevProps) {
    const isCreatingConnection = this.props.isCreatingConnection,
      prevIsCreatingConnection = prevProps.isCreatingConnection;

    const jPlumb = this.props.jsPlumb;
    const $element = $(`#${this.state.id}`);

    if (isCreatingConnection !== prevIsCreatingConnection) {
      jPlumb.toggleDraggable($element);
    }

    if (isCreatingConnection) {
      const currentScope = this.props.relationScope;
      const otherScope = (this.props.relationScope == "sequence") ? "aggregation" : "sequence";

      jPlumb.setSourceEnabled($element, false, otherScope);
      jPlumb.setSourceEnabled($element, true, currentScope);
      jPlumb.setTargetEnabled($element, false, otherScope);
      jPlumb.setTargetEnabled($element, true, currentScope);
    } else {
      jPlumb.setSourceEnabled($element, false, "sequence");
      jPlumb.setSourceEnabled($element, false, "aggregation");
      jPlumb.setTargetEnabled($element, false, "sequence");
      jPlumb.setTargetEnabled($element, false, "aggregation");
    }
  }

  initJsPlumb() {
    const $element = $(`#${this.state.id}`);
    const jPlumb = this.props.jsPlumb;
    const anchor = jPlumb.Anchors;

    jPlumb.draggable($element, {
        grid: [5, 5]
    });

    jPlumb.makeSource($element, {
        endpoint: ["Blank", { radius: 1 }],
        connector: "Straight",
        anchor: anchor,
        scope: "sequence",
        connectorOverlays: jPlumb.ArrowOverlay,
        connectorStyle: { stroke: "#000", strokeWidth: 1, outlineStroke: "transparent", outlineWidth: 2 },
    }, {connectionType: "sequence"});

    jPlumb.makeTarget($element, {
        dropOptions: { hoverClass: "hover" },
        anchor: anchor,
        scope: "sequence",
        endpoint: ["Blank", { radius: 1 }],
        connectorOverlays: jPlumb.ArrowOverlay,
        beforeDrop: this.sequenceRelationBeforeDrop,
    }, {connectionType: "sequence"});

    jPlumb.makeSource($element, {
        endpoint: ["Blank", { radius: 1 }],
        connector: "Straight",
        anchor: anchor,
        scope: "aggregation",
        connectorStyle: { stroke: "#000", strokeWidth: 3, outlineStroke: "transparent", outlineWidth: 2 },
    }, {connectionType: "aggregation"});

    jPlumb.makeTarget($element, {
        dropOptions: { hoverClass: "hover" },
        anchor: anchor,
        scope: "aggregation",
        endpoint: ["Blank", { radius: 1 }],
        beforeDrop: this.aggregationRelationBeforeDrop,
    }, {connectionType: "aggregation"});

    const this1 = this;

    if (this.props.aggregation) {
      this.props.aggregation.forEach(function (agg) {
        const source = this1.state.id;
        jPlumb.connect({
          source: source,
          target: `element_${agg.uuid}`,
          type: 'aggregation'
        }, {
          scope: 'aggregation',
          connectionType: 'aggregation'
        });
      });
    }
    
    if (this.props.sequence) {
      this.props.sequence.forEach(function (seq) {
        const source = this1.state.id;
        jPlumb.connect({
          source:  source,
          target: `element_${seq.uuid}`,
          type: 'sequence'
        }, {
          scope: 'sequence',
          connectionType: 'sequence'
        });
      });
    }

    // if (this.props.rels) {
    //   const source = (this.props.rels.source != undefined) ? `element_${this.props.rels.source}` : this.state.id;
    //   jPlumb.connect({
    //     source:  source,
    //     target: `element_${this.props.rels.target}`,
    //     type: this.props.rels.type
    //   }, {
    //     scope: this.props.rels.type,
    //     connectionType: this.props.rels.type
    //   });
    // }
    
    setTimeout(function () {
      jPlumb.setTargetEnabled($element, false, "aggregation");
      jPlumb.setTargetEnabled($element, false, "sequence");
      jPlumb.setSourceEnabled($element, false, "aggregation");
      jPlumb.setSourceEnabled($element, false, "sequence");
    }, 10);
  }

  sequenceRelationBeforeDrop(params) {
    let source = $('#' + params.sourceId);
    let target = $('#' + params.targetId);
    const jPlumb = this.props.jsPlumb;
    let isProperTypeTarget = target.hasClass('patternEl');
    let isProperTypeSource = source.hasClass('patternEl') || source.hasClass('ruleEl');
    let hasConnections = jPlumb.getAllConnections().filter(function (val, i) {
      return (val.scope === "sequence" || val.targetId === params.targetId) && val.sourceId === params.sourceId;
    }).length > 0;

    const res = !hasConnections && params.sourceId !== params.targetId && isProperTypeSource && isProperTypeTarget;

    if (res && this.props.connectionCreated) {
      this.props.connectionCreated('sequence', params.sourceId, params.targetId);
    }

    return res;
  }

  aggregationRelationBeforeDrop(params) {
    let source = $('#' + params.sourceId);
    let target = $('#' + params.targetId);
    const jPlumb = this.props.jsPlumb;
    let isProperTypeAlt = (target.hasClass('alternativeElement') || target.hasClass('repetitionElement')) && source.hasClass('patternEl');
    let isProperTypeConst = target.hasClass('basicElement') && source.hasClass('constraintEl');
    let hasConnections = jPlumb.getAllConnections().filter(function (val, i) {
      return val.scope === "aggregation" && val.sourceId === params.sourceId;
    }).length > 0;

    const res = !hasConnections && params.sourceId !== params.targetId && (isProperTypeAlt || isProperTypeConst);

    if (res && this.props.connectionCreated) {
      this.props.connectionCreated('aggregation', params.sourceId, params.targetId);
    }

    return res;
  }

  handleElementClick(e) {
    this.props.onElementClick(this.props.id);
  }

  render() {
    const name = (this.props.name != undefined) ? this.props.name : this.state.name;
    return (
    <div id={this.state.id} className={"element " + this.state.cssClass + ((!!this.props.isSelected) ? " selected" : "")} onClick={this.handleElementClick}>{name}</div>
    );
  }
}