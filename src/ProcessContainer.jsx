import React from 'react';

export default class ProcessContainer extends React.Component {
    constructor(props) {
        super(props);

        this.step = this.step.bind(this);
    }

    step() {
        this.props.process.step();
        this.forceUpdate();
    }

    render() {
        return (
            <div className="process-container">
                <button id="step" className="control-button" onClick={this.step}>step</button>
                <TextContainer
                    pc={this.props.process.pc}
                    text={this.props.process.text} 
                    labels={this.props.process.labeled}/>
                <RegisterContainer regs={this.props.process.regs}/>
            </div>
        );
    }
}

class TextContainer extends React.Component {
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
        let classes = `instruction ${this.props.isCurrent ? 'current' : ''}`;

        return (
            <div className={classes}>
                <span className="instruction-label">{this.props.label && this.props.label + ':'}</span>
                <span className="instruction-address">{this.props.address.toString(16)}</span>
                <span className="instruction-mnemonic">{this.props.mnemonic}</span>
                <span className="instruction-operands">{this.renderOperands()}</span>
            </div>
        );
    }
}

class RegisterContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    renderRegs() {
        const size = this.props.regs.size;
        const nRegs = this.props.regs.n;
        let regViews = new Array(nRegs);

        for (let i = 0; i < nRegs; i++) {
            regViews[i] = (
                <MultiSizeRegisterView
                    key={i*size}
                    registers={this.props.regs.groups[i]}
                    value={new DataView(this.props.regs.buffer, i*size, size)}/>
            );
        }

        return regViews;
    }

    render() {
        return (
            <div className='container register-container'>
                <div className="container-title">registers</div>
                {this.renderRegs()}
            </div>
        );
    }
}

// This is getting hacky...
const ENCODINGS = {HEX: 0, INT: 1, UINT: 2, CHAR: 3, BIN: 4};
const ENC_NAMES = ['hex', 'int', 'uint', 'char', 'bin'];
const ENC_COLOR = ['#ffe3e3', '#ccfff6', '#e0ffdc', '#fffdda', '#deddff']
const N_ENCODINGS = Object.keys(ENCODINGS).length;

const REG_STYLE = {
    1: {backgroundColor: '#c9a792', color: '#fff'},
    2: {backgroundColor: '#b48166', color: '#fff'},
    4: {backgroundColor: '#9a4456', color: '#fff'},
    8: {backgroundColor: '#742c3d', color: '#fff'},
};

/**
 * Component to display the value of a register.
 * Receives a Dataview as props contianing all the register
 */
class MultiSizeRegisterView extends React.Component {
    constructor(props) {
        super(props);

        this.nRegs = this.props.registers.length;
        // Initialize state to be first register in the list
        const {name, offset, size} = props.registers[0];
        this.state = {
            encoding: ENCODINGS.HEX,
            idx: 0,
            name: name,
            offset: offset,
            size: size
        };

        this.toggleRegister = this.toggleRegister.bind(this);
        this.toggleEncoding = this.toggleEncoding.bind(this);
    }

    toggleEncoding() {
        this.setState((state, props) => {
            return {encoding: (state.encoding + 1) % N_ENCODINGS}
        });
    }

    toggleRegister() {
        this.setState((state, props) => {
            const idx = (state.idx + 1) % this.nRegs;
            const {name, offset, size} = props.registers[idx];
            return {
                idx: idx,
                name: name,
                offset: offset,
                size: size
            };
        });
    }

    decode() {
        switch (this.state.encoding) {
            case ENCODINGS.HEX:
                return '0x' + pad(this.props.value.getUint32(this.state.offset, true).toString(16), 2*this.state.size);
            case ENCODINGS.INT:
                return this.props.value.getInt32(this.state.offset, true);
            case ENCODINGS.UINT:
                return this.props.value.getUint32(this.state.offset, true);
            case ENCODINGS.CHAR:
                return 'CHAR';
            case ENCODINGS.BIN:
                return pad(this.props.value.getUint32(this.state.offset, true).toString(2), 8*this.state.size);
        }
    }

    render() {
        let encStyle = {
            backgroundColor: ENC_COLOR[this.state.encoding]
        };

        return (
            <div className="register">
                <button 
                    className="toggle toggle-register"
                    onClick={this.toggleRegister}
                    style={REG_STYLE[this.state.size]}>{this.state.name}</button>
                <span className='register-value'>{this.decode()}</span>
                <button 
                    className="toggle toggle-encoding" 
                    onClick={this.toggleEncoding}
                    style={encStyle}>{ENC_NAMES[this.state.encoding]}</button>
            </div>
        );
    }
}

function pad(n, width, z='0') {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}