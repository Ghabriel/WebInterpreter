// Copyright 2017 Ghabriel Nunes <ghabriel.nunes@gmail.com>

%left T_COMPARISON
%left '+' '-'
%left '%'
%left '*' '/'
%left '**'
%right '!'
%right '%'
%nonassoc U_MINUS
%nonassoc U_PLUS
%nonassoc '(' ')'

%start program

%%

program
    : exec_command_seq EOF  { console.log("Program finished."); }
    |
    ;

exec_command_seq
    : command                    { program.execute($1); }
    | exec_command_seq command   { program.execute($2); }
    ;

command_seq
    : command               { $$ = []; $$.push($1); }
    | command_seq command   { $$ = $1; $$.push($2); }
    ;

command
    : normal_command T_EOC  { $$ = $1; }
    | special_command       { $$ = $1; }
    ;

normal_command
    : var_assign    { $$ = $1; }
    | fn_call       { $$ = $1; }
    ;

special_command
    : T_IF "(" expr ")" "{" command_seq "}"
        { $$ = Actions.conditional($3, $6); }
    | T_IF "(" expr ")" "{" command_seq "}" T_ELSE "{" command_seq "}"
        { $$ = Actions.conditional($3, $6, $10); }
    ;

var_assign
    : identifier assign expr  { $$ = Actions.assignment($1, $3, $2); }
    ;

identifier
    : T_ID        { $$ = yytext; }
    ;

assign
    : T_ASSIGN    { $$ = yytext; }
    ;

fn_call
    : identifier "(" rvalue_list ")" { $$ = Actions.call($1, $3); }
    ;

rvalue_list
    : expr                     { $$ = []; $$.push($1); }                    
    | rvalue_list "," expr     { $$ = $1; $$.push($3); }
    ;

expr
    : T_REAL     { $$ = Actions.primitive(parseFloat(yytext)); }
    | T_BOOL     { $$ = Actions.primitive(yytext == "true"); }
    | identifier { $$ = Actions.id($1); }
    | fn_call    { $$ = $1; }
    | expr T_COMPARISON expr { $$ = Actions.operate($1, $3, $2); }
    | expr "+" expr          { $$ = Actions.operate($1, $3, $2); }
    | expr "-" expr          { $$ = Actions.operate($1, $3, $2); }
    | expr "*" expr          { $$ = Actions.operate($1, $3, $2); }
    | expr "/" expr          { $$ = Actions.operate($1, $3, $2); }
    | expr "**" expr         { $$ = Actions.operate($1, $3, $2); }
    | expr "%" expr          { $$ = Actions.operate($1, $3, $2); }
    | "-" expr %prec U_MINUS { $$ = Actions.operate(null, $2, $1); }
    | "+" expr %prec U_PLUS  { $$ = $2; }
    | "(" expr ")"           { $$ = $2; }
    ;
