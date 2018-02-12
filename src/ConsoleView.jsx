import React from 'react';


export default class Console extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            lines: []
        }

        // A string buffer to maintain
        this.buf = '';

        // Bind it up
        this.addLine = this.addLine.bind(this);
        this.submitLine = this.submitLine.bind(this);
        this.focusInput = this.focusInput.bind(this);
        this.write = this.write.bind(this);
        this.flush = this.flush.bind(this);

        // Take over the stdio
        this.props.io.stdout = this;
        this.props.io.stdin = this;
        this.props.io.stderr = {
            write: (value) => this.error(value)
        };
    }

    /**
     * Write a value to the buffer, flush if buffer contains newline
     */
    write(value) {
        let lines = value.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
            this.addLine(lines[i]);
        }

        this.buf = lines[lines.length - 1];
    }

    /**
     * Write an error to the buffer, flush immediately and color it red
     */
    error(value) {
        this.flush();
        const lines = value.split('\n');

        for (const line of lines)
            this.addLine(line, '#f99');
    }

    /**
     *
     */
    read() {

    }

    /**
     * Force the buffer to flush
     */
    flush() {
        this.addLine(this.buf);
        this.buf = '';
    }

    /**
     * Commit a line to the console history, making it uneditable
     */
    addLine(text, color="#fff") {
        this.setState(({lines}) => {
            let newLines = lines.slice();
            newLines.push({text, color});
            return {lines: newLines};
        });
    }

    /**
     * Parse a line of text from the console, interpret it as a command
     *
     */
    submitLine(line) {
        // TODO: Parse line and look for commands ??
        addLine(line);
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
                    submitLine={this.addLine}
                    prompt="> " />
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
     * Component controlling.  It's a little fancy
     */
    handleChange(evt) {
        let newValue = evt.target.value;
        this.setState({value: newValue});
        evt.preventDefault();
    }

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