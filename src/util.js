/**
 * A module of strange utility functions that don't belong anywhere else
 */

const ENCODINGS = ['hex', 'int', 'uint', 'char', 'bin'];

/**
 * Function to pass to setState to toggle encoding between the above options
 */
export function nextEncoding(state) {
	const nextIdx = (state.encIdx + 1) % ENCODINGS.length;
	return {
		encoding: ENCODINGS[nextIdx],
		encIdx: nextIdx
	};
}