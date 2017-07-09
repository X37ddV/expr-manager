import { isFunctionToken } from "./common";
import { IContext, ValueType } from "./interface";
import Parser from "./parser";
import Type from "./type";
import Value from "./value";

interface IExprItem {
    parser: Parser;
    text: string;
}

export default abstract class Context implements IContext {
    private exprList: IExprItem[] = [];
    // 得到解析信息
    public getParserInfo(expr: string): Parser {
        expr = expr.trim(); /// 去除表达式两端无效空格
        let index = -1; /// 查找当前上下文的exprList列表
        for (let i = 0; i < this.exprList.length; i++) {
            if (this.exprList[i].text === expr) {
                index = i;
                break;
            }
        }
        let r;
        if (index >= 0) { /// 该表达式之前被解析过，直接返回缓存里的解析结果
            r = this.exprList[index].parser;
        } else { /// 该表达式之前从未被解析过，开始新的解析
            r = new Parser().parser(expr); /// return this;
            this.exprList.push({ /// 将解析过的表达式缓存，下次不需要再次解析
                parser: r,
                text: expr,
            });
        }
        return r; /// 返回ExprParser对象
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
    public genType(type?: ValueType, info?, data?, entity?, depends?, errorMsg?): Type {
        return new Type(this, type, info, data, entity, depends, errorMsg);
    }
    // 有错误时，生成对应的ExprType对象
    public genErrorType(errorMsg: string): Type {
        return this.genType(undefined, undefined, undefined, undefined, undefined, errorMsg);
    }
    public getFunctionType(name: string, source: any, paramType: any, paramData: any): Type {
        return this.doGetFunctionType(name, source, paramType, paramData);
    }
    public getFunctionValue(name: string, source: any, paramValue: any): Value {
        return this.doGetFunctionValue(name, source, paramValue);
    }
    public getVariableType(name: string, source: any): Type {
        return this.doGetVariableType(name, source);
    }
    public getVariableValue(name: string, source: any): Value {
        return this.doGetVariableValue(name, source);
    }
    public getEntityType(source: any): Type {
        return this.doGetEntityType(source);
    }
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
