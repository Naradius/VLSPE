import React from "react";
import ReactDOM from "react-dom";
import Application from "./components/application.jsx";

import './semantic/semantic.min.css';
import './styles/jsplumbtoolkit-defaults.css';
import './styles/jsplumbtoolkit-demo.css';
import './styles/app.css';
import './styles/main.css';
import './semantic/components/dropdown.css';
import './semantic/components/modal.css';

import './jsplumb.min.js';

ReactDOM.render(<Application />, document.getElementById("root"));