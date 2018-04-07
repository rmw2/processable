import React from 'react';
import Draggable from 'react-draggable';

import { Encodings, ENC_NAMES, decode, format, pad } from './decode.js';
import { encStyle } from './util.js';

import './heap.css';

const DETAIL_SIZE = 0x40;
const CHUNK_SIZE = 0x08;

export default class Heap extends React.Component {
	constructor(props) {
		super(props);

    this.state = {
      detail: props.start,
      width: null,
    };

    this.updateDetailWindow = this.updateDetailWindow.bind(this);
	}

  componentDidMount() {
    this.resize = () => this.setState({width: this.full.clientWidth});
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  componentWillReceiveProps({show}) {
    // SUPER HACK: force the resize to be asynchronous
    if (show) setTimeout(this.resize, 0);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize)
  }

  updateDetailWindow(x) {
    const {detail, width} = this.state;
    const {brk, start} = this.props;
    const size = brk - start;

    // Calculate widths
    const chunkWidth = CHUNK_SIZE * width / size;
    const newDetail = detail + CHUNK_SIZE * Math.floor(x/chunkWidth);

    this.setState({
      detail: newDetail < start 
        ? start 
        : newDetail + DETAIL_SIZE > brk 
        ? brk - DETAIL_SIZE 
        : newDetail
    });
  }

	render() {
    const {heap, start, brk} = this.props;
    const {detail, width} = this.state;
    const size = brk - start;

    // Calculate widths
    const chunkWidth = CHUNK_SIZE * width / size;
    const detailWidth =  DETAIL_SIZE * width / size;
    const detailOffset = (detail - start) / size * width;

    let chunks = new Array(size / CHUNK_SIZE);
    chunks.fill(0);

    return (
      <div id="heap" className="container">
        <div id="heap-full" ref={div => this.full = div}>
          <div id="heap-start" className="heap-address" data-tip="heap start">0x{start.toString(16)}</div>
          <div id="heap-brk" className="heap-address" data-tip="brk">0x{brk.toString(16)}</div>
          {chunks.map((_, i) =>
            <div key={start + CHUNK_SIZE * i} className="heap-chunk" style={{width: chunkWidth}} />
          )}
          <Draggable
            axis="x"
            onStop={(e, {x}) => this.updateDetailWindow(x)}
            position={{x: 0, y: 0}}>
            <div id="heap-detail-window" style={{width: detailWidth, left: detailOffset}}>
              <div id="heap-detail-start" className="heap-address">0x{detail.toString(16)}</div>
              <div id="heap-detail-end" className="heap-address">0x{(detail + DETAIL_SIZE).toString(16)}</div>
            </div>
          </Draggable>
        </div>
        <HeapDetail start={start} brk={brk} detail={detail} heap={heap} />
      </div>
    );
	}
}

class HeapDetail extends React.Component {
	constructor(props) {
    super(props);

    this.items = [];
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.detail != this.props.detail)
      this.items[(nextProps.detail - this.props.start) / CHUNK_SIZE].refs.item.scrollIntoView({
        block: 'start', 
        inline: 'start', 
        behavior: 'smooth'
      });
  }

  /**
   * Very similar to the stack
   */
  render() {
    const {start, brk, heap, detail} = this.props;
    const end = start + DETAIL_SIZE;
    let items = [];

    for (let addr = start; addr < brk; addr += CHUNK_SIZE) {
      items.push({
        value: heap.read(addr, CHUNK_SIZE),
        size: CHUNK_SIZE,
        addr
      });
    } 

    return (
      <div id="heap-detail">
        {items.map((item, i) => 
          <HeapItem ref={hi => this.items[i] = hi} key={item.addr} {...item} />
        )}
      </div>
    );
  }
}

class HeapItem extends React.Component {
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

  render() {
    const {encoding} = this.state;
    const {value, addr, size} = this.props;

    // Values to display
    const decodedValue = (encoding == Encodings.CHAR) 
      ? decode(value, encoding)
      : format(decode(value, encoding), encoding);

    let bytes = Array.from(new Uint8Array(value.toBuffer()));


    return (
      <div ref="item" className="heap-item">
        <div style={encStyle[encoding]}
          className="heap-decode"
          onClick={this.toggleDecoding}>
          <span className="heap-decode-encoding">{ENC_NAMES[encoding]}</span>
          <span className="heap-decode-content"
            dangerouslySetInnerHTML={{__html: decodedValue}} />
        </div>
        <div className="heap-raw">
        {bytes.map((val, i) => 
          <Byte
            key={addr + i}
            value={val}
            address={addr + i}
            aligned={!i} />
        )}
        </div>
      </div>
    );
  }
}

class Byte extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {aligned, value, address} = this.props;
    // Render byte's value in hex, along with address 
    return (
      <div ref="thisbyte" className={`heap-byte ${aligned ? 'aligned' : ''}`}>
        <span className="byte-value">{pad(value.toString(16), 2)}</span>
        {/*<span className="byte-address" onClick={() => toggleBreak(address)}>
          {address.toString(16)}
        </span>*/}
      </div>
    );
  }
}
