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
		}

		console.log(bytes);

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
 * A single byte on the stack
 */
class ByteView extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.refs.thisbyte.scrollIntoView(false);
	}

	render() {
		const aligned = (this.props.address % this.props.alignment === 0) ? ' aligned' : '';

		const pointer = this.props.pointer ? (
			<span className="stack-pointer">
				{this.props.pointer}
				<span className="arrow" dangerouslySetInnerHTML={{__html: ' &rarr;'}}></span>
			</span>
		) : <span className="stack-pointer" />;

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