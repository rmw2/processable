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

const hello = {
	image: {
		text: {
			start: 134512640,
			end: 134512660,
			contents: [
				["pushl", "%ebp"],
				["movl", "%esp", "%ebp"],
				["movabsq", "$pcGreeting", "%rdi"],
				["call", "printf"],
				["movl", "$4", "%eax"],
				["addl", "%eax", "%esp"],
				["movl", "$0", "%eax"],
				["movl", "%ebp", "%esp"],
				["popl", "%ebp"],
				["ret"],
			],
			addresses: [
				134512640,
				134512642,
				134512644,
				134512646,
				134512648,
				134512650,
				134512652,
				134512654,
				134512656,
				134512658,
			],
		},
		rodata: {
			start: 134512660,
			end: 134512674,
			contents: new Uint8Array('Hello World!\n\0'.split('').map((c) => c.charCodeAt(0))).buffer,
		},
		bss: {},
		data: {},
	},
	labels: {
		pcGreeting: 134512660
	}
};

module.exports = { fibonacci, hello };