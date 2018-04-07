import React from 'react';
import ReactTooltip from 'react-tooltip';

import NavBar from './NavBar.jsx';
import AboutPage from './About.jsx';
import RegisterContainer from './RegisterView.jsx';
import TextContainer from './TextView.jsx';
import StackContainer from './StackView.jsx';
import TabbedStaticContainer from './StaticView.jsx';
import Heap from './Heap.jsx';
import Console from './ConsoleView.jsx';
import commands from './Debugger.js';

import './layout.css';
import './nav.css';

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

    this.state = {
      about: false,
      showHeap: false,
    }

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
    if (!this.props.process.pc) {
      this.props.process.io.stderr.write('process not running');
      return;
    }

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
    if (!this.props.process.pc) {
      this.props.process.io.stderr.write('process not running');
      return;
    }

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
    this.props.process.lib.exit(1);
    this.forceUpdate();
    throw e;
  }

  render() {
    let p = this.props.process;
    let {about, showHeap} = this.state;

    let controls = {
      step: this.step,
      run: this.run,
      restart: this.props.restart,
      blocked: p.blocked,
    };

    return (
      <div id="app">
        <NavBar showAbout={() => this.setState({about: !about})}>
          <ProcessControls {...controls} />
        </NavBar>
        <main className={`process ${showHeap ? 'with-heap' : ''}`}>
          <TextContainer
            pc={p.pc}
            text={p.mem.segments.text.data}
            labels={p.labeled}
            breakpoints={p.breakpoints}
            toggleBreakpoint={this.toggleBreakpoint} />
          <TabbedStaticContainer
            segments={p.mem.segments}
            labeled={p.labeled}/>
          <Console
            ref="console"
            forceUpdate={this.forceUpdate.bind(this)}
            io={p.io}
            signals={p.signals}
            commands={this.commands} />
          <RegisterContainer
            regs={p.regs}
            flags={p.regs.flags} />
          <StackContainer
            mem={p.mem.segments.stack.data}
            origin={p.stackOrigin}
            rsp={+p.regs.read('rsp')}
            rbp={+p.regs.read('rbp')} />
          <button id="heap-toggle"
            onClick={() => this.setState({showHeap: !showHeap})}>heap</button>
          <Heap
            show={showHeap}
            heap={p.mem.segments.heap.data}
            start={p.mem.segments.heap.lo}
            brk={p.mem.segments.heap.hi} />
        </main>
        {about && <AboutPage close={() => this.setState({about: false})}/>}
      </div>
    );
  }
}

/**
 * The Controls for a process.
 */
const ProcessControls = ({restart, step, run, blocked}) => {
  return (
    <div id="controls">
      <div className="button-box">
        {/*<div className="button-caption">restart</div>*/}
        <button id="restart" data-tip='restart'
          className="control-button" onClick={restart}>&#8634;</button>
      </div>
      <div className="button-box">
        {/*<div className="button-caption">step</div>*/}
        <button id="step" data-tip='step'
          className="control-button" disabled={blocked} onClick={step}>&#8677;</button>
      </div>
      <div className="button-box">
        {/*<div className="button-caption">continue</div>*/}
        <button id="continue" data-tip='continue'
          className="control-button" disabled={blocked} onClick={run}>&#10142;</button>
      </div>
      <ReactTooltip multiline
        delayShow={500}
        className="tooltip" 
        type="light" 
        effect="solid" 
        globalEventOff="click"/>
    </div>
  );
};