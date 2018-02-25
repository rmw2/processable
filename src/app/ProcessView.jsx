import React from 'react';

import RegisterContainer from './RegisterView.jsx';
import TextContainer from './TextView.jsx';
import StackContainer from './StackView.jsx';
import TabbedStaticContainer from './StaticView.jsx';
import Console from './ConsoleView.jsx';

import './layout.css';
import './nav.css';

/**
 * Commands that the console should respond to
 * @param {React.Component} view -- the top-level component which will
 * respond to the commands
 *
 * @this should be the process object being monitored by the component
 */
const commands = function (view) {
  return {
    run: (argv) => {
      this.exec(argv);
      view.forceUpdate();
    },
    restart: () => {
      view.props.restart();
      view.forceUpdate();
    }
  };
};

/**
 * @classdesc
 * The main component class for the debugger. Holds an inferior process
 * and renders visual components that display the state of the inferior.
 *
 * Implements an error boundary that catches javascript errors and prints
 * them to the inferior's stderr stream
 */
export default class ProcessContainer extends React.Component {
  constructor(props) {
    super(props);

    this.step = this.step.bind(this);
    this.run = this.run.bind(this);

    this.bindToProcess(this.props.process);


  }

  componentWillReceiveProps(props) {
    this.bindToProcess(props.process);
    this.refs.console.clear();
  }

  /**
   * Do any administration and binding between the process
   * and the react component.  Specifically make sure that
   * the controls and breakpoint ui elements will interact with the
   * correct methods on the process object
   */
  bindToProcess(p) {
    this.toggleBreakpoint = p.toggleBreakpoint.bind(p);
    this.commands = commands.call(p, this);
    // Do some preprocessing of labels and figure out which VM areas they live in
    // TODO
  }

  /**
   * Single step the process
   */
  step() {
    try {
      this.props.process.step();
    } catch (e) {
      this.displayError(e);
    }

    // TODO: come up with a clever way to keep track of things that have changed
    // and only redraw those things.  It seems like react wouldn't really be able to
    // figure it out because most change lies deep within objects, unless the process
    // object kept track of changes on itself
    this.forceUpdate();
  }

  /**
   * Run the process continuously as long as it is not blocked and has not hit
   * a breakpoint
   */
  run() {
    try {
      this.props.process.run();
    } catch (e) {
      this.displayError(e);
    }

    // Make sure we update the view
    this.forceUpdate();
  }

  /**
   * Error handling for internal/react errors
   * Should print a different and more apologetic message at some point
   */
  componentDidCatch(error) {
    this.displayError(error);
  }

  /**
   * Error handling for errors in code running on the VM
   * Print the error to the screen and try to give as much information as possible
   */
  displayError(e) {
    // Write it to the console....
    this.props.process.io.stderr.write(`${e}`);
    throw e;
  }

  render() {
    let p = this.props.process;

    let controls = {
      step: this.step,
      run: this.run,
      restart: this.props.restart,
      blocked: p.blocked,
    };

    return (
      <div id="wrapper">
        <ProcessNav {...controls} />
        <main>
          <TextContainer
            pc={p.pc}
            text={p.mem.segments.text.data}
            labels={p.labeled}
            breakpoints={p.breakpoints}
            toggleBreakpoint={this.toggleBreakpoint} />
          <RegisterContainer
            regs={p.regs}
            flags={p.regs.flags} />
          <TabbedStaticContainer
            segments={p.mem.segments}
            labeled={p.labeled} />
          <Console
            ref="console"
            io={p.io}
            commands={this.commands} />
          <StackContainer
            mem={p.mem.segments.stack.data}
            origin={p.stackOrigin}
            rsp={+p.regs.read('rsp')}
            rbp={+p.regs.read('rbp')} />
        </main>
      </div>
    );
  }
}

/**
 * The navbar for the app.  Put the
 */
const ProcessNav = ({restart, step, run, blocked}) => {
  return (
    <nav className="process-nav">
      <div id="controls">
        <div className="button-box">
          {/*<div className="button-caption">restart</div>*/}
          <button id="restart" className="control-button" onClick={restart}>&#8634;</button>
        </div>
        <div className="button-box">
          {/*<div className="button-caption">step</div>*/}
          <button id="step" className="control-button" disabled={blocked} onClick={step}>&#8677;</button>
        </div>
        <div className="button-box">
          {/*<div className="button-caption">continue</div>*/}
          <button id="continue" className="control-button" disabled={blocked} onClick={run}>&#10142;</button>
        </div>
      </div>
      <div id="navigation">
        <div className="nav-box">help</div>
        <div className="nav-box">about</div>
        <div className="nav-box"
          onClick={() => window.location.href = 'http://github.com/rmw2/processable'}>github</div>
      </div>
    </nav>
  );
}
