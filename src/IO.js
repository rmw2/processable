/**
 * A module to represent io targets
 * and abstractions like files and the console
 */

// BIG OL' TODO.  THIS SEEMS TRICKY
export default class Console {
	constructor() {

	}

	read() {

	}

	write(str) {

	}
}

// Use cases...

// call printf
// -> get arguments
// -> generate string to print
// -> write string to fd 1 (console)
// -> display string in console

// call scanf
// -> get arguments
// -> read string from fd 0
// -> request last string from console
// -> parse string, write data to addresses

//