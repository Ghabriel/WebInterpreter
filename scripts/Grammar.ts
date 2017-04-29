// Copyright 2017 Ghabriel Nunes <ghabriel.nunes@gmail.com>

import {Actions} from "./core/Actions"
import {Parser} from "./core/Parser"
import {Program} from "./core/Program"

// Used by the generated grammar
let ActionsWrapper = Actions;
let ProgramWrapper = Program;

export namespace Grammar {
	export let grammar: Parser;
}
