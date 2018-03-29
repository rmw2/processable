/**
 * Display instructions and such
 */
import React from 'react';
import { pad } from './decode.js';

export default class TextContainer extends React.Component {
    constructor(props) {
        super(props);

    }

    renderInstructions() {
        const instructions = this.props.text.instructions;
        const addresses = this.props.text.idxToAddr;
        const pcIdx = this.props.text.addrToIdx[this.props.pc];

        return instructions.map((inst, idx) => {
            let [mnemonic, ...operands] = inst;
            let addr = addresses[idx];
            return <InstructionView
                key={addr}
                label={this.props.labels[addr]}
                mnemonic={mnemonic}
                operands={operands}
                address={addr}
                isBreakpoint={!!this.props.breakpoints[addr]}
                toggleBreakpoint={this.props.toggleBreakpoint}
                isCurrent={pcIdx == idx} />;
        });
    }

    render() {
        let pc = (this.props.pc)
            ? `PC: 0x${this.props.pc.toString(16)}`
            : (this.props.pc === undefined)
            ? '[process not started]'
            : '[process terminated]';

        return (
            <div id="text" className="container">
                <div className="container-title">text</div>
                <span className="pc">{pc}</span>
                <div id="text-content" className="content">
                    {this.renderInstructions()}
                </div>
            </div>
        );

    }
}

class InstructionView extends React.Component {
    constructor(props) {
        super(props);

        this.toggleBreakpoint = this.toggleBreakpoint.bind(this);
        this.state = {
            isBreakpoint: this.props.isBreakpoint
        };
    }

    /**
     * Make sure that breakpoints set by the console update the view
     */
    componentWillReceiveProps(nextProps) {
        let {isBreakpoint} = nextProps;
        this.setState({isBreakpoint});
    }

    toggleBreakpoint() {
        this.props.toggleBreakpoint(this.props.address);

        this.setState((state) => {
            return {isBreakpoint: !state.isBreakpoint}
        });
    }

    renderOperands() {
        return this.props.operands.length ? this.props.operands.map((op, idx) =>
            <span key={idx} className="operand">{op}</span>
        ).reduce((prev, curr) =>
            [prev, ', ', curr]
        ) : null;
    }

    componentDidUpdate() {
        if (this.props.isCurrent)
            this.refs.thisinst.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
    }

    render() {
        // Todo: replace with better solution for conditional classes
        const highlightStyle = this.props.isCurrent ? {
            backgroundColor:  this.state.isBreakpoint ? '#f99' : '#eee',
            fontWeight: 'bold'
        } : {};

        const addrStyle = this.state.isBreakpoint ? {
            backgroundColor: '#f99',
            borderColor: this.props.isCurrent ? '#000' : '#000'
        } : {
            borderColor: this.props.isCurrent ? '#ddd' : '#ddd'
        };

        return (
            <div ref="thisinst" style={highlightStyle} className="instruction">
                <span className="instruction-label">{this.props.label && this.props.label + ':'}</span>
                <span className="instruction-address"
                    onClick={this.toggleBreakpoint}
                    style={addrStyle}>
                    {pad(this.props.address.toString(16), 2)}
                </span>
                <span className="instruction-mnemonic">{this.props.mnemonic}</span>
                <span className="instruction-operands">{this.renderOperands()}</span>
            </div>
        );
    }
}