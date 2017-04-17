import { isNumber } from "../base/common";

// Number
const funcNumberToString = {
    fn: (context, source) => {
        /// <summary>转换数字类型为字符串</summary>
        /// <param name="source" type="Number"></param>
        /// <returns type="Object">字符串</returns>
        return context.genValue(source.toValue() + "");
    },
    p: [],
    r: "string",
};
const funcNumberAbs = {
    fn: (context, source) => {
        /// <summary>获取数的绝对值</summary>
        /// <param name="source" type="Number"></param>
        /// <returns type="Object">绝对值</returns>
        return source.abs();
    },
    p: [],
    r: "number",
};
const funcNumberCeil = {
    fn: (context, source) => {
        /// <summary>对数进行向上取整</summary>
        /// <param name="source" type="Number"></param>
        /// <returns type="Object">数值</returns>
        return source.ceil();
    },
    p: [],
    r: "number",
};
const funcNumberFloor = {
    fn: (context, source) => {
        /// <summary>对数进行向下取整</summary>
        /// <param name="source" type="Number"></param>
        /// <returns type="Object">数值</returns>
        return source.floor();
    },
    p: [],
    r: "number",
};
const funcNumberCos = {
    fn: (context, source) => {
        /// <summary>获取数的余弦</summary>
        /// <param name="source" type="Number"></param>
        /// <returns type="Object">余弦</returns>
        return source.cos();
    },
    p: [],
    r: "number",
};
const funcNumberExp = {
    fn: (context, source) => {
        /// <summary>获取 e 的指数</summary>
        /// <param name="source" type="Number"></param>
        /// <returns type="Object">指数</returns>
        return source.exp();
    },
    p: [],
    r: "number",
};
const funcNumberLn = {
    fn: (context, source) => {
        /// <summary>获取数的自然对数（底为 e）</summary>
        /// <param name="source" type="Number"></param>
        /// <returns type="Object">自然对数</returns>
        return source.ln();
    },
    p: [],
    r: "number",
};
const funcNumberLog = {
    fn: (context, source, base) => {
        /// <summary>获取数的指定底数的对数</summary>
        /// <param name="source" type="Number"></param>
        /// <param name="base" type="Number">底数</param>
        /// <returns type="Object">对数</returns>
        return source.log(base);
    },
    p: ["number"],
    r: "number",
};
const funcNumberPower = {
    fn: (context, source, exponent) => {
        /// <summary>获取数的指定指数的次幂</summary>
        /// <param name="source" type="Number"></param>
        /// <param name="exponent" type="Number">指数</param>
        /// <returns type="Object">次幂</returns>
        return source.power(exponent);
    },
    p: ["number"],
    r: "number",
};
const funcNumberRound = {
    fn: (context, source, scale) => {
        /// <summary>根据保留的小数位数对数四舍五入</summary>
        /// <param name="source" type="Number"></param>
        /// <param name="scale" type="Number">保留小数位数</param>
        /// <returns type="Object">数值</returns>
        return source.round(scale);
    },
    p: ["number"],
    r: "number",
};
const funcNumberSin = {
    fn: (context, source) => {
        /// <summary>获取数的正弦</summary>
        /// <param name="source" type="Number"></param>
        /// <returns type="Object">正弦</returns>
        return source.sin();
    },
    p: [],
    r: "number",
};
const funcNumberSqrt = {
    fn: (context, source) => {
        /// <summary>获取数的平方根</summary>
        /// <param name="source" type="Number"></param>
        /// <returns type="Object">平方根</returns>
        return source.sqrt();
    },
    p: [],
    r: "number",
};
const funcNumberTan = {
    fn: (context, source) => {
        /// <summary>获取树的正切值</summary>
        /// <param name="source" type="Number"></param>
        /// <returns type="Object">正切值</returns>
        return source.tan();
    },
    p: [],
    r: "number",
};
const funcNumberTrunc = {
    fn: (context, source, scale) => {
        /// <summary>根据保留的小数位数对数进行截断</summary>
        /// <param name="source" type="Number"></param>
        /// <param name="scale" type="Number">保留小数位数</param>
        /// <returns type="Object">数值</returns>
        return source.trunc(scale);
    },
    p: ["number"],
    r: "number",
};
const funcNumberToRMB = {
    fn: (context, source, rmb, big) => {
        /// <summary>获取人民币大写</summary>
        /// <param name="source" type="Number"></param>
        /// <param name="rmb" type="Boolean">是否人民币(默认true)</param>
        /// <param name="big" type="Boolean">是否大写(默认true)</param>
        /// <returns type="Object">人民币大写</returns>
        let conversion = (num, isRMB, isBig) => {
            let cn = (isBig ? "零壹贰叁肆伍陆柒捌玖" : "零一二三四五六七八九").split("");
            let cq = (isBig ? "拾佰仟" : "十百千").split(""); cq.unshift("");
            let cw = "万亿兆".split(""); cw.unshift("");
            let cd = isRMB ? "元" : "点";
            let cl = "角分厘".split("");
            let cz = isRMB ? "整" : "";
            let cf = "负";
            let v = "";
            let s = (num + ".").split(".", 2);
            let x = s[0].split("");
            let y = s[1].split("");
            let isNegative = x[0] === "-";
            if (isNegative) {
                x.shift();
            }
            x = x.reverse();

            // 处理整数部分
            let c = "";
            let i = 0;
            let t = [];
            let inZero = true;
            while (i < x.length) {
                t.push(x[i++]);
                if (t.length === 4 || i === x.length) {
                    // 从个位数起以每四位数为一小节
                    for (let j = 0; j < t.length; j++) {
                        let n = Number(t[j]);
                        if (n === 0) {
                            // 1. 避免 "零" 的重覆出现; 2. 个位数的 0 不必转成 "零"
                            if (!inZero && j !== 0) {
                                c = cn[0] + c;
                            }
                            inZero = true;
                        } else {
                            c = cn[n] + cq[j] + c;
                            inZero = false;
                        }
                    }
                    // 加上该小节的位数
                    if (c.length === 0) {
                        if (v.length > 0 && v.split("")[0] !== cn[0]) {
                            v = cn[0] + v;
                        }
                    } else {
                        v = c + (cw[Math.floor((i - 1) / 4)] || "") + v;
                    }
                    c = "";
                    t = [];
                }
            }

            // 处理小数部分
            if (y.length > 0) {
                v += cd;
                for (let k = 0; k < y.length; k++) {
                    let m = Number(y[k]);
                    if (isRMB) {
                        // 避免小数点后 "零" 的重覆出现
                        if ((m !== 0) || (v.substring(v.length - 1) !== cn[0]) || (k > 2)) {
                            v += cn[m];
                        }
                        if ((m !== 0) || (v.substring(v.length - 1) === cn[0]) && (k === 2)) {
                            v += cl[k] || "";
                        }
                    } else {
                        v += cn[m];
                    }
                }
            } else {
                // 处理无小数部分时整数部分的结尾
                if (v.length === 0) {
                    v = cn[0];
                }
                if (isRMB) {
                    v += cd + cz;
                }
            }

            // 其他例外状况的处理, 非人民币则将 "壹拾" 或 "一十" 改为 "拾" 或 "十"
            if (!isRMB && v.substring(0, 2) === cn[1] + cq[1]) {
                v = v.substring(1);
            }

            // 没有整数部分 且 有小数部分
            if (v.split("")[0] === cd) {
                if (isRMB) {
                    v = v.substring(1);
                } else {
                    v = cn[0] + v;
                }
            }

            // 是否为负数
            if (isNegative) {
                v = cf + v;
            }

            return v;
        };
        let v = source.toValue();
        return context.genValue(isNumber(v) ?
            conversion(v, rmb === undefined || rmb, big === undefined || big) : null);
    },
    p: ["boolean?", "boolean?"],
    r: "string",
};
export default {
    Abs: funcNumberAbs,
    Ceil: funcNumberCeil,
    Cos: funcNumberCos,
    Exp: funcNumberExp,
    Floor: funcNumberFloor,
    Ln: funcNumberLn,
    Log: funcNumberLog,
    Power: funcNumberPower,
    Round: funcNumberRound,
    Sin: funcNumberSin,
    Sqrt: funcNumberSqrt,
    Tan: funcNumberTan,
    ToRMB: funcNumberToRMB,
    ToString: funcNumberToString,
    Trunc: funcNumberTrunc,
};
