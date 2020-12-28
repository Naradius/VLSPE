'use strict';
import React, { Component } from "react";
import Canvas from "./canvas.jsx";
import ElementsMenu from "./elementsMenu.jsx";
import PropertiesBlock from "./propertiesBlock.jsx";
import { RuleElementModel } from "./canvas/ruleElement.jsx";
import { BasicPatternModel } from "./canvas/patterns/basicPattern.jsx";
import { AlternativePatternModel } from "./canvas/patterns/alternativePattern.jsx";
import { RepetitionPatternModel } from "./canvas/patterns/repetitionPattern.jsx";
import { POSConstraintModel } from "./canvas/constraints/posConstraint.jsx";
import { RuleConstraintModel } from "./canvas/constraints/ruleConstraint.jsx";
import { TokenConstraintModel } from "./canvas/constraints/tokenConstraint.jsx";
import { OrthographyConstraintModel } from "./canvas/constraints/orthConstraint.jsx";
import { MorphologyConstraintModel } from "./canvas/constraints/morphConstraint.jsx";

export default class MainPane extends Component {
  constructor(props) {
    super(props);

    const anchors = [[0.5, 0, 0, -1],
    [1, 0.5, 1, 0],
    [0.5, 1, 0, 1],
    [0, 0.5, -1, 0],
    [1, 0, 0, -1],
    [1, 1, 0, 1],
    [0, 1, -1, 0],
    [0, 0, 1, 0]
  ];

    this.state = {
      isCreatingConnection: false,
      currentScope: 'sequence',
      nextId: 0,
      elements: [],
      instance: jsPlumb.getInstance({
        DragOptions: { cursor: 'pointer', zIndex: 2000 },
        PaintStyle: { stroke: '#000' },
        ConnectorStyle: {
          lineWidth: 4,
          strokeStyle: "#216477",
          outlineWidth: 2,
          outlineColor: "white"
        },
        EndpointHoverStyle: { fill: "orange" },
        HoverPaintStyle: { stroke: "orange" },
        EndpointStyle: { width: 20, height: 16, stroke: '#000' },
        Endpoint: "Rectangle",
        Anchors: anchors,
        Container: "canvas"
      })
    };
    this.state.instance.Anchors = anchors;
    this.state.instance.ArrowOverlay = [
      ["Arrow", {
          location: 1,
          id: "arrow",
          length: 14,
          foldback: 0.8,
      }]
  ];

    const aggrConType = {
      endpoint: ["Dot", { radius: 1 }],
      connector: "Straight",
      anchor: anchors,
      scope: "aggregation",
      connectorStyle: { stroke: "#000", strokeWidth: 3, outlineStroke: "transparent", outlineWidth: 2 },
    };
    const seqConType = {
      endpoint: ["Dot", { radius: 1 }],
      connector: "Straight",
      anchor: anchors,
      scope: "sequence",
      connectorStyle: { stroke: "#000", strokeWidth: 1, outlineStroke: "transparent", outlineWidth: 2 },
    };
    this.state.instance.registerConnectionType("aggregation", aggrConType);
    this.state.instance.registerConnectionType("sequence", seqConType);

    const _this = this;
    this.state.instance.bind("connection", function () {
      _this.relationshipCreationFinished();
    });

    this.state.instance.bind("connectionAborted", function () {
      _this.relationshipCreationFinished();
    });

    this.state.instance.bind("click", function (e) {
      _this.relationshipClick(e);
    });

    this.deleteElement = this.deleteElement.bind(this);
    this.deleteElementConnection = this.deleteElementConnection.bind(this);
    this.createElement = this.createElement.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.createRelationship = this.createRelationship.bind(this);
    this.handleElementClick = this.handleElementClick.bind(this);
    this.handlePropertyChange = this.handlePropertyChange.bind(this);
    this.connectionCreated = this.connectionCreated.bind(this);
  }

  componentDidMount() {
    $(document).keydown(this.handleKeyPress);
  }

  componentDidUpdate(prevProps) {
    if (this.props.elements && prevProps.elements !== this.props.elements) {
      //this.setState({nextId: this.props.elements.length});
    }

    if (!this.props.clearElements && prevProps.clearElements) {
      this.props.onElementsCleared();
    }

    if (this.props.clearElements && !prevProps.clearElements) {
      const this1 = this;
      this.props.elements.forEach((el) => {
        this1.deleteElement(el);
      });
      this.forceUpdate();

      this.props.afterClear();
    }
  }

  handleKeyPress(event) {
    if (event.keyCode == 46) {
      const elementId = this.state.selectedId;
      const element = this.props.elements.find((el) => {
        return el.uuid === elementId;
      });
      if (element) {
        this.deleteElement(element);
        this.props.onElementDeleted(element);
        this.forceUpdate();
      }      
    }
  }

  relationshipClick(e) {
    this.connectionRemoved(e);
    this.state.instance.deleteConnection(e);
  }

  handleElementClick(id) {
    this.setState({selectedId: id});
  }

  createElement(type) {
    const nextId = this.state.nextId;
    let element;
    switch (type)
    {
      case "rule":
        element = new RuleElementModel(nextId, 5, 5);
          break;
      case "basicPattern":
        element = new BasicPatternModel(nextId, 5, 5);
          break;
      case "alternativePattern":
        element = new AlternativePatternModel(nextId, 5, 5);
          break;
      case "repetitionPattern":
        element = new RepetitionPatternModel(nextId, 5, 5);
          break;
      case "posConstraint":
        element = new POSConstraintModel(nextId, 5, 5);
          break;
      case "ruleConstraint":
        element = new RuleConstraintModel(nextId, 5, 5);
            break;
      case "tokenConstraint":
        element = new TokenConstraintModel(nextId, 5, 5);
            break;
      case "orthConstraint":
        element = new OrthographyConstraintModel(nextId, 5, 5);
            break;
      case "morphConstraint":
        element = new MorphologyConstraintModel(nextId, 5, 5);
            break;
      default:
          break;
    }
    this.props.elements.push(element);
    this.setState({nextId: nextId + 1});
  }
  
  handlePropertyChange(property, value) {
    const selectedId = this.state.selectedId;
    const currentElement = this.props.elements.find(function (el) {
      return el.uuid == selectedId;
    });
    currentElement[property] = value;
    this.forceUpdate();
  }

  renderElement(elementDef) {
    return elementDef.render(this.state.selectedId, this.state.instance, 
      this.handleElementClick, this.state.isCreatingConnection,
      this.state.currentScope, this.connectionCreated);
  }

  connectionRemoved(connection) {
    const type = connection.scope,
      sourceId = connection.sourceId.split('_')[1],
      targetId = connection.targetId.split('_')[1];

    const sourceEl = this.props.elements.find((el) => {return el.uuid === sourceId;});
    const targetEl = this.props.elements.find((el) => {return el.uuid === targetId;});
    if (type === 'aggregation') {
      targetEl.aggregation = targetEl.aggregation.filter(function (x, i) {
        return x !== sourceEl;
      });
    } else {
      sourceEl.sequence = sourceEl.sequence.filter(function (x, i) {
        return x !== targetEl;
      });
    }
  }

  connectionCreated(type, source, target) {
    const sourceId = source.split('_')[1];
    const targetId = target.split('_')[1];

    const sourceEl = this.props.elements.find((el) => {return el.uuid === sourceId;});
    const targetEl = this.props.elements.find((el) => {return el.uuid === targetId;});
    if (type === 'aggregation') {
      targetEl.aggregation.push(sourceEl);
    } else {
      sourceEl.sequence.push(targetEl);
    }
  }

  deleteElement(element) {
    this.deleteElementConnection(element);
  }

  deleteElementConnection(element) {
    const $element = $('#element_' + element.uuid);
    const conns = this.state.instance.getAllConnections();
    const connarr = [];
    conns.forEach(v => {connarr.push(v)});
    connarr.forEach(v => {
      if (v.targetId == $element[0].id || v.sourceId == $element[0].id)
      {
        const sourceId = v.sourceId.split('_')[1];
        const targetId = v.targetId.split('_')[1];

        const sourceEl = this.props.elements.find((el) => {return el.uuid === sourceId;});
        const targetEl = this.props.elements.find((el) => {return el.uuid === targetId;});

        if (v.sourceId != $element[0].id) {
          sourceEl.sequence = sourceEl.sequence.filter((el) => {return el !== targetEl;});
          sourceEl.aggregation = sourceEl.aggregation.filter((el) => {return el !== targetEl;});
        }

        this.state.instance.deleteConnection(v);
      }
    });
  }

  createRelationship(type) {
    const elements = this.props.elements;
    const isCreatingConnection = this.state.isCreatingConnection;

    if (elements.length > 0 && !isCreatingConnection) {
      this.setState({isCreatingConnection: true, currentScope: type});
    }
  }

  relationshipCreationFinished() {
    if (this.state.isCreatingConnection) {
        this.setState({isCreatingConnection: false});
    }
  }

  render() {
    const elements = (this.props.elements == null) ? [] : this.props.elements.map((el) => {
      return this.renderElement(el);
    });
    const selectedId = this.state.selectedId;
    const currentElementModel = (this.props.elements == null) ? null : this.props.elements.find(function (el) {
      return el.uuid == selectedId;
    });
    return (
      <div className="ui segment">
          <div className="ui two column equal width grid">
            <div className="two wide column">
                <ElementsMenu onCreateElement={this.createElement} onCreateRelationship={this.createRelationship} />
                <PropertiesBlock currentElement={currentElementModel} onPropertyChange={this.handlePropertyChange} />
            </div>
            <Canvas>
              {elements}
            </Canvas>
          </div>
      </div>
    );
  }
}