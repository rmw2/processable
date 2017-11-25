/**
 * Library of C functions, fake-implemented in javascript to allow for
 * a similar debugging and i/o experience
 */

function stdlib(stdout, stdin) {
	return {
		printf: (fmt, ...args) => {
			
		}
	}
}