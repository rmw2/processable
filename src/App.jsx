import React from 'react';
import ReactDOM from 'react-dom';
import ProcessContainer from './ProcessView.jsx';
import { uploadAndAssemble } from './Assembler.js';

const { fibonacci } = require('./TestProcesses.js');
const { Process } = require('./Process.js');


// Loading example program(s)
document.getElementById('load-fib').onclick = function loadFib() {
  let p = new Process(fibonacci.text, fibonacci.labels);

	ReactDOM.render(
		React.createElement(ProcessContainer, {process: p}), 
		document.getElementById('root')
	);
}

// Upload button
document.getElementById('upload').onchange = uploadAndAssemble;
