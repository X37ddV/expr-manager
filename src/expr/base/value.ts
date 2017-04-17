import locale from "../base/locale";
import { compare, format, getValueType } from "./common";
import { IContext } from "./interface";
import Decimal from "decimal";

let Big = (v) => {
    return new Decimal(v);
};

export default class Value {
    private context: IContext;
    private type;
    private value;
    private entity;
    private errorMsg;
    private parentObj;
    constructor(context: IContext, value, type, entity, errorMsg, parentObj) {
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
    public genValue(value, type?, entity?, errorMsg?, parentObj?) {
        /// <summary>生成ExprValue对象</summary>
        return new Value(this.context, value, type, entity, errorMsg, parentObj);
    }
    public genErrorValue(errorMsg) {
        /// <summary>有错误时，生成对应的ExprValue对象</summary>
        return this.genValue(undefined, undefined, undefined, errorMsg, undefined);
    }
    public toValue() {
        /// <summary>根据ExprValue对象的type属性得到其value值</summary>
        return this.type === "number" ? Number(this.value) : this.value;
    }
    public isEntity() {
        /// <summary>该ExprValue对象是否为实体数据</summary>
        return this.entity != null;
    }
    public arrayPush(ev) {
        /// <summary>将ev放入this数组末尾(ev为数组时将被视为一个元素)</summary>
        if (this.type === "array") {
            ev = ev || this.genValue(null);
            this.toValue().push(ev.toValue());
        }
        return this;
    }
    public arrayConcat(ev) {
        /// <summary>将ev数组中的元素挨个放入this数组末尾</summary>
        if (this.type === "array" && ev.type === "array") {
            this.value = this.toValue().concat(ev.toValue());
        }
        return this;
    }
    public objectSetProperty(ev) {
        /// <summary>设置对象属性值</summary>
        if (this.type === "object") {
            let h = ev.toValue();
            this.value[h.key] = h.value;
        }
        return this;
    }
    public objectSetProperties(ev) {
        /// <summary>设置对象多个属性值</summary>
        if (this.type === "object" && ev.type === "array") {
            let h = ev.toValue();
            for (let i = 0; i < h.length; i++) {
                this.value[h[i].key] = h[i].value;
            }
        }
        return this;
    }
    public negative(op) {
        /// <summary>取正/负值</summary>
        let v;
        if (this.type === "null") { // 对null取负值结果为0
            v = this.genValue("0", "number");
        } else if (this.type === "number") { // 对数字取负值
            v = op === "-" ? Big(this.value).times(Big(-1)).toString() : this.value;
            v = this.genValue(v, "number");
        } else { // 该运算数类型无法进行取正/负运算
            v = op === "-" ? locale.getLocale().MSG_EX_NEGATIVE : locale.getLocale().MSG_EX_POSITIVE;
            v = this.genErrorValue(format(v, this.type));
        }
        return v;
    }
    public not() {
        /// <summary>非运算</summary>
        let v;
        if (this.type === "boolean") { // 布尔类型取相反值
            v = this.genValue(!this.value, "boolean");
        } else if (this.type === "string" && this.value === "" || this.type === "number" && this.value === "0"
                    || this.type === "null") { // ""或者0或者null非运算后结果为true
            v = this.genValue(true, "boolean");
        } else { // 其余情况非运算后结果均为false
            v = this.genValue(false, "boolean");
        }
        return v;
    }
    public multiply(ev) {
        /// <summary>乘法</summary>
        let v;
        if (this.type === "null" && ev.type === "null") { // null*null结果为null
            v = this.genValue(null, "null");
        } else if ((this.type === "number" || this.type === "null") && (ev.type === "number" || ev.type === "null")) {
            let vl = Big(this.value || "0"); // null与数字做乘法运算时，null被转换成数字0
            let vr = Big(ev.value || "0");
            v = this.genValue(vl.times(vr).toString(), "number");
        } else { // 两运算数不能进行乘法运算
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_MULTIPLY, this.type, ev.type));
        }
        return v;
    }
    public divide(ev) {
        /// <summary>除法</summary>
        let v;
        if (this.type === "null" && ev.type === "null") { // null/null结果为null
            v = this.genValue(null, "null");
        } else if (ev.type === "null" || ev.type === "number" && ev.value === "0") { // 除数为0，报错
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_DIVIDE_N, ev.value));
        } else if ((this.type === "number" || this.type === "null") && (ev.type === "number")) {
            let vl = Big(this.value || "0"); // 被除数为null时会被转换成"0"
            let vr = Big(ev.value);
            v = this.genValue(vl.div(vr, 10, 1).toString(), "number");
        } else { // 两运算数不能进行除法运算
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_DIVIDE, this.type, ev.type));
        }
        return v;
    }
    public remainder(ev) {
        /// <summary>求余</summary>
        let v;
        if (this.type === "null" && ev.type === "null") { // null%null结果为null
            v = this.genValue(null, "null");
        } else if (ev.type === "null" || ev.type === "number" && ev.value === "0") { // 除数为0，报错
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_REMAINDER_N, ev.value));
        } else if ((this.type === "number" || this.type === "null") && (ev.type === "number")) {
            let vl = Big(this.value || "0"); // 被除数为null时会被转换成"0"
            let vr = Big(ev.value);
            v = this.genValue(vl.mod(vr).toString(), "number");
        } else { // 两运算数不能进行求余运算
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_REMAINDER, this.type, ev.type));
        }
        return v;
    }
    public add(ev) {
        /// <summary>加法</summary>
        let v;
        let vl;
        let vr;
        if (this.type === "null" && ev.type === "null") { // null+null结果为null
            v = this.genValue(null, "null");
        } else if ((this.type === "number" || this.type === "null") && (ev.type === "number" || ev.type === "null")) {
            vl = Big(this.value || "0"); // null与数字做加法运算时，null被转换成数字0
            vr = Big(ev.value || "0");
            v = this.genValue(vl.plus(vr).toString(), "number");
        } else if ((this.type === "string" || this.type === "null") && (ev.type === "string" || ev.type === "null")) {
            vl = this.toValue(); // null与字符串做加法运算时，null被转换成""
            vr = ev.toValue();
            vl = vl || "";
            vr = vr || "";
            v = this.genValue(vl + vr, "string");
        } else if ((this.type === "array" || this.type === "null") && (ev.type === "array" || ev.type === "null")) {
            vl = this.value || []; // null与数组做加法运算时，null被转换成[]
            vr = ev.value || [];
            v = this.genValue(vl.concat(vr), "array");  // 拼接成新的数组
        } else { // 两运算数不能进行加法运算
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_ADD, this.type, ev.type));
        }
        return v;
    }
    public subtract(ev) {
        /// <summary>减法</summary>
        let v;
        let vl;
        let vr;
        if (this.type === "null" && ev.type === "null") { // null-null结果为null
            v = this.genValue(null, "null");
        } else if ((this.type === "number" || this.type === "null") && (ev.type === "number" || ev.type === "null")) {
            vl = Big(this.value || "0"); // null与数字做减法运算时，null被转换成数字0
            vr = Big(ev.value || "0");
            v = this.genValue(vl.minus(vr).toString(), "number");
        } else if ((this.type === "array" || this.type === "null") && (ev.type === "array" || ev.type === "null")) {
            vl = this.value || []; // null与数组做减法运算时，null被转换成[]
            vr = ev.value || [];
            v = [];
            let found;
            for (let i = 0; i < vl.length; i++) {
                found = false;
                for (let j = 0; j < vr.length; j++) {
                    found = compare(vl[i], vr[j]);  // 比较数组元素是否相等(简单类型/日期/对象/数组)
                    if (found) {
                        break;
                    }
                }
                if (!found) {
                    v.push(vl[i]);
                }
            }
            v = this.genValue(v, "array");
        } else { // 两运算数不能进行减法运算
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_SUBTRACT, this.type, ev.type));
        }
        return v;
    }
    public equal(ev, op) {
        /// <summary>判定相等或不相等</summary>
        let v;
        let vl;
        let vr;
        let b = op === "==";
        if (this.type === "null" && ev.type === "null") { // null==null
            v = this.genValue(b, "boolean");
        } else if (this.type === "null" || ev.type === "null") { // 除null外任何值都不等于null
            v = this.genValue(!b, "boolean");
        } else if (this.type === "number" && ev.type === "number") { // 数字比较
            vl = Big(this.value);
            vr = Big(ev.value);
            v = vl.equals(vr);
            v = this.genValue(b ? v : !v, "boolean");
        } else if (this.type === ev.type) { // 类型相同两运算数比较，如数组，对象，日期，字符串
            v = compare(this.value, ev.value);
            v = this.genValue(b ? v : !v, "boolean");
        } else { // 两运算数不能进行相等或不等运算
            v = b ? locale.getLocale().MSG_EX_EQUAL : locale.getLocale().MSG_EX_EQUAL_N;
            v = this.genErrorValue(format(v, this.type, ev.type));
        }
        return v;
    }
    public compare(ev, op) {
        /// <summary>比较两运算数</summary>
        if (op === "==" || op === "!=") {
            return this.equal(ev, op);
        } else {
            let v;
            if ((this.type === "string" || this.type === "null") && (ev.type === "string" || ev.type === "null")) {
                switch (op) { // 字符串
                    case ">": v = this.value > ev.value; break;
                    case "<": v = this.value < ev.value; break;
                    case ">=": v = this.value >= ev.value; break;
                    case "<=": v = this.value <= ev.value; break;
                    default: break;
                }
                v = this.genValue(v, "boolean");
            } else if ((this.type === "date" || this.type === "null") && (ev.type === "date" || ev.type === "null")) {
                v = this.value - ev.value;
                switch (op) { // 日期
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
                switch (op) { // 数字
                    case ">": v = vl.greaterThan(vr); break;
                    case "<": v = vl.lessThan(vr); break;
                    case ">=": v = vl.greaterThanOrEqualTo(vr); break;
                    case "<=": v = vl.lessThanOrEqualTo(vr); break;
                    default: break;
                }
                v = this.genValue(v, "boolean");
            } else {
                switch (op) { // 两运算不能进行>,<,>=,<=运算
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
    public and(ev) {
        /// <summary>与运算</summary>
        let v;
        if (!ev) { // 左运算视为false时，右运算数计算被跳过所以ev==undefined
            if (this.type === "boolean" || this.type === "null") {
                v = this.genValue(false, "boolean");
            } else {
                v = this.genErrorValue(format(locale.getLocale().MSG_EX_AND_L, this.type));
            }
        } else if (this.type === "boolean" && (ev.type === "boolean" || ev.type === "null")) {
            v = this.genValue(!!(this.value && ev.value), "boolean");
        } else { // 两运算数不能进行与运算
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_AND, this.type, ev.type));
        }
        return v;
    }
    public or(ev) {
        /// <summary>或运算</summary>
        let v;
        if (!ev) { // 左运算视为true时，右运算数计算被跳过所以ev==undefined
            if (this.type === "boolean") {
                v = this.genValue(true, "boolean");
            } else {
                v = this.genErrorValue(format(locale.getLocale().MSG_EX_OR_L, this.type));
            }
        } else if ((this.type === "boolean" || this.type === "null") && (ev.type === "boolean" || ev.type === "null")) {
            v = this.genValue(!!(this.value || ev.value), "boolean");
        } else { // 两运算数不能进行或运算
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_OR, this.type, ev.type));
        }
        return v;
    }
    public subscript(ev) {
        /// <summary>下标或属性访问</summary>
        let v;
        let i;
        let t;
        if (ev.type === "array") { // a[n]
            i = ev.toValue()[0];
            t = getValueType(i);
        } else { // a.x
            i = ev.toValue();
            t = ev.type;
        }
        if (this.type === "string" || this.type === "array") {
            if (t === "number") {
                v = this.toValue();
                if (v.length > i && i >= 0 && v.length > 0) {
                    if (this.type === "array" && this.entity) {
                        v = this.context.getEntityValue(this, i);
                    } else { // "rwqer"[2],[1,2,3][2]
                        v = v[i];
                        v = this.genValue(v, getValueType(v), null);
                    }
                } else { // 下标越界:[1,2,3][-1]
                    v = this.genErrorValue(format(locale.getLocale().MSG_EX_SUBSCRIPT_U, this.type, i));
                }
            } else { // 索引必须为数字:"fasdf"["0"]
                v = this.genErrorValue(format(locale.getLocale().MSG_EX_SUBSCRIPT_T, i));
            }
        } else if (this.type === "object") { // {x:1,y:2}["x"] , Root()["E1"]
            v = this.genValue(i);
            v = v.getVariableValue(this);
        } else { // 无法做下标操作:(1+2)[0]
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_SUBSCRIPT, this.type));
        }
        return v;
    }
    public hashItem(ev) {
        /// <summary>得到{key:...,value:...}键值对对象</summary>
        let v = this.genValue({ key: this.toValue(), value: ev.toValue() }, "object");
        return v;
    }
    public getVariableValue(ev) {
        /// <summary>得到对象ev的this.toValue()属性值</summary>
        let v;
        if (ev && ev.type !== "object") {
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_DOT, ev.type));
        } else {
            v = this.context.getVariableValue(this.toValue(), ev);
        }
        return v;
    }
    public getFunctionValue(ev) {
        /// <summary>得到函数执行结果</summary>
        /// <param name="ev">函数调用者</param>
        let v = this.toValue();
        if (ev && ev.value === null) {
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_FUNC_NULL, v.key));
        } else {
            v = this.context.getFunctionValue(v.key, ev, v.value);
        }
        return v;
    }
    public abs() {
        /// <summary>获取数的绝对值</summary>
        let v = Big(this.value || "0");
        v = this.genValue(v.abs().toString(), "number");
        return v;
    }
    public ceil() {
        /// <summary>向上取整</summary>
        let v = Big(this.value || "0");
        v = v.ceil();
        v = this.genValue(v.toString(), "number");
        return v;
    }
    public floor() {
        /// <summary>向下取整</summary>
        let v = Big(this.value || "0");
        v = v.floor();
        v = this.genValue(v.toString(), "number");
        return v;
    }
    public round(scale) {
        /// <summary>四舍五入保留scale位小数</summary>
        let v;
        if (scale >= 0) {
            v = Big(this.value || "0");
            v = v.toDecimalPlaces(scale, 4);
            v = this.genValue(v.toString(), "number");
        } else {
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_ROUND, scale));
        }
        return v;
    }
    public trunc(scale) {
        /// <summary>按精度截断数据</summary>
        let v;
        if (scale >= 0) {
            v = Big(this.value || "0");
            v = v.toDecimalPlaces(scale, 1);
            v = this.genValue(v.toString(), "number");
        } else {
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_TRUNC, scale));
        }
        return v;
    }
    public cos() {
        /// <summary>获取数的余弦</summary>
        let v = Big(this.value || "0");
        v = v.cos();
        v = this.genValue(v.toString(), "number");
        return v;
    }
    public exp() {
        /// <summary>获取 e 的指数</summary>
        let v = Big(this.value || "0");
        v = v.exp();
        v = this.genValue(v.toString(), "number");
        return v;
    }
    public ln() {
        /// <summary>获取数的自然对数（底为 e）</summary>
        let v = Big(this.value || "0");
        if (v.greaterThan("0")) {
            v = v.ln();
            v = this.genValue(v.toString(), "number");
        } else {
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_LN, v.toString()));
        }
        return v;
    }
    public log(base) {
        /// <summary>获取数的指定底数的对数</summary>
        let v = Big(this.value || "0");
        if (v.greaterThan("0") && base > 0 && base !== 1) {
            v = v.log(base);
            v = this.genValue(v.toString(), "number");
        } else {
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_LOG, base, v.toString()));
        }
        return v;
    }
    public power(exponent) {
        /// <summary>获取数的指定指数的次幂</summary>
        let v = Big(this.value || "0");
        v = v.pow(exponent);
        v = this.genValue(v.toString(), "number");
        return v;
    }
    public sin() {
        /// <summary>获取数的正弦</summary>
        let v = Big(this.value || "0");
        v = v.sin();
        v = this.genValue(v.toString(), "number");
        return v;
    }
    public sqrt() {
        /// <summary>获取数的平方根</summary>
        let v = Big(this.value || "0");
        v = v.sqrt();
        v = this.genValue(v.toString(), "number");
        return v;
    }
    public tan() {
        /// <summary>获取树的正切值</summary>
        let v = Big(this.value || "0");
        v = v.tan();
        v = this.genValue(v.toString(), "number");
        return v;
    }
}
