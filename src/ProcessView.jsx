import React from 'react';
import RegisterContainer from './RegisterView.jsx';
import TextContainer from './TextView.jsx';
import StackContainer from './StackView.jsx';
import StaticContainer from './StaticView.jsx';

export default class ProcessContainer extends React.Component {
    constructor(props) {
        super(props);

        this.step = this.step.bind(this);
        this.run = this.run.bind(this);
        this.toggleBreakpoint = this.props.process.toggleBreakpoint.bind(
            this.props.process);

        // Do some preprocessing of labels and figure out which VM areas they live in
        // TODO
    }

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

    run() {
        try {
            this.props.process.run();        
        } catch (e) {
            this.displayError(e);
        }

        this.forceUpdate();
    }

    componentDidCatch(error) {
        this.displayError(error);
    }

    displayError(e) {
        alert(`${e}\n${e.stack}`);
        throw e;
    }

    render() {
        let p = this.props.process;

        return (
            <div className="process-container">
                <div id="controls" className="container">
                    <button id="step" className="control-button" onClick={this.step}>&#8677;</button>
                    <button id="continue" className="control-button" onClick={this.run}>&#10142;</button>
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
                <StaticContainer
                    name="rodata"
                    mem={p.mem.segments.rodata.data}
                    hi={p.mem.segments.rodata.hi}
                    lo={p.mem.segments.rodata.lo}
                    labelFor={p.labeled} />
                <StaticContainer
                    name="data"
                    mem={p.mem.segments.data.data}
                    hi={p.mem.segments.data.hi}
                    lo={p.mem.segments.data.lo}
                    labelFor={p.labeled} />
                <StaticContainer
                    name="bss"
                    mem={p.mem.segments.bss.data}
                    hi={p.mem.segments.bss.hi}
                    lo={p.mem.segments.bss.lo}
                    labelFor={p.labeled} />
            </div>
        );
    }
}