const { Process } = require('./Process.js');
const { Int64 } = require('./Int64.js');
const x86 = require('./x86.js');

const STACK_TOP = 0xF000;

describe('simple process', () => {
	const insts = [
		['movl', '$1', '%eax'],
		['pushl', '%eax'],
		['jmp', '_start'],
	];

	const labels = {
		_start: 0
	}

	let p = new Process(insts, labels, x86.Chip);

	test('initializes stack and PC', () => {
		let stack = p.read('%rsp');
		expect(stack).toEqual(new Int64(STACK_TOP));
		//expect(stack.v).toBe(STACK_TOP);
		expect(p.rip).toBe(0);
	});

	// ['movq', '$1', '%rax'],
	p.step();
	test('moves immediate value to register', () => {
		let eax = p.read('%eax');
		expect(eax).toBe(1);
	});

	// ['pushq', '%rax'],
	p.step();
	test('pushes onto stack', () => {

	});

	// ['jmp', '_start'],
	p.step();
	test('jumps to label', () => {
		expect(p.rip).toBe(0);
	});
});

