interface IToken {
    childs?: Array<IToken>;
    id?: number;
    parent?: IToken;
    tokenErrorMsg?: string;
    tokenIndex?: number;
    tokenText?: string;
    tokenType?: string;
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

declare class expr {
    constructor();
    init(data, dataContext, context): expr;
    calcExpr(expr, entityName, dataCursor, field): Value;
    getFunction(): any; // todo: 
    addExpression(expr, entityName, propertyName, types, callback, scope): expr;
    removeExpression(expr, entityName, propertyName, types, callback, scope): expr;
    resetExpression(): expr;
    checkAndSort(): string;
    calcExpression(type, info): expr;
}

declare module "expr" {
    export = expr;
}
