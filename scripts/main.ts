// Copyright 2017 Ghabriel Nunes <ghabriel.nunes@gmail.com>

/// <reference path="defs/jQuery.d.ts" />

import {Cache} from "./Cache"
import {Grammar} from "./Grammar"
import {UI} from "./UI"

$(document).ready(function() {
	let ui = new UI("#command", "#console", "#submit", Grammar.grammar);

	Cache.setup();
});
