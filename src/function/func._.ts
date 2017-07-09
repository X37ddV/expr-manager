import { isArray, isObject, isString } from "../lib/base/common";
import ExprContext from "../lib/context";

// 表达式函数
// ----------

// 条件判断函数，如果第一个参数为true，则获取第二个参数，否则获取第三个参数
const funcIIf = {
    fn: (context: ExprContext, source, bool, tv, fv) => {
        return context.genValue(bool ? tv : fv);
    },
    p: ["boolean", "undefined", "undefined"],
    r: "undefined",
};
// 空值判断函数，如果第一个参数为null，则获取第二个参数，否则获取第一个参数
const funcIfNull = {
    fn: (context: ExprContext, source, v, d) => {
        return context.genValue((v !== null) ? v : d);
    },
    p: ["undefined", "undefined"],
    r: "undefined",
};
// 获取当前实体的父实体对象，如果当前为根则获取自己
const funcParent = {
    e: "parent",
    fn: (context) => {
        return context.getParentValue(null);
    },
    p: [],
    r: "object",
};
// 获取当前实体的索引号，没有记录返回-1
const funcRecNo = {
    e: "value",
    fn: (context) => {
        return context.getRecNo(null);
    },
    p: [],
    r: "number",
};
// 获取实体根对象
const funcRoot = {
    e: "root",
    fn: (context) => {
        return context.getRootValue();
    },
    p: [],
    r: "object",
};
// 获取本地当前日期时间
const funcNow = {
    fn: (context) => {
        return context.genValue(new Date());
    },
    p: [],
    r: "date",
};
// 获取当前字段唯一标识
const funcFieldName = {
    fn: (context) => {
        return context.getContextVariableValue("FieldName");
    },
    p: [],
    r: "string",
};
// 获取当前字段别名
const funcFieldDisplayName = {
    fn: (context) => {
        return context.getContextVariableValue("FieldDisplayName");
    },
    p: [],
    r: "string",
};
// 获取当前字段值
const funcFieldValue = {
    fn: (context) => {
        return context.getContextVariableValue("FieldValue");
    },
    p: [],
    r: "undefined",
};
// 获取对象属性值
const funcPropValue = {
    fn: (context: ExprContext, source, obj, prop, delimiter) => {
        let r;
        let o = obj;
        if (isString(delimiter) && isArray(o)) {
            r = "";
            for (let i = 0; i < o.length; i++) {
                r += isObject(o[i]) ? o[i][prop] : "";
                if (i < o.length - 1) {
                    r += delimiter;
                }
            }
        } else {
            if (isArray(o)) {
                o = o.length > 0 ? o[0] : {};
            }
            r = isObject(o) ? o[prop] : null;
        }
        if (r === undefined) {
            r = null;
        }
        return context.genValue(r);
    },
    p: ["undefined", "string", "string?"],
    r: "undefined",
};
// 返回介于 0 ~ 1 之间的一个随机数
const funcRandom = {
    fn: (context) => {
        return context.genValue(Math.random());
    },
    p: [],
    r: "number",
};
// 表达式函数列表
export default {
    FieldDisplayName: funcFieldDisplayName,
    FieldName: funcFieldName,
    FieldValue: funcFieldValue,
    IIf: funcIIf,
    IfNull: funcIfNull,
    Now: funcNow,
    Parent: funcParent,
    PropValue: funcPropValue,
    Random: funcRandom,
    RecNo: funcRecNo,
    Root: funcRoot,
};
