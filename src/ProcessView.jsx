import React from 'react';
import RegisterContainer from './RegisterView.jsx'
import TextContainer from './TextView.jsx'
import StackContainer from './StackView.jsx'

export default class ProcessContainer extends React.Component {
    constructor(props) {
        super(props);

        this.step = this.step.bind(this);
        this.run = this.run.bind(this);
        this.toggleBreakpoint = this.props.process.toggleBreakpoint.bind(
            this.props.process);
    }

    step() {
        this.props.process.step();
        // TODO: come up with a clever way to keep track of things that have changed
        // and only redraw those things.  It seems like react wouldn't really be able to
        // figure it out because most change lies deep within objects
        this.forceUpdate();
    }

    run() {
        this.props.process.run();
        this.forceUpdate();
    }

    render() {
        return (
            <div className="process-container">
                <div id="controls" className="container">
                    <button id="step" className="control-button" onClick={this.step}>&#8677;</button>
                    <button id="continue" className="control-button" onClick={this.run}>&#10142;</button>
                </div> 
                <TextContainer
                    pc={this.props.process.pc}
                    text={this.props.process.text} 
                    labels={this.props.process.labeled}
                    breakpoints={this.props.process.breakpoints}
                    toggleBreakpoint={this.toggleBreakpoint} />
                <RegisterContainer 
                    regs={this.props.process.regs}
                    flags={this.props.process.regs.flags} />
                <StackContainer 
                    mem={this.props.process.mem}
                    origin={this.props.process.stackOrigin}
                    pointer={this.props.process.read('%rsp').val()} />
            </div>
        );
    }
}