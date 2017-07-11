type CalcType = "load" | "add" | "update" | "remove";

type FunctionEntityType = "root" | "parent" | "value" | "data";

type FunctionResultType = "undefined" | "string" | "number" | "boolean" | "date" |
    "object" | "array";

type FunctionParamsType = "undefined" | "undefined?" | "string" | "string?" | "number" |
    "number?" | "boolean" | "boolean?" | "date" | "date?" | "object" | "object?" | "array" |
    "array?" | "expr" | "expr?";

interface IFunctionItem {
    e?: FunctionEntityType;
    fn: (context, ...others) => any;
    p: FunctionParamsType[];
    r: FunctionResultType;
}

interface IFunctionGroup {
    [name: string]: IFunctionItem;
}

interface IFunction {
    ""?: IFunctionGroup;
    "array"?: IFunctionGroup;
    "boolean"?: IFunctionGroup;
    "date"?: IFunctionGroup;
    "number"?: IFunctionGroup;
    "object"?: IFunctionGroup;
    "string"?: IFunctionGroup;
}

type TokenType = "TK_UNKNOWN" | "TK_STRING" | "TK_NUMBER" | "TK_BOOL" | "TK_NULL" |
    "TK_IDEN" | "TK_DOT" | "TK_LP" | "TK_LA" | "TK_LO" | "TK_RP" | "TK_RA" | "TK_RO" |
    "TK_UNARY" | "TK_NOT" | "TK_MULTI" | "TK_DIV" | "TK_MOD" | "TK_PLUS" | "TK_MINUS" |
    "TK_CO" | "TK_EO" | "TK_AND" | "TK_OR" | "TK_COLON" | "TK_COMMA" |
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
    calcExpr(expr: string, entityName: string, dataCursor, field): Value;
    getFunction(): IFunction;
    addExpression(expr: string, entityName: string, propertyName: string, types: CalcType[], callback, scope): ExprManager;
    removeExpression(expr: string, entityName: string, propertyName: string, types: CalcType[], callback, scope): ExprManager;
    resetExpression(): ExprManager;
    checkAndSort(): string;
    calcExpression(type: CalcType, info): ExprManager;
    calcDependencies(expr: string, entityName: string): any;
}

declare module "expr-manager" {
    export = ExprManager;
}
