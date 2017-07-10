import Decimal from "decimal.js";
import locale from "../base/locale";
import { compare, format, getValueType } from "./common";
import Context from "./context";
import { ValueType } from "./interface";
import { IToken } from "./interface";

// 大数据值计算对象
const Big = (v) => {
    return new Decimal(v);
};

// 值
// ----------

export default class Value {
    public errorMsg: string;
    public tokens: IToken[];
    public rootToken: IToken;
    private context: Context;
    private type: ValueType;
    private value: any;
    private entity;
    private parentObj;
    // 值构造函数
    constructor(context: Context, value: any, type: ValueType, entity, errorMsg: string, parentObj) {
        this.context = context;
        this.type = type ? type : getValueType(value);
        if (this.type === "number") {
            value += "";
        }
        this.value = value;
        this.entity = entity || null;
        this.errorMsg = errorMsg || "";
        this.parentObj = parentObj || null;
    }
    // 生成值对象
    public genValue(value: any, type?: ValueType, entity?, errorMsg?: string, parentObj?): Value {
        return new Value(this.context, value, type, entity, errorMsg, parentObj);
    }
    // 生成错误值对象
    public genErrorValue(errorMsg: string): Value {
        return this.genValue(undefined, undefined, undefined, errorMsg, undefined);
    }
    // 得到值内容
    public toValue(): any {
        return this.type === "number" ? Number(this.value) : this.value;
    }
    // 是否为实体
    public isEntity(): boolean {
        return this.entity != null;
    }
    // 追加数组元素
    public arrayPush(ev: Value): Value {
        if (this.type === "array") {
            ev = ev || this.genValue(null);
            this.toValue().push(ev.toValue());
        }
        return this;
    }
    // 连接数组元素
    public arrayConcat(ev: Value): Value {
        if (this.type === "array" && ev.type === "array") {
            this.value = this.toValue().concat(ev.toValue());
        }
        return this;
    }
    // 设置对象属性
    public objectSetProperty(ev: Value): Value {
        if (this.type === "object") {
            const h = ev.toValue();
            this.value[h.key] = h.value;
        }
        return this;
    }
    // 批量设置对象属性
    public objectSetProperties(ev: Value): Value {
        if (this.type === "object" && ev.type === "array") {
            const h = ev.toValue();
            for (const item of h) {
                this.value[item.key] = item.value;
            }
        }
        return this;
    }
    // 取正/负值
    public negative(op: string): Value {
        let v: Value;
        if (this.type === "null") { /// 对null取负值结果为0
            v = this.genValue("0", "number");
        } else if (this.type === "number") { /// 对数字取负值
            v = op === "-" ? Big(this.value).times(Big(-1)).toString() : this.value;
            v = this.genValue(v, "number");
        } else { /// 该运算数类型无法进行取正/负运算
            const errorMsg = op === "-" ? locale.getLocale().MSG_EX_NEGATIVE : locale.getLocale().MSG_EX_POSITIVE;
            v = this.genErrorValue(format(errorMsg, this.type));
        }
        return v;
    }
    // 非运算
    public not(): Value {
        return (this.type === "boolean") ? /// 布尔类型取相反值
            this.genValue(!this.value, "boolean") :
            (this.type === "string" && this.value === "" || this.type === "number" && this.value === "0"
                || this.type === "null") ? /// ""或者0或者null非运算后结果为true
                this.genValue(true, "boolean") :
                this.genValue(false, "boolean");
    }
    // 乘法
    public multiply(ev: Value): Value {
        let v;
        if (this.type === "null" && ev.type === "null") { /// null*null结果为null
            v = this.genValue(null, "null");
        } else if ((this.type === "number" || this.type === "null") && (ev.type === "number" || ev.type === "null")) {
            const vl = Big(this.value || "0"); /// null与数字做乘法运算时，null被转换成数字0
            const vr = Big(ev.value || "0");
            v = this.genValue(vl.times(vr).toString(), "number");
        } else { /// 两运算数不能进行乘法运算
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_MULTIPLY, this.type, ev.type));
        }
        return v;
    }
    // 除法
    public divide(ev: Value): Value {
        let v: Value;
        if (this.type === "null" && ev.type === "null") { /// null/null结果为null
            v = this.genValue(null, "null");
        } else if (ev.type === "null" || ev.type === "number" && ev.value === "0") { /// 除数为0，报错
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_DIVIDE_N, ev.value));
        } else if ((this.type === "number" || this.type === "null") && (ev.type === "number")) {
            const vl = Big(this.value || "0"); /// 被除数为null时会被转换成"0"
            const vr = Big(ev.value);
            v = this.genValue(vl.div(vr).toString(), "number");
        } else { /// 两运算数不能进行除法运算
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_DIVIDE, this.type, ev.type));
        }
        return v;
    }
    // 求余
    public remainder(ev: Value): Value {
        let v: Value;
        if (this.type === "null" && ev.type === "null") { /// null%null结果为null
            v = this.genValue(null, "null");
        } else if (ev.type === "null" || ev.type === "number" && ev.value === "0") { /// 除数为0，报错
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_REMAINDER_N, ev.value));
        } else if ((this.type === "number" || this.type === "null") && (ev.type === "number")) {
            const vl = Big(this.value || "0"); /// 被除数为null时会被转换成"0"
            const vr = Big(ev.value);
            v = this.genValue(vl.mod(vr).toString(), "number");
        } else { /// 两运算数不能进行求余运算
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_REMAINDER, this.type, ev.type));
        }
        return v;
    }
    // 加法
    public add(ev: Value): Value {
        let v: Value;
        let vl;
        let vr;
        if (this.type === "null" && ev.type === "null") { /// null+null结果为null
            v = this.genValue(null, "null");
        } else if ((this.type === "number" || this.type === "null") && (ev.type === "number" || ev.type === "null")) {
            vl = Big(this.value || "0"); /// null与数字做加法运算时，null被转换成数字0
            vr = Big(ev.value || "0");
            v = this.genValue(vl.plus(vr).toString(), "number");
        } else if ((this.type === "string" || this.type === "null") && (ev.type === "string" || ev.type === "null")) {
            vl = this.toValue(); /// null与字符串做加法运算时，null被转换成""
            vr = ev.toValue();
            vl = vl || "";
            vr = vr || "";
            v = this.genValue(vl + vr, "string");
        } else if ((this.type === "array" || this.type === "null") && (ev.type === "array" || ev.type === "null")) {
            vl = this.value || []; /// null与数组做加法运算时，null被转换成[]
            vr = ev.value || [];
            v = this.genValue(vl.concat(vr), "array");  /// 拼接成新的数组
        } else { /// 两运算数不能进行加法运算
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_ADD, this.type, ev.type));
        }
        return v;
    }
    // 减法
    public subtract(ev: Value): Value {
        let v: Value;
        let vl;
        let vr;
        if (this.type === "null" && ev.type === "null") { /// null-null结果为null
            v = this.genValue(null, "null");
        } else if ((this.type === "number" || this.type === "null") && (ev.type === "number" || ev.type === "null")) {
            vl = Big(this.value || "0"); /// null与数字做减法运算时，null被转换成数字0
            vr = Big(ev.value || "0");
            v = this.genValue(vl.minus(vr).toString(), "number");
        } else if ((this.type === "array" || this.type === "null") && (ev.type === "array" || ev.type === "null")) {
            vl = this.value || []; /// null与数组做减法运算时，null被转换成[]
            vr = ev.value || [];
            const val = [];
            let found;
            for (const left of vl) {
                found = false;
                for (const right of vr) {
                    found = compare(left, right);  /// 比较数组元素是否相等(简单类型/日期/对象/数组)
                    if (found) {
                        break;
                    }
                }
                if (!found) {
                    val.push(left);
                }
            }
            v = this.genValue(val, "array");
        } else { /// 两运算数不能进行减法运算
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_SUBTRACT, this.type, ev.type));
        }
        return v;
    }
    // 等于
    public equal(ev: Value, op: string): Value {
        let v: Value;
        let vl;
        let vr;
        const b = op === "==";
        if (this.type === "null" && ev.type === "null") { /// null==null
            v = this.genValue(b, "boolean");
        } else if (this.type === "null" || ev.type === "null") { /// 除null外任何值都不等于null
            v = this.genValue(!b, "boolean");
        } else if (this.type === "number" && ev.type === "number") { /// 数字比较
            vl = Big(this.value);
            vr = Big(ev.value);
            const val = vl.equals(vr);
            v = this.genValue(b ? val : !val, "boolean");
        } else if (this.type === ev.type) { /// 类型相同两运算数比较，如数组，对象，日期，字符串
            const val = compare(this.value, ev.value);
            v = this.genValue(b ? val : !val, "boolean");
        } else { /// 两运算数不能进行相等或不等运算
            const val = b ? locale.getLocale().MSG_EX_EQUAL : locale.getLocale().MSG_EX_EQUAL_N;
            v = this.genErrorValue(format(val, this.type, ev.type));
        }
        return v;
    }
    // 比较运算
    public compare(ev: Value, op: string): Value {
        if (op === "==" || op === "!=") {
            return this.equal(ev, op);
        } else {
            let v;
            if ((this.type === "string" || this.type === "null") && (ev.type === "string" || ev.type === "null")) {
                switch (op) { /// 字符串
                    case ">": v = this.value > ev.value; break;
                    case "<": v = this.value < ev.value; break;
                    case ">=": v = this.value >= ev.value; break;
                    case "<=": v = this.value <= ev.value; break;
                    default: break;
                }
                v = this.genValue(v, "boolean");
            } else if ((this.type === "date" || this.type === "null") && (ev.type === "date" || ev.type === "null")) {
                v = this.value - ev.value;
                switch (op) { /// 日期
                    case ">": v = v > 0; break;
                    case "<": v = v < 0; break;
                    case ">=": v = v >= 0; break;
                    case "<=": v = v <= 0; break;
                    default: break;
                }
                v = this.genValue(v, "boolean");
            } else if ((this.type === "number" || this.type === "null") &&
                (ev.type === "number" || ev.type === "null")) {
                let vl;
                let vr;
                vl = Big(this.value || "0");
                vr = Big(ev.value || "0");
                switch (op) { /// 数字
                    case ">": v = vl.greaterThan(vr); break;
                    case "<": v = vl.lessThan(vr); break;
                    case ">=": v = vl.greaterThanOrEqualTo(vr); break;
                    case "<=": v = vl.lessThanOrEqualTo(vr); break;
                    default: break;
                }
                v = this.genValue(v, "boolean");
            } else {
                switch (op) { /// 两运算不能进行>,<,>=,<=运算
                    case ">": v = locale.getLocale().MSG_EX_COMPARE_A; break;
                    case "<": v = locale.getLocale().MSG_EX_COMPARE_B; break;
                    case ">=": v = locale.getLocale().MSG_EX_COMPARE_C; break;
                    case "<=": v = locale.getLocale().MSG_EX_COMPARE_D; break;
                    default: break;
                }
                v = this.genErrorValue(format(v, this.type, ev.type));
            }
            return v;
        }
    }
    // 与运算
    public and(ev: Value): Value {
        let v;
        if (!ev) { /// 左运算视为false时，右运算数计算被跳过所以ev==undefined
            v = (this.type === "boolean" || this.type === "null") ?
                this.genValue(false, "boolean") :
                this.genErrorValue(format(locale.getLocale().MSG_EX_AND_L, this.type));
        } else {
            v = (this.type === "boolean" && (ev.type === "boolean" || ev.type === "null")) ?
                this.genValue(!!(this.value && ev.value), "boolean") :
                this.genErrorValue(format(locale.getLocale().MSG_EX_AND, this.type, ev.type));
        }
        return v;
    }
    // 或运算
    public or(ev: Value) {
        let v;
        if (!ev) { /// 左运算视为true时，右运算数计算被跳过所以ev==undefined
            v = (this.type === "boolean") ?
                this.genValue(true, "boolean") :
                this.genErrorValue(format(locale.getLocale().MSG_EX_OR_L, this.type));
        } else {
            v = ((this.type === "boolean" || this.type === "null") && (ev.type === "boolean" || ev.type === "null")) ?
                this.genValue(!!(this.value || ev.value), "boolean") :
                this.genErrorValue(format(locale.getLocale().MSG_EX_OR, this.type, ev.type)); /// 两运算数不能进行或运算
        }
        return v;
    }
    // 下标运算
    public subscript(ev: Value): Value {
        let v;
        let i;
        let t;
        if (ev.type === "array") { /// a[n]
            i = ev.toValue()[0];
            t = getValueType(i);
        } else { /// a.x
            i = ev.toValue();
            t = ev.type;
        }
        if (this.type === "string" || this.type === "array") {
            if (t === "number") {
                v = this.toValue();
                if (v.length > i && i >= 0 && v.length > 0) {
                    if (this.type === "array" && this.entity) {
                        v = this.context.getEntityValue(this, i);
                    } else { /// "rwqer"[2],[1,2,3][2]
                        v = v[i];
                        v = this.genValue(v, getValueType(v), null);
                    }
                } else { /// 下标越界:[1,2,3][-1]
                    v = this.genErrorValue(format(locale.getLocale().MSG_EX_SUBSCRIPT_U, this.type, i));
                }
            } else { /// 索引必须为数字:"fasdf"["0"]
                v = this.genErrorValue(format(locale.getLocale().MSG_EX_SUBSCRIPT_T, i));
            }
        } else if (this.type === "object") { /// {x:1,y:2}["x"] , Root()["E1"]
            v = this.genValue(i);
            v = v.getVariableValue(this);
        } else { /// 无法做下标操作:(1+2)[0]
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_SUBSCRIPT, this.type));
        }
        return v;
    }
    // 获取{key:...,value:...}键值对对象
    public hashItem(ev: Value): Value {
        return this.genValue({ key: this.toValue(), value: ev.toValue() }, "object");
    }
    // 获取变量值
    public getVariableValue(ev: Value): Value {
        return (ev && ev.type !== "object") ?
            this.genErrorValue(format(locale.getLocale().MSG_EX_DOT, ev.type)) :
            this.context.getVariableValue(this.toValue(), ev);
    }
    // 获取函数返回结果值
    public getFunctionValue(ev: Value): Value {
        const v = this.toValue();
        return (ev && ev.value === null) ?
            this.genErrorValue(format(locale.getLocale().MSG_EX_FUNC_NULL, v.key)) :
            this.context.getFunctionValue(v.key, ev, v.value);
    }
    // 绝对值
    public abs(): Value {
        const v = Big(this.value || "0");
        return this.genValue(v.abs().toString(), "number");
    }
    // 向上取整
    public ceil(): Value {
        const v = Big(this.value || "0");
        return this.genValue(v.ceil().toString(), "number");
    }
    // 向下取整
    public floor(): Value {
        const v = Big(this.value || "0");
        return this.genValue(v.floor().toString(), "number");
    }
    // 四舍五入保留scale位小数
    public round(scale: number): Value {
        let v;
        if (scale >= 0) {
            v = Big(this.value || "0");
            v = v.toDecimalPlaces(scale, 4);
            v = this.genValue(v.toString(), "number");
        } else {
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_ROUND, scale.toString()));
        }
        return v;
    }
    // 按精度截断数据
    public trunc(scale: number): Value {
        let v;
        if (scale >= 0) {
            v = Big(this.value || "0");
            v = v.toDecimalPlaces(scale, 1);
            v = this.genValue(v.toString(), "number");
        } else {
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_TRUNC, scale.toString()));
        }
        return v;
    }
    // 获取数的余弦
    public cos(): Value {
        let v = Big(this.value || "0");
        const name = "cos";
        v = v[name]();
        return this.genValue(v.toString(), "number");
    }
    // 获取 e 的指数
    public exp(): Value {
        let v = Big(this.value || "0");
        v = v.exp();
        return this.genValue(v.toString(), "number");
    }
    // 获取数的自然对数（底为 e）
    public ln(): Value {
        let value;
        let v = Big(this.value || "0");
        if (v.greaterThan("0")) {
            v = v.ln();
            value = this.genValue(v.toString(), "number");
        } else {
            value = this.genErrorValue(format(locale.getLocale().MSG_EX_LN, v.toString()));
        }
        return value;
    }
    // 获取数的指定底数的对数
    public log(base: number): Value {
        let value;
        let v = Big(this.value || "0");
        if (v.greaterThan("0") && base > 0 && base !== 1) {
            v = v.log(base);
            value = this.genValue(v.toString(), "number");
        } else {
            value = this.genErrorValue(format(locale.getLocale().MSG_EX_LOG, base.toString(), v.toString()));
        }
        return value;
    }
    // 获取数的指定指数的次幂
    public power(exponent: number): Value {
        let v = Big(this.value || "0");
        v = v.pow(exponent);
        return this.genValue(v.toString(), "number");
    }
    // 获取数的正弦
    public sin(): Value {
        let v = Big(this.value || "0");
        const name = "sin";
        v = v[name]();
        return this.genValue(v.toString(), "number");
    }
    // 获取数的平方根
    public sqrt(): Value {
        let v = Big(this.value || "0");
        v = v.sqrt();
        return this.genValue(v.toString(), "number");
    }
    // 获取树的正切值
    public tan(): Value {
        let v = Big(this.value || "0");
        const name = "tan";
        v = v[name]();
        return this.genValue(v.toString(), "number");
    }
}
