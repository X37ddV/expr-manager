type CalcType = "load" | "add" | "update" | "remove";
type ValueType = "undefined" | "null" | "string" | "number" | "boolean" | "date" | "object" | "array";
type FunctionEntityType = "root" | "parent" | "value" | "data";
type FunctionResultType = "undefined" | "string" | "number" | "boolean" | "date" | "object" | "array";
type FunctionParamsType = "undefined" | "undefined?" | "string" | "string?" | "number" |
    "number?" | "boolean" | "boolean?" | "date" | "date?" | "object" | "object?" | "array" |
    "array?" | "expr" | "expr?";
type TokenType = "TK_UNKNOWN" | "TK_STRING" | "TK_NUMBER" | "TK_BOOL" | "TK_NULL" |
    "TK_IDEN" | "TK_DOT" | "TK_LP" | "TK_LA" | "TK_LO" | "TK_RP" | "TK_RA" | "TK_RO" |
    "TK_UNARY" | "TK_NOT" | "TK_MULTI" | "TK_DIV" | "TK_MOD" | "TK_PLUS" | "TK_MINUS" |
    "TK_CO" | "TK_EO" | "TK_AND" | "TK_OR" | "TK_COLON" | "TK_COMMA" |
    "VTK_FUNCTION" | "VTK_COMMA" | "VTK_PAREN" | "VTK_ARRAY" | "VTK_OBJECT" | "VTK_SUBSCRIPT";
type ModeType = "Single" | "BranchUpdate" | "BranchDelete" | "All";

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

interface IExprItem {
    expr: string;
    fullName: string;
    entityName: string;
    propertyName: string;
    updateMode: ModeType;
    updateTarget: string;
}

interface IToken {
    childs: IToken[];
    id: number;
    parent: IToken;
    tokenErrorMsg: string;
    tokenIndex: number;
    tokenText: string;
    tokenType: TokenType;
    tokenValue: string;
}

interface IDataCursor {
    [fullName: string]: number;
}

interface ILocaleConfig {
    MSG_EC_FUNC_E: string;
    MSG_EC_FUNC_P: string;
    MSG_EC_FUNC_R: string;
    MSG_EC_PROP_E: string;
    MSG_EC_PROP_N: string;
    MSG_EC_VARI_I: string;
    MSG_EC_VARI_N: string;

    MSG_EF_MODEL: string;
    MSG_EF_STR_TO_DATE: string;
    MSG_EF_STR_TO_NUM: string;

    MSG_EL_SYNTAX_ON: string;
    MSG_EL_SYNTAX_S: string;
    MSG_EL_SYNTAX_UC: string;
    MSG_EL_SYNTAX_XN: string;

    MSG_EP_EMPTY: string;
    MSG_EP_LEXICAL_B: string;
    MSG_EP_LEXICAL_E: string;
    MSG_EP_LEXICAL_L: string;
    MSG_EP_MATCH: string;
    MSG_EP_SYNTAX_A: string;
    MSG_EP_SYNTAX_C: string;
    MSG_EP_SYNTAX_D: string;
    MSG_EP_SYNTAX_E: string;
    MSG_EP_SYNTAX_M: string;
    MSG_EP_SYNTAX_N: string;
    MSG_EP_SYNTAX_O: string;
    MSG_EP_SYNTAX_P: string;
    MSG_EP_SYNTAX_SUB: string;
    MSG_EP_UNKNOWN: string;

    MSG_ES_PARSER: string;

    MSG_EX_ADD: string;
    MSG_EX_AND: string;
    MSG_EX_AND_L: string;
    MSG_EX_COMPARE_A: string;
    MSG_EX_COMPARE_B: string;
    MSG_EX_COMPARE_C: string;
    MSG_EX_COMPARE_D: string;
    MSG_EX_DIVIDE: string;
    MSG_EX_DIVIDE_N: string;
    MSG_EX_DOT: string;
    MSG_EX_EQUAL: string;
    MSG_EX_EQUAL_N: string;
    MSG_EX_FUNC_NULL: string;
    MSG_EX_LN: string;
    MSG_EX_LOG: string;
    MSG_EX_MULTIPLY: string;
    MSG_EX_NEGATIVE: string;
    MSG_EX_OR: string;
    MSG_EX_OR_L: string;
    MSG_EX_POSITIVE: string;
    MSG_EX_REMAINDER: string;
    MSG_EX_REMAINDER_N: string;
    MSG_EX_ROUND: string;
    MSG_EX_SUBSCRIPT: string;
    MSG_EX_SUBSCRIPT_T: string;
    MSG_EX_SUBSCRIPT_U: string;
    MSG_EX_SUBTRACT: string;
    MSG_EX_TRUNC: string;
}

interface IFunctionConfig {
    [propName: string]: {
        fn: string;
        p: string[];
        r: string;
    };
}

declare class Type {
    errorMsg: string;
    rootToken: IToken;
    tokens: IToken[];
    type: ValueType;
    toValue(): ValueType;
}

declare class Value {
    errorMsg: string;
    rootToken: IToken;
    tokens: IToken[];
    type: ValueType;
    toValue(): any;
}

declare class Locale {
    localeName: string;
    defineLocale(name: string, config: ILocaleConfig): void;
    defineFunction(name: string, config: IFunctionConfig): void;
    getLocale(name?: string): ILocaleConfig;
    getFunction(name?: string): IFunctionConfig;
}

declare class ExprManager {
    static locale: Locale;
    constructor();
    init(data, dataContext, context): ExprManager;
    regFunction(funcs: IFunction): ExprManager;
    getFunction(): IFunction;
    resetExpression(): ExprManager;
    addExpression(expr: string, entityName: string, propertyName: string, types: CalcType[], callback, scope): ExprManager;
    removeExpression(expr: string, entityName: string, propertyName: string, types: CalcType[], callback, scope): ExprManager;
    getExpressionList(type: CalcType, entityName: string, propertyName: string): IExprItem[];
    checkAndSort(): string;
    calcExpression(type: CalcType, info): ExprManager;
    calcDependencies(expr: string, entityName: string): Type;
    calcExpr(expr: string, entityName: string, dataCursor: IDataCursor, field): Value;
    calc(expr: string, data): Value;
}

declare module "expr-manager" {
    export = ExprManager;
}
