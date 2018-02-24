import React from 'react';

const Color = {
  NORMAL: '#fff',
  ERROR:  '#f99',
  HELP:   '#99f'
};

export default class Console extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lines: [],
      prompt: '(pbl) ',
      interactive: true
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
    this.flush      = this.flush.bind(this);
    this.runCommand = this.runCommand.bind(this);

    // Take over the process' stdio
    this.props.io.stdout = this;
    this.props.io.stdin = this;
    this.props.io.stderr = {
      write: (value) => this.error(value)
    };
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
      this.addLine(line, Color.ERROR);
  }

  /**
   * Read from the input buffer, n characters at a time, consuming them
   * @param {Number} n -- the number of characters from the input buffer to read
   */
  read(n) {
    if (this.inbuf == '')
      return null;

    let read = this.inbuf.slice(0,n);
    this.inbuf = this.inbuf.slice(n);

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
    this.addLine(this.outbuf);
    this.outbuf = '';
  }

  /**
   * Commit a line to the console history, making it uneditable
   */
  addLine(text, color=Color.NORMAL) {
    this.setState(({lines}) => {
      let newLines = lines.slice();
      newLines.push({text, color});
      return {lines: newLines};
    });
  }

  /**
   * Parse a line of text from the console, add it to the input buffer
   *
   */
  submitLine(line) {
    this.inbuf += line + '\n';

    this.signals.dispatch('SIGIO');
    // TODO: Parse line and look for commands ??
    addLine(line);
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
      this.props.commands[command](tokens.slice(1));
      this.addLine(line, Color.HELP);
    } else {
      this.addLine(line);
    }
  }

  /**
   * Super hacky way of making sure that any click in the
   * console focuses in the input box
   */
  focusInput() {
    // Eek
    this.refs.input.refs.input.focus();
  }

  render() {
    return (
      <div id="console"
        className="container"
        onClick={this.focusInput} >
        {this.state.lines.map((line, idx) =>
          <div className="console-line" key={idx} style={{color: line.color}}>
            {line.text}
          </div>
        )}
        <InputLine
          ref="input"
          submitLine={this.state.interactive ? this.runCommand : this.submitLine}
          prompt={this.state.prompt} />
      </div>
    );
  }
}

class InputLine extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: ''
    }

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
      this.props.submitLine(this.props.prompt + this.state.value);
      this.setState({value: ''});
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
          value={this.state.value} />
      </div>
    );
  }
}