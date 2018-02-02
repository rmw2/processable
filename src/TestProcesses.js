const { Process } = require('./Process.js');

const fibonacci = {
	image: {
		text: {
			start: 0x8048000,
			end: 0x8048016,
			contents: [
				['pushl', 	'$1'],
				['pushl', 	'$1'],
				['movl', 	'$0', '%eax'],
				['addl', 	'$1', '%eax'],
				['movl', 	'4(%rsp)','%ebx'],
				['movl', 	'(%rsp)','%ecx'],
				['addl', 	'%ecx', '%ebx'],
				['jb', 		'end'],
				['pushl', 	'%ebx'],
				['jmp',		'loop'],
				['hlt']
			],
			addresses: [
				0x8048000,
				0x8048002,
				0x8048004,
				0x8048006,
				0x8048008,
				0x804800a,
				0x804800c,
				0x804800e,
				0x8048010,
				0x8048012,
				0x8048014
			],
		},
		rodata: {},
		data: {},
		bss: {},
	},

	labels: {
		loop: 0x8048006,
		end: 0x8048014
	},
};

module.exports = { fibonacci };