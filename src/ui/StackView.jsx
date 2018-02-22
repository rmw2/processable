/**
 * The stack, broh
 */
import React from 'react';

import { encStyle } from './util.js';
import { Encodings, decode, pad } from './decode.js';

const BYTE_HEIGHT = 1.2; // em


/**
 * A component to display view
 */
export default class StackContainer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			alignment: 4, // Alignment in bytes for display purposes
		}
	}

	setAlignment(val) {
		this.setState({alignment: val});
	}

	render() {
		// This is pretty inefficient
		let bytes = [], decoded = [];
		for (let addr = this.props.origin - 1; addr >= this.props.rsp; addr--) {
			let pointer = (addr == this.props.rsp) ? '%rsp' : 
				(addr == this.props.rbp) ? '%rbp' : null;

			bytes.push(
				<ByteView 
					key={addr} 
					value={this.props.mem.read(addr, 1)} 
					address={addr} 
					alignment={this.state.alignment}
					pointer={pointer} />
			);

			if (addr % this.state.alignment === 0) {
				decoded.push(
					<DecodeView
					 key={addr}
					 value={this.props.mem.read(addr, this.state.alignment)} />
				);
			}
		}

		return (
			<div id="stack" className="container">
				<div className="container-title">stack</div>
				<div className="button-group">
					<div className="desc">alignment</div>
					{[1,2,4,8].map((val) => 
						<button 
							key={val}
							className="toggle" 
							style={{backgroundColor: val == this.state.alignment ? '#eee' : '#aaa'}} 
							onClick={() => this.setAlignment(val)}>
							{val}
						</button>
					)}
				</div>
				<div id="stack-content" className="content">
					<div id="stack-bytes-raw">{bytes}</div>
					<div id="stack-bytes-decoded">{decoded}</div>
				</div>
			</div>
		);
	}
}

/**
 * @classdesc
 * A component to show a decoded view of a particular group of 
 * bytes on the stack, toggleable between string, signed/unsigned decimal int,
 * and hex or binary digits.
 */
class DecodeView extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			encoding: Encodings.INT,
		};

		this.toggleDecoding = this.toggleDecoding.bind(this);
	}

	toggleDecoding() {
		this.setState(({encoding}) => {
			return {encoding: ++encoding % Encodings.length}
		});
	}

	render() {
		let {encoding} = this.state;

		// HACK
		// TODO: make this more elegant
		let size = this.props.value.size;


		// Hackily set the position of the box
		let style = {
			// VERY STRANGE WORLD.  For some reason (maybe rounding EM to px?) the 8-byte object is
			// 1px smaller than the 8 bytes to its left.  We correct that with a calc().
			// Maybe we can figure out why this happens at some point ?? Probably hard to avoid
			// seeing as we're trying to line up two columns that don't actually share any positioning
			height: `${size * BYTE_HEIGHT}em`,
		};

		// Set background color by encoding
		Object.assign(style, encStyle[encoding]);

		return (
			<div style={style} 
				className="stack-decode" 
				onClick={this.toggleDecoding} >
				<span className="stack-decode-content"
					dangerouslySetInnerHTML={{__html: decode(this.props.value, encoding)}} />
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

	/** 
	 * Ensure that items newly pushed to the stack are scrolled into view
	 */
	componentDidMount() {
		this.refs.thisbyte.scrollIntoView(false);
	}

	render() {
		const aligned = (this.props.address % this.props.alignment === 0) ? ' aligned' : '';

		// If a pointer was provided, render its name and an arrow before the byte value
		const pointer = this.props.pointer ? (
			<span className="stack-pointer">
				{this.props.pointer}
				<span className="arrow"> &rarr;</span>
			</span>
		) : <span className="stack-pointer" />;

		// Render byte's value in hex, along with pointer and address if applicable
		return (
			<div ref="thisbyte" className={'stack-byte' + aligned} style={{height: `${BYTE_HEIGHT}em`}}>
				{pointer}
				<span style={{visibility: (this.props.pointer || aligned) ? 'visible' : 'hidden'}} 
					className="byte-address">
					{this.props.address.toString(16)}
				</span>
				<span className="byte-value">{pad(this.props.value.toString(16), 2)}</span>
			</div>
		);
	}
}