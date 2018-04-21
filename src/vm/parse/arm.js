import { FixedInt } from '../../fixed-int/FixedInt.js';


/*
Where a mnemonic is overloaded then an assembler shall determine 
the precise form of the instruction from the size of the *first* 
register operand.
*/

function arm(wordsize) {

	this.read = (operand, size=wordsize) => {
		if (operand === 'WZR' || operand === 'XZR')
			return new FixedInt(size);
	};

	this.write = (operand, value, size=wordsize) => {
		if (operand === 'WZR' || operand === 'XZR') 
			return;
	};

	this.jump = () => {

	};

	this.execute = () => {

	};
}