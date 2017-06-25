import { isIDENToken } from "./common";
import Context from "./context";
import Value from "./value";

export default class Calc {
    private context: Context = null;
    private values = {};
    public genValue(value, type, entity?, errorMsg?, parentObj?) {
        /// <summary>生成ExprValue对象</summary>
        return new Value(this.context, value, type, entity, errorMsg, parentObj);
    }
    public genErrorValue(errorMsg) {
        /// <summary>有错误时，生成对应的ExprValue对象</summary>
        return this.genValue(undefined, undefined, undefined, errorMsg, undefined);
    }
    public getValue(tokenId) {
        /// <summary>根据token结点ID返回对应的ExprValue对象</summary>
        return this.values[tokenId];
    }
    public setValue(tokenId, v) {
        /// <summary>设置某token结点ID对应的ExprValue对象</summary>
        this.values[tokenId] = v;
    }
    public calc(expr, context) {
        /// <summary>对表达式进行语法分析和数值计算</summary>
        /// <param name="expr" type="String">待分析计算的表达式</param>
        /// <param name="context" type="ExprContext">本次计算所在的数据上下文</param>
        /// <returns name="r" type="ExprValue">语法树根节点对应的ExprValue对象</returns>
        this.context = context || new Context();
        let r;
        const p = this.context.getParserInfo(expr); // 在context数据上下文中对expr进行语法分析
        if (p.errorMsg === "") { // 表达式解析正确(语法正确，但是计算结果尚需验证如3/0)
            const msg = this.doCalc(p.rootToken); // 将表达式按照既定规则运算
            if (msg === "") { // 计算正确，返回根节点对应的ExprValue对象
                r = this.getValue(p.rootToken.id);
                r.tokens = p.tokens;
                r.rootToken = p.rootToken;
            } else { // 计算过程中出错
                r = this.genErrorValue(msg);
            }
        } else { // 解析过程中出错
            r = this.genErrorValue(p.errorMsg);
        }
        return r;
    }
    public doCalc(rootToken) {
        /// <summary>对表达式进行数值计算</summary>
        /// <param name="rootToken" type="Object">当前被求值的Token对象结点</param>
        /// <returns name="msg" type="String">计算过程中的出错信息，若为空则代表没有错误</returns>
        const t = rootToken;
        const p = t.parent;
        let msg = "";
        let l;
        let r;
        let tv = null;
        let lv;
        let rv;
        if (t.childs) { // 先计算该结点的所有子节点
            const isIfNull = this.context.isIfNullToken(t); // 是否为IfNull(1,2)函数形式的","结点
            const isIIf = this.context.isIIfToken(t); // 是否为IIf(true,1,2)函数形式的","结点

            for (let i = 0; i < t.childs.length; i++) {
                msg = this.doCalc(t.childs[i]);
                if (msg !== "") { // 计算子节点出错，直接返回错误信息，不再计算父节点
                    break;
                } else if (i === 0) { // 第一个子节点计算正确
                    l = t.childs[0];
                    lv = this.getValue(l.id); // 左运算数
                    if (isIfNull && lv.toValue() !== null) { // IfNull函数的第一个参数不为null，之后的参数不用计算，均为undefined
                        break;
                    } else if (isIIf && !lv.toValue()) { // IIf函数的第一个参数为false，跳过第二个参数，直接计算第三个参数
                        i++;
                    } else if (t.tokenType === "TK_OR" && !!lv.toValue() === true ||
                        t.tokenType === "TK_AND" && !!lv.toValue() === false) { // &&、|| 左运算数已经能判断结果，右运算数不再计算
                        break;
                    }
                } else if (i === 1) { // 第二个子节点计算正确
                    r = t.childs[1];
                    rv = this.getValue(r.id); // 右运算数
                    if (isIIf) { // IIf函数第一个参数为true,第二个参数计算出来后，无需计算后面的参数
                        break;
                    }
                }
            }
        }
        if (msg === "") {
            switch (t.tokenType) {
                case "TK_STRING": // 字符串结点
                    tv = this.genValue(t.tokenValue, "string");
                    break;
                case "TK_NUMBER": // 数字结点
                    tv = this.genValue(t.tokenValue, "number");
                    break;
                case "TK_BOOL": // 布尔结点
                    tv = this.genValue(t.tokenValue === "true", "boolean");
                    break;
                case "TK_NULL": // NULL结点
                    tv = this.genValue(null, "null");
                    break;
                case "TK_IDEN": // 标识符结点
                    tv = this.genValue(t.tokenValue, "string");
                    if (isIDENToken(t)) { // 排除了函数名和对象属性的情况
                        tv = tv.getVariableValue(null);
                    }
                    break;
                case "TK_UNARY": // 单目结点
                    tv = lv.negative(t.tokenValue);
                    break;
                case "TK_NOT": // !运算结点
                    tv = lv.not();
                    break;
                case "TK_MULTI": // *结点
                    tv = lv.multiply(rv);
                    break;
                case "TK_DIV": // /结点
                    tv = lv.divide(rv);
                    break;
                case "TK_MOD": // %结点
                    tv = lv.remainder(rv);
                    break;
                case "TK_PLUS": // +加法结点
                    tv = lv.add(rv);
                    break;
                case "TK_MINUS": // -减法结点
                    tv = lv.subtract(rv);
                    break;
                case "TK_CO": // 比较运算符结点，包括==,!=,>,>=,<,<=
                    tv = lv.compare(rv, t.tokenValue);
                    break;
                case "TK_AND": // &&结点
                    tv = lv.and(rv);
                    break;
                case "TK_OR": // ||结点
                    tv = lv.or(rv);
                    break;
                case "TK_COLON": // :结点
                    tv = lv.hashItem(rv); // tv为键值对对象
                    break;
                case "TK_DOT": // .结点
                    switch (r.tokenType) {
                        case "VTK_FUNCTION": // 调用函数
                            tv = rv.getFunctionValue(lv); // 调用者为lv
                            break;
                        case "TK_IDEN": // 访问属性
                            tv = rv.getVariableValue(lv);
                            break;
                        default:
                            break;
                    }
                    break;
                case "VTK_COMMA": // ,结点
                    tv = this.genValue([], "array");
                    for (const item of t.childs) {
                        lv = this.getValue(item.id);
                        tv.arrayPush(lv); // lv为(1,2)或{x:1,y:2}中，的子节点
                    }
                    break;
                case "VTK_PAREN": // ()结点
                    if (t.childs.length === 0) { // 如：fun()
                        tv = this.genValue([], "array");
                    } else if (p && p.tokenType === "TK_IDEN" && l.tokenType !== "VTK_COMMA") {
                        tv = this.genValue([], "array").arrayPush(lv); // 如：fun(2)
                    } else {
                        tv = lv; // 如：fun(1,2,3) 或 2+((4))
                    }
                    break;
                case "VTK_ARRAY": // []结点
                    tv = this.genValue([], "array");
                    if (t.childs.length > 0) {
                        if (l.tokenType === "VTK_COMMA") {
                            tv.arrayConcat(lv);
                        } else {
                            tv.arrayPush(lv);
                        }
                    }
                    break;
                case "VTK_OBJECT": // {}结点
                    tv = this.genValue({}, "object");
                    if (t.childs.length > 0) {
                        if (l.tokenType === "VTK_COMMA") {
                            tv.objectSetProperties(lv); // 如：{x:1,y:2}
                        } else {
                            tv.objectSetProperty(lv); // 如：{x:1}
                        }
                    }
                    break;
                case "VTK_SUBSCRIPT": // a[n]结点
                    tv = lv.subscript(rv);
                    break;
                case "VTK_FUNCTION": // Fn()结点
                    if (p && p.tokenType === "TK_DOT" && p.childs[0] !== t) { // 有显式调用者
                        tv = lv.hashItem(rv);
                    } else { // 没有显式调用者
                        tv = lv.hashItem(rv).getFunctionValue(null);
                    }
                    break;
                default:
                    break;
            }
            msg = tv.errorMsg;
            if (msg === "") {
                this.setValue(t.id, tv); // 设置某token结点ID对应的ExprValue对象
            }
        }
        return msg;
    }
}
