import locale from "../base/locale";
import { format } from "./common";
import Context from "./context";
import { ValueType } from "./interface";
import { IToken } from "./interface";

// 类型
// ----------

export default class Type {
    public errorMsg: string;
    public tokens: IToken[];
    public rootToken: IToken;
    public dependencies: string[];
    public type: ValueType;
    public entity;
    public depends;
    private context: Context;
    private info;
    private data;
    // 类型构造函数
    constructor(context: Context, type: ValueType, info, data, entity, depends, errorMsg: string) {
        this.context = context;
        this.type = type || "undefined";
        this.info = info || type;
        this.data = data;
        this.entity = entity || null;
        this.depends = depends || null;
        this.errorMsg = (errorMsg || "").trim();
    }
    // 生成类型对象
    public genType(type: ValueType, info?, data?, entity?, depends?, errorMsg?: string): Type {
        return new Type(this.context, type, info, data, entity, depends, errorMsg);
    }
    // 生成错误类型对象
    public genErrorType(errorMsg: string): Type {
        return this.genType(undefined, undefined, undefined, undefined, undefined, errorMsg);
    }
    // 该类型对象是否包含了数据
    public hasData(): boolean {
        return this.data !== undefined;
    }
    // 得到类型值
    public toValue(): ValueType {
        return this.type;
    }
    // 追加数组元素
    public arrayPush(et: Type): Type {
        if (this.type === "array") {
            this.info.push(et.info); /// info存储数组元素的类型
            this.data.push(et.data); /// data存储数组元素的值
        }
        return this;
    }
    // 连接数组元素
    public arrayConcat(et: Type): Type {
        if (this.type === "array" && et.type === "array") {
            this.info = this.info.concat(et.info); /// info存储数组元素的类型
            this.data = this.data.concat(et.data); /// data存储数组元素的值
        }
        return this;
    }
    // 设置对象属性
    public objectSetProperty(et: Type): Type {
        if (this.type === "object") {
            const h = et.info;
            this.info[h.key] = h.value;
            const d = et.data;
            this.data[d.key] = d.value;
        }
        return this;
    }
    // 批量设置对象属性
    public objectSetProperties(et: Type): Type {
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
    // 取正/负值
    public negative(op: string): Type {
        let t;
        if (this.type === "null" || this.type === "undefined" || this.type === "number") {
            t = this.genType("number");
        } else { /// 该运算数类型无法进行取正/负运算
            t = op === "-" ? locale.getLocale().MSG_EX_NEGATIVE : locale.getLocale().MSG_EX_POSITIVE;
            t = this.genErrorType(format(t, this.type));
        }
        return t;
    }
    // 非运算
    public not(): Type {
        return this.genType("boolean");
    }
    // 乘法
    public multiply(et: Type): Type {
        return (this.type === "null" && et.type === "null") ? this.genType("null") :
            ((this.type === "number" || this.type === "null" || this.type === "undefined") &&
                (et.type === "number" || et.type === "null" || et.type === "undefined")) ? this.genType("number") :
                this.genErrorType(format(locale.getLocale().MSG_EX_MULTIPLY, this.type, et.type));
    }
    // 除法
    public divide(et: Type): Type {
        let t;
        if (this.type === "null" && et.type === "null") {
            t = this.genType("null");
        } else if ((this.type === "number" || this.type === "null" || this.type === "undefined") &&
            (et.type === "number" || et.type === "undefined")) {
            t = (et.hasData() && (et.data === "null" || et.type === "number" && Number(et.data) === 0)) ?
                this.genErrorType(format(locale.getLocale().MSG_EX_DIVIDE_N, et.data)) :
                this.genType("number");
        } else {
            t = this.genErrorType(format(locale.getLocale().MSG_EX_DIVIDE, this.type, et.type));
        }
        return t;
    }
    // 求余
    public remainder(et: Type): Type {
        let t;
        if (this.type === "null" && et.type === "null") {
            t = this.genType("null");
        } else if ((this.type === "number" || this.type === "null" || this.type === "undefined") &&
            (et.type === "number" || et.type === "undefined")) {
            t = (et.hasData() && (et.data === "null" || et.type === "number" && Number(et.data) === 0)) ?
                this.genErrorType(format(locale.getLocale().MSG_EX_REMAINDER_N, et.data)) :
                this.genType("number");
        } else {
            t = this.genErrorType(format(locale.getLocale().MSG_EX_REMAINDER, this.type, et.type));
        }
        return t;
    }
    // 加法
    public add(et: Type): Type {
        return (this.type === "undefined" && et.type === "undefined") ?
            this.genType("undefined") :
            (this.type === "null" && et.type === "null") ?
                this.genType("null") :
                ((this.type === "number" || this.type === "null" || this.type === "undefined") &&
                    (et.type === "number" || et.type === "null" || et.type === "undefined")) ?
                    this.genType("number") :
                    ((this.type === "string" || this.type === "null" || this.type === "undefined") &&
                        (et.type === "string" || et.type === "null" || et.type === "undefined")) ?
                        this.genType("string") :
                        ((this.type === "array" || this.type === "null" || this.type === "undefined") &&
                            (et.type === "array" || et.type === "null" || et.type === "undefined")) ?
                            this.genType("array") :
                            this.genErrorType(format(locale.getLocale().MSG_EX_ADD, this.type, et.type));
    }
    // 减法
    public subtract(et: Type): Type {
        return (this.type === "undefined" && et.type === "undefined") ?
            this.genType("undefined") :
            (this.type === "null" && et.type === "null") ?
                this.genType("null") :
                ((this.type === "number" || this.type === "null" || this.type === "undefined") &&
                    (et.type === "number" || et.type === "null" || et.type === "undefined")) ?
                    this.genType("number") :
                    ((this.type === "array" || this.type === "null" || this.type === "undefined") &&
                        (et.type === "array" || et.type === "null" || et.type === "undefined")) ?
                        this.genType("array") :
                        this.genErrorType(format(locale.getLocale().MSG_EX_SUBTRACT, this.type, et.type));
    }
    // 等于
    public equal(et: Type, op: string): Type {
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
    // 比较运算
    public compare(et: Type, op: string): Type {
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
                }
                t = this.genErrorType(format(t, this.type, et.type));
            }
            return t;
        }
    }
    // 与运算
    public and(et: Type): Type {
        return (this.type === "undefined" || et.type === "undefined" || this.type === "null" || et.type === "null" ||
            (this.type === "boolean" && et.type === "boolean")) ?
            this.genType("boolean") :
            this.genErrorType(format(locale.getLocale().MSG_EX_AND, this.type, et.type));
    }
    // 或运算
    public or(et: Type): Type {
        return (this.type === "undefined" || et.type === "undefined" || this.type === "null" || et.type === "null" ||
            (this.type === "boolean" && et.type === "boolean")) ?
            this.genType("boolean") :
            this.genErrorType(format(locale.getLocale().MSG_EX_OR, this.type, et.type));
    }
    // 下标运算
    public subscript(et: Type): Type {
        let t;
        const i = (et.type === "array") ?
            et.info[0] :
            et.info;
        if (this.type === "string" || this.type === "array") {
            if (i === "number") {
                t = (this.type === "array" && this.entity) ?
                    this.context.getEntityType(this) :
                    (this.type === "string") ?
                        this.genType("string") :
                        this.genType("undefined");
            } else {
                t = this.genErrorType(format(locale.getLocale().MSG_EX_SUBSCRIPT_T, i));
            }
        } else if (this.type === "object") {
            t = this.genType("string", "string", i);
            t = t.getVariableType(this);
        } else {
            t = (this.type === "undefined") ?
                this.genType("undefined") :
                this.genErrorType(format(locale.getLocale().MSG_EX_SUBSCRIPT, this.type));
        }
        return t;
    }
    // 获取{key:...,value:...}键值对对象
    public hashItem(et: Type): Type {
        return this.genType("object", { key: this.data, value: et.info }, { key: this.data, value: et.data });
    }
    // 获取变量值类型对象
    public getVariableType(et: Type): Type {
        return (et && et.type !== "object" && et.type !== "undefined") ?
            this.genErrorType(format(locale.getLocale().MSG_EX_DOT, et.type)) :
            this.context.getVariableType(this.data, et);
    }
    // 获取函数返回结果类型对象
    public getFunctionType(et: Type): Type {
        return this.context.getFunctionType(this.info.key, et, this.info.value, this.data.value);
    }
}
