// Copyright 2017 Ghabriel Nunes <ghabriel.nunes@gmail.com>

import {Node} from "./Actions"
import {SymbolTable} from "./SymbolTable"

type Logger = (text: string) => void;

export class Program {
	public finish(): void {
		console.log("Program finished.");
	}

	public execute(command: Node): void {
		command.execute(this);
	}

	public openScope(): void {
		this.symbolTables.push(new SymbolTable());
	}

	public closeScope(): void {
		this.symbolTables.pop();
	}

	public pushValue(value: any): void {
		this.valueStack.push(value);
	}

	public popValue(): any {
		return this.valueStack.pop();
	}

	public log(text: string): void {
		if (Program.logger) {
			Program.logger(text);
		}
	}

	public static setLogger(logger: Logger) {
		this.logger = logger;
	}

	private static logger: Logger = null;
	private valueStack: any[] = [];
	private symbolTables: SymbolTable[] = [];
}
