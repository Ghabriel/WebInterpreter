define("core/Parser",["require","exports"],function(t,e){"use strict"}),define("core/Definitions",["require","exports"],function(t,e){"use strict"}),define("core/Errors",["require","exports","core/Program"],function(t,e,n){"use strict";var r;!function(t){function e(t){n.Program.log("Semantic error: "+t+"\n")}function r(t){e("Undeclared variable '"+t+"'")}t.undeclaredVariable=r}(r=e.Errors||(e.Errors={}))}),define("core/Functions",["require","exports","core/Program"],function(t,e,n){"use strict";function r(t){n.Program.log("[PRINT] "+t+"\n")}e.print=r}),define("core/Actions",["require","exports","core/Errors","core/Program","core/Functions"],function(t,e,n,r,i){"use strict";function s(t,e,n){r.Program.log("\t"+e+": "+n+"\n")}function o(t,e){for(var n=0,r=t;n<r.length;n++){var i=r[n];i.execute(e)}}var c,a={"+":function(t,e){return t+e},"-":function(t,e){return(t||0)-e},"*":function(t,e){return t*e},"/":function(t,e){return t/e},"**":function(t,e){return Math.pow(t,e)},"%":function(t,e){return t%e},"==":function(t,e){return t==e},"!=":function(t,e){return t!=e},"<>":function(t,e){return t!=e},"<":function(t,e){return t<e},">":function(t,e){return t>e},"<=":function(t,e){return t<=e},">=":function(t,e){return t>=e}},h=void 0;!function(t){function e(t){return{execute:function(e){e.pushValue(t)}}}function c(t){return{execute:function(e){var i=e.lookup(t);if(null===i)return n.Errors.undeclaredVariable(t),void e.pushValue(h);var o=i.value;e.pushValue(o),r.Program.log("variable retrieval:\n"),s(e,"name",t),s(e,"value",o)}}}function l(t,e,n){return{execute:function(i){e.execute(i);var o=i.popValue();i.scope().insert(t,{value:o}),r.Program.log("assignment:\n"),s(i,"variable",t),s(i,"value",o),s(i,"assignType",n)}}}function u(t,e){return{execute:function(n){o(e,n);for(var c=[],a=0;a<e.length;a++){var l=n.popValue();if(l===h)return;c.push(l)}c.reverse(),i.hasOwnProperty(t)?i[t].apply(null,c):(r.Program.log("call:\n"),s(n,"name",t),s(n,"#params",e.length),s(n,"params","["+c.join(",")+"]"))}}}function y(t,e,n){return{execute:function(i){t.execute(i);var c=i.popValue();c?o(e,i):n&&o(n,i),r.Program.log("if:\n"),s(i,"condition",t),s(i,"then",e),s(i,"otherwise",n)}}}function p(t,e,n){return{execute:function(i){var o=null;t&&(t.execute(i),o=i.popValue()),e.execute(i);var c=i.popValue(),h=a[n](o,c);i.pushValue(h),r.Program.log("operator:\n"),s(i,"lhs",o),s(i,"rhs",c),s(i,"operation",n),s(i,"result",h)}}}t.primitive=e,t.id=c,t.assignment=l,t.call=u,t.conditional=y,t.operate=p}(c=e.Actions||(e.Actions={}))}),define("core/Settings",["require","exports"],function(t,e){"use strict";var n;!function(t){t.SCOPE_ASCENDING_LOOKUP=!0}(n=e.Settings||(e.Settings={}))}),define("core/SymbolTable",["require","exports"],function(t,e){"use strict";var n=function(){function t(){this.symbols={}}return t.prototype.insert=function(t,e){this.symbols[t]=e},t.prototype.lookup=function(t){return this.symbols.hasOwnProperty(t)?this.symbols[t]:null},t}();e.SymbolTable=n}),define("core/Program",["require","exports","core/Settings","core/SymbolTable"],function(t,e,n,r){"use strict";var i=function(){function t(){this.valueStack=[],this.symbolTables=[],this.openScope()}return t.prototype.finish=function(){console.log("Program finished.")},t.prototype.execute=function(t){t.execute(this)},t.prototype.openScope=function(){this.symbolTables.push(new r.SymbolTable)},t.prototype.closeScope=function(){this.symbolTables.pop()},t.prototype.scope=function(){return this.symbolTables[this.symbolTables.length-1]},t.prototype.lookup=function(t){for(var e=this.symbolTables.length-1,r=this.symbolTables[e].lookup(t);null===r&&e>=0&&n.Settings.SCOPE_ASCENDING_LOOKUP;)e--,r=this.symbolTables[e].lookup(t);return r},t.prototype.pushValue=function(t){this.valueStack.push(t)},t.prototype.popValue=function(){return this.valueStack.pop()},t.log=function(e){t.logger&&t.logger(e)},t.setLogger=function(t){this.logger=t},t.logger=null,t}();e.Program=i}),define("UI",["require","exports","core/Program"],function(t,e,n){"use strict";var r=function(){function t(t,e,r,i){this.history=[],this.HISTORY_END=-1,this.historyPointer=this.HISTORY_END,this.input=document.querySelector(t),this.output=document.querySelector(e),this.submit=document.querySelector(r),this.parser=i;var s=this;n.Program.setLogger(function(t){s.output.innerHTML+=t}),this.bindEvents()}return t.prototype.bindEvents=function(){var t=this.input,e=this.output,n=this.submit,r=this.parser,i=this;n.addEventListener("click",function(){try{r.parse(t.value),i.historyPointer=i.HISTORY_END,i.history.push(t.value),t.value=""}catch(t){e.innerHTML+=t.message+"\n"}});var s;t.addEventListener("keydown",function(e){var n;switch(e.keyCode){case 27:i.historyPointer=i.HISTORY_END,this.value="";break;case 190:if(""!=this.value)break;case 38:i.historyPointer==i.HISTORY_END&&(s=t.value),i.historyPointer<i.history.length-1&&(i.historyPointer++,n=i.history.length-1-i.historyPointer,this.value=i.history[n]),e.preventDefault();break;case 40:i.historyPointer>0?(i.historyPointer--,n=i.history.length-1-i.historyPointer,this.value=i.history[n]):0==i.historyPointer&&(i.historyPointer--,this.value=s),e.preventDefault()}}),t.addEventListener("keyup",function(t){switch(t.keyCode){case 13:n.click()}})},t}();e.UI=r}),define("Grammar",["require","exports","core/Actions","core/Program"],function(t,e,n,r){"use strict";var i,s=n.Actions,o=r.Program;!function(t){t.grammar=function(){function t(){this.yy={}}var e=new o,n=s,r=function(t,e,n,r){for(n=n||{},r=t.length;r--;n[t[r]]=e);return n},i=[1,8],c=[1,10],a=[1,12,21],h=[1,12,17,21],l=[1,15],u=[1,24],y=[1,18],p=[1,19],f=[1,23],g=[1,22],m=[1,30],_=[1,31],d=[1,32],b=[1,33],v=[1,34],k=[1,35],x=[1,36],S=[8,15,24,27,28,29,30,31,32,33],P=[15,24],E=[8,15,24,27,28,29],T=[8,15,24,27,28,29,30,31],I=[8,15,24,27,28,29,30,31,32],w=[12,17,21],O={trace:function(){},yy:{},symbols_:{error:2,program:3,exec_command_seq:4,command:5,command_seq:6,normal_command:7,T_EOC:8,special_command:9,var_assign:10,fn_call:11,T_IF:12,"(":13,expr:14,")":15,"{":16,"}":17,T_ELSE:18,identifier:19,assign:20,T_ID:21,T_ASSIGN:22,rvalue_list:23,",":24,T_REAL:25,T_BOOL:26,T_COMPARISON:27,"+":28,"-":29,"*":30,"/":31,"**":32,"%":33,$accept:0,$end:1},terminals_:{2:"error",8:"T_EOC",12:"T_IF",13:"(",15:")",16:"{",17:"}",18:"T_ELSE",21:"T_ID",22:"T_ASSIGN",24:",",25:"T_REAL",26:"T_BOOL",27:"T_COMPARISON",28:"+",29:"-",30:"*",31:"/",32:"**",33:"%"},productions_:[0,[3,1],[4,1],[4,2],[6,1],[6,2],[5,2],[5,1],[7,1],[7,1],[9,7],[9,11],[10,3],[19,1],[20,1],[11,4],[11,3],[23,1],[23,3],[14,1],[14,1],[14,1],[14,1],[14,3],[14,3],[14,3],[14,3],[14,3],[14,3],[14,3],[14,2],[14,2],[14,3]],performAction:function(t,r,i,s,o,c,a){var h=c.length-1;switch(o){case 2:case 3:e.execute(c[h]);break;case 4:case 17:this.$=[],this.$.push(c[h]);break;case 5:this.$=c[h-1],this.$.push(c[h]);break;case 6:case 32:this.$=c[h-1];break;case 7:case 8:case 9:case 22:case 31:this.$=c[h];break;case 10:this.$=n.conditional(c[h-4],c[h-1]);break;case 11:this.$=n.conditional(c[h-8],c[h-5],c[h-1]);break;case 12:this.$=n.assignment(c[h-2],c[h],c[h-1]);break;case 13:case 14:this.$=t;break;case 15:this.$=n.call(c[h-3],c[h-1]);break;case 16:this.$=n.call(c[h-2],[]);break;case 18:this.$=c[h-2],this.$.push(c[h]);break;case 19:this.$=n.primitive(parseFloat(t));break;case 20:this.$=n.primitive("true"==t);break;case 21:this.$=n.id(c[h]);break;case 23:case 24:case 25:case 26:case 27:case 28:case 29:this.$=n.operate(c[h-2],c[h],c[h-1]);break;case 30:this.$=n.operate(null,c[h],c[h-1])}},table:[{3:1,4:2,5:3,7:4,9:5,10:6,11:7,12:i,19:9,21:c},{1:[3]},{1:[2,1],5:11,7:4,9:5,10:6,11:7,12:i,19:9,21:c},r(a,[2,2]),{8:[1,12]},r(h,[2,7]),{8:[2,8]},{8:[2,9]},{13:[1,13]},{13:l,20:14,22:[1,16]},r([8,13,15,22,24,27,28,29,30,31,32,33],[2,13]),r(a,[2,3]),r(h,[2,6]),{11:21,13:u,14:17,19:20,21:c,25:y,26:p,28:f,29:g},{11:21,13:u,14:25,19:20,21:c,25:y,26:p,28:f,29:g},{11:21,13:u,14:28,15:[1,27],19:20,21:c,23:26,25:y,26:p,28:f,29:g},r([13,21,25,26,28,29],[2,14]),{15:[1,29],27:m,28:_,29:d,30:b,31:v,32:k,33:x},r(S,[2,19]),r(S,[2,20]),r(S,[2,21],{13:l}),r(S,[2,22]),{11:21,13:u,14:37,19:20,21:c,25:y,26:p,28:f,29:g},{11:21,13:u,14:38,19:20,21:c,25:y,26:p,28:f,29:g},{11:21,13:u,14:39,19:20,21:c,25:y,26:p,28:f,29:g},{8:[2,12],27:m,28:_,29:d,30:b,31:v,32:k,33:x},{15:[1,40],24:[1,41]},r(S,[2,16]),r(P,[2,17],{27:m,28:_,29:d,30:b,31:v,32:k,33:x}),{16:[1,42]},{11:21,13:u,14:43,19:20,21:c,25:y,26:p,28:f,29:g},{11:21,13:u,14:44,19:20,21:c,25:y,26:p,28:f,29:g},{11:21,13:u,14:45,19:20,21:c,25:y,26:p,28:f,29:g},{11:21,13:u,14:46,19:20,21:c,25:y,26:p,28:f,29:g},{11:21,13:u,14:47,19:20,21:c,25:y,26:p,28:f,29:g},{11:21,13:u,14:48,19:20,21:c,25:y,26:p,28:f,29:g},{11:21,13:u,14:49,19:20,21:c,25:y,26:p,28:f,29:g},r(S,[2,30]),r(S,[2,31]),{15:[1,50],27:m,28:_,29:d,30:b,31:v,32:k,33:x},r(S,[2,15]),{11:21,13:u,14:51,19:20,21:c,25:y,26:p,28:f,29:g},{5:53,6:52,7:4,9:5,10:6,11:7,12:i,19:9,21:c},r([8,15,24,27],[2,23],{28:_,29:d,30:b,31:v,32:k,33:x}),r(E,[2,24],{30:b,31:v,32:k,33:x}),r(E,[2,25],{30:b,31:v,32:k,33:x}),r(T,[2,26],{32:k,33:x}),r(T,[2,27],{32:k,33:x}),r(I,[2,28],{33:x}),r(I,[2,29],{33:x}),r(S,[2,32]),r(P,[2,18],{27:m,28:_,29:d,30:b,31:v,32:k,33:x}),{5:55,7:4,9:5,10:6,11:7,12:i,17:[1,54],19:9,21:c},r(w,[2,4]),r(h,[2,10],{18:[1,56]}),r(w,[2,5]),{16:[1,57]},{5:53,6:58,7:4,9:5,10:6,11:7,12:i,19:9,21:c},{5:55,7:4,9:5,10:6,11:7,12:i,17:[1,59],19:9,21:c},r(h,[2,11])],defaultActions:{6:[2,8],7:[2,9]},parseError:function(t,e){function n(t,e){this.message=t,this.hash=e}if(!e.recoverable)throw n.prototype=Error,new n(t,e);this.trace(t)},parse:function(t){var e=this,n=[0],r=[null],i=[],s=this.table,o="",c=0,a=0,h=0,l=2,u=1,y=i.slice.call(arguments,1),p=Object.create(this.lexer),f={yy:{}};for(var g in this.yy)Object.prototype.hasOwnProperty.call(this.yy,g)&&(f.yy[g]=this.yy[g]);p.setInput(t,f.yy),f.yy.lexer=p,f.yy.parser=this,"undefined"==typeof p.yylloc&&(p.yylloc={});var m=p.yylloc;i.push(m);var _=p.options&&p.options.ranges;"function"==typeof f.yy.parseError?this.parseError=f.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;for(var d,b,v,k,x,S,P,E,T,I=function(){var t;return t=p.lex()||u,"number"!=typeof t&&(t=e.symbols_[t]||t),t},w={};;){if(v=n[n.length-1],this.defaultActions[v]?k=this.defaultActions[v]:(null!==d&&"undefined"!=typeof d||(d=I()),k=s[v]&&s[v][d]),"undefined"==typeof k||!k.length||!k[0]){var O="";T=[];for(S in s[v])this.terminals_[S]&&S>l&&T.push("'"+this.terminals_[S]+"'");O=p.showPosition?"Parse error on line "+(c+1)+":\n"+p.showPosition()+"\nExpecting "+T.join(", ")+", got '"+(this.terminals_[d]||d)+"'":"Parse error on line "+(c+1)+": Unexpected "+(d==u?"end of input":"'"+(this.terminals_[d]||d)+"'"),this.parseError(O,{text:p.match,token:this.terminals_[d]||d,line:p.yylineno,loc:m,expected:T})}if(k[0]instanceof Array&&k.length>1)throw new Error("Parse Error: multiple actions possible at state: "+v+", token: "+d);switch(k[0]){case 1:n.push(d),r.push(p.yytext),i.push(p.yylloc),n.push(k[1]),d=null,b?(d=b,b=null):(a=p.yyleng,o=p.yytext,c=p.yylineno,m=p.yylloc,h>0&&h--);break;case 2:if(P=this.productions_[k[1]][1],w.$=r[r.length-P],w._$={first_line:i[i.length-(P||1)].first_line,last_line:i[i.length-1].last_line,first_column:i[i.length-(P||1)].first_column,last_column:i[i.length-1].last_column},_&&(w._$.range=[i[i.length-(P||1)].range[0],i[i.length-1].range[1]]),x=this.performAction.apply(w,[o,a,c,f.yy,k[1],r,i].concat(y)),"undefined"!=typeof x)return x;P&&(n=n.slice(0,-1*P*2),r=r.slice(0,-1*P),i=i.slice(0,-1*P)),n.push(this.productions_[k[1]][0]),r.push(w.$),i.push(w._$),E=s[n[n.length-2]][n[n.length-1]],n.push(E);break;case 3:return!0}}return!0}},A=function(){var t={EOF:1,parseError:function(t,e){if(!this.yy.parser)throw new Error(t);this.yy.parser.parseError(t,e)},setInput:function(t,e){return this.yy=e||this.yy||{},this._input=t,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var t=this._input[0];this.yytext+=t,this.yyleng++,this.offset++,this.match+=t,this.matched+=t;var e=t.match(/(?:\r\n?|\n).*/g);return e?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),t},unput:function(t){var e=t.length,n=t.split(/(?:\r\n?|\n)/g);this._input=t+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-e),this.offset-=e;var r=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),n.length-1&&(this.yylineno-=n.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:n?(n.length===r.length?this.yylloc.first_column:0)+r[r.length-n.length].length-n[0].length:this.yylloc.first_column-e},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-e]),this.yyleng=this.yytext.length,this},more:function(){return this._more=!0,this},reject:function(){return this.options.backtrack_lexer?(this._backtrack=!0,this):this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},less:function(t){this.unput(this.match.slice(t))},pastInput:function(){var t=this.matched.substr(0,this.matched.length-this.match.length);return(t.length>20?"...":"")+t.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var t=this.match;return t.length<20&&(t+=this._input.substr(0,20-t.length)),(t.substr(0,20)+(t.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var t=this.pastInput(),e=new Array(t.length+1).join("-");return t+this.upcomingInput()+"\n"+e+"^"},test_match:function(t,e){var n,r,i;if(this.options.backtrack_lexer&&(i={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(i.yylloc.range=this.yylloc.range.slice(0))),r=t[0].match(/(?:\r\n?|\n).*/g),r&&(this.yylineno+=r.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:r?r[r.length-1].length-r[r.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+t[0].length},this.yytext+=t[0],this.match+=t[0],this.matches=t,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(t[0].length),this.matched+=t[0],n=this.performAction.call(this,this.yy,this,e,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),n)return n;if(this._backtrack){for(var s in i)this[s]=i[s];return!1}return!1},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var t,e,n,r;this._more||(this.yytext="",this.match="");for(var i=this._currentRules(),s=0;s<i.length;s++)if(n=this._input.match(this.rules[i[s]]),n&&(!e||n[0].length>e[0].length)){if(e=n,r=s,this.options.backtrack_lexer){if(t=this.test_match(n,i[s]),t!==!1)return t;if(this._backtrack){e=!1;continue}return!1}if(!this.options.flex)break}return e?(t=this.test_match(e,i[r]),t!==!1&&t):""===this._input?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var t=this.next();return t?t:this.lex()},begin:function(t){this.conditionStack.push(t)},popState:function(){var t=this.conditionStack.length-1;return t>0?this.conditionStack.pop():this.conditionStack[0]},_currentRules:function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},topState:function(t){return t=this.conditionStack.length-1-Math.abs(t||0),t>=0?this.conditionStack[t]:"INITIAL"},pushState:function(t){this.begin(t)},stateStackSize:function(){return this.conditionStack.length},options:{},performAction:function(t,e,n,r){switch(n){case 0:break;case 1:return 12;case 2:return 18;case 3:return"T_FOR";case 4:return"T_WHILE";case 5:return"T_RETURN";case 6:return"T_FUNCTION";case 7:return 27;case 8:return 27;case 9:return 27;case 10:return 27;case 11:return 27;case 12:return 27;case 13:return 22;case 14:return 22;case 15:return 22;case 16:return 22;case 17:return 22;case 18:return 22;case 19:return 22;case 20:return 28;case 21:return 29;case 22:return 30;case 23:return 31;case 24:return 32;case 25:return 33;case 26:return 13;case 27:return 15;case 28:return"[";case 29:return"]";case 30:return 16;case 31:return 17;case 32:return 24;case 33:return 25;case 34:return 26;case 35:return 21;case 36:return 8;case 37:return"INVALID"}},rules:[/^(?:(\s|\t)+)/,/^(?:if\b)/,/^(?:else\b)/,/^(?:for\b)/,/^(?:while\b)/,/^(?:return\b)/,/^(?:function\b)/,/^(?:==)/,/^(?:!=|<>)/,/^(?:<)/,/^(?:>)/,/^(?:<=)/,/^(?:>=)/,/^(?:\+=)/,/^(?:-=)/,/^(?:\*=)/,/^(?:\/=)/,/^(?:\*\*=)/,/^(?:%=)/,/^(?:=)/,/^(?:\+)/,/^(?:-)/,/^(?:\*)/,/^(?:\/)/,/^(?:\*\*)/,/^(?:%)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:\{)/,/^(?:\})/,/^(?:,)/,/^(?:([0-9]+|[0-9]*\.[0-9]+))/,/^(?:(true|false\b))/,/^(?:([A-Za-z][A-Za-z0-9_]*))/,/^(?:(;))/,/^(?:$.)/],conditions:{INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37],inclusive:!0}}};return t}();return O.lexer=A,t.prototype=O,O.Parser=t,new t}()}(i=e.Grammar||(e.Grammar={}))}),define("Cache",["require","exports"],function(t,e){"use strict";var n=function(){function t(){}return t.setup=function(){"serviceWorker"in navigator?navigator.serviceWorker.register("cache.js",{scope:"./"}).then(function(t){t.installing?console.log("Service worker installing"):t.waiting?console.log("Service worker installed"):t.active&&console.log("Service worker active")}).catch(function(t){console.log("Cache service failed ("+t+")")}):console.log("Cache service failed (navigator.serviceWorker is not defined)")},t}();e.Cache=n}),define("main",["require","exports","Cache","Grammar","UI"],function(t,e,n,r,i){"use strict";$(document).ready(function(){new i.UI("#command","#console","#submit",r.Grammar.grammar);n.Cache.setup()})});
