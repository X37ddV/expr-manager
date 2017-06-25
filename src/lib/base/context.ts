import { isFunctionToken } from "./common";
import { IContext } from "./interface";
import Parser from "./parser";
import Type from "./type";
import Value from "./value";

interface IExprItem {
    parser: Parser;
    text: string;
}

export default class Context implements IContext {
    private exprList: Array<IExprItem> = [];
    public genValue(value, type?, entity?, errorMsg?, parentObj?) {
        // 生成ExprValue对象
        return new Value(this, value, type, entity, errorMsg, parentObj);
    }
    public genErrorValue(errorMsg: string) {
        // 有错误时，生成对应的ExprValue对象
        return this.genValue(undefined, undefined, undefined, errorMsg, undefined);
    }
    public genType(type?, info?, data?, entity?, depends?, errorMsg?) {
        // 生成ExprType对象
        return new Type(this, type, info, data, entity, depends, errorMsg);
    }
    public genErrorType(errorMsg) {
        // 有错误时，生成对应的ExprType对象
        return this.genType(undefined, undefined, undefined, undefined, undefined, errorMsg);
    }
    public getFunctionType(name, source, paramType, paramData) {
        // 得到函数source.name(paramValue)返回值的ExprType对象
        return this.doGetFunctionType(name, source, paramType, paramData);
    }
    public getFunctionValue(name, source, paramValue) {
        // 得到函数source.name(paramValue)执行结果
        return this.doGetFunctionValue(name, source, paramValue);
    }
    public getVariableType(name, source) {
        // 得到变量类型
        return this.doGetVariableType(name, source);
    }
    public getVariableValue(name, source) {
        // 得到对象source的name属性值
        return this.doGetVariableValue(name, source);
    }
    public getEntityType(source) {
        // 得到实体类型
        return this.doGetEntityType(source);
    }
    public getEntityValue(source, index) {
        // 从实体数组source中取出第index条实体记录
        return this.doGetEntityValue(source, index);
    }
    public getParserInfo(expr) {
        /// <summary>得到解析信息</summary>
        /// <returns type="String">解析结果ExprParser对象</returns>
        expr = expr.trim(); // 去除表达式两端无效空格
        let index = -1; // 查找当前上下文的exprList列表
        for (let i = 0; i < this.exprList.length; i++) {
            if (this.exprList[i].text === expr) {
                index = i;
                break;
            }
        }
        let r;
        if (index >= 0) { // 该表达式之前被解析过，直接返回缓存里的解析结果
            r = this.exprList[index].parser;
        } else { // 该表达式之前从未被解析过，开始新的解析
            const p = new Parser();
            r = p.parser(expr); // return this;
            this.exprList.push({ // 将解析过的表达式缓存，下次不需要再次解析
                parser: r,
                text: expr,
            });
        }
        return r; // 返回ExprParser对象
    }
    public isIfNullToken(token) {
        /// <summary>是否为IfNull(1,2)函数形式的","结点</summary>
        return isFunctionToken(token, this.doGetIfNullName());
    }
    public isIIfToken(token) {
        /// <summary>是否为IIf(true,1,2)函数形式的","结点</summary>
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
