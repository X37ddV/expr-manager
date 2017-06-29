import moment from "moment";
import { format, isNumber, isString } from "../lib/base/common";
import locale from "../lib/base/locale";

// 字符串函数
// ----------

// 转换字符串类型为字符串
const funcStringToString = {
    fn: (context, source) => {
        return context.genValue(source.toValue() + "");
    },
    p: [],
    r: "string",
};
// 转换字符串类型为数字
const funcStringToNumber = {
    fn: (context, source) => {
        const n = Number(source.toValue());
        return isNaN(n) ?
            context.genErrorValue(format(locale.getLocale().MSG_EF_STR_TO_NUM, source.toValue())) :
            context.genValue(n);
    },
    p: [],
    r: "number",
};
// 转换字符串类型为日期时间
const funcStringToDate = {
    fn: (context, source, fmt) => {
        fmt = fmt || "";
        const s = source.toValue();
        const m = moment(s, fmt);
        return m.isValid() ?
            context.genValue(m.toDate()) :
            context.genErrorValue(format(locale.getLocale().MSG_EF_STR_TO_NUM, s, fmt));
    },
    p: ["string?"],
    r: "date",
};
// 获取字符串长度
const funcStringLength = {
    fn: (context, source) => {
        const value = source.toValue();
        return context.genValue(isString(value) ? value.length : null);
    },
    p: [],
    r: "number",
};
// 转换字符串为大写
const funcStringUpper = {
    fn: (context, source) => {
        const value = source.toValue();
        return context.genValue(isString(value) ? value.toUpperCase() : null);
    },
    p: [],
    r: "string",
};
// 转换字符串为小写
const funcStringLower = {
    fn: (context, source) => {
        const value = source.toValue();
        return context.genValue(isString(value) ? value.toLowerCase() : null);
    },
    p: [],
    r: "string",
};
// 去除字符串两端空格
const funcStringTrim = {
    fn: (context, source) => {
        const value = source.toValue();
        return context.genValue(isString(value) ? value.trim() : null);
    },
    p: [],
    r: "string",
};
// 去除字符串左端空格
const funcStringTrimLeft = {
    fn: (context, source) => {
        const value = source.toValue();
        return context.genValue(isString(value) ? value.replace(/^\s+/g, "") : null);
    },
    p: [],
    r: "string",
};
// 去除字符串右端空格
const funcStringTrimRight = {
    fn: (context, source) => {
        const value = source.toValue();
        return context.genValue(isString(value) ? value.replace(/\s+$/g, "") : null);
    },
    p: [],
    r: "string",
};
// 获取字符串的子字符串，指定开始位置和长度
const funcStringSubString = {
    fn: (context, source, start, len) => {
        const value = source.toValue();
        const left = start >= 0 ? start : value.toString().length + start;
        let right = left + len;
        if (left > right) {
            right = left;
        }
        return context.genValue(isString(value) && isNumber(start) && isNumber(len) ?
            value.substring(left, right) : null);
    },
    p: ["number", "number"],
    r: "string",
};
// 获取字符串的左子字符串，指定长度
const funcStringLeftString = {
    fn: (context, source, len) => {
        const value = source.toValue();
        return context.genValue(isString(value) && isNumber(len) ? value.substring(0, len) : null);
    },
    p: ["number"],
    r: "string",
};
// 获取字符串的右子字符串，指定长度
const funcStringRightString = {
    fn: (context, source, len) => {
        const value = source.toValue();
        return context.genValue(isString(value) && isNumber(len) ?
            value.substring(value.length - len, value.length) : null);
    },
    p: ["number"],
    r: "string",
};
// 检索字符串，获取子字符串在字符串中的起始位置
const funcStringPos = {
    fn: (context, source, subValue) => {
        const value = source.toValue();
        return context.genValue(isString(value) && isString(subValue) ?
            value.indexOf(subValue) : null);
    },
    p: ["string"],
    r: "number",
};
// 字符串替换
const funcStringReplace = {
    fn: (context, source, srcStr, desStr, model) => {
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
                    if (index !== -1) {
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
    p: ["string", "string", "string?"],
    r: "string",
};
// 正则替换
const funcStringReplaceReg = {
    fn: (context, source, srcStr, desStr, model) => {
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
    p: ["string", "string", "string?"],
    r: "string",
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
