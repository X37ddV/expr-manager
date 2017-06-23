export interface IToken {
    childs?: Array<IToken>;
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
