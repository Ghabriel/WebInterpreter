// Copyright 2017 Ghabriel Nunes <ghabriel.nunes@gmail.com>

interface Symbol {

}

export class SymbolTable {
	public insert(name: string, data: Symbol): void {
		this.symbols[name] = data;
	}

	public lookup(name: string): Symbol {
		if (this.symbols.hasOwnProperty(name)) {
			return this.symbols[name];
		}
		return null;
	}

	private symbols: {[n: string]: Symbol} = {};
}
