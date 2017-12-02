const WORD_SIZE = 8;

const chip = function () {
	return {
		/******************************************************************
		 * The almighty move
		 *****************************************************************/

		mov : (operands, size) => {
			let src = this.read(operands[0], size);
			this.write(operands[1], src, size);
		},

		push : (operands, size) => {
			let src = this.read(operands[0], size);
			let rsp = this.read('%rsp').val();
			this.write('%rsp', rsp - size);
			this.write('(%rsp)', src, size);
		},

		pop : (operands, size) => {
			let dest = this.read('(%rsp)', size);
			let rsp = this.read('%rsp').val();
			this.write('%rsp', rsp + size);
			this.write(operands[0], dest, size);
		},

		/******************************************************************
		 * Arithmetic
		 *****************************************************************/

		add : (operands, size) => {
			let src = this.read(operands[0]);
			let dest = this.read(operands[1]);
			// TODO: Set flags
			this.write(operands[1], src + dest, size)
		},

		sub : (operands, size) => {
			let src = this.read(operands[0]);
			let dest = this.read(operands[1]);
			// TODO: Set flags
			this.write(operands[1], src - dest, size)
		},

		imul : (operands, size) => {
			let src = this.read(operands[0]);
			let dest = this.read(operands[1]);
			// TODO: set flags
			this.write(operands[1], src * dest, size)
		},

		idiv : (operands, size) => {
			let src = this.read(operands[0]);
			let dest = this.read(operands[1]);
			this.write(operands[1], src / dest, size);
		},

		adc : (operands, size) => {
			let src = this.read(operands[0]);
			let dest = this.read(operands[1]);
			// TODO: Set flags
			this.write(operands[1], src + dest + this.flags.CF, size)
		},

		lea : (operands, size) => {
			let address = this.parseMemoryOperand(operands[0]);
			this.write(operands[1], address, size);
		},

		/******************************************************************
		 * Logical
		 *****************************************************************/

		xor : (operands, size) => {
			let src = this.read(operands[0]);
			let dest = this.read(operands[1]);
			// TODO: Set flags
			this.write(operands[1], src ^ dest, size);
		},

		or : (operands, size) => {
			let src = this.read(operands[0]);
			let dest = this.read(operands[1]);
			// TODO: Set flags
			this.write(operands[1], src | dest, size);
		},

		and : (operands, size) => {
			let src = this.read(operands[0]);
			let dest = this.read(operands[1]);
			// TODO: Set flags
			this.write(operands[1], src & dest, size);
		},

		/******************************************************************
		 * Unary Operations
		 *****************************************************************/

		inc : (operands, size) => {
			let dest = this.read(operands[0]);
			// TODO: Set flags
			this.write(operands[0], dest + 1, size);
		},

		dec : (operands, size) => {
			let dest = this.read(operands[0]);
			// TODO: Set flags
			this.write(operands[0], dest - 1, size);
		},

		not : (operands, size) => {
			let dest = this.read(operands[0]);
			// TODO: Set flags
			this.write(operands[0], ~dest, size);
		},

		neg : (operands, size) => {
			let dest = this.read(operands[0]);
			// TODO: Set flags
			this.write(operands[0], -dest, size)
		},

		/******************************************************************
		 * Control flow
		 *****************************************************************/

		call : (operands, size) => {
			let rsp = this.read('%rsp');
			this.write('%rsp', rsp - WORD_SIZE);
			this.write('(%rsp)', this.pc, WORD_SIZE);
			this.jump(operands[0]);
		},

		ret : (operands, size) => {
			// TODO: add optional immediate operand value to the stack 
			let ret = this.read('(%rsp)', WORD_SIZE);
			let rsp = this.read('%rsp')
			this.write('%rsp', rsp + WORD_SIZE);
			this.jump(ret);
		},

		jmp : (operands, size) => {
			this.jump(operands[0]);
		},

		/******************************************************************
		 * Shifts
		 *****************************************************************/

		shl : (operands, size) => {
			let src = this.read(operands[0]);
			let dest = this.read(operands[1]);
			// TODO: Set flags
			this.write(operands[1], dest << src, size);
		},

		shr : (operands, size) => {
			let src = this.read(operands[0]);
			let dest = this.read(operands[1]);
			// TODO: Set flags
			this.write(operands[1], dest >>> src, size);
		},

		sal : (operands, size) => {
			let src = this.read(operands[0]);
			let dest = this.read(operands[1]);
			// TODO: Set flags
			this.write(operands[1], dest << src, size);
		},

		sar : (operands, size) => {
			let src = this.read(operands[0]);
			let dest = this.read(operands[1]);
			// TODO: Set flags
			this.write(operands[1], dest >> src, size);
		},

		/******************************************************************
		 * Condition Testing
		 *****************************************************************/

		cmp : (operands, size) => {
			// Set flags according to src - dest

		},

		test : (operands, size) => {
			// Set flags according to src & dest

		}
	}
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
			'rx'   : [24, 2],
			'rh'   : [25, 1],
			'rl'   : [24, 1],
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

module.exports = { chip, registers };