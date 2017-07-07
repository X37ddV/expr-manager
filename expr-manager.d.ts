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
