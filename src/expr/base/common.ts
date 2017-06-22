import { IToken } from "./interface";

// 内部公共函数
// ----------

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
// 是否为正确数字格式(至多包含一个".")
export function isNS(s: string): boolean {
    return s.replace(/[^\.]/g, "").length <= 1;
}
// 是否为不能识别的字符
export function isUN(s: string): boolean {
    return !isC(s) && " ()[]{}!<>=+-&|*/%'\",.".indexOf(s) < 0;
}
export function hasToken(tokenTypes: string, tokenType: string): boolean {
    // token类型是否包含在tokens中
    return (tokenTypes + ",").indexOf(tokenType + ",") >= 0;
}
export function isIDENToken(token: IToken): boolean {
    // 是否为变量标识符(排除函数名, 对象属性名的情况)
    let p = token.parent;
    return !(p &&
        (hasToken("VTK_FUNCTION,TK_COLON", p.tokenType) && p.childs[0] === token ||
            p.tokenType === "TK_DOT" && p.childs[0] !== token));
}
export function isFunctionToken(t: IToken, name: string): boolean {
    // t是否为n(,,)函数形式中的","结点
    return t && t.tokenType === "VTK_COMMA" && // 自身为，结点
        t.parent && t.parent.tokenType === "VTK_PAREN" && // 父节点为()
        t.parent.parent && t.parent.parent.tokenType === "TK_IDEN" && // 祖父结点为abc标识符结点
        t.parent.parent.tokenValue === name; // 函数名为n
}
export function eachToken(token: IToken, fn: (token: IToken) => boolean, scope): boolean {
    // 遍历语法树
    let r = true;
    if (token.childs) { // 若有孩子节点, 先遍历孩子节点, 深度优先遍历
        for (let i = 0; i < token.childs.length; i++) {
            if (eachToken(token.childs[i], fn, scope) === false) {
                r = false;
                break; // 子节点出错, 父节点、祖父节点...直接返回false
            }
        }
    }
    return !r ? r : fn.call(scope, token);
}
export function format(str: string, ...values: string[]): string {
    // 格式化字符串s, 替换掉s中的{0}、{1}等
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
export function getValueType(value: any): string {
    // 得到v的数据类型
    // IE8下, Object.prototype.toString.call(null) === "[object Object]"
    // IE9下, Object.prototype.toString.call(null) === "[object NULL]"
    // 所以为了兼容, 单独处理 v === null 的情况
    if (value === null) {
        return "null";
    } else {
        return Object.prototype.toString.call(value).replace("[object ", "").replace("]", "").toLowerCase();
    }
}
function compareArray(farr: any, sarr: any, isKey: boolean): boolean {
    // 比较数组
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
function compareObject(fobj: any, sobj: any): boolean { // 比较对象
    let f = [];
    let s = [];
    let r = true;
    for (let i in fobj) {
        if (fobj.hasOwnProperty(i)) {
            f.push(i);
        }
    }
    for (let j in sobj) {
        if (sobj.hasOwnProperty(j)) {
            s.push(j);
        }
    }
    if (compareArray(f, s, true)) { // 对象所包含的属性集相同
        for (let ele in fobj) { // 有属性值为undefined或对应属性的值不相等
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
        let ftype = typeof (fobj);
        let stype = typeof (sobj);
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
export function merger(o: Object, c: Object): Object {
    // 遍历对象c中的属性, 将属性键值对依次添加到对象o中
    if (isObject(o) && isObject(c)) {
        for (let p in c) {
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
