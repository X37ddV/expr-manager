import Parser from "./parser";
import Type from "./type";
import Value from "./value";

export type ValueType = "undefined" | "null" | "string" | "number" | "boolean" | "date" | "object" | "array";

export type TokenType = "TK_UNKNOWN" | "TK_STRING" | "TK_NUMBER" | "TK_BOOL" | "TK_NULL" | "TK_IDEN" |
    "TK_DOT" | "TK_LP" | "TK_LA" | "TK_LO" | "TK_RP" | "TK_RA" | "TK_RO" | "TK_UNARY" | "TK_NOT" |
    "TK_MULTI" | "TK_DIV" | "TK_MOD" | "TK_PLUS" | "TK_MINUS" | "TK_CO" | "TK_EO" | "TK_AND" |
    "TK_OR" | "TK_COLON" | "TK_COMMA" |
    "VTK_FUNCTION" | "VTK_COMMA" | "VTK_PAREN" | "VTK_ARRAY" | "VTK_OBJECT" | "VTK_SUBSCRIPT";

export interface IToken {
    childs?: IToken[];
    id?: number;
    parent?: IToken;
    tokenErrorMsg?: string;
    tokenIndex?: number;
    tokenText?: string;
    tokenType?: TokenType;
    tokenValue?: string;
}
