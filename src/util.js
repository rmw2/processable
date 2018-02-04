/**
 * A module of strange utility functions that don't belong anywhere else
 * 
 * Anything in here is likely to be some hacky glue for the front-end
 * display, quarantined in here so that we don't pollute the code base
 * with such grossness.
 */

const NAMES = ['hex', 'int', 'uint', 'char', 'bin'];

/**
 * Function to pass to setState to toggle encoding between the above options
 */
export function nextEncoding(state) {
	const nextIdx = (state.encIdx + 1) % NAMES.length;
	return {
		encoding: NAMES[nextIdx],
		encIdx: nextIdx
	};
}

// Common stles for each encoding
export const encStyle = {
	// String mapping
    hex:  {backgroundColor:  '#ffe3e3'},
    int:  {backgroundColor:  '#ccfff6'},
    uint: {backgroundColor:  '#e0ffdc'},
    char: {backgroundColor:  '#fffdda'},
    bin:  {backgroundColor:  '#deddff'},

    // Super hack, repeat mapping by index
    0:    {backgroundColor:  '#ffe3e3'},
    1:    {backgroundColor:  '#ccfff6'},
    2:    {backgroundColor:  '#e0ffdc'},
    3:    {backgroundColor:  '#fffdda'},
    4:    {backgroundColor:  '#deddff'}
};

export const regStyle = {
    1: {backgroundColor: '#c9a762'},
    2: {backgroundColor: '#b48166'},
    4: {backgroundColor: '#9a4456'},
    8: {backgroundColor: '#742c3d'},
};