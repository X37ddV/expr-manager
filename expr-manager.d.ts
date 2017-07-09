type TokenType = "TK_UNKNOWN" | "TK_STRING" | "TK_NUMBER" | "TK_BOOL" | "TK_NULL" | "TK_IDEN" |
    "TK_DOT" | "TK_LP" | "TK_LA" | "TK_LO" | "TK_RP" | "TK_RA" | "TK_RO" | "TK_UNARY" | "TK_NOT" |
    "TK_MULTI" | "TK_DIV" | "TK_MOD" | "TK_PLUS" | "TK_MINUS" | "TK_CO" | "TK_EO" | "TK_AND" |
    "TK_OR" | "TK_COLON" | "TK_COMMA" |
    "VTK_FUNCTION" | "VTK_COMMA" | "VTK_PAREN" | "VTK_ARRAY" | "VTK_OBJECT" | "VTK_SUBSCRIPT";

interface IToken {
    childs?: IToken[];
    id?: number;
    parent?: IToken;
    tokenErrorMsg?: string;
    tokenIndex?: number;
    tokenText?: string;
    tokenType?: TokenType;
    tokenValue?: string;
}

declare class Value {
    constructor();
    errorMsg: string;
    toValue(): any;
    rootToken: IToken;
    tokens: Array<IToken>;
    type: string;
}

declare class ExprManager {
    constructor();
    init(data, dataContext, context): ExprManager;
    calcExpr(expr, entityName, dataCursor, field): Value;
    getFunction(): any;
    addExpression(expr, entityName, propertyName, types, callback, scope): ExprManager;
    removeExpression(expr, entityName, propertyName, types, callback, scope): ExprManager;
    resetExpression(): ExprManager;
    checkAndSort(): string;
    calcExpression(type, info): ExprManager;
    calcDependencies(expr: string, entityName: string): any;
}

declare module "expr-manager" {
    export = ExprManager;
}
