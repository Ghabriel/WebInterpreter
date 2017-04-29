define("core/Parser", ["require", "exports"], function (require, exports) {
    "use strict";
});
define("core/Actions", ["require", "exports"], function (require, exports) {
    "use strict";
    function trace(program, name, value) {
        program.log("\t" + name + ": " + value + "\n");
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
                    var value = 42;
                    program.pushValue(value);
                    program.log("variable retrieval:\n");
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
                    program.log("assignment:\n");
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
                    program.log("if:\n");
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
                    program.log("operator:\n");
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
        Program.prototype.pushValue = function (value) {
            this.valueStack.push(value);
        };
        Program.prototype.popValue = function () {
            return this.valueStack.pop();
        };
        Program.prototype.log = function (text) {
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
define("UI", ["require", "exports", "core/Program"], function (require, exports, Program_1) {
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
            Program_1.Program.setLogger(function (text) {
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
                    output.innerHTML = e.message;
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
define("Grammar", ["require", "exports", "core/Actions", "core/Program"], function (require, exports, Actions_1, Program_2) {
    "use strict";
    var ActionsWrapper = Actions_1.Actions;
    var ProgramWrapper = Program_2.Program;
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
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,8],$V1=[1,10],$V2=[5,13,22],$V3=[5,13,18,22],$V4=[1,16],$V5=[1,25],$V6=[1,19],$V7=[1,20],$V8=[1,24],$V9=[1,23],$Va=[1,30],$Vb=[1,31],$Vc=[1,32],$Vd=[1,33],$Ve=[1,34],$Vf=[1,35],$Vg=[1,36],$Vh=[9,16,25,28,29,30,31,32,33,34],$Vi=[16,25],$Vj=[9,16,25,28,29,30],$Vk=[9,16,25,28,29,30,31,32],$Vl=[9,16,25,28,29,30,31,32,33],$Vm=[13,18,22];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"program":3,"exec_command_seq":4,"EOF":5,"command":6,"command_seq":7,"normal_command":8,"T_EOC":9,"special_command":10,"var_assign":11,"fn_call":12,"T_IF":13,"(":14,"expr":15,")":16,"{":17,"}":18,"T_ELSE":19,"identifier":20,"assign":21,"T_ID":22,"T_ASSIGN":23,"rvalue_list":24,",":25,"T_REAL":26,"T_BOOL":27,"T_COMPARISON":28,"+":29,"-":30,"*":31,"/":32,"**":33,"%":34,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",9:"T_EOC",13:"T_IF",14:"(",16:")",17:"{",18:"}",19:"T_ELSE",22:"T_ID",23:"T_ASSIGN",25:",",26:"T_REAL",27:"T_BOOL",28:"T_COMPARISON",29:"+",30:"-",31:"*",32:"/",33:"**",34:"%"},
productions_: [0,[3,2],[3,0],[4,1],[4,2],[7,1],[7,2],[6,2],[6,1],[8,1],[8,1],[10,7],[10,11],[11,3],[20,1],[21,1],[12,4],[24,1],[24,3],[15,1],[15,1],[15,1],[15,1],[15,3],[15,3],[15,3],[15,3],[15,3],[15,3],[15,3],[15,2],[15,2],[15,3]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
 console.log("Program finished."); 
break;
case 3: case 4:
 program.execute($$[$0]); 
break;
case 5: case 17:
 this.$ = []; this.$.push($$[$0]); 
break;
case 6:
 this.$ = $$[$0-1]; this.$.push($$[$0]); 
break;
case 7: case 32:
 this.$ = $$[$0-1]; 
break;
case 8: case 9: case 10: case 22: case 31:
 this.$ = $$[$0]; 
break;
case 11:
 this.$ = Actions.conditional($$[$0-4], $$[$0-1]); 
break;
case 12:
 this.$ = Actions.conditional($$[$0-8], $$[$0-5], $$[$0-1]); 
break;
case 13:
 this.$ = Actions.assignment($$[$0-2], $$[$0], $$[$0-1]); 
break;
case 14: case 15:
 this.$ = yytext; 
break;
case 16:
 this.$ = Actions.call($$[$0-3], $$[$0-1]); 
break;
case 18:
 this.$ = $$[$0-2]; this.$.push($$[$0]); 
break;
case 19:
 this.$ = Actions.primitive(parseFloat(yytext)); 
break;
case 20:
 this.$ = Actions.primitive(yytext == "true"); 
break;
case 21:
 this.$ = Actions.id($$[$0]); 
break;
case 23: case 24: case 25: case 26: case 27: case 28: case 29:
 this.$ = Actions.operate($$[$0-2], $$[$0], $$[$0-1]); 
break;
case 30:
 this.$ = Actions.operate(null, $$[$0], $$[$0-1]); 
break;
}
},
table: [{1:[2,2],3:1,4:2,6:3,8:4,10:5,11:6,12:7,13:$V0,20:9,22:$V1},{1:[3]},{5:[1,11],6:12,8:4,10:5,11:6,12:7,13:$V0,20:9,22:$V1},o($V2,[2,3]),{9:[1,13]},o($V3,[2,8]),{9:[2,9]},{9:[2,10]},{14:[1,14]},{14:$V4,21:15,23:[1,17]},o([9,14,16,23,25,28,29,30,31,32,33,34],[2,14]),{1:[2,1]},o($V2,[2,4]),o($V3,[2,7]),{12:22,14:$V5,15:18,20:21,22:$V1,26:$V6,27:$V7,29:$V8,30:$V9},{12:22,14:$V5,15:26,20:21,22:$V1,26:$V6,27:$V7,29:$V8,30:$V9},{12:22,14:$V5,15:28,20:21,22:$V1,24:27,26:$V6,27:$V7,29:$V8,30:$V9},o([14,22,26,27,29,30],[2,15]),{16:[1,29],28:$Va,29:$Vb,30:$Vc,31:$Vd,32:$Ve,33:$Vf,34:$Vg},o($Vh,[2,19]),o($Vh,[2,20]),o($Vh,[2,21],{14:$V4}),o($Vh,[2,22]),{12:22,14:$V5,15:37,20:21,22:$V1,26:$V6,27:$V7,29:$V8,30:$V9},{12:22,14:$V5,15:38,20:21,22:$V1,26:$V6,27:$V7,29:$V8,30:$V9},{12:22,14:$V5,15:39,20:21,22:$V1,26:$V6,27:$V7,29:$V8,30:$V9},{9:[2,13],28:$Va,29:$Vb,30:$Vc,31:$Vd,32:$Ve,33:$Vf,34:$Vg},{16:[1,40],25:[1,41]},o($Vi,[2,17],{28:$Va,29:$Vb,30:$Vc,31:$Vd,32:$Ve,33:$Vf,34:$Vg}),{17:[1,42]},{12:22,14:$V5,15:43,20:21,22:$V1,26:$V6,27:$V7,29:$V8,30:$V9},{12:22,14:$V5,15:44,20:21,22:$V1,26:$V6,27:$V7,29:$V8,30:$V9},{12:22,14:$V5,15:45,20:21,22:$V1,26:$V6,27:$V7,29:$V8,30:$V9},{12:22,14:$V5,15:46,20:21,22:$V1,26:$V6,27:$V7,29:$V8,30:$V9},{12:22,14:$V5,15:47,20:21,22:$V1,26:$V6,27:$V7,29:$V8,30:$V9},{12:22,14:$V5,15:48,20:21,22:$V1,26:$V6,27:$V7,29:$V8,30:$V9},{12:22,14:$V5,15:49,20:21,22:$V1,26:$V6,27:$V7,29:$V8,30:$V9},o($Vh,[2,30]),o($Vh,[2,31]),{16:[1,50],28:$Va,29:$Vb,30:$Vc,31:$Vd,32:$Ve,33:$Vf,34:$Vg},o($Vh,[2,16]),{12:22,14:$V5,15:51,20:21,22:$V1,26:$V6,27:$V7,29:$V8,30:$V9},{6:53,7:52,8:4,10:5,11:6,12:7,13:$V0,20:9,22:$V1},o([9,16,25,28],[2,23],{29:$Vb,30:$Vc,31:$Vd,32:$Ve,33:$Vf,34:$Vg}),o($Vj,[2,24],{31:$Vd,32:$Ve,33:$Vf,34:$Vg}),o($Vj,[2,25],{31:$Vd,32:$Ve,33:$Vf,34:$Vg}),o($Vk,[2,26],{33:$Vf,34:$Vg}),o($Vk,[2,27],{33:$Vf,34:$Vg}),o($Vl,[2,28],{34:$Vg}),o($Vl,[2,29],{34:$Vg}),o($Vh,[2,32]),o($Vi,[2,18],{28:$Va,29:$Vb,30:$Vc,31:$Vd,32:$Ve,33:$Vf,34:$Vg}),{6:55,8:4,10:5,11:6,12:7,13:$V0,18:[1,54],20:9,22:$V1},o($Vm,[2,5]),o($V3,[2,11],{19:[1,56]}),o($Vm,[2,6]),{17:[1,57]},{6:53,7:58,8:4,10:5,11:6,12:7,13:$V0,20:9,22:$V1},{6:55,8:4,10:5,11:6,12:7,13:$V0,18:[1,59],20:9,22:$V1},o($V3,[2,12])],
defaultActions: {6:[2,9],7:[2,10],11:[2,1]},
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
case 1:return 13
break;
case 2:return 19
break;
case 3:return 'T_FOR'
break;
case 4:return 'T_WHILE'
break;
case 5:return 'T_RETURN'
break;
case 6:return 'T_FUNCTION'
break;
case 7:return 28
break;
case 8:return 28
break;
case 9:return 28
break;
case 10:return 28
break;
case 11:return 28
break;
case 12:return 28
break;
case 13:return 29
break;
case 14:return 30
break;
case 15:return 31
break;
case 16:return 32
break;
case 17:return 33
break;
case 18:return 34
break;
case 19:return 23
break;
case 20:return 23
break;
case 21:return 23
break;
case 22:return 23
break;
case 23:return 23
break;
case 24:return 23
break;
case 25:return 23
break;
case 26:return 14
break;
case 27:return 16
break;
case 28:return '['
break;
case 29:return ']'
break;
case 30:return 17
break;
case 31:return 18
break;
case 32:return 25
break;
case 33:return 26
break;
case 34:return 27
break;
case 35:return 22
break;
case 36:return 9
break;
case 37:return 5
break;
case 38:return 'INVALID'
break;
}
},
rules: [/^(?:(\s|\t)+)/,/^(?:if\b)/,/^(?:else\b)/,/^(?:for\b)/,/^(?:while\b)/,/^(?:ret\b)/,/^(?:function\b)/,/^(?:==)/,/^(?:!=|<>)/,/^(?:<)/,/^(?:>)/,/^(?:<=)/,/^(?:>=)/,/^(?:\+)/,/^(?:-)/,/^(?:\*)/,/^(?:\/)/,/^(?:\*\*)/,/^(?:%)/,/^(?:\+=)/,/^(?:-=)/,/^(?:\*=)/,/^(?:\/=)/,/^(?:\*\*=)/,/^(?:%=)/,/^(?:=)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:\{)/,/^(?:\})/,/^(?:,)/,/^(?:([0-9]+|[0-9]*\.[0-9]+))/,/^(?:(true|false\b))/,/^(?:([A-Za-z][A-Za-z0-9_]*))/,/^(?:(;))/,/^(?:$)/,/^(?:.)/],
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
define("main", ["require", "exports", "Grammar", "UI"], function (require, exports, Grammar_1, UI_1) {
    "use strict";
    $(document).ready(function () {
        var ui = new UI_1.UI("#command", "#console", "#submit", Grammar_1.Grammar.grammar);
    });
});
