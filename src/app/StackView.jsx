/**
 * The stack, broh
 */
import React from 'react';

import { encStyle } from './util.js';
import { Encodings, ENC_NAMES, decodeAndFormat as decode, pad } from './decode.js';

import './stack.css';

/**
 * A component to display view
 */
export default class StackContainer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			alignment: 4, // Alignment in bytes for display purposes
			breaks: [],
			growsUp: false
		};
	}

	/**
	 * Update the breaks array to accomodate a potentially larger stack
	 */
	componentWillReceiveProps(nextProps) {

	}

	setAlignment(val) {
		this.setState({alignment: val});
	}

	render() {
		const {alignment, breaks, growsUp} = this.state;
		const {origin, rsp, rbp, mem} = this.props;
		let items = [];

		for (let addr = origin - 1, idx = 0; addr >= rsp; addr--) {
			let pointer = (addr === rsp) 
				? '%rsp' 
				: (addr === rbp) 
				? '%rbp' 
				: null;

			console.log(addr, pointer, addr % alignment);

			if (alignment && addr % alignment === 0) {
				items.push({
					value: this.props.mem.read(addr, alignment),
					size: alignment,
					addr, pointer, growsUp, idx
				});

				// Keep track of the number of "items" on the stack
				idx++;
			} else if (!alignment && addr === breaks[idx]) {
				let size = (breaks[idx-1] || origin) - breaks[idx];

				items.push({
					value: this.mem.read(addr, size),
					size, addr, pointer, growsUp, idx
				});

				// Keep track of the number of "items" on the stack
				idx++;
			}
		}

		// Grab the extras

		return (
			<div id="stack" className="container">
				<div className="container-title">stack
					<button className="toggle" id="toggle-stack-direction"
						onClick={() => this.setState({growsUp: !growsUp})}
						dangerouslySetInnerHTML={{__html: growsUp ? '&uarr;' : '&darr;'}}/>
				</div>
				<div className="button-group">
					<div className="desc">alignment</div>
					{[1, 2, 4, 8, null].map((val) =>
						<button
							key={val}
							className="toggle"
							style={{backgroundColor: val == this.state.alignment ? '#eee' : '#aaa'}}
							onClick={() => this.setAlignment(val)}>
							{val ? val : '*'}
						</button>
					)}
				</div>
				<div id="stack-content" className={`content ${growsUp ? 'up' : 'down'}`}>
					{items.map((item) => 
						<StackItem key={item.addr} {...item}/>
					)}
				</div>
			</div>
		);
	}
}

/**
 * @classdesc
 * A component to show a decoded view of a particular group of
 * bytes on the stack, toggleable between string, signed/unsigned decimal int,
 * and hex or binary digits.  Additionally show the individual bytes along the side
 */
class StackItem extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			encoding: this.props.encoding || Encodings.HEX,
		};

		this.toggleDecoding = this.toggleDecoding.bind(this);
	}

	toggleDecoding() {
		this.setState(({encoding}) => {
			return {encoding: ++encoding % Encodings.length}
		});
	}

	componentDidMount() {
		this.refs.item.scrollIntoView({
			block: 'start', 
			inline: 'nearest', 
			behavior: 'smooth'
		});
	}

	render() {
		const {encoding} = this.state;
		const {value, addr, size, pointer, growsUp} = this.props;

		// Values to display
		const decodedValue = decode(value, encoding, growsUp);
		let bytes = Array.from(new Uint8Array(value.toBuffer()));

		// if (!growsUp) {
		// 	bytes = bytes.reverse();
		// }

		return (
			<div ref="item" className="stack-item">
				<div className="stack-raw">
				{bytes.map((val, i) => 
					<ByteView
						key={addr + i}
						value={val}
						address={addr + i}
						pointer={!i ? pointer : null} 
						aligned={!i} />
				)}
				</div>
				<div style={encStyle[encoding]}
					className="stack-decode"
					onClick={this.toggleDecoding}>
					<span className="stack-decode-encoding">{ENC_NAMES[encoding]}</span>
					<span className="stack-decode-content"
						dangerouslySetInnerHTML={{__html: decodedValue}} />
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

	/**
	 * Ensure that items newly pushed to the stack are scrolled into view
	 */
	componentDidMount() {
		this.refs.thisbyte.scrollIntoView(false);
	}

	render() {
		const {aligned, pointer, value, address} = this.props;
		console.log(pointer);
		// Render byte's value in hex, along with pointer and address if applicable
		return (
			<div ref="thisbyte" className={`stack-byte ${aligned ? 'aligned' : ''}`}>
				{pointer ? (
					<span className="stack-pointer">
						{pointer} <span className="arrow">&rarr;</span>
					</span>
				) : (
					<span className="stack-pointer" />
				)}
				<span className="byte-address" onClick={() => null}>
					{address.toString(16)}
				</span>
				<span className="byte-value">{pad(value.toString(16), 2)}</span>
			</div>
		);
	}
}


