import { IToken, ValueType } from "./interface";

// 内部公共函数
// ----------

// 获取**值**类型
export function getValueType(v: any): ValueType {
    return v === null ? "null" : // 兼容IE8
        Object.prototype.toString.call(v).replace("[object ", "").replace("]", "").toLowerCase();
}
// 是否为**字符串**
export function isString(v: any): boolean {
    return getValueType(v) === "string";
}
// 是否为**数字**
export function isNumber(v: any): boolean {
    return getValueType(v) === "number";
}
// 是否为**对象**
export function isObject(v: any): boolean {
    return getValueType(v) === "object";
}
// 是否为**数组**
export function isArray(v: any): boolean {
    return getValueType(v) === "array";
}
// 判断**tokenType**是否包含在**tokenTypes**中
export function hasToken(tokenTypes: string, tokenType: string): boolean {
    return (tokenTypes + ",").indexOf(tokenType + ",") >= 0;
}
// 是否为**数字**组成字符
export function isN(s: string): boolean {
    return "0123456789.".indexOf(s) >= 0;
}
// 是否为**八进制数字**组成字符
export function isO(s: string): boolean {
    return "01234567".indexOf(s) >= 0;
}
// 是否为**十六进制数字**组成字符
export function isX(s: string): boolean {
    return "0123456789abcdefABCDEF".indexOf(s) >= 0;
}
// 是否为**标识符**组成字符
export function isC(s: string): boolean {
    return s !== "." && isN(s) || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_".indexOf(s) >= 0;
}
// 是否至多包含一个"."
export function isNS(s: string): boolean {
    return s.replace(/[^\.]/g, "").length <= 1;
}
// 是否为不能识别的字符
export function isUN(s: string): boolean {
    return !isC(s) && " ()[]{}!<>=+-&|*/%'\",.".indexOf(s) < 0;
}
// 是否为变量标识符（排除函数名，对象属性名的情况）
export function isIDENToken(token: IToken): boolean {
    const p = token.parent;
    return !(p &&
        (hasToken("VTK_FUNCTION,TK_COLON", p.tokenType) && p.childs[0] === token ||
            p.tokenType === "TK_DOT" && p.childs[0] !== token));
}
// t是否为n(,,)函数形式中的","结点
export function isFunctionToken(t: IToken, name: string): boolean {
    return t && t.tokenType === "VTK_COMMA" && // 自身为，结点
        t.parent && t.parent.tokenType === "VTK_PAREN" && // 父节点为()
        t.parent.parent && t.parent.parent.tokenType === "TK_IDEN" && // 祖父结点为abc标识符结点
        t.parent.parent.tokenValue === name;
}
// 遍历**语法树**
export function eachToken(token: IToken, fn: (token: IToken) => boolean, scope): boolean {
    let r = true;
    if (token.childs) { // 若有孩子节点, 先遍历孩子节点, 深度优先遍历
        for (const item of token.childs) {
            if (eachToken(item, fn, scope) === false) {
                r = false;
                break;
            }
        }
    }
    return !r ? r : fn.call(scope, token);
}
// 格式化字符串str, 替换掉str中的{0}、{1}等
export function format(str: string, ...values: string[]): string {
    return str.replace(/\{(\d+)\}/g, (m, i) => values[i]);
}
// 比较**数组**是否相等
function compareArray(farr: any[], sarr: any[], isKey: boolean): boolean {
    let r = farr.length === sarr.length;
    if (r) {
        for (let i = 0; i < farr.length; i++) {
            if (isKey === true) { // 查找是否存在
                if (sarr.indexOf(farr[i]) === -1) {
                    r = false;
                    break;
                }
            } else { // 数组元素递归比较是否相等
                if (!compare(farr[i], sarr[i])) {
                    r = false;
                    break;
                }
            }
        }
    }
    return r;
}
// 比较**对象**是否相等
function compareObject(fobj: object, sobj: object): boolean {
    const f = [];
    const s = [];
    let r = true;
    for (const i in fobj) {
        if (fobj.hasOwnProperty(i)) {
            f.push(i);
        }
    }
    for (const j in sobj) {
        if (sobj.hasOwnProperty(j)) {
            s.push(j);
        }
    }
    if (compareArray(f, s, true)) { // 对象所包含的属性集相同
        for (const ele in fobj) { // 有属性值为undefined或对应属性的值不相等
            if (sobj.hasOwnProperty(ele) && !compare(fobj[ele], sobj[ele])) {
                r = false;
                break;
            }
        }
    } else {
        r = false;
    }
    return r;
}
// 比较**值**是否相等
export function compare(fobj: any, sobj: any): boolean {
    let r;
    if (fobj !== null && sobj !== null && fobj !== undefined && sobj !== undefined) {
        const ftype = typeof (fobj);
        const stype = typeof (sobj);
        if (ftype === stype) {
            if (ftype === "object") { // 都是复合类型
                r = fobj.constructor === Date && sobj.constructor === Date ? fobj.valueOf() === sobj.valueOf() :
                    fobj.constructor === Array && sobj.constructor === Array ? compareArray(fobj, sobj, false) :
                    fobj.constructor !== Array && sobj.constructor !== Array ? compareObject(fobj, sobj) :
                    false;
            } else { // 都是简单类型
                r = fobj === sobj;
            }
        } else {
            r = false;
        }
    } else {
        r = fobj === sobj;
    }
    return r;
}
// 遍历对象c中的属性, 将属性键值对依次添加到对象o中
export function merger(o: object, c: object): object {
    if (isObject(o) && isObject(c)) {
        for (const p in c) {
            if (c.hasOwnProperty(p)) {
                if (o[p] && isObject(o[p])) { // 嵌套, 可以扩充该对象的子对象
                    merger(o[p], c[p]);
                } else { // 添加新属性, 或覆盖原有属性值(同名属性类型不为object)
                    o[p] = c[p];
                }
            }
        }
    }
    return o;
}
