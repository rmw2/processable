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
	}

	render() {
		let bytes = [];
		for (let addr = this.props.origin - 1; addr >= this.props.pointer; addr--) {
			bytes.push(
				<ByteView 
					key={addr} 
					value={this.props.mem.read(addr, 1)} 
					address={addr} 
					isTop={addr == this.props.pointer} />
			);
		}

		return (
			<div id="stack" className="container">
				<div className="container-title">stack</div>
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
		const style = {
			address: {
				visibility: this.props.isTop ? 'visible' : '',
			}
		}

		return (
			<div ref="thisbyte" className="stack-byte">
				<span className="stack-pointer" dangerouslySetInnerHTML={this.printPointer()}></span>
				<span style={style.address} className="byte-address">{this.props.address.toString(16)}</span>
				<span className="byte-value">{pad(this.props.value.toString(16), 2)}</span>
			</div>
		);
	}
}