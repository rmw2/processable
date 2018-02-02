import React from 'react';
import { pad } from './decode.js';

const PRINTABLE = 33;

export default class StaticView extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
    // This is pretty inefficient
    let bytes = [];
    for (let addr = this.props.lo; addr < this.props.hi; addr++) {
      bytes.push(
        <ByteView 
          key={addr} 
          address={addr}
          value={this.props.mem.read(addr, 1)} 
          label={this.props.labelFor[addr]} />
      );
    }

		return (
			<div id={this.props.name} className="container">
        <div className="container-title">{this.props.name}</div>
        <div id={this.props.name + '-content'} className="content">
          {bytes}
        </div>
      </div>
		);
	}
}

/**
 * @classdesc
 * A view of a single byte, sort of different from the 
 */
class ByteView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      decode: (this.props.name == 'rodata') ? 'char' : 'hex'
    };

    this.toggleDecoding = this.toggleDecoding.bind(this);
  }

  toggleDecoding() {
    this.setState(({decode}) => {
      return (decode == 'hex') ? 'char' : 'hex';
    });
  }

  render() {
    let value = (this.props.value > PRINTABLE && this.state.decode === 'char')
      ? `'${String.fromCharCode(this.props.value)}'`
      : pad(this.props.value.toString(16), 2);

    let label = this.props.label  ? this.props.label + ':' : null;
    let showAddress = (this.props.address % 8 == 0);

    return (
      <div className="static-byte" onClick={this.toggleDecoding} >
        <span className="static-label">{label}</span>
        <span className="byte-value">{value}</span>
        <span className={'byte-address' + (showAddress ? ' aligned' : '')}>{this.props.address.toString(16)}</span>
      </div>
    );
  }
}