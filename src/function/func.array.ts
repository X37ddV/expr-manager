import { compare } from "../lib/base/common";
import ExprContext from "../lib/context";

// 集合私有函数
// ----------

// 分别将source中每个值作为计算环境求出expr的值
function doEachCollection(source, expr, fn) {
    let r;
    let msg = "";
    if (source.isEntity()) { // source为实体数据，如Root().E1[0].Entity1.Sum("ID")中的Root().E1[0].Entity1
        const curr = {};
        let pa = source.parentObj;
        while (pa) {
            if (pa.entity.name !== "" && !curr[pa.entity.name]) {
                curr[pa.entity.name] = pa.entity.recNo;
            }
            pa = pa.parentObj;
        }
        for (const en in curr) {  // 将该source数组的父对象，祖父对象...(一直到根节点Root())放入计算环境堆栈
            if (curr.hasOwnProperty(en)) {
                this.pushEntityCurrent(en, curr[en]);
            }
        }
        const map = source.entity.map;
        for (let i = 0; i < map.length; i++) { // 遍历map，计算将每一个map元素作为实体计算环境时expr的值
            r = this.calcEntityExpr(expr, source.entity.name, map[i]);
            msg = r.errorMsg;
            if (msg === "") {
                const x = fn.call(this, r, i);
                if (x !== undefined) { // 两计算数运算出错，如：Root().E1.Sum("P3"),当Root().E1有多条记录时
                    msg = x;
                    break;
                }
            } else { // expr在实体计算环境source.entity.name, map[i]下计算出错，如：Root().E1[0].Entity1.Sum("ID/0")
                break;
            }
        }
        for (const en in curr) { // 恢复堆栈
            if (curr.hasOwnProperty(en)) {
                this.popEntityCurrent();
            }
        }
    } else { // source为普通数据，如[1,2,3].Sum()中的[1,2,3]
        for (let j = 0; j < source.value.length; j++) {
            r = this.calcDataExpr(expr, source.value[j]);
            msg = r.errorMsg;
            if (msg === "") {
                const y = fn.call(this, r, j);
                if (y !== undefined) { // 两计算数运算出错，如：[1,2,[3]].Sum()
                    msg = y;
                    break;
                }
            } else { // expr在数据计算环境source.value[j]下计算出错，如：[1,2,"3"].Sum("$0+1")
                break;
            }
        }
    }
    return msg;
}
// 将source中求出的值经过fn处理后最终的结果
function doCompCollection(source, expr, fn) {
    let r;
    let msg;
    msg = doEachCollection.call(this, source, expr, (a) => { // a为分别将source中每个值作为计算环境求出expr的值
        if (r) { // 从第二个计算数开始，与结果值r做fn运算
            const tmp = fn.call(this, r, a);
            if (tmp.errorMsg) { // r,a两计算数运算出错，如：[1,2,[3]].Sum()
                return tmp.errorMsg;
            } else { // 存储中间结果，如Max运算中，r始终存储fn函数返回的最大值
                r = tmp;
            }
        } else { // a为第一个计算数，直接赋给结果值r
            r = a;
        }
    });
    if (msg !== "") {
        r = this.genErrorValue(msg);
    }
    if (!r) {
        r = this.genValue(null);
    }
    return r;
}

// 集合函数
// ----------

// 获取集合元素个数
const funcArrayCount = {
    e: "value",
    fn: (context: ExprContext, source) => {
        const r = source.toValue().length;
        return context.genValue(r, undefined, null, "");
    },
    p: [],
    r: "number",
};
// 获取集合元素的合计值
const funcArraySum = {
    e: "value",
    fn: (context: ExprContext, source, expr) => {
        expr = expr || "$0";
        const r = doCompCollection.call(context, source, expr, (a, b) => {
            return a.add(b);
        });
        return r;
    },
    p: ["expr?"],
    r: "undefined",
};
// 获取集合元素的最大值
const funcArrayMax = {
    e: "value",
    fn: (context: ExprContext, source, expr) => {
        expr = expr || "$0";
        const r = doCompCollection.call(context, source, expr, (a, b) => {
            let v = a.compare(b, ">");
            if (v.errorMsg === "") {
                v = v.toValue() ? a : b;
            }
            return v;
        });
        return r;
    },
    p: ["expr?"],
    r: "undefined",
};
// 获取集合元素的最小值
const funcArrayMin = {
    e: "value",
    fn: (context: ExprContext, source, expr) => {
        expr = expr || "$0";
        const r = doCompCollection.call(context, source, expr, (a, b) => {
            let v = a.compare(b, "<");
            if (v.errorMsg === "") {
                v = v.toValue() ? a : b;
            }
            return v;
        });
        return r;
    },
    p: ["expr?"],
    r: "undefined",
};
// 获取集合元素的平均值
const funcArrayAverage = {
    e: "value",
    fn: (context: ExprContext, source, expr) => {
        expr = expr || "$0";
        let r = doCompCollection.call(context, source, expr, (a, b) => {
            return a.add(b);
        });
        if (r.errorMsg === "") {
            if (r.toValue() === null) {
                r = context.genValue(0);
            } else {
                const c = source.toValue().length;
                r = r.divide(context.genValue(c));
            }
        }
        return r;
    },
    p: ["expr?"],
    r: "number",
};
// 获取集合中唯一元素的集合
const funcArrayDistinct = {
    e: "data",
    fn: (context, source, expr) => {
        expr = expr || "$0";
        let r = context.genValue([], "array");
        const arr = [];
        if (source.entity) {
            r.entity = context.genEntityInfo(source.entity.fullName);
            r.entity.map = [];
            r.parentObj = source.parentObj;
        }
        const find = (v) => { // 查找表达式结果是否有重复值
            let f = false;
            for (const item of arr) {
                f = compare(item, v);
                if (f) {
                    break;
                }
            }
            return f;
        };
        const msg = doEachCollection.call(context, source, expr, (a, i) => {
            const b = a.toValue();
            if (!find(b)) {
                arr.push(b);
                r.arrayPush(source.subscript(context.genValue(i)));
                if (r.entity && r.entity.map) {
                    r.entity.map.push(source.entity.map[i]);
                }
            }
        });
        if (msg !== "") {
            r = context.genErrorValue(msg);
        }
        return r;
    },
    p: ["expr?"],
    r: "array",
};
// 获取满足条件的元素集合
const funcArrayWhere = {
    e: "data",
    fn: (context, source, expr) => {
        expr = expr || "true";
        let r = context.genValue([], "array");
        if (source.entity) {
            r.entity = context.genEntityInfo(source.entity.fullName);
            r.entity.map = [];
            r.parentObj = source.parentObj;
        }
        const msg = doEachCollection.call(context, source, expr, (a, i) => {
            if (a.toValue()) {
                r.arrayPush(source.subscript(context.genValue(i)));
                if (r.entity && r.entity.map) {
                    r.entity.map.push(source.entity.map[i]);
                }
            }
        });
        if (msg !== "") {
            r = context.genErrorValue(msg);
        }
        return r;
    },
    p: ["expr"],
    r: "array",
};
// 集合函数列表
export default {
    Average: funcArrayAverage,
    Count: funcArrayCount,
    Distinct: funcArrayDistinct,
    Max: funcArrayMax,
    Min: funcArrayMin,
    Sum: funcArraySum,
    Where: funcArrayWhere,
};
