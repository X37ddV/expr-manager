import moment from "moment";
import { format, isNumber, isString } from "../lib/base/common";
import locale from "../lib/base/locale";

// String
const funcStringToString = {
    fn: (context, source) => {
        /// <summary>转换字符串类型为字符串</summary>
        /// <param name="source" type="String"></param>
        /// <returns type="Object">字符串</returns>
        return context.genValue(source.toValue() + "");
    },
    p: [],
    r: "string",
};
const funcStringToNumber = {
    fn: (context, source) => {
        /// <summary>转换字符串类型为数字</summary>
        /// <param name="source" type="String"></param>
        /// <returns type="Object">数字</returns>
        const n = Number(source.toValue());
        return isNaN(n) ?
            context.genErrorValue(source.toValue() + "无法被转换为数字") :
            context.genValue(n);
    },
    p: [],
    r: "number",
};
const funcStringToDate = {
    fn: (context, source, fmt) => {
        /// <summary>转换字符串类型为日期时间</summary>
        /// <param name="source" type="String"></param>
        /// <param name="fmt" type="String">日期时间格式</param>
        /// <returns type="Object">日期时间</returns>
        fmt = fmt || "";
        const s = source.toValue();
        const m = moment(s, fmt);
        return m.isValid() ?
            context.genValue(m.toDate()) :
            context.genErrorValue(s + " 无法被 " + fmt + " 格式化为日期时间");
    },
    p: ["string?"],
    r: "date",
};
const funcStringLength = {
    fn: (context, source) => {
        /// <summary>获取字符串长度</summary>
        /// <param name="source" type="String"></param>
        /// <returns type="Object">字符串长度</returns>
        const value = source.toValue();
        return context.genValue(isString(value) ? value.length : null);
    },
    p: [],
    r: "number",
};
const funcStringUpper = {
    fn: (context, source) => {
        /// <summary>转换字符串为大写</summary>
        /// <param name="source" type="String"></param>
        /// <returns type="Object">大写字符串</returns>
        const value = source.toValue();
        return context.genValue(isString(value) ? value.toUpperCase() : null);
    },
    p: [],
    r: "string",
};
const funcStringLower = {
    fn: (context, source) => {
        /// <summary>转换字符串为小写</summary>
        /// <param name="source" type="String"></param>
        /// <returns type="Object">小写字符串</returns>
        const value = source.toValue();
        return context.genValue(isString(value) ? value.toLowerCase() : null);
    },
    p: [],
    r: "string",
};
const funcStringTrim = {
    fn: (context, source) => {
        /// <summary>去除字符串两端空格</summary>
        /// <param name="source" type="String"></param>
        /// <returns type="Object">字符串</returns>
        const value = source.toValue();
        return context.genValue(isString(value) ? value.trim() : null);
    },
    p: [],
    r: "string",
};
const funcStringTrimLeft = {
    fn: (context, source) => {
        /// <summary>去除字符串左端空格</summary>
        /// <param name="source" type="String"></param>
        /// <returns type="Object">字符串</returns>
        const value = source.toValue();
        return context.genValue(isString(value) ? value.replace(/^\s+/g, "") : null);
    },
    p: [],
    r: "string",
};
const funcStringTrimRight = {
    fn: (context, source) => {
        /// <summary>去除字符串右端空格</summary>
        /// <param name="source" type="String"></param>
        /// <returns type="Object">字符串</returns>
        const value = source.toValue();
        return context.genValue(isString(value) ? value.replace(/\s+$/g, "") : null);
    },
    p: [],
    r: "string",
};
const funcStringSubString = {
    fn: (context, source, start, len) => {
        /// <summary>获取字符串的子字符串，指定开始位置和长度</summary>
        /// <param name="source" type="String"></param>
        /// <param name="start" type="Number">开始位置</param>
        /// <param name="len" type="Number">长度</param>
        /// <returns type="Object">子字符串</returns>
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
const funcStringLeftString = {
    fn: (context, source, len) => {
        /// <summary>获取字符串的左子字符串，指定长度</summary>
        /// <param name="source" type="String"></param>
        /// <param name="len" type="Number">长度</param>
        /// <returns type="Object">子字符串</returns>
        const value = source.toValue();
        return context.genValue(isString(value) && isNumber(len) ? value.substring(0, len) : null);
    },
    p: ["number"],
    r: "string",
};
const funcStringRightString = {
    fn: (context, source, len) => {
        /// <summary>获取字符串的右子字符串，指定长度</summary>
        /// <param name="source" type="String"></param>
        /// <param name="len" type="Number">长度</param>
        /// <returns type="Object">子字符串</returns>
        const value = source.toValue();
        return context.genValue(isString(value) && isNumber(len) ?
            value.substring(value.length - len, value.length) : null);
    },
    p: ["number"],
    r: "string",
};
const funcStringPos = {
    fn: (context, source, subValue) => {
        /// <summary>检索字符串，获取子字符串在字符串中的起始位置</summary>
        /// <param name="source" type="String"></param>
        /// <param name="subValue" type="String">子字符串</param>
        /// <returns type="Object">位置索引</returns>
        const value = source.toValue();
        return context.genValue(isString(value) && isString(subValue) ?
            value.indexOf(subValue) : null);
    },
    p: ["string"],
    r: "number",
};
const funcStringReplace = {
    fn: (context, source, srcStr, desStr, model) => {
        /// <summary>字符串替换</summary>
        /// <param name="source" type="String">源字符串</param>
        /// <param name="srcStr" type="String">被搜索的子字符串</param>
        /// <param name="desStr" type="String">用于替换的子字符串</param>
        /// <param name="model" type="Boolen">匹配模式</param>
        /// <returns type="Object">替换后的新字符串</returns>
        let r;
        let t;
        if (model === undefined) {
            model = "g"; // 默认全部替换,且区分大小写(i表示不区分大小写)
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
const funcStringReplaceReg = {
    fn: (context, source, srcStr, desStr, model) => {
        /// <summary>正则替换</summary>
        /// <param name="source" type="String">源字符串</param>
        /// <param name="srcStr" type="String">用于匹配子字符串的正则表达式</param>
        /// <param name="desStr" type="String">用于替换的子字符串</param>
        /// <param name="model" type="Boolen">匹配模式</param>
        /// <returns type="Object">替换后的新字符串</returns>
        let r;
        if (model === undefined) {
            model = "g"; // 默认全部替换,且区分大小写(i表示不区分大小写)
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
