import 'React' from 'react';

class ProcessContainer extends React.Component {
	constructor(props) {
		super(props);

		this.process = new Process();
	}

	render() {
		return (
			<div className='process-container'>
				<RegisterContainer regs={this.process.regs}/>
			</div>
		);
	}
}

class RegisterContainer extends React.Component {
	constructor(props) {
		super(props);


	}

	render () {
		return (
			<div className='register-container'>
				<MultiSizeRegisterView value={new DataView(this.props.regs.buffer, 0, 8)}/>
			</div>
		);
	}
}

const ENCODINGS = {INT: 0, UINT: 1, CHAR: 2, HEX: 3, BIN: 4};
const ENCODING_NAMES = ['int', 'uint', 'char', 'hex', 'bin'];
const N_ENCODINGS = Object.keys(ENCODINGS).length;

/**
 * Component to display the value of a register.
 * Receives a Dataview as props contianing all the register
 */
class MultiSizeRegisterView extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			encoding: ENCODINGS.INT,
		};
	}

	toggleEncoding() {
		this.setState((state, props) => {
			encoding: (state.encoding + 1) % N_ENCODINGS
		});
	}

	toggleRegister() {
		// TODO
		alert('Toggling register');
	}

	decode() {
		switch (this.state.encoding) {
			case ENCODINGS.INT:
				return this.props.value.getInt32(0);
			case ENCODINGS.UINT:
				return this.props.value.getUint32(0);
			case ENCODINGS.CHAR:
				return 'CHAR';
			case ENCODINGS.HEX:
				return this.props.value.getUint32(0).toString(16);
			case ENCODINGS.BIN:
				return this.props.value.getUint32(0).toString(2);
		}
	}

	render() {
		return (
			<button className="toggle-register" onClick={() => this.toggleRegister()}></button>
			<span className='register-value'>{this.decode()}</span>
			<button className="toggle-encoding" onClick={() => this.toggleEncoding()}></button>
		);
	}
}