import React from 'react';
import ReactDOM from 'react-dom';
import ProcessContainer from './ProcessContainer.jsx';

const { fibonacci } = require('./TestProcesses.js');
const { Process } = require('./Process.js');

let p = new Process(fibonacci.text, fibonacci.labels);

ReactDOM.render(
	<ProcessContainer process={p}/>,
	document.getElementById('root')
);
