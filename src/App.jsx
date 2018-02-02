import React from 'react';
import ReactDOM from 'react-dom';
import ProcessContainer from './ProcessView.jsx';
import { Assembly } from './Assembler.js';

const { fibonacci } = require('./TestProcesses.js');
const { Process } = require('./Process.js');

// Loading example program(s)
document.getElementById('load-fib').onclick = function loadFib() {
  let p = new Process(fibonacci.image, fibonacci.labels);

	ReactDOM.render(
		React.createElement(ProcessContainer, {process: p}), 
		document.getElementById('root')
	);
}

// Upload button
document.getElementById('upload').onchange = function uploadAndAssemble() {
  let input = event.target;
  let reader = new FileReader();

  reader.onload = () => {
    // Assemble the text
    let text = reader.result;

    let asm = new Assembly(text);
    let {image, labels} = asm.link();

    // Start the process
    let p = new Process(image, labels);

    // Render it up
    ReactDOM.render(
      React.createElement(ProcessContainer, {process: p}), 
      document.getElementById('root')
    );
  };

  reader.readAsText(input.files[0]);
}