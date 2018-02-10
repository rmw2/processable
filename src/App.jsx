import React from 'react';
import ReactDOM from 'react-dom';
import ProcessContainer from './ProcessView.jsx';
import { Assembly } from './Assembler.js';
import { Process } from './Process.js';

const examples = require('./TestProcesses.js');
const exnames = ['fibonacci', 'hello'];


// Loading example program(s)
for (let ex of exnames) {
  document.getElementById(ex).onclick = function () {
    let p = new Process(examples[ex].image, examples[ex].labels);

    ReactDOM.render(
      React.createElement(ProcessContainer, {process: p}), 
      document.getElementById('root')
    );
  }
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