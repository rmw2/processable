import React from 'react';
import RegisterContainer from './RegisterView.jsx';
import TextContainer from './TextView.jsx';
import StackContainer from './StackView.jsx';
import TabbedStaticContainer from './StaticView.jsx';
import Console from './ConsoleView.jsx';

export default class ProcessContainer extends React.Component {
  constructor(props) {
    super(props);

    this.step = this.step.bind(this);
    this.run = this.run.bind(this);
    this.toggleBreakpoint = this.props.process.toggleBreakpoint.bind(
      this.props.process);

    this.commands = commands.call(this.props.process, this);

    // Do some preprocessing of labels and figure out which VM areas they live in
    // TODO
  }

  componentDidMount() {
    this.refs.stdout.write('Type "run [arg1 arg2 ...]" to begin\n');
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

    return (
      <div className="process-container">
        <div id="controls" className="container">
          <div className="button-box">
            <div className="button-caption">restart</div>
            <button id="restart" className="control-button" onClick={this.props.restart}>&#8634;</button>
          </div>
          <div className="button-box">
            <div className="button-caption">step</div>
            <button id="step" className="control-button" onClick={this.step}>&#8677;</button>
          </div>
          <div className="button-box">
            <div className="button-caption">continue</div>
            <button id="continue" className="control-button" onClick={this.run}>&#10142;</button>
          </div>
        </div>
        <TextContainer
          pc={p.pc}
          text={p.mem.segments.text.data}
          labels={p.labeled}
          breakpoints={p.breakpoints}
          toggleBreakpoint={this.toggleBreakpoint} />
        <RegisterContainer
          regs={p.regs}
          flags={p.regs.flags} />
        <StackContainer
          mem={p.mem.segments.stack.data}
          origin={p.stackOrigin}
          rsp={+p.regs.read('rsp')}
          rbp={+p.regs.read('rbp')} />
        <TabbedStaticContainer
          segments={p.mem.segments}
          labeled={p.labeled} />
        <Console
          ref="stdout"
          io={p.io}
          commands={this.commands} />
      </div>
    );
  }
}

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