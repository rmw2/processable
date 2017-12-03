/**
 * Display registers and such
 */
import React from 'react';
import { nextEncoding, decodeFromBuffer } from './decode.js';

export default class RegisterContainer extends React.Component {
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
            <div id="registers" className="container">
                <div className="container-title">registers</div>
                <FlagView flags={this.props.flags} />
                <div id="register-content" className="content">
                    {this.renderRegs()}
                </div>
            </div>
        );
    }
}

class FlagView extends React.Component {
    constructor(props) {
        super(props);
    }

    renderFlags() {
        return Object.keys(this.props.flags).map((flag) => {
            let flagStyle = {
                backgroundColor: this.props.flags[flag] ? '#efe' : '#fee',
            };

            return (
                <span key={flag} style={flagStyle} className='register-flag'>
                    {flag}
                </span>
            );
        });
    }

    render() {
        return (
            <div id="register-flags">
                {this.renderFlags()}
            </div>
        );
    }
}

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
            encoding: 'hex',
            encIdx: 0,
            regIdx: 0,
            name: name,
            offset: offset,
            size: size
        };

        this.toggleRegister = this.toggleRegister.bind(this);
        this.toggleEncoding = this.toggleEncoding.bind(this);
    }

    toggleEncoding() {
        this.setState(nextEncoding);
    }

    /**
     * Switch the register being viewed.  Update the register name,
     * size, and offset into the ArrayBuffer at which the data is stored
     */
    toggleRegister() {
        this.setState((state, props) => {
            const idx = (state.regIdx + 1) % this.nRegs;
            const {name, offset, size} = props.registers[idx];
            return {
                regIdx: idx,
                name: name,
                offset: offset,
                size: size
            };
        });
    }

    /**
     * Print the value stored in this register according to the current view state
     * Called with dangerouslySetInnerHTML to allow line-break tags for formatting
     */
    decode() {
        return {
            __html: decodeFromBuffer(
                this.props.value, 
                this.state.offset, 
                this.state.size, 
                this.state.encoding
            )
        };
    }

    render() {
        const encStyle = {
            hex:  {backgroundColor:  '#ffe3e3'},
            int:  {backgroundColor:  '#ccfff6'},
            uint: {backgroundColor:  '#e0ffdc'},
            char: {backgroundColor:  '#fffdda'},
            bin:  {backgroundColor:  '#deddff'}
        };

        const regStyle = {
            1: {backgroundColor: '#c9a762'},
            2: {backgroundColor: '#b48166'},
            4: {backgroundColor: '#9a4456'},
            8: {backgroundColor: '#742c3d'},
        };

        return (
            <div className="register">
                <button 
                    className="toggle toggle-register"
                    onClick={this.toggleRegister}
                    style={regStyle[this.state.size]}>{this.state.name}</button>
                <span className='register-value' dangerouslySetInnerHTML={this.decode()}></span>
                <button 
                    className="toggle toggle-encoding" 
                    onClick={this.toggleEncoding}
                    style={encStyle[this.state.encoding]}>{this.state.encoding}</button>
            </div>
        );
    }
}