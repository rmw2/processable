const { Process } = require('./Process.js');
const { Int64 } = require('./Int64.js');
const x86 = require('./x86.js');

const STACK_TOP = 0xF000;

describe('Process object', () => {
	let p = new Process([]);

	test('initializes stack and PC', () => {
		let stack = p.read('%rsp');
		expect(stack).toEqual(new Int64(STACK_TOP));
		expect(p.pc).toBe(0);
	});

	test('interprets register operands correctly', () => {
		for (let reg in Object.assign({}, ...x86.registers)) {
			expect(p.read(`%${reg}`)).toEqual(p.regs.read(reg));
		}
	});

	test('accesses memory correctly', () => {
		expect(p.read('(%rsp)')).toBe(0);
	});
});

describe('Executes', () => {
	const suffixes = ['b', 'w', 'l'];//, 'q'];
	const sizes = [1, 2, 4, 8];
	const regs = ['al', 'ax', 'eax'];

	test('mov', () => {
		for (const s in suffixes) {
			const val = Math.floor(Math.random() * 0xFF);
			// Create new process and execute
			let p = new Process([[`mov${suffixes[s]}`, `$${val}`, `%${regs[s]}`]]);
			p.step(false);
			expect(p.regs.read(regs[s])).toBe(val);

			// Create new process and execute
			let q = new Process([[`mov${suffixes[s]}`, `%${regs[s]}`, '(%rsp)']]);
			q.regs.write(regs[s], val);
			q.step(false);
			expect(q.mem.read(STACK_TOP-8, sizes[s])).toBe(val);
		}
	});

});