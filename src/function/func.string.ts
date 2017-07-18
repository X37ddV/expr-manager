import moment from "moment";
import { format, isString } from "../lib/base/common";
import locale from "../lib/base/locale";
import ExprContext, { FunctionParamsType, FunctionResultType } from "../lib/context";

// 字符串函数
// ----------

// 转换字符串类型为字符串
const funcStringToString = {
    fn: (context: ExprContext, source) => {
        return context.genValue(source.toValue() + "");
    },
    p: [] as FunctionParamsType[],
    r: "string" as FunctionResultType,
};
// 转换字符串类型为数字
const funcStringToNumber = {
    fn: (context: ExprContext, source) => {
        const n = Number(source.toValue());
        return isNaN(n) ?
            context.genErrorValue(format(locale.getLocale().MSG_EF_STR_TO_NUM, source.toValue())) :
            context.genValue(n);
    },
    p: [] as FunctionParamsType[],
    r: "number" as FunctionResultType,
};
// 转换字符串类型为日期时间
const funcStringToDate = {
    fn: (context: ExprContext, source, fmt) => {
        fmt = fmt || "";
        const s = source.toValue();
        const m = moment(s, fmt);
        return m.isValid() ?
            context.genValue(m.toDate()) :
            context.genErrorValue(format(locale.getLocale().MSG_EF_STR_TO_NUM, s, fmt));
    },
    p: ["string?"] as FunctionParamsType[],
    r: "date" as FunctionResultType,
};
// 获取字符串长度
const funcStringLength = {
    fn: (context: ExprContext, source) => {
        return context.genValue(source.toValue().length);
    },
    p: [] as FunctionParamsType[],
    r: "number" as FunctionResultType,
};
// 转换字符串为大写
const funcStringUpper = {
    fn: (context: ExprContext, source) => {
        return context.genValue(source.toValue().toUpperCase());
    },
    p: [] as FunctionParamsType[],
    r: "string" as FunctionResultType,
};
// 转换字符串为小写
const funcStringLower = {
    fn: (context: ExprContext, source) => {
        return context.genValue(source.toValue().toLowerCase());
    },
    p: [] as FunctionParamsType[],
    r: "string" as FunctionResultType,
};
// 去除字符串两端空格
const funcStringTrim = {
    fn: (context: ExprContext, source) => {
        return context.genValue(source.toValue().trim());
    },
    p: [] as FunctionParamsType[],
    r: "string" as FunctionResultType,
};
// 去除字符串左端空格
const funcStringTrimLeft = {
    fn: (context: ExprContext, source) => {
        return context.genValue(source.toValue().replace(/^\s+/g, ""));
    },
    p: [] as FunctionParamsType[],
    r: "string" as FunctionResultType,
};
// 去除字符串右端空格
const funcStringTrimRight = {
    fn: (context: ExprContext, source) => {
        return context.genValue(source.toValue().replace(/\s+$/g, ""));
    },
    p: [] as FunctionParamsType[],
    r: "string" as FunctionResultType,
};
// 获取字符串的子字符串，指定开始位置和长度
const funcStringSubString = {
    fn: (context: ExprContext, source, start, len) => {
        const value = source.toValue();
        const left = start >= 0 ? start : value.toString().length + start;
        let right = left + len;
        if (left > right) {
            right = left;
        }
        return context.genValue(value.substring(left, right));
    },
    p: ["number", "number"] as FunctionParamsType[],
    r: "string" as FunctionResultType,
};
// 获取字符串的左子字符串，指定长度
const funcStringLeftString = {
    fn: (context: ExprContext, source, len) => {
        return context.genValue(source.toValue().substring(0, len));
    },
    p: ["number"] as FunctionParamsType[],
    r: "string" as FunctionResultType,
};
// 获取字符串的右子字符串，指定长度
const funcStringRightString = {
    fn: (context: ExprContext, source, len) => {
        const value = source.toValue();
        return context.genValue(value.substring(value.length - len, value.length));
    },
    p: ["number"] as FunctionParamsType[],
    r: "string" as FunctionResultType,
};
// 检索字符串，获取子字符串在字符串中的起始位置
const funcStringPos = {
    fn: (context: ExprContext, source, subValue) => {
        return context.genValue(source.toValue().indexOf(subValue));
    },
    p: ["string"] as FunctionParamsType[],
    r: "number" as FunctionResultType,
};
// 字符串替换
const funcStringReplace = {
    fn: (context: ExprContext, source, srcStr, desStr, model) => {
        let r;
        let t;
        if (model === undefined) { // 默认全部替换,且区分大小写(i表示不区分大小写)
            model = "g";
        }
        let value = source.toValue();
        let index = 0;
        const length = srcStr.length;
        if (/^m?g?i?$/.test(model)) {
            if (/g/.test(model)) { // 全部替换
                if (/i/.test(model)) { // 不区分大小写
                    index = value.toUpperCase().indexOf(srcStr.toUpperCase(), index);
                    while (index !== -1) {
                        t = value.split("");
                        let param = [index, length];
                        param = param.concat(desStr.split(""));
                        Array.prototype.splice.apply(t, param);
                        value = t.join("");
                        index = value.toUpperCase().indexOf(srcStr.toUpperCase(), index);
                    }
                } else { // 区分大小写
                    index = value.indexOf(srcStr, index);
                    while (index !== -1) {
                        t = value.split("");
                        let param = [index, length];
                        param = param.concat(desStr.split(""));
                        Array.prototype.splice.apply(t, param);
                        value = t.join("");
                        index = value.indexOf(srcStr, index);
                    }
                }
            } else { // 只替换第一个
                if (/i/.test(model)) { // 不区分大小写
                    index = value.toUpperCase().indexOf(srcStr.toUpperCase(), index);
                    if (index >= 0) {
                        t = value.split("");
                        let param = [index, length];
                        param = param.concat(desStr.split(""));
                        Array.prototype.splice.apply(t, param);
                        value = t.join("");
                    }
                } else { // 区分大小写
                    value = value.replace(srcStr, desStr);
                }
            }
        } else {
            r = context.genErrorValue(format(locale.getLocale().MSG_EF_MODEL, model));
        }
        if (!r) {
            r = context.genValue(value);
        }
        return r;
    },
    p: ["string", "string", "string?"] as FunctionParamsType[],
    r: "string" as FunctionResultType,
};
// 正则替换
const funcStringReplaceReg = {
    fn: (context: ExprContext, source, srcStr, desStr, model) => {
        let r;
        if (model === undefined) { // 默认全部替换,且区分大小写(i表示不区分大小写)
            model = "g";
        }
        let value = source.toValue();
        let regexp;
        try {
            regexp = new RegExp(srcStr, model);
        } catch (e) {
            r = context.genErrorValue(format(locale.getLocale().MSG_EF_MODEL, model));
        }
        value = value.replace(regexp, desStr);
        if (!r) {
            r = context.genValue(value);
        }
        return r;
    },
    p: ["string", "string", "string?"] as FunctionParamsType[],
    r: "string" as FunctionResultType,
};
// 字符串函数列表
export default {
    LeftString: funcStringLeftString,
    Length: funcStringLength,
    Lower: funcStringLower,
    Pos: funcStringPos,
    Replace: funcStringReplace,
    ReplaceReg: funcStringReplaceReg,
    RightString: funcStringRightString,
    SubString: funcStringSubString,
    ToDate: funcStringToDate,
    ToNumber: funcStringToNumber,
    ToString: funcStringToString,
    Trim: funcStringTrim,
    TrimLeft: funcStringTrimLeft,
    TrimRight: funcStringTrimRight,
    Upper: funcStringUpper,
};
