import { FixedInt, ALU } from '../../fixed-int/FixedInt.js';

const chip = function() {
	let mnems = {
		/*************************************************************
		 * Data Movement Instructions 
		 *************************************************************/
		MOV : () => {

		},

		MVN : () => {

		}, 

		STR : () => {

		},

		STP : () => {

		},

		/*************************************************************
		 * Control Flow Instructions 
		 *************************************************************/
		B : () => {

		},

		BL : () => {

		},

		BLR : () => {

		},

		RET : () => {

		},

		/*************************************************************
		 * Arithmetic Instructions
		 *************************************************************/
		ADD : () => {

		},

		SUB : () => {

		},

		ADC : () => {

		},

		SBC : () => {

		},

		NEG : () => {

		},

		ASR	: () => {

		},

		LSL	: () => {
		
		},


		LSR	: () => {

		},

		ROR	: () => {

		},

		/*************************************************************
		 * Logical Instructions
		 *************************************************************/
		AND : () => {

		},

		BIC : () => {

		},

		ORR : () => {

		},

		ORN : () => {

		},

		EOR : () => {

		},

		EON : () => {

		},

		/*************************************************************
		 * Comparison Instructions 
		 *************************************************************/
		CMP : () => {

		},

		CMN : () => {

		},

		TST : () => {

		},
	};
}

const registers = {
	info: {
		size: 8,
		n: 32
	},

	// Register definition:
	// Stack pointer SP, and 31 registers X0 - X30
	mapping: [{
		SP: [0,8],
		WSP: [0,4],
	}].concat((new Array(31).fill(0)).map((_,i) => ({
		[`X${i}`]: [8*(i+1), 8],
		[`W${i}`]: [8*(i+1), 4]
	}))),

	/**
	 * Status flags register
	 */
	flags: {
		Z: false, // Zero
		C: false, // Carry
		N: false, // Negative (sign)
		V: false, // Overflow
	}
};