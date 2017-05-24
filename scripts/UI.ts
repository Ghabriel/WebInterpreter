// Copyright 2017 Ghabriel Nunes <ghabriel.nunes@gmail.com>

import {Parser} from "./core/Parser"
import {Program} from "./core/Program"

export class UI {
	constructor(inputSel: string, outputSel: string,
				submitSel: string, parser: Parser) {
		this.input = <HTMLInputElement> document.querySelector(inputSel);
		this.output = <HTMLElement> document.querySelector(outputSel);
		this.submit = <HTMLElement> document.querySelector(submitSel);
		this.parser = parser;

		let self = this;
		Program.setLogger(function(text: string) {
			self.output.innerHTML += text;
		});

		this.bindEvents();
	}

	public bindEvents(): void {
		let input = this.input;
		let output = this.output;
		let submit = this.submit;
		let parser = this.parser;
		let self = this;

		submit.addEventListener("click", function() {
			try {
				parser.parse(input.value);
				self.historyPointer = self.HISTORY_END;
				self.history.push(input.value);
				input.value = "";
			} catch (e) {
				output.innerHTML += e.message + "\n";
			}
		})

		let cachedInput: string;
		input.addEventListener("keydown", function(e) {
			let index: number;
			switch (e.keyCode) {
				case 27: // esc key
					self.historyPointer = self.HISTORY_END;
					this.value = "";
					break;
				case 190: // dot
					if (this.value != "") {
						break;
					}
					// intentional fall-through
				case 38: // up arrow
					if (self.historyPointer == self.HISTORY_END) {
						cachedInput = input.value;
					}

					if (self.historyPointer < self.history.length - 1) {
						self.historyPointer++;
						index = self.history.length - 1 - self.historyPointer;
						this.value = self.history[index];
					}
					e.preventDefault();
					break;
				case 40: // down arrow
					if (self.historyPointer > 0) {
						self.historyPointer--;
						index = self.history.length - 1 - self.historyPointer;
						this.value = self.history[index];
					} else if (self.historyPointer == 0) {
						self.historyPointer--;
						this.value = cachedInput;
					}
					e.preventDefault();
					break;
			}
		});

		input.addEventListener("keyup", function(e) {
			switch (e.keyCode) {
				case 13:
					submit.click();
					break;
			}
		});
	}

	private input: HTMLInputElement;
	private output: HTMLElement;
	private submit: HTMLElement;
	private parser: Parser;
	private history: string[] = [];
	private readonly HISTORY_END = -1;
	private historyPointer: number = this.HISTORY_END;
}
