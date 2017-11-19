const { Process } = require('./Process.js');
const { Int64 } = require('./Int64.js');
const x86 = require('./x86.js');

const STACK_TOP = 0xF000;

describe('Process object', () => {
	let p = new Process([], {}, x86.Chip);

	test('initializes stack and PC', () => {
		let stack = p.read('%rsp');
		expect(stack).toEqual(new Int64(STACK_TOP));
		expect(p.rip).toBe(0);
	});

	test('interprets register operands correctly', () => {
		for (let reg in x86.Registers) {
			expect(p.read(`%${reg}`)).toEqual(p.regs.read(reg));
		}
	});

	test('accesses memory correctly', () => {

	});
});

describe('Executes', () => {

	const suffixes = ['b', 'w', 'l', 'q'];
	const operandPairs = [
		['$0x12', '%rax'],
		['%rax', '']
	];

	test('mov', () => {
		for (s in suffixes) {

		}
	});
});