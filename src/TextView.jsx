/**
 * Display instructions and such
 */
import React from 'react';

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
        return (
            <div className="container text-container">
                <div className="container-title">text</div>
                <span className="pc"> PC: 0x{this.props.pc.toString(16)} </span>
                {this.renderInstructions()}
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

    toggleBreakpoint() {
        this.props.toggleBreakpoint(this.props.address);

        this.setState((state) => {
            return {isBreakpoint: !state.isBreakpoint}
        });
    }

    renderOperands() {
        return this.props.operands.map((op, idx) => 
            <span key={idx} className="operand">{op}</span>
        ).reduce((prev, curr) => 
            [prev, ', ', curr]
        );
    }

    render() {
        // Todo: replace with better solution for conditional classes
        const highlightStyle = this.props.isCurrent ? {
            backgroundColor:  this.state.isBreakpoint ? '#f99' : '#ddd',
            fontWeight: 'bold'
        } : {};

        const addrStyle = this.state.isBreakpoint ? {
            backgroundColor: '#f99',
            borderColor: this.props.isCurrent ? '#f99' : '#000'
        } : {
            borderColor: this.props.isCurrent ? '#ddd' : '#fff'
        };

        return (
            <div style={highlightStyle} className="instruction">
                <span className="instruction-label">{this.props.label && this.props.label + ':'}</span>
                <span className="instruction-address" 
                    onClick={this.toggleBreakpoint}
                    style={addrStyle}>
                    {this.props.address.toString(16)}
                </span>
                <span className="instruction-mnemonic">{this.props.mnemonic}</span>
                <span className="instruction-operands">{this.renderOperands()}</span>
            </div>
        );
    }
}