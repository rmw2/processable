/**
 * The stack, broh
 */
import React from 'react';

import { nextEncoding } from './util.js';
import { pad } from './decode.js';

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
		let bytes = [];
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

			if (addr % this.state.alignment === 0)
				bytes.push(
					<DecodeView
					 key={`${addr}-decode`}
					 value={this.props.mem.read(addr, this.state.alignment)} />
				);
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
					{bytes}
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

		this.toggleDecoding = this.toggleDecoding.bind(this);
	}

	toggleDecoding() {
		this.setState(nextEncoding);
	}

	render() {
		// HACK
		// TODO: make this more elegant
		let size = this.props.value.size;

		const BYTE_HEIGHT = 1.2; // em
		let style = {
			height: `${size * BYTE_HEIGHT}em`,
			transform: `translateY(calc(1px - ${size * BYTE_HEIGHT}em))`,
			paddingTop: `${(size * BYTE_HEIGHT - 1)/ 2}em`,
			backgroundColor: `#ddf`
		};

		return (
			<div style={style} onClick={this.toggleDecoding} className="stack-decode">
				{this.props.value.toString(10)}
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
			<div ref="thisbyte" className={'stack-byte' + aligned}>
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