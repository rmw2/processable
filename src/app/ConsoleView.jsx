import React from 'react';

import './console.css';

const Style = {
  NORMAL: {color: '#fff'},
  ERROR:  {color: '#f22'},
  HELP:   {color: '#abf', fontStyle: 'italic'}
};

export default class Console extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lines: [],
      prompt: '(pbl) ',
      interactive: true,
      placeholder: 'run arg1 arg2 ...'
    }

    // Buffers to maintain
    this.outbuf = '';
    this.inbuf = '';

    // Bind it up
    this.addLine    = this.addLine.bind(this);
    this.submitLine = this.submitLine.bind(this);
    this.focusInput = this.focusInput.bind(this);
    this.write      = this.write.bind(this);
    this.read       = this.read.bind(this);
    this.error      = this.error.bind(this);
    this.flush      = this.flush.bind(this);
    this.runCommand = this.runCommand.bind(this);

    // Take over the process' stdio
    this.props.io.stdout = this;
    this.props.io.stdin = this;
    this.props.io.stderr = {
      write: this.error
    };

    // Attach to the process' signal router
    this.signals = this.props.signals;
  }

  /**
   * Make sure that a new process gets its stdio taken over
   */
  componentWillReceiveProps(nextProps) {
    if (nextProps.io != this.props.io) {
      // Take over the process' stdio
      nextProps.io.stdout = this;
      nextProps.io.stdin = this;
      nextProps.io.stderr = {
        write: this.error
      };
    }
  }

  /**
   * Write a value to the buffer, flush after every newline
   */
  write(value) {
    let lines = (this.outbuf + value).split('\n');

    for (let i = 0; i < lines.length - 1; i++) {
      this.addLine(lines[i]);
    }

    this.outbuf = lines[lines.length - 1];
  }

  /**
   * Write an error to the buffer, flush immediately and color it red
   */
  error(value) {
    this.flush();
    const lines = value.split('\n');

    for (const line of lines)
      if (line !== '') this.addLine(line, Style.ERROR);
  }

  /**
   * Read from the input buffer, n characters at a time, consuming them
   * @param {Number} n -- the number of characters from the input buffer to read
   */
  read(n=1) {
    let read = this.inbuf.slice(0,n);
    if (this.inbuf.length >= n) {
      this.inbuf = this.inbuf.slice(n);
    } else {
      this.inbuf = '';
      // Prompt for user input
      this.setState({interactive: false});
      this.focusInput();
    }
    return read;
  }

  /**
   * Peek at the next character in the input buffer, without consuming it
   */
  peek() {
    return this.inbuf.charAt(0);
  }

  /**
   * Force the buffer to flush
   */
  flush() {
    if (this.outbuf) {
      this.addLine(this.outbuf);
      this.outbuf = '';
    }
  }

  /**
   * Commit a line to the console history, making it uneditable
   */
  addLine(text, style=Style.NORMAL) {
    this.setState(({lines}) => {
      let newLines = lines.slice();
      newLines.push({text, style});
      return {lines: newLines, placeholder: ''};
    });
  }

  /**
   * Parse a line of text from the console, add it to the input buffer
   * This corresponds to reading a line into the process' stdin
   */
  submitLine(line) {
    this.inbuf += line + '\n';

    this.signals.dispatch('SIGIO');
    this.setState({interactive: true});

    this.addLine(this.outbuf + line);
    this.outbuf = '';

    // Hack to make everything update mid-step
    this.props.forceUpdate();
  }

  /**
   * DO command
   */
  runCommand(line) {
    let tokens = line.match(/[^\s"]+|"([^"]*)"/g);
    // Remove the prompt
    tokens.shift();
    let command = tokens[0];

    if (command in this.props.commands) {
      this.addLine(line, Style.NORMAL);
      let dialog = this.props.commands[command](tokens.slice(1));
      // Print the command text, if any
      dialog.split('\n').map((line) => this.addLine(line, Style.HELP));
    } else {
      this.addLine(line);
      this.addLine(`Undefined command: "${command}". Try "help"`, Style.ERROR);
    }
  }

  /**
   * Force the input box of the console to focus
   */
  focusInput() {
    // Eek
    this.refs.input.refs.input.focus();
  }

  /**
   * Focus on the console on initial mount
   */
  componentDidMount() {
    this.focusInput();
  }

  /**
   * Completely clear the output of the console, including it's buffers
   */
  clear() {
    this.setState({
      lines: [],
      prompt: '(pbl) ',
      interactive: true,
      placeholder: 'run arg1 arg2 ...'
    });

    this.inbuf = '';
    this.outbuf = '';
  }

  render() {
    return (
      <div id="console"
        className="container"
        onClick={this.focusInput} >
        {this.state.lines.map((line, idx) =>
          <pre className="console-line" key={idx} style={line.style}>
            {line.text}
          </pre>
        )}
        <InputLine
          ref="input"
          includePrompt={this.state.interactive}
          submitLine={this.state.interactive ? this.runCommand : this.submitLine}
          prompt={this.state.interactive ? this.state.prompt : this.outbuf}
          placeholder={this.state.placeholder} />
      </div>
    );
  }
}

class InputLine extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleKey = this.handleKey.bind(this);
  }

  /**
   * Component control: update this.state.value in response to changes
   * in the value of the input element
   */
  handleChange(evt) {
    let newValue = evt.target.value;
    this.setState({value: newValue});
    evt.preventDefault();
  }

  /**
   * Second component control method for listening to key presses
   * which don't necessarily update the input value
   */
  handleKey(evt) {
    // Just handle the enter key
    if (evt.key == 'Enter') {
      this.setState({value: ''});
      this.props.submitLine(
        (this.props.includePrompt ? this.props.prompt : '') + this.state.value
      );
    }
  }

  render() {
    return (
      <div className="console-line">
        <span className="console-prompt">{this.props.prompt}</span>
        <input ref="input"
          className="console-input"
          onChange={this.handleChange}
          onKeyUp={this.handleKey}
          value={this.state.value}
          placeholder={this.props.placeholder} />
      </div>
    );
  }
}