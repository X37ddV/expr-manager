import locale from "../base/locale";
import { format } from "./common";
import { IContext } from "./interface";

export default class Type {
    private context: IContext;
    private type;
    private info;
    private data;
    private entity;
    private depends;
    private errorMsg;
    constructor(context: IContext, type, info, data, entity, depends, errorMsg) {
        this.context = context;
        this.type = type || "undefined";
        this.info = info || type;
        this.data = data;
        this.entity = entity || null;
        this.depends = depends || null;
        this.errorMsg = errorMsg || "";
    }
    public genType(type, info?, data?, entity?, depends?, errorMsg?) {
        /// <summary>生成ExprType对象</summary>
        return new Type(this.context, type, info, data, entity, depends, errorMsg);
    }
    public genErrorType(errorMsg) {
        /// <summary>有错误时，生成对应的ExprType对象</summary>
        return this.genType(undefined, undefined, undefined, undefined, undefined, errorMsg);
    }
    public hasData() {
        /// <summary>该ExprType对象是否包含了数据</summary>
        return this.data !== undefined;
    }
    public toValue() {
        /// <summary>得到ExprType对象的type值</summary>
        return this.type;
    }
    public arrayPush(et) {
        /// <summary>将et放入this数组末尾(ev为数组时将被视为一个元素)</summary>
        if (this.type === "array") {
            this.info.push(et.info); // info存储数组元素的类型
            this.data.push(et.data); // data存储数组元素的值
        }
        return this;
    }
    public arrayConcat(et) {
        /// <summary>将et数组中的元素挨个放入this数组末尾</summary>
        if (this.type === "array" && et.type === "array") {
            this.info = this.info.concat(et.info); // info存储数组元素的类型
            this.data = this.data.concat(et.data); // data存储数组元素的值
        }
        return this;
    }
    public objectSetProperty(et) {
        if (this.type === "object") {
            const h = et.info;
            this.info[h.key] = h.value;
            const d = et.data;
            this.data[d.key] = d.value;
        }
        return this;
    }
    public objectSetProperties(et) {
        if (this.type === "object" && et.type === "array") {
            for (const item of et.info) {
                this.info[item.key] = item.value;
            }
            for (const item of et.data) {
                this.data[item.key] = item.value;
            }
        }
        return this;
    }
    public negative(op) {
        /// <summary>取正/负值</summary>
        let t;
        if (this.type === "null" || this.type === "undefined" || this.type === "number") {
            t = this.genType("number");
        } else { // 该运算数类型无法进行取正/负运算
            t = op === "-" ? locale.getLocale().MSG_EX_NEGATIVE : locale.getLocale().MSG_EX_POSITIVE;
            t = this.genErrorType(format(t, this.type));
        }
        return t;
    }
    public not() {
        return this.genType("boolean");
    }
    public multiply(et) {
        let t;
        if (this.type === "null" && et.type === "null") {
            t = this.genType("null");
        } else if ((this.type === "number" || this.type === "null" || this.type === "undefined") &&
            (et.type === "number" || et.type === "null" || et.type === "undefined")) {
            t = this.genType("number");
        } else {
            t = this.genErrorType(format(locale.getLocale().MSG_EX_MULTIPLY, this.type, et.type));
        }
        return t;
    }
    public divide(et) {
        let t;
        if (this.type === "null" && et.type === "null") {
            t = this.genType("null");
        } else if ((this.type === "number" || this.type === "null" || this.type === "undefined") &&
            (et.type === "number" || et.type === "undefined")) {
            if (et.hasData() && (et.data === "null" || et.type === "number" && Number(et.data) === 0)) {
                t = this.genErrorType(format(locale.getLocale().MSG_EX_DIVIDE_N, et.info));
            } else {
                t = this.genType("number");
            }
        } else {
            t = this.genErrorType(format(locale.getLocale().MSG_EX_DIVIDE, this.type, et.type));
        }
        return t;
    }
    public remainder(et) {
        let t;
        if (this.type === "null" && et.type === "null") {
            t = this.genType("null");
        } else if ((this.type === "number" || this.type === "null" || this.type === "undefined") &&
            (et.type === "number" || et.type === "undefined")) {
            if (et.hasData() && (et.data === "null" || et.type === "number" && Number(et.data) === 0)) {
                t = this.genErrorType(format(locale.getLocale().MSG_EX_REMAINDER_N, et.info));
            } else {
                t = this.genType("number");
            }
        } else {
            t = this.genErrorType(format(locale.getLocale().MSG_EX_REMAINDER, this.type, et.type));
        }
        return t;
    }
    public add(et) {
        let t;
        if (this.type === "undefined" && et.type === "undefined") {
            t = this.genType("undefined");
        } else if (this.type === "null" && et.type === "null") {
            t = this.genType("null");
        } else if ((this.type === "number" || this.type === "null" || this.type === "undefined") &&
            (et.type === "number" || et.type === "null" || et.type === "undefined")) {
            t = this.genType("number");
        } else if ((this.type === "string" || this.type === "number" || this.type === "null" ||
            this.type === "undefined") &&
            (et.type === "string" || et.type === "number" || et.type === "null" || et.type === "undefined")) {
            t = this.genType("string");
        } else if ((this.type === "array" || this.type === "null" || this.type === "undefined") &&
            (et.type === "array" || et.type === "null" || et.type === "undefined")) {
            t = this.genType("array");
        } else {
            t = this.genErrorType(format(locale.getLocale().MSG_EX_ADD, this.type, et.type));
        }
        return t;
    }
    public subtract(et) {
        let t;
        if (this.type === "undefined" && et.type === "undefined") {
            t = this.genType("undefined");
        } else if (this.type === "null" && et.type === "null") {
            t = this.genType("null");
        } else if ((this.type === "number" || this.type === "null" || this.type === "undefined") &&
            (et.type === "number" || et.type === "null" || et.type === "undefined")) {
            t = this.genType("number");
        } else if ((this.type === "array" || this.type === "null" || this.type === "undefined") &&
            (et.type === "array" || et.type === "null" || et.type === "undefined")) {
            t = this.genType("array");
        } else {
            t = this.genErrorType(format(locale.getLocale().MSG_EX_SUBTRACT, this.type, et.type));
        }
        return t;
    }
    public equal(et, op) {
        let t;
        const b = op === "==";
        if (this.type === "undefined" || et.type === "undefined" || this.type === "null" || et.type === "null" ||
            this.type === et.type) {
            t = this.genType("boolean");
        } else {
            t = b ? locale.getLocale().MSG_EX_EQUAL : locale.getLocale().MSG_EX_EQUAL_N;
            t = this.genErrorType(format(t, this.type, et.type));
        }
        return t;
    }
    public compare(et, op) {
        if (op === "==" || op === "!=") {
            return this.equal(et, op);
        } else {
            let t;
            if (this.type === "undefined" || et.type === "undefined" || this.type === "null" || et.type === "null" ||
                (this.type === et.type && (et.type === "string" || et.type === "date" || et.type === "number"))) {
                t = this.genType("boolean");
            } else {
                switch (op) {
                    case ">": t = locale.getLocale().MSG_EX_COMPARE_A; break;
                    case "<": t = locale.getLocale().MSG_EX_COMPARE_B; break;
                    case ">=": t = locale.getLocale().MSG_EX_COMPARE_C; break;
                    case "<=": t = locale.getLocale().MSG_EX_COMPARE_D; break;
                    default: break;
                }
                t = this.genErrorType(format(t, this.type, et.type));
            }
            return t;
        }
    }
    public and(et) {
        let t;
        if (this.type === "undefined" || et.type === "undefined" || this.type === "null" || et.type === "null" ||
            (this.type === "boolean" && et.type === "boolean")) {
            t = this.genType("boolean");
        } else {
            t = this.genErrorType(format(locale.getLocale().MSG_EX_AND, this.type, et.type));
        }
        return t;
    }
    public or(et) {
        let t;
        if (this.type === "undefined" || et.type === "undefined" || this.type === "null" || et.type === "null" ||
            (this.type === "boolean" && et.type === "boolean")) {
            t = this.genType("boolean");
        } else {
            t = this.genErrorType(format(locale.getLocale().MSG_EX_OR, this.type, et.type));
        }
        return t;
    }
    public subscript(et) {
        let t;
        let i;
        if (et.type === "array") {
            i = et.info[0];
        } else {
            i = et.info;
        }
        if (this.type === "string" || this.type === "array") {
            if (i === "number") {
                if (this.type === "array" && this.entity) {
                    t = this.context.getEntityType(this);
                } else if (this.type === "string") {
                    t = this.genType("string");
                } else {
                    t = this.genType("undefined");
                }
            } else {
                t = this.genErrorType(format(locale.getLocale().MSG_EX_SUBSCRIPT_T, i));
            }
        } else if (this.type === "object") {
            t = this.genType("string", "string", i);
            t = t.getVariableType(this);
        } else if (this.type === "undefined") {
            t = this.genType("undefined");
        } else {
            t = this.genErrorType(format(locale.getLocale().MSG_EX_SUBSCRIPT, this.type));
        }
        return t;
    }
    public hashItem(et) {
        /// <summary>得到{key:...,value:...}键值对对象</summary>
        return this.genType("object", { key: this.data, value: et.info }, { key: this.data, value: et.data });
    }
    public getVariableType(et) {
        return this.context.getVariableType(this.data, et);
    }
    public getFunctionType(et) {
        /// <summary>得到函数执行结果的ExprType对象</summary>
        /// <param name="ev">函数调用者</param>
        return this.context.getFunctionType(this.info.key, et, this.info.value, this.data.value);
    }
}
