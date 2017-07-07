import { isFunctionToken } from "./common";
import { IContext } from "./interface";
import Parser from "./parser";
import Type from "./type";
import Value from "./value";

interface IExprItem {
    parser: Parser;
    text: string;
}

// 上下文基类
// ----------

export default class Context implements IContext {
    private exprList: IExprItem[] = [];
    // 生成ExprValue对象
    public genValue(value, type?, entity?, errorMsg?, parentObj?): Value {
        return new Value(this, value, type, entity, errorMsg, parentObj);
    }
    // 有错误时，生成对应的ExprValue对象
    public genErrorValue(errorMsg: string): Value {
        return this.genValue(undefined, undefined, undefined, errorMsg, undefined);
    }
    // 生成ExprType对象
    public genType(type?, info?, data?, entity?, depends?, errorMsg?): Type {
        return new Type(this, type, info, data, entity, depends, errorMsg);
    }
    // 有错误时，生成对应的ExprType对象
    public genErrorType(errorMsg): Type {
        return this.genType(undefined, undefined, undefined, undefined, undefined, errorMsg);
    }
    // 得到函数source.name(paramValue)返回值的ExprType对象
    public getFunctionType(name, source, paramType, paramData) {
        return this.doGetFunctionType(name, source, paramType, paramData);
    }
    // 得到函数source.name(paramValue)执行结果
    public getFunctionValue(name, source, paramValue) {
        return this.doGetFunctionValue(name, source, paramValue);
    }
    // 得到变量类型
    public getVariableType(name, source) {
        return this.doGetVariableType(name, source);
    }
    // 得到对象source的name属性值
    public getVariableValue(name, source) {
        return this.doGetVariableValue(name, source);
    }
    // 得到实体类型
    public getEntityType(source) {
        return this.doGetEntityType(source);
    }
    // 从实体数组source中取出第index条实体记录
    public getEntityValue(source, index) {
        return this.doGetEntityValue(source, index);
    }
    // 得到解析信息
    public getParserInfo(expr) {
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
            const p = new Parser();
            r = p.parser(expr); /// return this;
            this.exprList.push({ /// 将解析过的表达式缓存，下次不需要再次解析
                parser: r,
                text: expr,
            });
        }
        return r; /// 返回ExprParser对象
    }
    // 是否为IfNull(1,2)函数形式的","结点
    public isIfNullToken(token) {
        return isFunctionToken(token, this.doGetIfNullName());
    }
    // 是否为IIf(true,1,2)函数形式的","结点
    public isIIfToken(token) {
        return isFunctionToken(token, this.doGetIIfName());
    }
    public doGetIfNullName(): string { return ""; }
    public doGetIIfName(): string { return ""; }
    public doGetVariableType(name, source) {
        //
    }
    public doGetVariableValue(name, source) {
        //
    }
    public doGetFunctionType(name, source, paramType, paramData) {
        //
    }
    public doGetFunctionValue(name, source, paramValue) {
        //
    }
    public doGetEntityType(source) {
        //
    }
    public doGetEntityValue(source, index) {
        //
    }
}
