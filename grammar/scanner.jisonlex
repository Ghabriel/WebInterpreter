// Copyright 2017 Ghabriel Nunes <ghabriel.nunes@gmail.com>

real_lit [0-9]+|[0-9]*\.[0-9]+
bool_lit "true"|"false"

name [A-Za-z][A-Za-z0-9_]*
end_of_command ";"

%%

(\s|\t)+               /* skip whitespace */

"if"                   return 'T_IF'
"else"                 return 'T_ELSE'
"for"                  return 'T_FOR'
"while"                return 'T_WHILE'
"return"               return 'T_RETURN'
"function"             return 'T_FUNCTION'

"=="                   return 'T_COMPARISON'
"!="|"<>"              return 'T_COMPARISON'
"<"                    return 'T_COMPARISON'
">"                    return 'T_COMPARISON'
"<="                   return 'T_COMPARISON'
">="                   return 'T_COMPARISON'

"+"                    return '+'
"-"                    return '-'
"*"                    return '*'
"/"                    return '/'
"**"                   return '**'
"%"                    return '%'

"+="                   return 'T_ASSIGN'
"-="                   return 'T_ASSIGN'
"*="                   return 'T_ASSIGN'
"/="                   return 'T_ASSIGN'
"**="                  return 'T_ASSIGN'
"%="                   return 'T_ASSIGN'
"="                    return 'T_ASSIGN'

"("                    return '('
")"                    return ')'
"["                    return '['
"]"                    return ']'
"{"                    return '{'
"}"                    return '}'
","                    return ','

{real_lit}             return 'T_REAL'
{bool_lit}             return 'T_BOOL'

{name}                 return 'T_ID'
{end_of_command}       return 'T_EOC'

<<EOF>>                return 'EOF'
.                      return 'INVALID'
