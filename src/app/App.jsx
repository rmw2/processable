import React from 'react';
import ReactDOM from 'react-dom';

import ProcessContainer from './ProcessView.jsx';
import NavBar from './NavBar.jsx';
import { Assembly } from '../vm/Assembler.js';
import { Process } from '../vm/Process.js';

import './style.css';
import './reset.css';
import './home.css';

// Names of sample files
const examples = [
  'euclid.s',
  'euclidopt.s',
  'hello.s',
  'fibonacci.s',
  'uppercase.s',
  'power.s'
];

/**
 * The main application
 */
const App = ({examples}) => (
  <div id="app">
    <NavBar/>
    <main className="home">
      <section id="welcome">
        <div className="feature-text">
          Welcome to <b>processable</b>, a visual student's debugger for x86-64.
          This is the <i>unstable, bleeding edge</i> of the application which is
          still under active development.  Feel free to explore, but note that
          many things are still broken.  For more info, you can check out the code
          on <a href="http://github.com/rmw2/processable">github</a>, read my thoughts
          about the project <a href="http://robwhitaker.xyz/blog/">here</a>,
          or get in contact with me at rmw2<span className="at"></span>princeton.edu.
        </div>
      </section>
      <section id="option-upload">
        <h2>Select an Assembly file to debug (in AT&amp;T Syntax)</h2>
        <div className="load-buttons">
          <label className="file" htmlFor="upload">
            <input id="upload"
              className="file"
              name="inputfile"
              type="file"
              onChange={uploadAndAssemble}/> upload file
          </label>
        </div>
      </section>
      <section id="option-example">
        <h2>Or load an example:</h2>
        <div className="load-buttons">
          {examples.map((name, idx) =>
            <span>
              <button key={name}
                className="example"
                onClick={() => fetchAndAssemble(name)}>
                {name}
              </button>
              {(idx % 3 == 2) ? <br /> : null}
            </span>
          )}
        </div>
      </section>
    </main>
  </div>
);

/**
 *
 */
function loadText(text, filename='') {
  let asm = new Assembly(text);
  let {image, labels} = asm.link();
  let p = new Process(image, labels);

  ReactDOM.render(
    React.createElement(ProcessContainer, {
      process: p,
      restart: () => loadText(text),
      filename
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
      loadText(client.responseText, name);
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
  let reader = new FileReader();
  reader.onload = () => loadText(reader.result);
  reader.readAsText(event.target.files[0]);
  console.log(event.target.value);
}

// Render the chooser
ReactDOM.render(React.createElement(App, {examples}), document.getElementById('root'));