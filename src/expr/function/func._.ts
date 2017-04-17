import { isArray, isObject, isString } from "../base/common";

// _
const funcIIf = {
    fn: (context, source, bool, tv, fv) => {
        /// <summary>条件判断函数，如果第一个参数为true，则获取第二个参数，否则获取第三个参数</summary>
        /// <param name="bool" type="Boolean">条件值</param>
        /// <param name="tv" type="Object">真值</param>
        /// <param name="fv" type="Object">假值</param>
        /// <returns type="Object">第二个参数或第三个参数</returns>
        return context.genValue(bool ? tv : fv);
    },
    p: ["boolean", "undefined", "undefined"],
    r: "undefined",
};
const funcIfNull = {
    fn: (context, source, v, d) => {
        /// <summary>空值判断函数，如果第一个参数为null，则获取第二个参数，否则获取第一个参数</summary>
        /// <param name="v" type="Object">值</param>
        /// <param name="d" type="Object">默认值</param>
        /// <returns type="Object">第一个参数或第二个参数</returns>
        return context.genValue((v !== null) ? v : d);
    },
    p: ["undefined", "undefined"],
    r: "undefined",
};
const funcParent = {
    e: "parent",
    fn: (context) => {
        /// <summary>获取当前实体的父实体对象，如果当前为根则获取自己</summary>
        /// <returns type="Object">父实体对象</returns>
        return context.getParentValue(null);
    },
    p: [],
    r: "object",
};
const funcRecNo = {
    e: "value",
    fn: (context) => {
        /// <summary>获取当前实体的索引号，没有记录返回-1</summary>
        /// <returns type="Object">索引号</returns>
        return context.getRecNo(null);
    },
    p: [],
    r: "number",
};
const funcRoot = {
    e: "root",
    fn: (context) => {
        /// <summary>获取实体根对象</summary>
        /// <returns type="Object">实体根对象</returns>
        return context.getRootValue();
    },
    p: [],
    r: "object",
};
const funcNow = {
    fn: (context) => {
        /// <summary>获取本地当前日期时间</summary>
        /// <returns type="Object">本地当前日期时间</returns>
        return context.genValue(new Date());
    },
    p: [],
    r: "date",
};
const funcFieldName = {
    fn: (context) => {
        /// <summary>获取当前字段唯一标识</summary>
        /// <returns type="Object">字段唯一标识</returns>
        return context.getContextVariableValue("FieldName");
    },
    p: [],
    r: "string",
};
const funcFieldDisplayName = {
    fn: (context) => {
        /// <summary>获取当前字段别名</summary>
        /// <returns type="Object">字段别名（显示名称）</returns>
        return context.getContextVariableValue("FieldDisplayName");
    },
    p: [],
    r: "string",
};
const funcFieldValue = {
    fn: (context) => {
        /// <summary>获取当前字段值</summary>
        /// <returns type="Object">字段值</returns>
        return context.getContextVariableValue("FieldValue");
    },
    p: [],
    r: "undefined",
};
const funcPropValue = {
    fn: (context, source, obj, prop, delimiter) => {
        /// <summary>获取对象属性值</summary>
        /// <param name="obj" type="Object">对象或数组(没有分隔符则获取数组第一个元素，有分隔符获取数组所有元素集合)</param>
        /// <param name="prop" type="String">属性名</param>
        /// <param name="delimiter" type="String">分隔符</param>
        /// <returns type="Object">属性值</returns>
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
                if (o.length > 0) {
                    o = o[0];
                } else {
                    o = {};
                }
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
const funcRandom = {
    fn: (context) => {
        /// <summary>返回介于 0 ~ 1 之间的一个随机数</summary>
        /// <returns type="Object">数字</returns>
        return context.genValue(Math.random());
    },
    p: [],
    r: "number",
};
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
