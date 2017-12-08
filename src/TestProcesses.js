const { Process } = require('./Process.js');

const fibonacci = {
	text: [
		['pushl', 	'$1'],
		['pushl', 	'$1'],
		['movq', 	'$0', '%eax'],
		['addl', 	'$1', '%eax'],
		['movl', 	'4(%rsp)','%ebx'],
		['movl', 	'(%rsp)','%ecx'],
		['addl', 	'%ecx', '%ebx'],
		['jb', 		'end'],
		['pushl', 	'%ebx'],
		['jmp',		'loop'],
		['hlt']
	],

	labels: {
		loop: 0x03,
		end: 0x0a
	},
};

module.exports = { fibonacci };

let p = new Process(fibonacci.text, fibonacci.labels);