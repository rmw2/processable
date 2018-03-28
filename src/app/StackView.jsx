/**
 * The stack, broh
 */
import React from 'react';

import { encStyle } from './util.js';
import { Encodings, ENC_NAMES, decodeAndFormat as decode, pad } from './decode.js';

import './stack.css';

const DEFAULT_ALIGNMENT = 4;


/**
 * Find a value in a reverse sorted list
 * if not found, return the negative of the first index whose
 * value is larger
 */
function find(value, list) {
	// naive implementation
	// Todo: replace with binary search
	for (let i = 0; i < list.length; i++) {
		if (list[i] === value)
			return i;
		if (list[i] < value)
			return -i;
	}
}

/**
 * A component to display the stack
 */
export default class StackContainer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			alignment: DEFAULT_ALIGNMENT,
			breaks: [this.props.origin],
			growsUp: true
		}; 

		this.toggleBreak = this.toggleBreak.bind(this);
	}

	/**
	 * Update the breaks array to accomodate a potentially larger stack
	 */
	componentWillReceiveProps(nextProps) {
		let breaks = this.state.breaks.slice();
		let last;

		console.log('updating breaks array');

		// Remove excess 
		while (nextProps.rsp > (last = breaks[breaks.length - 1])) {
			let removed = breaks.pop();
			console.log(`removed ${removed}`);
		}

		// Add necessary extras
		while (nextProps.rsp < (last = breaks[breaks.length - 1])) {
			if (last % 4 === 0) {
				breaks.push(last - 4);
			} else if (last % 4 === 2) {
				breaks.push(last - 2);
			} else {
				breaks.push(last - 1);
			}
		}

		console.log(`new breaks: ${breaks}`)

		this.setState({breaks});
	}

	/**
	 * Add or remove a decoding break
	 * this is a WILD function
	 */
	toggleBreak(addr) {
		let breaks = this.state.breaks.slice();
		let idx = find(addr, breaks);

		if (idx < 0) {
			idx = -idx;
			// Add extra breaks below if necessary
			switch ((addr - breaks[idx]) % 8) {
				case 3:
				case 5:
					breaks.splice(idx, 0, addr - 1);
					break;
				case 6:
					breaks.splice(idx, 0, addr - 2);
					break;
				case 7:
					breaks.splice(idx, 0, addr - 1, addr - 3);
			}

			// Add the new break
			breaks.splice(idx, 0, addr);
			
			// Add extra break above if necessary
			switch ((breaks[idx - 1] - addr) % 8) {
				case 3:
				case 5:
					breaks.splice(idx, 0, addr + 1);
					break;
				case 6:
					breaks.splice(idx, 0, addr + 2);
					break;
				case 7:
					breaks.splice(idx, 0, addr + 3, addr + 1);
			}
		} else {
			// Remove break
			if ([1,2,4,8].indexOf(breaks[idx - 1] - breaks[idx + 1]) < 0) {
				// Not allowed to create irregular breaks
				return false;
			}

			breaks.splice(idx, 1);
		}

		this.setState({breaks});
		return true;
	}

	render() {
		const {alignment, breaks, growsUp} = this.state;
		const {origin, rsp, rbp, mem} = this.props;
		let items = [];

		for (let addr = origin - 1, idx = 1; addr >= rsp; addr--) {
			let pointer = (addr === rsp) 
				? '%rsp' 
				: (addr === rbp) 
				? '%rbp' 
				: null;


			if (alignment && addr % alignment === 0) {
				items.push({
					value: mem.read(addr, alignment),
					size: alignment,
					addr, pointer, growsUp
				});
			} else if (!alignment && addr === breaks[idx]) {
				let size = breaks[idx-1] - breaks[idx];

				items.push({
					value: mem.read(addr, size),
					toggleBreak: this.toggleBreak,
					size, addr, pointer, growsUp
				});

				idx++;
			}
		}

		// Grab the extras
		// TODO

		return (
			<div id="stack" className="container">
				<div className="container-title">stack
					<button className="toggle" id="toggle-stack-direction"
						data-tip={`Show stack as growing ${growsUp ? 'down' : 'up'}`}
						onClick={() => this.setState({growsUp: !growsUp})}
						dangerouslySetInnerHTML={{__html: growsUp ? '&uarr;' : '&darr;'}}/>
				</div>
				<div className="button-group">
					<div className="desc">alignment</div>
					{[1, 2, 4, 8, null].map((val) =>
						<button
							key={val}
							className="toggle"
							data-tip={val 
								? `Decode stack in groups of ${val} byte${val > 1 ? 's' : ''}` 
								: 'Customize grouping of stack bytes<br/>(click on an address to edit)'
							}
							style={{backgroundColor: val == this.state.alignment ? '#eee' : '#aaa'}}
							onClick={() => this.setState({alignment: val})}>
							{val ? val : '*'}
						</button>
					)}
				</div>
				<div id="stack-content" className={`content ${growsUp ? 'up' : 'down'}`}>
					{items.map((item) => 
						<StackItem key={item.addr} {...item}/>
					)}
					<div className="stack-item" id="stack-spacer"/>
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
			block: this.props.growsUp ? 'end' : 'start', 
			inline: 'nearest', 
			behavior: 'smooth'
		});
	}

	render() {
		const {encoding} = this.state;
		const {value, addr, size, pointer, growsUp, toggleBreak} = this.props;

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
						toggleBreak={toggleBreak}
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

	render() {
		const {aligned, pointer, value, address, toggleBreak=() => null} = this.props;
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
				<span className="byte-address" onClick={() => toggleBreak(address)}>
					{address.toString(16)}
				</span>
				<span className="byte-value">{pad(value.toString(16), 2)}</span>
			</div>
		);
	}
}


