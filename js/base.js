define("core/Parser", ["require", "exports"], function (require, exports) {
    "use strict";
});
define("core/Definitions", ["require", "exports"], function (require, exports) {
    "use strict";
});
define("core/Errors", ["require", "exports", "core/Program"], function (require, exports, Program_1) {
    "use strict";
    var Errors;
    (function (Errors) {
        function error(text) {
            Program_1.Program.log("Semantic error: " + text + "\n");
        }
        function undeclaredVariable(name) {
            error("Undeclared variable '" + name + "'");
        }
        Errors.undeclaredVariable = undeclaredVariable;
    })(Errors = exports.Errors || (exports.Errors = {}));
});
define("core/Actions", ["require", "exports", "core/Errors", "core/Program"], function (require, exports, Errors_1, Program_2) {
    "use strict";
    function trace(program, name, value) {
        Program_2.Program.log("\t" + name + ": " + value + "\n");
    }
    function execute(block, program) {
        for (var _i = 0, block_1 = block; _i < block_1.length; _i++) {
            var node = block_1[_i];
            node.execute(program);
        }
    }
    var operators = {
        "+": function (lhs, rhs) { return lhs + rhs; },
        "-": function (lhs, rhs) { return (lhs || 0) - rhs; },
        "*": function (lhs, rhs) { return lhs * rhs; },
        "/": function (lhs, rhs) { return lhs / rhs; },
        "**": function (lhs, rhs) { return Math.pow(lhs, rhs); },
        "%": function (lhs, rhs) { return lhs % rhs; },
        "==": function (lhs, rhs) { return lhs == rhs; },
        "!=": function (lhs, rhs) { return lhs != rhs; },
        "<>": function (lhs, rhs) { return lhs != rhs; },
        "<": function (lhs, rhs) { return lhs < rhs; },
        ">": function (lhs, rhs) { return lhs > rhs; },
        "<=": function (lhs, rhs) { return lhs <= rhs; },
        ">=": function (lhs, rhs) { return lhs >= rhs; }
    };
    var ERROR = undefined;
    var Actions;
    (function (Actions) {
        function primitive(value) {
            return {
                execute: function (program) {
                    program.pushValue(value);
                }
            };
        }
        Actions.primitive = primitive;
        function id(name) {
            return {
                execute: function (program) {
                    var scope = program.scope();
                    var data = scope.lookup(name);
                    if (data === null) {
                        Errors_1.Errors.undeclaredVariable(name);
                        program.pushValue(ERROR);
                        return;
                    }
                    var value = data.value;
                    program.pushValue(value);
                    Program_2.Program.log("variable retrieval:\n");
                    trace(program, "name", name);
                    trace(program, "value", value);
                }
            };
        }
        Actions.id = id;
        function assignment(name, rhs, assignType) {
            return {
                execute: function (program) {
                    rhs.execute(program);
                    var value = program.popValue();
                    program.scope().insert(name, {
                        value: value
                    });
                    Program_2.Program.log("assignment:\n");
                    trace(program, "variable", name);
                    trace(program, "value", value);
                    trace(program, "assignType", assignType);
                }
            };
        }
        Actions.assignment = assignment;
        function call(name, params) {
            return {
                execute: function (program) {
                    execute(params, program);
                    var list = [];
                    for (var i = 0; i < params.length; i++) {
                        var param = program.popValue();
                        if (param === ERROR) {
                            return;
                        }
                        list.push(param);
                    }
                    list.reverse();
                    Program_2.Program.log("call:\n");
                    trace(program, "name", name);
                    trace(program, "#params", params.length);
                    trace(program, "params", "[" + list.join(",") + "]");
                }
            };
        }
        Actions.call = call;
        function conditional(condition, then, otherwise) {
            return {
                execute: function (program) {
                    condition.execute(program);
                    var value = program.popValue();
                    if (value) {
                        execute(then, program);
                    }
                    else if (otherwise) {
                        execute(otherwise, program);
                    }
                    Program_2.Program.log("if:\n");
                    trace(program, "condition", condition);
                    trace(program, "then", then);
                    trace(program, "otherwise", otherwise);
                }
            };
        }
        Actions.conditional = conditional;
        function operate(lhs, rhs, op) {
            return {
                execute: function (program) {
                    var lhsValue = null;
                    if (lhs) {
                        lhs.execute(program);
                        lhsValue = program.popValue();
                    }
                    rhs.execute(program);
                    var rhsValue = program.popValue();
                    var result = operators[op](lhsValue, rhsValue);
                    program.pushValue(result);
                    Program_2.Program.log("operator:\n");
                    trace(program, "lhs", lhsValue);
                    trace(program, "rhs", rhsValue);
                    trace(program, "operation", op);
                    trace(program, "result", result);
                }
            };
        }
        Actions.operate = operate;
    })(Actions = exports.Actions || (exports.Actions = {}));
});
define("core/SymbolTable", ["require", "exports"], function (require, exports) {
    "use strict";
    var SymbolTable = (function () {
        function SymbolTable() {
            this.symbols = {};
        }
        SymbolTable.prototype.insert = function (name, data) {
            this.symbols[name] = data;
        };
        SymbolTable.prototype.lookup = function (name) {
            if (this.symbols.hasOwnProperty(name)) {
                return this.symbols[name];
            }
            return null;
        };
        return SymbolTable;
    }());
    exports.SymbolTable = SymbolTable;
});
define("core/Program", ["require", "exports", "core/SymbolTable"], function (require, exports, SymbolTable_1) {
    "use strict";
    var Program = (function () {
        function Program() {
            this.valueStack = [];
            this.symbolTables = [];
        }
        Program.prototype.finish = function () {
            console.log("Program finished.");
        };
        Program.prototype.execute = function (command) {
            command.execute(this);
        };
        Program.prototype.openScope = function () {
            this.symbolTables.push(new SymbolTable_1.SymbolTable());
        };
        Program.prototype.closeScope = function () {
            this.symbolTables.pop();
        };
        Program.prototype.scope = function () {
            return this.symbolTables[this.symbolTables.length - 1];
        };
        Program.prototype.pushValue = function (value) {
            this.valueStack.push(value);
        };
        Program.prototype.popValue = function () {
            return this.valueStack.pop();
        };
        Program.log = function (text) {
            if (Program.logger) {
                Program.logger(text);
            }
        };
        Program.setLogger = function (logger) {
            this.logger = logger;
        };
        Program.logger = null;
        return Program;
    }());
    exports.Program = Program;
});
define("UI", ["require", "exports", "core/Program"], function (require, exports, Program_3) {
    "use strict";
    var UI = (function () {
        function UI(inputSel, outputSel, submitSel, parser) {
            this.history = [];
            this.HISTORY_END = -1;
            this.historyPointer = this.HISTORY_END;
            this.input = document.querySelector(inputSel);
            this.output = document.querySelector(outputSel);
            this.submit = document.querySelector(submitSel);
            this.parser = parser;
            var self = this;
            Program_3.Program.setLogger(function (text) {
                self.output.innerHTML += text;
            });
            this.bindEvents();
        }
        UI.prototype.bindEvents = function () {
            var input = this.input;
            var output = this.output;
            var submit = this.submit;
            var parser = this.parser;
            var self = this;
            submit.addEventListener("click", function () {
                try {
                    parser.parse(input.value);
                    self.historyPointer = self.HISTORY_END;
                    self.history.push(input.value);
                    input.value = "";
                }
                catch (e) {
                    output.innerHTML += e.message + "\n";
                }
            });
            var cachedInput;
            input.addEventListener("keydown", function (e) {
                var index;
                switch (e.keyCode) {
                    case 27:
                        self.historyPointer = self.HISTORY_END;
                        this.value = "";
                        break;
                    case 38:
                    case 190:
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
                    case 40:
                        if (self.historyPointer > 0) {
                            self.historyPointer--;
                            index = self.history.length - 1 - self.historyPointer;
                            this.value = self.history[index];
                        }
                        else if (self.historyPointer == 0) {
                            self.historyPointer--;
                            this.value = cachedInput;
                        }
                        e.preventDefault();
                        break;
                }
            });
            input.addEventListener("keyup", function (e) {
                switch (e.keyCode) {
                    case 13:
                        submit.click();
                        break;
                }
            });
        };
        return UI;
    }());
    exports.UI = UI;
});
define("Grammar", ["require", "exports", "core/Actions", "core/Program"], function (require, exports, Actions_1, Program_4) {
    "use strict";
    var ActionsWrapper = Actions_1.Actions;
    var ProgramWrapper = Program_4.Program;
    var Grammar;
    (function (Grammar) {
/* parser generated by jison 0.4.17 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
Grammar.grammar = (function(){
var program = new ProgramWrapper(); var Actions = ActionsWrapper;
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,10],$V1=[1,12],$V2=[7,15,24],$V3=[7,15,20,24],$V4=[1,18],$V5=[1,28],$V6=[1,22],$V7=[1,23],$V8=[1,27],$V9=[1,26],$Va=[1,33],$Vb=[1,34],$Vc=[1,35],$Vd=[1,36],$Ve=[1,37],$Vf=[1,38],$Vg=[1,39],$Vh=[11,18,27,30,31,32,33,34,35,36],$Vi=[18,27],$Vj=[11,18,27,30,31,32],$Vk=[11,18,27,30,31,32,33,34],$Vl=[11,18,27,30,31,32,33,34,35],$Vm=[15,20,24];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"program":3,"setup":4,"exec_command_seq":5,"finish":6,"EOF":7,"command":8,"command_seq":9,"normal_command":10,"T_EOC":11,"special_command":12,"var_assign":13,"fn_call":14,"T_IF":15,"(":16,"expr":17,")":18,"{":19,"}":20,"T_ELSE":21,"identifier":22,"assign":23,"T_ID":24,"T_ASSIGN":25,"rvalue_list":26,",":27,"T_REAL":28,"T_BOOL":29,"T_COMPARISON":30,"+":31,"-":32,"*":33,"/":34,"**":35,"%":36,"$accept":0,"$end":1},
terminals_: {2:"error",7:"EOF",11:"T_EOC",15:"T_IF",16:"(",18:")",19:"{",20:"}",21:"T_ELSE",24:"T_ID",25:"T_ASSIGN",27:",",28:"T_REAL",29:"T_BOOL",30:"T_COMPARISON",31:"+",32:"-",33:"*",34:"/",35:"**",36:"%"},
productions_: [0,[3,4],[3,1],[4,0],[6,0],[5,1],[5,2],[9,1],[9,2],[8,2],[8,1],[10,1],[10,1],[12,7],[12,11],[13,3],[22,1],[23,1],[14,4],[26,1],[26,3],[17,1],[17,1],[17,1],[17,1],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,2],[17,2],[17,3]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
 console.log("Program finished."); 
break;
case 3:
 program.openScope(); 
break;
case 4:
 program.closeScope(); 
break;
case 5: case 6:
 program.execute($$[$0]); 
break;
case 7: case 19:
 this.$ = []; this.$.push($$[$0]); 
break;
case 8:
 this.$ = $$[$0-1]; this.$.push($$[$0]); 
break;
case 9: case 34:
 this.$ = $$[$0-1]; 
break;
case 10: case 11: case 12: case 24: case 33:
 this.$ = $$[$0]; 
break;
case 13:
 this.$ = Actions.conditional($$[$0-4], $$[$0-1]); 
break;
case 14:
 this.$ = Actions.conditional($$[$0-8], $$[$0-5], $$[$0-1]); 
break;
case 15:
 this.$ = Actions.assignment($$[$0-2], $$[$0], $$[$0-1]); 
break;
case 16: case 17:
 this.$ = yytext; 
break;
case 18:
 this.$ = Actions.call($$[$0-3], $$[$0-1]); 
break;
case 20:
 this.$ = $$[$0-2]; this.$.push($$[$0]); 
break;
case 21:
 this.$ = Actions.primitive(parseFloat(yytext)); 
break;
case 22:
 this.$ = Actions.primitive(yytext == "true"); 
break;
case 23:
 this.$ = Actions.id($$[$0]); 
break;
case 25: case 26: case 27: case 28: case 29: case 30: case 31:
 this.$ = Actions.operate($$[$0-2], $$[$0], $$[$0-1]); 
break;
case 32:
 this.$ = Actions.operate(null, $$[$0], $$[$0-1]); 
break;
}
},
table: [o([15,24],[2,3],{3:1,4:2,7:[1,3]}),{1:[3]},{5:4,8:5,10:6,12:7,13:8,14:9,15:$V0,22:11,24:$V1},{1:[2,2]},{6:13,7:[2,4],8:14,10:6,12:7,13:8,14:9,15:$V0,22:11,24:$V1},o($V2,[2,5]),{11:[1,15]},o($V3,[2,10]),{11:[2,11]},{11:[2,12]},{16:[1,16]},{16:$V4,23:17,25:[1,19]},o([11,16,18,25,27,30,31,32,33,34,35,36],[2,16]),{7:[1,20]},o($V2,[2,6]),o($V3,[2,9]),{14:25,16:$V5,17:21,22:24,24:$V1,28:$V6,29:$V7,31:$V8,32:$V9},{14:25,16:$V5,17:29,22:24,24:$V1,28:$V6,29:$V7,31:$V8,32:$V9},{14:25,16:$V5,17:31,22:24,24:$V1,26:30,28:$V6,29:$V7,31:$V8,32:$V9},o([16,24,28,29,31,32],[2,17]),{1:[2,1]},{18:[1,32],30:$Va,31:$Vb,32:$Vc,33:$Vd,34:$Ve,35:$Vf,36:$Vg},o($Vh,[2,21]),o($Vh,[2,22]),o($Vh,[2,23],{16:$V4}),o($Vh,[2,24]),{14:25,16:$V5,17:40,22:24,24:$V1,28:$V6,29:$V7,31:$V8,32:$V9},{14:25,16:$V5,17:41,22:24,24:$V1,28:$V6,29:$V7,31:$V8,32:$V9},{14:25,16:$V5,17:42,22:24,24:$V1,28:$V6,29:$V7,31:$V8,32:$V9},{11:[2,15],30:$Va,31:$Vb,32:$Vc,33:$Vd,34:$Ve,35:$Vf,36:$Vg},{18:[1,43],27:[1,44]},o($Vi,[2,19],{30:$Va,31:$Vb,32:$Vc,33:$Vd,34:$Ve,35:$Vf,36:$Vg}),{19:[1,45]},{14:25,16:$V5,17:46,22:24,24:$V1,28:$V6,29:$V7,31:$V8,32:$V9},{14:25,16:$V5,17:47,22:24,24:$V1,28:$V6,29:$V7,31:$V8,32:$V9},{14:25,16:$V5,17:48,22:24,24:$V1,28:$V6,29:$V7,31:$V8,32:$V9},{14:25,16:$V5,17:49,22:24,24:$V1,28:$V6,29:$V7,31:$V8,32:$V9},{14:25,16:$V5,17:50,22:24,24:$V1,28:$V6,29:$V7,31:$V8,32:$V9},{14:25,16:$V5,17:51,22:24,24:$V1,28:$V6,29:$V7,31:$V8,32:$V9},{14:25,16:$V5,17:52,22:24,24:$V1,28:$V6,29:$V7,31:$V8,32:$V9},o($Vh,[2,32]),o($Vh,[2,33]),{18:[1,53],30:$Va,31:$Vb,32:$Vc,33:$Vd,34:$Ve,35:$Vf,36:$Vg},o($Vh,[2,18]),{14:25,16:$V5,17:54,22:24,24:$V1,28:$V6,29:$V7,31:$V8,32:$V9},{8:56,9:55,10:6,12:7,13:8,14:9,15:$V0,22:11,24:$V1},o([11,18,27,30],[2,25],{31:$Vb,32:$Vc,33:$Vd,34:$Ve,35:$Vf,36:$Vg}),o($Vj,[2,26],{33:$Vd,34:$Ve,35:$Vf,36:$Vg}),o($Vj,[2,27],{33:$Vd,34:$Ve,35:$Vf,36:$Vg}),o($Vk,[2,28],{35:$Vf,36:$Vg}),o($Vk,[2,29],{35:$Vf,36:$Vg}),o($Vl,[2,30],{36:$Vg}),o($Vl,[2,31],{36:$Vg}),o($Vh,[2,34]),o($Vi,[2,20],{30:$Va,31:$Vb,32:$Vc,33:$Vd,34:$Ve,35:$Vf,36:$Vg}),{8:58,10:6,12:7,13:8,14:9,15:$V0,20:[1,57],22:11,24:$V1},o($Vm,[2,7]),o($V3,[2,13],{21:[1,59]}),o($Vm,[2,8]),{19:[1,60]},{8:56,9:61,10:6,12:7,13:8,14:9,15:$V0,22:11,24:$V1},{8:58,10:6,12:7,13:8,14:9,15:$V0,20:[1,62],22:11,24:$V1},o($V3,[2,14])],
defaultActions: {3:[2,2],8:[2,11],9:[2,12],20:[2,1]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        function _parseError (msg, hash) {
            this.message = msg;
            this.hash = hash;
        }
        _parseError.prototype = Error;

        throw new _parseError(str, hash);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        var lex = function () {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        };
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:return 15
break;
case 2:return 21
break;
case 3:return 'T_FOR'
break;
case 4:return 'T_WHILE'
break;
case 5:return 'T_RETURN'
break;
case 6:return 'T_FUNCTION'
break;
case 7:return 30
break;
case 8:return 30
break;
case 9:return 30
break;
case 10:return 30
break;
case 11:return 30
break;
case 12:return 30
break;
case 13:return 25
break;
case 14:return 25
break;
case 15:return 25
break;
case 16:return 25
break;
case 17:return 25
break;
case 18:return 25
break;
case 19:return 25
break;
case 20:return 31
break;
case 21:return 32
break;
case 22:return 33
break;
case 23:return 34
break;
case 24:return 35
break;
case 25:return 36
break;
case 26:return 16
break;
case 27:return 18
break;
case 28:return '['
break;
case 29:return ']'
break;
case 30:return 19
break;
case 31:return 20
break;
case 32:return 27
break;
case 33:return 28
break;
case 34:return 29
break;
case 35:return 24
break;
case 36:return 11
break;
case 37:return 7
break;
case 38:return 'INVALID'
break;
}
},
rules: [/^(?:(\s|\t)+)/,/^(?:if\b)/,/^(?:else\b)/,/^(?:for\b)/,/^(?:while\b)/,/^(?:return\b)/,/^(?:function\b)/,/^(?:==)/,/^(?:!=|<>)/,/^(?:<)/,/^(?:>)/,/^(?:<=)/,/^(?:>=)/,/^(?:\+=)/,/^(?:-=)/,/^(?:\*=)/,/^(?:\/=)/,/^(?:\*\*=)/,/^(?:%=)/,/^(?:=)/,/^(?:\+)/,/^(?:-)/,/^(?:\*)/,/^(?:\/)/,/^(?:\*\*)/,/^(?:%)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:\{)/,/^(?:\})/,/^(?:,)/,/^(?:([0-9]+|[0-9]*\.[0-9]+))/,/^(?:(true|false\b))/,/^(?:([A-Za-z][A-Za-z0-9_]*))/,/^(?:(;))/,/^(?:$)/,/^(?:.)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();
})(Grammar = exports.Grammar || (exports.Grammar = {}));
});
define("Cache", ["require", "exports"], function (require, exports) {
    "use strict";
    var Cache = (function () {
        function Cache() {
        }
        Cache.setup = function () {
            if ("serviceWorker" in navigator) {
                navigator["serviceWorker"].register("cache.js", { scope: "./" }).then(function (reg) {
                    if (reg.installing) {
                        console.log("Service worker installing");
                    }
                    else if (reg.waiting) {
                        console.log("Service worker installed");
                    }
                    else if (reg.active) {
                        console.log("Service worker active");
                    }
                }).catch(function (error) {
                    console.log("Cache service failed (" + error + ")");
                });
            }
            else {
                console.log("Cache service failed (navigator.serviceWorker is not defined)");
            }
        };
        return Cache;
    }());
    exports.Cache = Cache;
});
define("main", ["require", "exports", "Cache", "Grammar", "UI"], function (require, exports, Cache_1, Grammar_1, UI_1) {
    "use strict";
    $(document).ready(function () {
        var ui = new UI_1.UI("#command", "#console", "#submit", Grammar_1.Grammar.grammar);
        Cache_1.Cache.setup();
    });
});

