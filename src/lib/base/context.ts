import Check from "./check";
import { isFunctionToken } from "./common";
import { ValueType } from "./interface";
import Parser from "./parser";
import Type from "./type";
import Value from "./value";

export default abstract class Context {
    private exprCache: {[key: string]: Parser} = {};
    // 得到解析信息
    public getParserInfo(expr: string): Parser {
        let r = this.exprCache[expr];
        if (!r) {
            r = new Parser().parser(expr);
            this.exprCache[expr] = r;
            if (!r.errorMsg) {
                const p = new Check();
                r.errorMsg = p.check(expr, this).errorMsg;
            }
        }
        return r;
    }
    // 生成ExprValue对象
    public genValue(value: any, type?: ValueType, entity?, errorMsg?: string, parentObj?): Value {
        return new Value(this, value, type, entity, errorMsg, parentObj);
    }
    // 有错误时，生成对应的ExprValue对象
    public genErrorValue(errorMsg: string): Value {
        return this.genValue(undefined, undefined, undefined, errorMsg, undefined);
    }
    // 生成ExprType对象
    public genType(type?: ValueType, info?, data?, entity?, depends?, errorMsg?: string): Type {
        return new Type(this, type, info, data, entity, depends, errorMsg);
    }
    // 有错误时，生成对应的ExprType对象
    public genErrorType(errorMsg: string): Type {
        return this.genType(undefined, undefined, undefined, undefined, undefined, errorMsg);
    }
    // 获取函数返回结果类型对象
    public getFunctionType(name: string, source: any, paramType: any, paramData: any): Type {
        return this.doGetFunctionType(name, source, paramType, paramData);
    }
    // 获取函数返回值
    public getFunctionValue(name: string, source: any, paramValue: any): Value {
        return this.doGetFunctionValue(name, source, paramValue);
    }
    // 获取变量类型对象
    public getVariableType(name: string, source: any): Type {
        return this.doGetVariableType(name, source);
    }
    // 获取变量值
    public getVariableValue(name: string, source: any): Value {
        return this.doGetVariableValue(name, source);
    }
    // 获取实体类型对象
    public getEntityType(source: any): Type {
        return this.doGetEntityType(source);
    }
    // 获取实体值，根据游标索引
    public getEntityValue(source: any, index: number): Value {
        return this.doGetEntityValue(source, index);
    }
    // 是否为IfNull(1,2)函数形式的","结点
    public isIfNullToken(token): boolean {
        return isFunctionToken(token, this.doGetIsIfNullTokenName());
    }
    // 是否为IIf(true,1,2)函数形式的","结点
    public isIIfToken(token): boolean {
        return isFunctionToken(token, this.doGetIsIIfTokenName());
    }
    protected abstract doGetIsIfNullTokenName(): string;
    protected abstract doGetIsIIfTokenName(): string;
    protected abstract doGetEntityValue(source: any, index: number): Value;
    protected abstract doGetEntityType(source: any): Type;
    protected abstract doGetVariableValue(name: string, source: any): Value;
    protected abstract doGetVariableType(name: string, source: any): Type;
    protected abstract doGetFunctionValue(name: string, source: any, paramValue: any): Value;
    protected abstract doGetFunctionType(name: string, source: any, paramType: any, paramData: any): Type;
}
