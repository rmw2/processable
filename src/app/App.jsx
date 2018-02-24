import React from 'react';
import ReactDOM from 'react-dom';
import ProcessContainer from './ProcessView.jsx';
import { Assembly } from '../vm/Assembler.js';
import { Process } from '../vm/Process.js';

// Names of sample files
const examples = [
  'euclid.s',
  'hello.s',
  'fibonacci.s'
];

/**
 * The main application
 */
const App = ({examples}) => (
  <div className="modal">
    <div className="modal-content">
      <div>Select an x86-64 Assembly file to debug (in AT&amp;T Syntax)</div>
      <div>
        <label className="file" htmlFor="upload">
          <input id="upload"
            className="file"
            name="inputfile"
            type="file"
            onChange={uploadAndAssemble}/> upload file
        </label>
      </div>
      <div>Or load an example:</div>
      <div>
        {examples.map((name) =>
          <button key={name} onClick={() => fetchAndAssemble(name)}>{name}</button>
        )}
      </div>
    </div>
  </div>
);

/**
 *
 */
function loadText(text) {
  let asm = new Assembly(text);
  let {image, labels} = asm.link();
  let p = new Process(image, labels);

  ReactDOM.render(
    React.createElement(ProcessContainer, {
      process: p,
      restart: () => loadText(text)
    }),
    document.getElementById('root')
  );
}

/**
 *
 */
function fetchAndAssemble(name) {
  let client = new XMLHttpRequest();
  client.open('GET', `samples/${name}`);

  client.onreadystatechange = () => {
    // Gotta wait for it to actually read, then unbind the handler
    if (client.responseText) {
      loadText(client.responseText);
      client.onreadystatechange = null;
    }
  }

  client.send();
}

/**
 * Upload a file, assemble it, and run
 *
 */
function uploadAndAssemble(event) {
  console.log(`Uploading file`)
  let input = event.target;
  let reader = new FileReader();
  reader.onload = () => loadText(reader.result);
  reader.readAsText(input.files[0]);
}

// Render the chooser
console.log('Rendering ze app');
ReactDOM.render(React.createElement(App, {examples}), document.getElementById('root'));