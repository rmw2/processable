/**
 * The stack, broh
 */
import React from 'react';
import { pad } from './decode.js'
/**
 * A component to display view
 */
export default class StackContainer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			alignment: 8, // Alignment in bytes for display purposes
		}
	}

	setAlignment(val) {
		this.setState({alignment: val});
	}

	render() {
		// This is pretty inefficient
		let bytes = [];
		for (let addr = this.props.origin - 1; addr >= this.props.pointer; addr--) {
			bytes.push(
				<ByteView 
					key={addr} 
					value={this.props.mem.read(addr, 1)} 
					address={addr} 
					alignment={this.state.alignment}
					isTop={addr == this.props.pointer} />
			);
		}

		return (
			<div id="stack" className="container">
				<div className="container-title">stack</div>
				<div className="button-group">
					<div className="desc">alignment</div>
					{[1,2,4,8].map((val) => 
						<button 
							className="toggle" 
							style={{backgroundColor: val == this.state.alignment ? '#eee' : '#aaa'}} 
							onClick={() => this.setAlignment(val)}>
							{val}
						</button>
					)}
				</div>
				<div id="stack-content" className="content">
					{bytes}
				</div>
			</div>
		);
	}
}

/**
 * A single byte on the stack
 */
class ByteView extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.refs.thisbyte.scrollIntoView(false);
	}

	printPointer() {
		if (this.props.isTop) {
			return {__html: '%rsp &rarr;'};
		}
	}

	render() {
		const aligned = (this.props.address % this.props.alignment === 0) ? ' aligned' : '';

		const style = {
			address: {
				visibility: (this.props.isTop || aligned) ? 'visible' : '',
			}
		}

		return (
			<div ref="thisbyte" className={'stack-byte' + aligned}>
				<span className="stack-pointer" dangerouslySetInnerHTML={this.printPointer()}></span>
				<span style={style.address} className="byte-address">{this.props.address.toString(16)}</span>
				<span className="byte-value">{pad(this.props.value.toString(16), 2)}</span>
			</div>
		);
	}
}

ByteView.defaultProps = {

}