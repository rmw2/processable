import React from 'react';
import { Encodings, ENC_NAMES, pad, escapeChar } from './decode.js';
import { encStyle } from './util.js';

import {Tabs, Tab, TabList, TabPanel} from 'react-tabs';

const PRINTABLE = 33;

import './static.css';

/**
 * The main thingio
 */
const TabbedStaticContainer = ({labeled, segments}) => {
  const {rodata, data, bss} = segments;

  return (
    <div id="static" className="container">
      <Tabs>
        <TabList>
          <Tab selectedClassName="tab-selected" className="tab container-title">rodata</Tab>
          <Tab selectedClassName="tab-selected" className="tab container-title">data</Tab>
          <Tab selectedClassName="tab-selected" className="tab container-title">bss</Tab>
        </TabList>
        <TabPanel>
          <StaticContainer
            name="rodata"
            mem={rodata.data}
            hi={rodata.hi}
            lo={rodata.lo}
            labelFor={labeled}
            defaultEncoding={Encodings.CHAR} />
        </TabPanel>
        <TabPanel>
          <StaticContainer
            name="data"
            mem={data.data}
            hi={data.hi}
            lo={data.lo}
            labelFor={labeled} />
        </TabPanel>
        <TabPanel>
          <StaticContainer
            name="bss"
            mem={bss.data}
            hi={bss.hi}
            lo={bss.lo}
            labelFor={labeled} />
        </TabPanel>
      </Tabs>
    </div>
  );
}

export class StaticContainer extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
    // This is pretty inefficient
    let bytes;
    let groups = [];
    let labels = [];
    for (let addr = this.props.lo; addr < this.props.hi; addr++) {
      if (addr in this.props.labelFor) {
        // Push label
        labels.push({addr, label: this.props.labelFor[addr]});

        // Push byte group for previous label
        if (bytes !== undefined)
          groups.push(bytes);

        bytes = [];
      }

      if (bytes === undefined)
        bytes = [];

      // Add the byte to the current labeled group
      bytes.push(this.props.mem.read(addr, 1));
    }

    // Add the last group
    if (bytes !== undefined)
      groups.push(bytes);

		return (
			<div id={this.props.name} className="tabbed-container">
        <div id={this.props.name + '-content'} className="content">
          {groups[0] && groups.map((bytes, idx) =>
            <LabeledByteGroup
              key={idx}
              bytes={new Uint8Array(bytes)}
              label={labels[idx].label}
              addr={labels[idx].addr}
              encoding={this.props.defaultEncoding}/>
          )}
        </div>
      </div>
		);
	}
}

/**
 *
 */
const Byte = ({addr, value}) => {
  console.log(value, value.toString(16));
  return (
    <span className="static-byte-value">
      {pad(value.toString(16), 2)}
    </span>
  );
}

class LabeledByteGroup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      encoding: this.props.encoding || Encodings.HEX,
    };

    this.toggleDecoding = this.toggleDecoding.bind(this);
  }

  toggleDecoding() {
    this.setState(({encoding}) => ({
      encoding: ++encoding % Encodings.length
    }));
  }

  render() {
    let {label, bytes, addr} = this.props;
    let {encoding} = this.state;

    // Decoding
    let str = '';
    for (let b of bytes) {
      str += escapeChar(+b);
    }

    return (
      <div className="static-byte-group">
        <div className="static-info">
          <button className="toggle toggle-encoding-static"
            style={encStyle[encoding]}
            onClick={this.toggleDecoding}>{ENC_NAMES[encoding]}</button>
          <div className="static-label">{label}:</div>
          <div className="static-address">{addr.toString(16)}</div>
        </div>
        <div className="static-value">
          <div className="static-bytes">
          {Array.from(bytes).map((value, idx) =>
            <span key={addr + idx} className="static-byte-value">
              {pad(value.toString(16), 2)}
            </span>
          )}
          </div>
          <div className="static-decoded" style={encStyle[encoding]}>
            {str}
          </div>
        </div>
      </div>
    );
  }
}

// /**
//  * @classdesc
//  * A view of a single byte, sort of different from the
//  */
// class ByteView extends React.Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       decode: (this.props.name == 'rodata') ? 'char' : 'hex'
//     };

//     this.toggleDecoding = this.toggleDecoding.bind(this);
//   }

//   toggleDecoding() {
//     this.setState(({decode}) => {
//       return {
//         decode: (decode == 'hex') ? 'char' : 'hex'
//       };
//     });
//   }

//   render() {
//     // Decode as character or hex byte, depending on printability and state
//     let value = (this.props.value > PRINTABLE && this.state.decode === 'char')
//       ? `'${String.fromCharCode(this.props.value)}'`
//       : pad(this.props.value.toString(16), 2);

//     let label = this.props.label  ? this.props.label + ':' : null;

//     // Align on 8-byte boundaries
//     // TODO: make this customizable
//     let showAddress = (this.props.address % 8 == 0);

//     return (
//       <div className="static-byte" onClick={this.toggleDecoding} >
//         <span className="static-label">{label}</span>
//         <span className="byte-value">{value}</span>
//         <span className={'byte-address' + (showAddress ? ' aligned' : '')}>{this.props.address.toString(16)}</span>
//       </div>
//     );
//   }
// }

export default TabbedStaticContainer;