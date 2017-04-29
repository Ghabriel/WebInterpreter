# WebInterpreter
A javascript-based web interpreter for custom programming languages.

During syntactic analysis, stores nodes which use the [Command pattern](https://en.wikipedia.org/wiki/Command_pattern) to be executed. Values are pushed to a stack so that nodes can retrieve them. Nodes also have access to the symbol table and other utilities.

## Project structure
* Lexical specification: grammar/scanner.jisonlex
* Syntactic/semantic specification: grammar/parser.jison
* Node types: scripts/core/Actions.ts
* Symbol definition: scripts/core/SymbolTable.ts
* UI customization: scripts/UI.ts, index.html, css/styles.css

The other files, in theory, don't need to be changed at all.

A basic example of how to use this system is implemented.

## User interface features
* Up/down arrows: history navigation
* Dot (.): equivalent to the up arrow (better usability for mobile devices)
* Esc: clears the input
* Enter: submits the input
