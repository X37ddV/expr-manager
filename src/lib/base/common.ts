import { IToken } from "./interface";

// 内部公共函数
// ----------

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
        t.parent.parent.tokenValue === name; // 函数名为name
}
// 遍历语法树
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
export function isArray(v: any): boolean {
    return getValueType(v) === "array";
}
export function isString(v: any): boolean {
    return getValueType(v) === "string";
}
export function isObject(v: any): boolean {
    return getValueType(v) === "object";
}
export function isNumber(v: any): boolean {
    return getValueType(v) === "number";
}
// 得到value的数据类型
export function getValueType(value: any): string {
    if (value === null) { // 兼容IE8，IE8下为[object Object]
        return "null";
    } else {
        return Object.prototype.toString.call(value).replace("[object ", "").replace("]", "").toLowerCase();
    }
}
// 比较数组
function compareArray(farr: any, sarr: any, isKey: boolean): boolean {
    let r = true;
    if (farr.length !== sarr.length) {
        r = false;
    } else {
        for (let i = 0; i < farr.length; i++) {
            if (isKey === true) {
                if (sarr.indexOf(farr[i]) === -1) {
                    r = false; // 查找是否存在
                    break;
                }
            } else {
                if (!compare(farr[i], sarr[i])) {
                    r = false; // 数组元素递归比较是否相等
                    break;
                }
            }
        }
    }
    return r;
}
// 比较对象
function compareObject(fobj: any, sobj: any): boolean {
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
export function compare(fobj: any, sobj: any): boolean {
    // 比较两个对象或数组是否相等
    if (fobj !== null && sobj !== null && fobj !== undefined && sobj !== undefined) {
        const ftype = typeof (fobj);
        const stype = typeof (sobj);
        if (ftype === stype) {
            if (ftype === "object") { // 都是复合类型
                if (fobj.constructor === Date && sobj.constructor === Date) { // 日期对象
                    return fobj.valueOf() === sobj.valueOf();
                } else if (fobj.constructor === Array && sobj.constructor === Array) { // 数组
                    return compareArray(fobj, sobj, false);
                } else if (fobj.constructor !== Array && sobj.constructor !== Array) { // 都不是数组
                    return compareObject(fobj, sobj);
                }
                return false;
            }
            return fobj === sobj; // 都是简单类型
        }
        return false;
    } else {
        return fobj === sobj;
    }
}
export function merger(o: object, c: object): object {
    // 遍历对象c中的属性, 将属性键值对依次添加到对象o中
    if (isObject(o) && isObject(c)) {
        for (const p in c) {
            if (c.hasOwnProperty(p)) {
                if (o[p] && isObject(o[p])) {
                    merger(o[p], c[p]); // 嵌套, 可以扩充该对象的子对象
                } else {
                    o[p] = c[p]; // 添加新属性, 或覆盖原有属性值(同名属性类型不为object)
                }
            }
        }
    }
    return o;
}
