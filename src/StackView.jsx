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
				<ByteView key={addr} value={this.props.mem.read(addr, 1)} address={addr} />
			);
		}

		return (
			<div className="stack-container container">
				<div className="container-title">stack</div>
				<div className="stack-contents">
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

	render() {
		return (
			<div className="stack-byte">
				<span className="byte-address">{this.props.address.toString(16)}</span>
				<span className="byte-value">{pad(this.props.value, 2)}</span>
			</div>
		);
	}
}