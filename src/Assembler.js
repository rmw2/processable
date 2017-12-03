/**
 * An assembler module, to parse an assembly file and convert it 
 * to objects understood by our debugger
 */

/**
 * Assemble a text file containing assembly instructions in AT&T syntax
 * and return an object mapping labels to addresses, parellel lists of
 * instruction strings and instruction addresses, and an object to 
 * describe staticly allocated data.
 */
export default function assemble(asm) {
	let addresses = [];
	let instructions = [];
	let labels = {};
	let addr = 0;

	let section = '';

	// Split assembly file by line
	const lines = asm.split('\n');

	for (let line of lines) {
		// Remove comments
		let [code, ...comments] = line.trim().split('#');
		// Split on whitespace or commas
		let tokens = code.split(/[\s,]+/g);

		// Parse label (and remove from instruction)
		if (tokens[0] && tokens[0].endsWith(':'))
			labels[tokens.shift().slice(0,-1)] = addr;

		// Parse directive
		if (tokens[0] && tokens[0].startsWith('.')) {
			switch (tokens[0]) {
				case '.section':
					section = tokens[1];
					break;
				case '.text':
					section = '.text';
				// TODO: handle static allocation etc. 
			}

			continue;
		}

		// Add instruction to instruction list & increment address
		if (section === '.text' && tokens.length > 0 && tokens[0]) {
			instructions.push(tokens);
			addresses.push(addr);
			addr += 1; // REPLACE WITH LENGTH OF INSTRUCTION AT SOME POINT
		}
	}

	return { instructions, addresses, labels };
}

module.exports = { assemble };