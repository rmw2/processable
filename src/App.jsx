import React from 'react';
import ReactDOM from 'react-dom';
import ProcessContainer from './ProcessView.jsx';
import { assemble } from './Assembler.js';

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
document.getElementById('upload').onchange = function assembleAndRun(event) {
	let input = event.target;
	let reader = new FileReader();

	reader.onload = () => {
		// Assemble the text
		let text = reader.result;

		let {instructions, addresses, labels} = assemble(text);
		
		// Start the process
		let p = new Process(instructions, labels);

		// Render it up
		ReactDOM.render(
			React.createElement(ProcessContainer, {process: p}), 
			document.getElementById('root')
		);
	};

	reader.readAsText(input.files[0]);
}