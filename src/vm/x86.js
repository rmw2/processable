import {FixedInt, ALU} from '../fixed-int/FixedInt.js';

const WORD_SIZE = 8;

const chip = function () {
	let mnems = {
		/******************************************************************
		 * The almighty move
		 *****************************************************************/

		mov : (operands, size) => {
			let src = this.read(operands[0], size);
			this.write(operands[1], src, size);
		},

		movabs : (operands, size) => {
			let src = this.read(operands[0], size);
			this.write(operands[1], src, size);
		},

		push : (operands, size) => {
			let src = this.read(operands[0], size);
			let rsp = this.regs.read('rsp');

			this.regs.write('rsp', rsp = ALU.sub(rsp, size));
			this.mem.write(src, +rsp);
		},

		pop : (operands, size) => {
			let rsp = this.regs.read('rsp');
			let dest = this.mem.read(+rsp, size);
			this.write('%rsp', ALU.add(rsp, size));
			this.write(operands[0], dest, size);
		},

		/******************************************************************
		 * Conversions
		 *****************************************************************/
		cltq : (operands, size) => {
			let eax = this.regs.read('eax');
			this.regs.write('edx', new FixedInt(4, (eax.isNegative) ? -1 : 0));
		},

		cqto : (operands, size) => {
			let rax = this.regs.read('rax');
			this.regs.write('rdx', new FixedInt(8, (rax.isNegative) ? -1 : 0));
		},

		/******************************************************************
		 * Arithmetic
		 *****************************************************************/

		add : (operands, size) => {
			let src = this.read(operands[0], size);
			let dest = this.read(operands[1], size);
			let result = ALU.add(src, dest);
			// Update flags
			this.regs.setFlag('CF', ALU.CF);
			this.regs.setFlag('OF', ALU.OF);
			this.regs.setFlag('ZF', ALU.ZF);
			this.regs.setFlag('SF', ALU.SF);

			this.write(operands[1], result, size)
		},

		sub : (operands, size) => {
			let src = this.read(operands[0], size);
			let dest = this.read(operands[1], size);
			let result = ALU.sub(dest, src);
			// Update flags
			this.regs.setFlag('CF', ALU.CF);
			this.regs.setFlag('OF', ALU.OF);
			this.regs.setFlag('ZF', ALU.ZF);
			this.regs.setFlag('SF', ALU.SF);
			this.write(operands[1], result, size)
		},

		imul : (operands, size) => {
			let src = this.read(operands[0], size);
			let dest = this.read(operands[1], size);
			let result = ALU.mul(dest, src);
			// updateFlags.call(this, result, size);
			this.write(operands[1], result, size);
		},

		idiv : (operands, size) => {
			// This is funky for x86 // TODO
			let src = this.read(operands[0], size);
			let dest, quoReg, remReg;

			if (size == 1) {
				dest = this.regs.read('ax');
				quoReg = 'al';
				remReg = 'ah';
			} else if (size == 2) {
				dest = new FixedInt(4, ALU.add(this.regs.read('ax'), ALU.shl(this.regs.read('dx'), 16)));
				quoReg = 'ax';
				remReg = 'dx';
			} else if (size == 4) {
				dest = new FixedInt(8, +this.regs.read('eax'), +this.regs.read('edx'));
				quoReg = 'eax';
				remReg = 'edx';
			} else {
				dest = this.regs.read('rax');
				quoReg = 'rax';
				remReg = 'rdx';
			}

			let result = ALU.div(dest, src);

			this.regs.write(quoReg, result, size);
			this.regs.write(remReg, ALU.aux, size);
		},

		adc : (operands, size) => {
			let src = this.read(operands[0], size);
			let dest = this.read(operands[1], size);
			let result = this.regs.getFlag('CF')
				? ALU.add(ALU.add(src, dest), 1)
				: ALU.add(src, dest);

			// Update flags
			this.regs.setFlag('CF', ALU.CF);
			this.regs.setFlag('OF', ALU.OF);
			this.regs.setFlag('ZF', ALU.ZF);
			this.regs.setFlag('SF', ALU.SF);

			this.write(operands[1], result, size);
		},

		lea : (operands, size) => {
			let address = new FixedInt(size, this.parseMemoryOperand(operands[0]));
			this.write(operands[1], address, size);
		},

		/******************************************************************
		 * Logical
		 *****************************************************************/

		xor : (operands, size) => {
			let src = this.read(operands[0], size);
			let dest = this.read(operands[1], size);
			let result = ALU.xor(src, dest);
			// TODO: Set flags
			this.write(operands[1], result, size);
		},

		or : (operands, size) => {
			let src = this.read(operands[0], size);
			let dest = this.read(operands[1], size);
			let result = ALU.or(src, dest);
			// TODO: Set flags
			this.write(operands[1], result, size);
		},

		and : (operands, size) => {
			let src = this.read(operands[0], size);
			let dest = this.read(operands[1], size);
			let result = ALU.and(src, dest);
			// TODO: Set flags
			this.write(operands[1], result, size);
		},

		/******************************************************************
		 * Unary Operations
		 *****************************************************************/

		inc : (operands, size) => {
			let dest = this.read(operands[0], size);
			let result = ALU.add(dest, 1);
			// SET FLAGS
			this.write(operands[0], result, size);
		},

		dec : (operands, size) => {
			let dest = this.read(operands[0], size);
			let result = ALU.sub(dest, 1);
			// SET FLAGS
			this.write(operands[0], result, size);
		},

		not : (operands, size) => {
			let dest = this.read(operands[0], size);
			let result = ALU.not(dest);
			// TODO: Set flags
			this.write(operands[0], result, size);
		},

		neg : (operands, size) => {
			let dest = this.read(operands[0], size);
			let result = ALU.neg(dest);
			// TODO: Set flags
			this.write(operands[0], result, size)
		},

		/******************************************************************
		 * Control flow
		 *****************************************************************/

		call : (operands, size) => {
			let rsp = ALU.sub(this.read('%rsp'), WORD_SIZE);
			let returnAddress = new FixedInt(WORD_SIZE, this.pc);

			this.regs.write('rsp', rsp);
			this.mem.write(returnAddress, rsp, WORD_SIZE);

			this.jump(operands[0]);
		},

		ret : (operands, size) => {
			// TODO: add optional immediate operand value to the stack
			let ret = this.read('(%rsp)', WORD_SIZE);
			let rsp = this.read('%rsp');
			this.write('%rsp', ALU.add(rsp, WORD_SIZE));
			this.jump(+ret);
		},

		jmp : (operands, size) => {
			this.jump(operands[0]);
		},

		je : (operands, size) => {
			if (this.regs.getFlag('ZF'))
				this.jump(operands[0]);
		},

		jne : (operands, size) => {
			if (!this.regs.getFlag('ZF'))
				this.jump(operands[0]);
		},

		jo : (operands, size) => {
			if (this.regs.getFlag('OF'))
				this.jump(operands[0]);
		},

		jno : (operands, size) => {
			if (!this.regs.getFlag('OF'))
				this.jump(operands[0]);
		},

		ja : (operands, size) => {
			if (!this.regs.getFlag('CF'))
				this.jump(operands[0]);
		},

		jae : (operands, size) => {
			if (!this.regs.getFlag('CF') || this.regs.getFlag('ZF'))
				this.jump(operands[0]);
		},

		jb : (operands, size) => {
			if (this.regs.getFlag('CF'))
				this.jump(operands[0]);
		},

		jbe : (operands, size) => {
			if (this.regs.getFlag('CF') || this.regs.getFlag('ZF'))
				this.jump(operands[0]);
		},

		jg : (operands, size) => {
			if (this.regs.getFlag('OF') === this.regs.getFlag('SF') && !this.regs.getFlag('ZF'))
				this.jump(operands[0]);
		},

		jge : (operands, size) => {
			if (this.regs.getFlag('OF') === this.regs.getFlag('SF') || this.regs.getFlag('ZF'))
				this.jump(operands[0]);
		},

		jl : (operands, size) => {
			if (this.regs.getFlag('OF') !== this.regs.getFlag('SF') && !this.regs.getFlag('ZF'))
				this.jump(operands[0]);
		},

		jle : (operands, size) => {
			if (this.regs.getFlag('OF') !== this.regs.getFlag('SF'))
				this.jump(operands[0]);
		},

		js : (operands, size) => {
			if (this.regs.getFlag('SF'))
				this.jump(operands[0]);
		},

		jns : (operands, size) => {
			if (!this.regs.getFlag('SF'))
				this.jump(operands[0]);
		},

		jcxz : (operands, size) => {
			if (this.regs.read('cx') === 0)
				this.jump(operands[0]);
		},

		jecxz : (operands, size) => {
			if (this.regs.read('ecx') === 0)
				this.jump(operands[0]);
		},

		/******************************************************************
		 * Shifts
		 *****************************************************************/

		shl : (operands, size) => {
			let src = this.read(operands[0]);
			let dest = this.read(operands[1]);
			let result = ALU.shl(dest, src);
			// TODO: Set flags
			this.write(operands[1], result, size);
		},

		shr : (operands, size) => {
			let src = this.read(operands[0]);
			let dest = this.read(operands[1]);
			let result = ALU.shr(dest, src);
			// TODO: Set flags
			this.write(operands[1], result, size);
		},

		sal : (operands, size) => {
			let src = this.read(operands[0]);
			let dest = this.read(operands[1]);
			let result = ALU.shl(dest, src);
			// TODO: Set flags
			this.write(operands[1], result, size);
		},

		sar : (operands, size) => {
			let src = this.read(operands[0]);
			let dest = this.read(operands[1]);
			let result = ALU.sar(dest, src)
			// TODO: Set flags
			this.write(operands[1], result, size);
		},

		/******************************************************************
		 * Explicit flag control
		 *****************************************************************/

		stc : () => {
			this.regs.setFlag('CF', true);
		},

		clc : () => {
			this.regs.setFlag('CF', false);
		},

		cmc : () => {
			this.regs.setFlag('CF', !this.regs.getFlag('CF'));
		},


		/******************************************************************
		 * Condition Testing
		 *****************************************************************/

		cmp : (operands, size) => {
			// Set flags according to src - dest
			ALU.sub(this.read(operands[0], size), this.read(operands[1], size));
			// Update flags
			this.regs.setFlag('CF', ALU.CF);
			this.regs.setFlag('OF', ALU.OF);
			this.regs.setFlag('ZF', ALU.ZF);
			this.regs.setFlag('SF', ALU.SF);
		},

		test : (operands, size) => {
			// Set flags according to src & dest
			ALU.and(this.read(operands[0]), this.read(operands[1]));
			// Update flags
			this.regs.setFlag('CF', ALU.CF);
			this.regs.setFlag('OF', ALU.OF);
			this.regs.setFlag('ZF', ALU.ZF);
			this.regs.setFlag('SF', ALU.SF);
		},

		hlt : () => {
			this.pc = undefined;
		}
	}

	// Setup aliases
	mnems.jz  = mnems.je;
	mnems.jnz = mnems.jne;
	mnems.jc  = mnems.jb;
	mnems.jnc = mnems.jae;

	mnems.jnb  = mnems.jae;
	mnems.jnbe = mnems.ja;
	mnems.jna  = mnems.jbe;
	mnems.jnae = mnems.jb;

	mnems.jng  = mnems.jle;
	mnems.jnge = mnems.jl;
	mnems.jnl  = mnems.jge;
	mnems.jnle = mnems.jg;

	return mnems;
}

const registers = {
	info: {
		size: 8,
		n: 16
	},

	mapping: [
		{
			'rax'  : [0, 8],
			'eax'  : [0, 4],
			'ax'   : [0, 2],
			'ah'   : [1, 1],
			'al'   : [0, 1],
		},
		{
			'rbx'  : [8, 8],
			'ebx'  : [8, 4],
			'bx'   : [8, 2],
			'bh'   : [9, 1],
			'bl'   : [8, 1],
		},
		{
			'rcx'  : [16, 8],
			'ecx'  : [16, 4],
			'cx'   : [16, 2],
			'ch'   : [17, 1],
			'cl'   : [16, 1],
		},
		{
			'rdx'  : [24, 8],
			'edx'  : [24, 4],
			'dx'   : [24, 2],
			'dh'   : [25, 1],
			'dl'   : [24, 1],
		},
		{
			'rsp'  : [32, 8],
			'esp'  : [32, 4],
			'sp'   : [32, 2],
			'spl'  : [32, 1],
		},
		{
			'rbp'  : [40, 8],
			'ebp'  : [40, 4],
			'bp'   : [40, 2],
			'bpl'  : [40, 1],
		},
		{
			'rsi'  : [48, 8],
			'esi'  : [48, 4],
			'si'   : [48, 2],
			'sil'  : [48, 1],
		},
		{
			'rdi'  : [56, 8],
			'edi'  : [56, 4],
			'di'   : [56, 2],
			'dil'  : [56, 1],
		},
		{
			'r8'   : [64, 8],
			'r8d'  : [64, 4],
			'r8w'  : [64, 2],
			'r8b'  : [64, 1],
		},
		{
			'r9'   : [72, 8],
			'r9d'  : [72, 4],
			'r9w'  : [72, 2],
			'r9b'  : [72, 1],
		},
		{
			'r10'  : [80, 8],
			'r10d' : [80, 4],
			'r10w' : [80, 2],
			'r10b' : [80, 1],
		},
		{
			'r11'  : [88, 8],
			'r11d' : [88, 4],
			'r11w' : [88, 2],
			'r11b' : [88, 1],
		},
		{
			'r12'  : [96, 8],
			'r12d' : [96, 4],
			'r12w' : [96, 2],
			'r12b' : [96, 1],
		},
		{
			'r13'  : [104, 8],
			'r13d' : [104, 4],
			'r13w' : [104, 2],
			'r13b' : [104, 1],
		},
		{
			'r14'  : [112, 8],
			'r14d' : [112, 4],
			'r14w' : [112, 2],
			'r14b' : [112, 1],
		},
		{
			'r15'  : [120, 8],
			'r15d' : [120, 4],
			'r15w' : [120, 2],
			'r15b' : [120, 1],
		}
	],

	/**
	 * Status flags register
	 */
	flags: {
		OF: false,
		SF: false,
		ZF: false,
		AF: false,
		CF: false,
		PF: false,
	}
};

// Exports
const x86 = { chip, registers, WORD_SIZE};
export default x86;
module.exports = x86;