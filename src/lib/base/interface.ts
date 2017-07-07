export interface IFunctionItem {
    e?: "root" | "parent" | "value" | "data";
    fn: (context, ...others) => any;
    p: Array<
        "undefined" | "undefined?" |
        "string" | "string?" |
        "number" | "number?" |
        "boolean" | "boolean?" |
        "date" | "date?" |
        "object" | "object?" |
        "array" | "array?" |
        "expr" | "expr?"
    >;
    r: "undefined" | "string" | "number" | "boolean" | "date" | "object" | "array";
}

export interface IFunction {
    _?: IFunctionItem;
    array?: IFunctionItem;
    boolean?: IFunctionItem;
    date?: IFunctionItem;
    number?: IFunctionItem;
    object?: IFunctionItem;
    string?: IFunctionItem;
}

export type ValueType = "undefined" | "null" | "string" | "number" | "boolean" | "date" | "object" | "array";

export interface IToken {
    childs?: IToken[];
    id?: number;
    parent?: IToken;
    tokenErrorMsg?: string;
    tokenIndex?: number;
    tokenText?: string;
    tokenType?: string;
    tokenValue?: string;
}

export interface IContext {
    getEntityType(source);
    getVariableType(name, source);
    getFunctionType(name, source, paramType, paramData);
    getEntityValue(source, index);
    getVariableValue(name, source);
    getFunctionValue(name, source, paramValue);
}
