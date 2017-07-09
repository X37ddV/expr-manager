import Parser from "./parser";
import Type from "./type";
import Value from "./value";

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
    getParserInfo(expr: string): Parser;

    genValue(value: any, type?: ValueType, entity?, errorMsg?: string, parentObj?): Value;
    genErrorValue(errorMsg: string): Value;
    genType(type?: ValueType, info?, data?, entity?, depends?, errorMsg?: string): Type;
    genErrorType(errorMsg: string): Type;

    getFunctionType(name: string, source, paramType, paramData): Type;
    getFunctionValue(name: string, source, paramValue): Value;
    getVariableType(name: string, source): Type;
    getVariableValue(name: string, source): Value;
    getEntityType(source): Type;
    getEntityValue(source, index: number): Value;

    isIfNullToken(token: IToken): boolean;
    isIIfToken(token: IToken): boolean;
}
