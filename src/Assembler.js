/**
 * An assembler module, to parse an assembly file and convert it 
 * to objects understood by our debugger
 */

/**
 * An event handler for file uploads, to replace the current program with another
 */
export function uploadAndAssemble() {
	let input = event.target;
	let reader = new FileReader();

	reader.onload = () => {
		// Assemble the text
		let text = reader.result;

		let {instructions, addresses, labels} = assemble(text);
		
		// Start the process
		let p = new Process(instructions, labels);

		// Render it up
		ReactDOM.render(
			React.createElement(ProcessContainer, {process: p}), 
			document.getElementById('root')
		);
	};

	reader.readAsText(input.files[0]);
}

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
				case '.data':

			}

			continue;
		}

		// Add instruction to instruction list & increment address
		if (section === '.text' && tokens.length > 0 && tokens[0]) {
			for (let i in tokens)
				if (!tokens[i]) tokens.splice(i, 1);

			instructions.push(tokens);
			addresses.push(addr);
			addr += 1; // REPLACE WITH LENGTH OF INSTRUCTION AT SOME POINT
		}
	}

	return { instructions, addresses, labels };
}


class Assembler {
	/**
	 * Instantiate a new asesmbler object
	 */
	constructor(asm) {
		this.addresses = [];
		this.instructions = [];
		this.labels = {};

		// This maybe should go in the assemble function ?
		this.lines = asm.split('\n');

		this.assemble();
	}

	assemble() {

	}

	readData() {

	}

	readBSS() {

	}

	readText() {

	}

	readRodata() {

	}
}

module.exports = { assemble };