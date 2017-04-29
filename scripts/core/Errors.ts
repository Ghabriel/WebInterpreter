// Copyright 2017 Ghabriel Nunes <ghabriel.nunes@gmail.com>

import {Program} from "./Program"

export namespace Errors {
	function error(text: string): void {
		Program.log("Semantic error: " + text + "\n");
	}

	export function undeclaredVariable(name: string): void {
		error("Undeclared variable '" + name + "'");
	}
}
