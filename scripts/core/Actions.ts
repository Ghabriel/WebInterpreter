// Copyright 2017 Ghabriel Nunes <ghabriel.nunes@gmail.com>

import {Program} from "./Program"

export interface Node {
	execute: (program: Program) => void;
}

function trace(program: Program, name: string, value: any) {
	program.log("\t" + name + ": " + value + "\n");
	// console.log(name, value);
}

function execute(block: Node[], program: Program) {
	for (let node of block) {
		node.execute(program);
	}
}

let operators = {
	"+": function(lhs, rhs) { return lhs + rhs; },
	"-": function(lhs, rhs) { return (lhs || 0) - rhs; },
	"*": function(lhs, rhs) { return lhs * rhs; },
	"/": function(lhs, rhs) { return lhs / rhs; },
	"**": function(lhs, rhs) { return lhs ** rhs; },
	"%": function(lhs, rhs) { return lhs % rhs; },

	"==": function(lhs, rhs) { return lhs == rhs; },
	"!=": function(lhs, rhs) { return lhs != rhs; },
	"<>": function(lhs, rhs) { return lhs != rhs; },
	"<": function(lhs, rhs) { return lhs < rhs; },
	">": function(lhs, rhs) { return lhs > rhs; },
	"<=": function(lhs, rhs) { return lhs <= rhs; },
	">=": function(lhs, rhs) { return lhs >= rhs; },
};

export namespace Actions {
	export function primitive(value: any): Node {
		return {
			execute: function(program: Program) {
				program.pushValue(value);
			}
		};
	}

	export function id(name: string): Node {
		return {
			execute: function(program: Program) {
				let value = 42;
				program.pushValue(value);

				program.log("variable retrieval:\n");
				trace(program, "name", name);
				trace(program, "value", value);
			}
		}
	}

	export function assignment(name: string, rhs: Node, assignType: string): Node {
		return {
			execute: function(program: Program) {
				rhs.execute(program);
				let value = program.popValue();

				program.log("assignment:\n");
				trace(program, "variable", name);
				trace(program, "value", value);
				trace(program, "assignType", assignType);
			}
		};
	}

	export function call(name: string, params: Node[]): Node {
		return {
			execute: function(program: Program) {
				execute(params, program);
				let list = [];
				for (let i = 0; i < params.length; i++) {
					list.push(program.popValue());
				}
				list.reverse();

				program.log("call:\n");
				trace(program, "name", name);
				trace(program, "#params", params.length);
				trace(program, "params", "[" + list.join(",") + "]");
			}
		};
	}

	export function conditional(condition: Node, then: Node[], otherwise: Node[]): Node {
		return {
			execute: function(program: Program) {
				condition.execute(program);
				let value = program.popValue();
				if (value) {
					execute(then, program);
				} else if (otherwise) {
					execute(otherwise, program);
				}

				program.log("if:\n");
				trace(program, "condition", condition);
				trace(program, "then", then);
				trace(program, "otherwise", otherwise);
			}
		};
	}

	export function operate(lhs: Node, rhs: Node, op: string): Node {
		return {
			execute: function(program: Program) {
				let lhsValue = null;
				if (lhs) {
					lhs.execute(program);
					lhsValue = program.popValue();
				}

				rhs.execute(program);
				let rhsValue = program.popValue();

				let result = operators[op](lhsValue, rhsValue);
				program.pushValue(result);

				program.log("operator:\n");
				trace(program, "lhs", lhsValue);
				trace(program, "rhs", rhsValue);
				trace(program, "operation", op);
				trace(program, "result", result);
			}
		}
	}
}
