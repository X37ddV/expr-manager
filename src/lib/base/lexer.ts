import locale from "../base/locale";
import { format, isC, isN, isNS, isO, isUN, isX } from "./common";
import { IToken } from "./interface";

// 词法分析器
// ----------

export default class Lexer {
    private expr: string[] = []; // 表达式字符数组
    private index: number = 0; // 当前索引位置
    // 设置表达式
    public setExpr(expr: string): Lexer {
        this.expr = expr ? expr.split("") : [];
        this.reset();
        return this;
    }
    // 重置词法分析器，以便再次从头开始解析
    public reset(): Lexer {
        this.index = 0;
        return this;
    }
    // 下一个Token结点
    public nextToken(): IToken {
        const s = this.expr;
        let n = this.index; /// 从上一次调用nextToken()的结束位置开始
        let hasWrong = false; /// 解析Token过程是否出错
        let token; /// 要返回的token对象
        while (n < s.length) {
            if (s[n] !== " ") {
                break;
            } else {
                n++;
            }
        }
        let tValue = "";
        let tType = "";
        let tText = "";
        const tIndex = n + 1;

        if (n < s.length) {
            switch (s[n]) {
                case "[":
                case "]":
                case "{":
                case "}":
                case ".":
                case "(":
                case ")":
                case "*":
                case "/":
                case "%":
                case "+":
                case "-":
                case ":":
                case ",":
                    tText = tValue = s[n++];
                    tType =
                        tValue === "[" ? "TK_LA" :
                            tValue === "]" ? "TK_RA" :
                                tValue === "{" ? "TK_LO" :
                                    tValue === "}" ? "TK_RO" :
                                        tValue === "." ? "TK_DOT" :
                                            tValue === "(" ? "TK_LP" :
                                                tValue === ")" ? "TK_RP" :
                                                    tValue === "*" ? "TK_MULTI" :
                                                        tValue === "/" ? "TK_DIV" :
                                                            tValue === "%" ? "TK_MOD" :
                                                                tValue === "+" ? "TK_PLUS" :
                                                                    tValue === "-" ? "TK_MINUS" :
                                                                        tValue === ":" ? "TK_COLON" :
                                                                            tValue === "," ? "TK_COMMA" :
                                                                                "";
                    break;
                case "!": /// ! !=
                    tValue = s[n++];
                    if (n < s.length && s[n] === "=") {
                        tValue += s[n++];
                        tType = "TK_EO";
                    } else {
                        tType = "TK_NOT";
                    }
                    tText = tValue;
                    break;
                case ">": /// > >=
                case "<": /// < <=
                    tValue = s[n++];
                    if (n < s.length && s[n] === "=") {
                        tValue += s[n++];
                    }
                    tText = tValue;
                    tType = "TK_CO";
                    break;
                case "=": /// ==
                    tValue = s[n++];
                    if (n < s.length && s[n] === "=") {
                        tValue += s[n++];
                        tType = "TK_EO";
                    } else {
                        tType = "TK_UNKNOWN";
                    }
                    tText = tValue;
                    break;
                case "&": /// &&
                case "|": /// ||
                    tValue = s[n++];
                    if (n < s.length && s[n] === tValue) {
                        tType =
                            tValue === "&" ? "TK_AND" :
                                tValue === "|" ? "TK_OR" :
                                    "TK_CO";
                        tValue += s[n++];
                    } else {
                        tType = "TK_UNKNOWN";
                    }
                    tText = tValue;
                    break;
                case "'":
                case "\"":
                    const start = s[n]; /// '或"
                    const v = [];
                    let endFlag = false; /// 是否找到对应的反引号
                    tValue += s[n++];
                    while (!hasWrong && n < s.length) {
                        if (s[n] === "\\") {
                            switch (s[n + 1]) {
                                case "\\": /// 转义符
                                    n++;
                                    v.push("\\");
                                    break;
                                case "n":
                                    n++;
                                    v.push("\n"); /// 换行
                                    break;
                                case "\'": /// 单引号
                                    n++;
                                    v.push("\'");
                                    break;
                                case "\"": /// 双引号
                                    n++;
                                    v.push("\"");
                                    break;
                                case "t": /// 制表符
                                    n++;
                                    v.push("\t");
                                    break;
                                case "b": /// 空格
                                    n++;
                                    v.push("\b");
                                    break;
                                case "r": /// 回车
                                    n++;
                                    v.push("\r");
                                    break;
                                case "f": /// 换页符
                                    n++;
                                    v.push("\f");
                                    break;
                                case "u": /// unicode字符
                                    const strU = s.join("").substring(n + 2, n + 6);
                                    if (isX(s[n + 2]) && isX(s[n + 3]) && isX(s[n + 4]) && isX(s[n + 5])) {
                                        v.push(String.fromCharCode(parseInt(strU, 16)));
                                        n += 5;
                                    } else {
                                        hasWrong = true;
                                        token = { /// 出错时要返回的token结点
                                            tokenErrorMsg: format(locale.getLocale().MSG_EL_SYNTAX_UC, "\\u" + strU),
                                            tokenIndex: n,
                                            tokenType: "TK_STRING",
                                        };
                                    }
                                    break;
                                case "x": /// 十六进制数
                                    const strX = s.join("").substring(n + 2, n + 4);
                                    if (isX(s[n + 2]) && isX(s[n + 3])) {
                                        v.push(String.fromCharCode(parseInt(strX, 16)));
                                        n += 3;
                                    } else {
                                        hasWrong = true;
                                        token = { /// 出错时要返回的token结点
                                            tokenErrorMsg: format(locale.getLocale().MSG_EL_SYNTAX_XN, "\\x" + strX),
                                            tokenIndex: n,
                                            tokenType: "TK_STRING",
                                        };
                                    }
                                    break;
                                case "0":
                                case "1":
                                case "2":
                                case "3":
                                case "4":
                                case "5":
                                case "6":
                                case "7": /// 八进制数
                                    const strN = s.join("").substring(n + 1, n + 4);
                                    if (isO(s[n + 1]) && isO(s[n + 2]) && isO(s[n + 3])) {
                                        v.push(String.fromCharCode(parseInt(strN, 8)));
                                        n += 3;
                                    } else {
                                        hasWrong = true;
                                        token = { /// 出错时要返回的token结点
                                            tokenErrorMsg: format(locale.getLocale().MSG_EL_SYNTAX_ON, "\\" + strN),
                                            tokenIndex: n,
                                            tokenType: "TK_STRING",
                                        };
                                    }
                                    break;
                                default: /// 不需要转义的字符
                                    n++;
                                    v.push(s[n]);
                                    break;
                            }
                        } else if (s[n] === start) { /// 字符串结束
                            endFlag = true;
                            break;
                        } else { /// 普通字符
                            v.push(s[n]);
                        }
                        n++;
                    }
                    if (!hasWrong) {
                        if (endFlag === true) { /// 找到了对应的字符串结束符
                            tValue += v.join("") + start;
                        } else { /// 没有找到对应的结束符
                            hasWrong = true;
                            token = { /// 出错时要返回的token结点
                                tokenErrorMsg: format(locale.getLocale().MSG_EL_SYNTAX_S, tValue + v.join("")),
                                tokenIndex: n,
                                tokenType: "TK_STRING",
                            };
                            break;
                        }
                        n++;
                        tText = tValue;
                        tValue = v.join(""); /// tText:"'123'"而tValue:"123"
                        tType = "TK_STRING";
                    }
                    break;
                default:
                    tValue = s[n++];
                    if (isN(tValue)) { /// 数字
                        while (n < s.length) {
                            if (!isN(s[n]) || (s[n] === "." && !isN(s[n + 1]))) {
                                break;
                            }
                            tValue += s[n++];
                        }
                        tType = isNS(tValue) ? "TK_NUMBER" : "TK_UNKNOWN";
                    } else if (isC(tValue)) { /// 标识符
                        while (n < s.length) {
                            if (!isC(s[n])) {
                                break;
                            }
                            tValue += s[n++];
                        }
                        switch (tValue) {
                            case "true":
                            case "false":
                                tType = "TK_BOOL";
                                break;
                            case "null":
                                tType = "TK_NULL";
                                break;
                            default:
                                tType = "TK_IDEN";
                        }
                    } else {
                        while (n < s.length) { /// 不能识别的字符
                            if (!isUN(s[n])) {
                                break;
                            }
                            tValue += s[n++];
                        }
                        tType = "TK_UNKNOWN";
                    }
                    tText = tValue;
            }
        } else {
            return null;
        }

        if (tType === "TK_PLUS" || tType === "TK_MINUS") {
            let j = n - tText.length - 1;
            while (j >= 0) { /// 紧接着({[+-*/%><=&|:,的+/-被解析为单目运算符
                if ("({[+-*/%><=&|:,".indexOf(s[j]) >= 0) {
                    tType = "TK_UNARY";
                    break;
                } else if (s[j] !== " ") {
                    break;
                }
                j--;
            }
            if (j === -1) {
                tType = "TK_UNARY";
            }
        }

        this.index = n;
        if (!hasWrong) {
            token = { /// 没有出错时返回的token结点
                tokenIndex: tIndex,
                tokenText: tText,
                tokenType: tType,
                tokenValue: tValue,
            };
        }
        return token; /// 返回Token节点对象
    }
}
