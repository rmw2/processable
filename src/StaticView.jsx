import React from 'react';
import { pad } from './decode.js';

import {Tabs, Tab, TabList, TabPanel} from 'react-tabs';

const PRINTABLE = 33;

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
            labelFor={labeled} />
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
			<div id={this.props.name} className="tabbed-container">
        <div id={this.props.name + '-content'} className="content">
          {bytes}
        </div>
      </div>
		);
	}
}

class LabeledByteGroup extends React.Component {
  constructor(props) {
    super(props);
  }

  toggleDecoding() {

  }

  render() {

    return (
      <div className="static-byte-group">
        <span className="static-label">{this.props.label}</span>
        {}
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
      return {
        decode: (decode == 'hex') ? 'char' : 'hex'
      };
    });
  }

  render() {
    // Decode as character or hex byte, depending on printability and state
    let value = (this.props.value > PRINTABLE && this.state.decode === 'char')
      ? `'${String.fromCharCode(this.props.value)}'`
      : pad(this.props.value.toString(16), 2);

    let label = this.props.label  ? this.props.label + ':' : null;

    // Align on 8-byte boundaries
    // TODO: make this customizable
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

export default TabbedStaticContainer;