import ExprContext, { FunctionParamsType, FunctionResultType } from "../lib/context";

// 数值函数
// ----------

// 转换数字类型为字符串
const funcNumberToString = {
    fn: (context: ExprContext, source) => {
        return context.genValue(source.toValue() + "");
    },
    p: [] as FunctionParamsType[],
    r: "string" as FunctionResultType,
};
// 获取数的绝对值
const funcNumberAbs = {
    fn: (context: ExprContext, source) => {
        return source.abs();
    },
    p: [] as FunctionParamsType[],
    r: "number" as FunctionResultType,
};
// 对数进行向上取整
const funcNumberCeil = {
    fn: (context: ExprContext, source) => {
        return source.ceil();
    },
    p: [] as FunctionParamsType[],
    r: "number" as FunctionResultType,
};
// 对数进行向下取整
const funcNumberFloor = {
    fn: (context: ExprContext, source) => {
        return source.floor();
    },
    p: [] as FunctionParamsType[],
    r: "number" as FunctionResultType,
};
// 获取数的余弦
const funcNumberCos = {
    fn: (context: ExprContext, source) => {
        return source.cos();
    },
    p: [] as FunctionParamsType[],
    r: "number" as FunctionResultType,
};
// 获取 e 的指数
const funcNumberExp = {
    fn: (context: ExprContext, source) => {
        return source.exp();
    },
    p: [] as FunctionParamsType[],
    r: "number" as FunctionResultType,
};
// 获取数的自然对数（底为 e）
const funcNumberLn = {
    fn: (context: ExprContext, source) => {
        return source.ln();
    },
    p: [] as FunctionParamsType[],
    r: "number" as FunctionResultType,
};
// 获取数的指定底数的对数
const funcNumberLog = {
    fn: (context: ExprContext, source, base) => {
        return source.log(base);
    },
    p: ["number"] as FunctionParamsType[],
    r: "number" as FunctionResultType,
};
// 获取数的指定指数的次幂
const funcNumberPower = {
    fn: (context: ExprContext, source, exponent) => {
        return source.power(exponent);
    },
    p: ["number"] as FunctionParamsType[],
    r: "number" as FunctionResultType,
};
// 根据保留的小数位数对数四舍五入
const funcNumberRound = {
    fn: (context: ExprContext, source, scale) => {
        return source.round(scale);
    },
    p: ["number"] as FunctionParamsType[],
    r: "number" as FunctionResultType,
};
// 获取数的正弦
const funcNumberSin = {
    fn: (context: ExprContext, source) => {
        return source.sin();
    },
    p: [] as FunctionParamsType[],
    r: "number" as FunctionResultType,
};
// 获取数的平方根
const funcNumberSqrt = {
    fn: (context: ExprContext, source) => {
        return source.sqrt();
    },
    p: [] as FunctionParamsType[],
    r: "number" as FunctionResultType,
};
// 获取树的正切值
const funcNumberTan = {
    fn: (context: ExprContext, source) => {
        return source.tan();
    },
    p: [] as FunctionParamsType[],
    r: "number" as FunctionResultType,
};
// 根据保留的小数位数对数进行截断
const funcNumberTrunc = {
    fn: (context: ExprContext, source, scale) => {
        return source.trunc(scale);
    },
    p: ["number"] as FunctionParamsType[],
    r: "number" as FunctionResultType,
};
// 获取人民币大写
const funcNumberToRMB = {
    fn: (context: ExprContext, source, rmb, big) => {
        const conversion = (num, isRMB, isBig) => {
            const cn = (isBig ? "零壹贰叁肆伍陆柒捌玖" : "零一二三四五六七八九").split("");
            const cq = [""].concat((isBig ? "拾佰仟" : "十百千").split(""));
            const cw = [""].concat("万亿兆".split(""));
            const cd = isRMB ? "元" : "点";
            const cl = "角分厘".split("");
            const cz = isRMB ? "整" : "";
            const cf = "负";
            let r = "";
            const s = (num + ".").split(".", 2);
            let x = s[0].split("");
            const y = s[1].split("");
            const isNegative = x[0] === "-";
            if (isNegative) {
                x.shift();
            }
            x = x.reverse();

            // - 处理整数部分
            let c = "";
            let i = 0;
            let t = [];
            let inZero = true;
            while (i < x.length) {
                t.push(x[i++]);
                if (t.length === 4 || i === x.length) {
                    // + 从个位数起以每四位数为一小节
                    for (let j = 0; j < t.length; j++) {
                        const n = Number(t[j]);
                        if (n === 0) {
                            // 1. 避免 "零" 的重覆出现;
                            // 2. 个位数的 0 不必转成 "零"
                            if (!inZero && j !== 0) {
                                c = cn[0] + c;
                            }
                            inZero = true;
                        } else {
                            c = cn[n] + cq[j] + c;
                            inZero = false;
                        }
                    }
                    // + 加上该小节的位数
                    if (c.length === 0) {
                        if (r.length > 0 && r.split("")[0] !== cn[0]) {
                            r = cn[0] + r;
                        }
                    } else {
                        r = c + (cw[Math.floor((i - 1) / 4)] || "") + r;
                    }
                    c = "";
                    t = [];
                }
            }

            // - 处理小数部分
            if (y.length > 0) {
                r += cd;
                for (let k = 0; k < y.length; k++) {
                    const m = Number(y[k]);
                    if (isRMB) {
                        // + 避免小数点后 "零" 的重覆出现
                        if ((m !== 0) || (r.substring(r.length - 1) !== cn[0]) || (k > 2)) {
                            r += cn[m];
                        }
                        if ((m !== 0) || (r.substring(r.length - 1) === cn[0]) && (k === 2)) {
                            r += cl[k] || "";
                        }
                    } else {
                        r += cn[m];
                    }
                }
            } else {
                // + 处理无小数部分时整数部分的结尾
                if (r.length === 0) {
                    r = cn[0];
                }
                if (isRMB) {
                    r += cd + cz;
                }
            }

            // - 其他例外状况的处理, 非人民币则将 "壹拾" 或 "一十" 改为 "拾" 或 "十"
            if (!isRMB && r.substring(0, 2) === cn[1] + cq[1]) {
                r = r.substring(1);
            }

            // - 没有整数部分 且 有小数部分
            if (r.split("")[0] === cd) {
                r = isRMB ? r.substring(1) : cn[0] + r;
            }

            // - 是否为负数
            if (isNegative) {
                r = cf + r;
            }

            return r;
        };
        return context.genValue(conversion(source.toValue(),
            rmb === undefined || rmb, big === undefined || big));
    },
    p: ["boolean?", "boolean?"] as FunctionParamsType[],
    r: "string" as FunctionResultType,
};
// 数值函数列表
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
