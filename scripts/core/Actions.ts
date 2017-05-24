// Copyright 2017 Ghabriel Nunes <ghabriel.nunes@gmail.com>

import {Errors} from "./Errors"
import {Program} from "./Program"
import * as fn from "./Functions"

export interface Node {
	execute: (program: Program) => void;
}

function trace(program: Program, name: string, value: any) {
	Program.log("\t" + name + ": " + value + "\n");
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

const ERROR = undefined;

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
				let data = program.lookup(name);
				if (data === null) {
					Errors.undeclaredVariable(name);
					program.pushValue(ERROR);
					return;
				}

				let value = data.value;
				program.pushValue(value);

				Program.log("variable retrieval:\n");
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
				program.scope().insert(name, {
					value: value
				});

				Program.log("assignment:\n");
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
					let param = program.popValue();
					if (param === ERROR) {
						return;
					}
					list.push(param);
				}
				list.reverse();

				if (fn.hasOwnProperty(name)) {
					fn[name].apply(null, list);
				} else {
					Program.log("call:\n");
					trace(program, "name", name);
					trace(program, "#params", params.length);
					trace(program, "params", "[" + list.join(",") + "]");
				}
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

				Program.log("if:\n");
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

				Program.log("operator:\n");
				trace(program, "lhs", lhsValue);
				trace(program, "rhs", rhsValue);
				trace(program, "operation", op);
				trace(program, "result", result);
			}
		}
	}
}
