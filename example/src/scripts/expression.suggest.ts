import _ from "underscore";
import s from "underscore.string";

function exprSuggestGetExprContinuously(line: string, pos: number): string {
    // 获取连续的表达式
    let p = pos;
    let t = exprSuggestGetExprBrackets(line, p);
    if (t) {
        let prev = line[p];
        if (prev !== "}") {
            p = p - t.length;
            let iden = exprSuggestGetExprIden(line, p);
            if (iden) {
                t = iden + t;
                p = p - iden.length;
                let part = exprSuggestGetExpr(line, p);
                if (part) {
                    part += ".";
                }
                t = part + t;
            } else {
                if (prev === "]") {
                    prev = line[p];
                    if (prev === "]" || prev === ")") {
                        t = exprSuggestGetExprContinuously(line, p) + t;
                    }
                }
            }
        }
    } else {
        t = null;
    }
    return t;
}

function exprSuggestGetExprBrackets(line: string, pos: number): string {
    // 获取括号匹配
    let str = "";
    let n = 0;
    let r = line[pos];
    let l = r === "]" ? "[" : r === "}" ? "{" : r === ")" ? "(" : "";
    if (l) {
        let c;
        while (pos >= 0) {
            c = line[pos];
            if (c === r) {
                n++;
            } else if (c === l) {
                n--;
            }
            str = c + str;
            if (n === 0) {
                break;
            }
            pos--;
        }
        if (n > 0) {
            str = "";
        }
    }
    return str;
}

function exprSuggestGetExprIden(line: string, pos: number): string {
    // 获取标识符
    let str = "";
    while (pos >= 0) {
        if (line[pos] !== undefined && /[\w,_,$]/.test(line[pos])) {
            str = line[pos] + str;
        } else {
            break;
        }
        pos--;
    }
    return str;
}

function exprSuggestGetExpr(line: string, pos: number): string {
    // 获取部分表达式
    let t = null;
    let p = pos;
    if (p > 0) {
        let prev = line[p];
        if (prev === ".") {
            if (p > 0) {
                p--;
                prev = line[p];
                switch (prev) {
                    case "}":
                    case "]":
                    case ")":
                        t = exprSuggestGetExprContinuously(line, p);
                        break;
                    case "\"":
                    case "'":
                        t = "''";
                        break;
                    default:
                        t = exprSuggestGetExprIden(line, p);
                        if (!t) {
                            t = null;
                        }
                        break;
                }
            }
        } else {
            if (" ([{+-!*/%=><&|:,".indexOf(prev) >= 0) {
                t = "";
            }
        }
    } else {
        t = "";
    }
    return t;
}

function exprSuggestInString(line: string, pos: number): boolean {
    // 是否在字符串中
    let c = "";
    let backslash = false;
    for (let i = 0; i < pos; i++) {
        if (c !== "" && line[i] === "\\") {
            backslash = !backslash;
        } else {
            if (c === line[i] && !backslash) {
                c = "";
            } else if (c === "" && "'\"".indexOf(line[i]) >= 0) {
                c = line[i];
            }
            backslash = false;
        }
    }
    return !!c;
}

function exprSuggestGetInput(line: string, pos: number): string {
    // 获取输入文本
    let str = "";
    let reg = /[\w,_,$]/;
    if (line[pos] === undefined || !reg.test(line[pos])) {
        pos--;
        str = exprSuggestGetExprIden(line, pos);
    }
    return str;
}

function exprSuggestGetPropertyName(object: Object): Array<string> {
    let r = [];
    for (let name in object) {
        if (object.hasOwnProperty(name)) {
            r.push(name);
        }
    }
    return r;
}

interface IExprSuggestInfoCalcExpr {
    (line: string): Value;
};

interface IExprSuggestInfo {
    calcExpr: IExprSuggestInfoCalcExpr;
    constants: Object;
    fields: Object;
    childs: Object;
    funcs: Object;
};

export interface IExprSuggestResult {
    inputValue: string;
    suggestList: Array<string>;
}

export function exprSuggest(line: string, pos: number, info: IExprSuggestInfo): IExprSuggestResult {
    let r = null; // null表示无需提示，""表示无限制提示
    let input = "";

    // 解析: 不在字符串中
    if (!exprSuggestInString(line, pos)) {
        // 解析: 获取输入文本
        input = exprSuggestGetInput(line, pos);
        // 解析: 获取部分表达式
        r = exprSuggestGetExpr(line, pos - input.length - 1);
    }

    // 准备: 建议列表
    let suggest = [];
    if (r === "" && input) {
        // 准备: 根函数、字段、环境变量、预留字
        suggest = suggest.concat(exprSuggestGetPropertyName(info.funcs[r]));
        suggest = suggest.concat(exprSuggestGetPropertyName(info.fields));
        suggest = suggest.concat(exprSuggestGetPropertyName(info.childs));
        suggest = suggest.concat(exprSuggestGetPropertyName(info.constants));
        suggest = suggest.concat(exprSuggestGetPropertyName({
            false: false,
            null: null,
            true: true,
        }));
    } else if (r) {
        // 准备: 根据计算结果类型
        let v = info.calcExpr(r);
        if (v && !v.errorMsg) {
            if (v.type !== "undefined" && v.type !== "null") {
                suggest = suggest.concat(exprSuggestGetPropertyName(info.funcs[v.type]));
                if (v.type === "object") {
                    // 准备: 返回对象时, 添加对象属性
                    suggest = suggest.concat(exprSuggestGetPropertyName(v.toValue()));
                }
            }
        }
    }

    // 根据输入内容过滤、去重、排序
    suggest = _.sortBy(_.uniq(_.filter(suggest, (i => n => s.startsWith(n, i))(input))));
    if (suggest.length === 1 && suggest[0] === input) {
        suggest = [];
    }

    return {
        inputValue: input,
        suggestList: suggest,
    };
}
