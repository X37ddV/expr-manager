import { compare } from "../lib/base/common";

function doEachCollection(source, expr, fn) {
    /// <summary>分别将source中每个值作为计算环境求出expr的值</summary>
    let r;
    let msg = "";
    if (source.isEntity()) { // source为实体数据，如Root().E1[0].Entity1.Sum("ID")中的Root().E1[0].Entity1
        let curr = {};
        let pa = source.parentObj;
        while (pa) {
            if (pa.entity.name !== "" && !curr[pa.entity.name]) {
                curr[pa.entity.name] = pa.entity.recNo;
            }
            pa = pa.parentObj;
        }
        for (let en in curr) {  // 将该source数组的父对象，祖父对象...(一直到根节点Root())放入计算环境堆栈
            if (curr.hasOwnProperty(en)) {
                this.pushEntityCurrent(en, curr[en]);
            }
        }
        let map = source.entity.map;
        for (let i = 0; i < map.length; i++) {
            // 遍历map，计算将每一个map元素作为实体计算环境时expr的值
            r = this.calcEntityExpr(expr, source.entity.name, map[i]);
            msg = r.errorMsg;
            if (msg === "") {
                let x = fn.call(this, r, i);
                if (x !== undefined) { // 两计算数运算出错，如：Root().E1.Sum("P3"),当Root().E1有多条记录时
                    msg = x;
                    break;
                }
            } else { // expr在实体计算环境source.entity.name, map[i]下计算出错，如：Root().E1[0].Entity1.Sum("ID/0")
                break;
            }
        }
        for (let en in curr) { // 恢复堆栈
            if (curr.hasOwnProperty(en)) {
                this.popEntityCurrent();
            }
        }
    } else { // source为普通数据，如[1,2,3].Sum()中的[1,2,3]
        for (let j = 0; j < source.value.length; j++) {
            r = this.calcDataExpr(expr, source.value[j]);
            msg = r.errorMsg;
            if (msg === "") {
                let y = fn.call(this, r, j);
                if (y !== undefined) { // 两计算数运算出错，如：[1,2,[3]].Sum()
                    msg = y;
                    break;
                }
            } else { // expr在数据计算环境source.value[j]下计算出错，如：[1,2,"3"].Sum("$0+1")
                break;
            }
        }
    }
    return msg; // 返回出错信息
}
function doCompCollection(source, expr, fn) {
    /// <summary>将source中求出的值经过fn处理后最终的结果</summary>
    let r;
    let msg;
    msg = doEachCollection.call(this, source, expr, (a) => { // a为分别将source中每个值作为计算环境求出expr的值
        if (r) { // 从第二个计算数开始，与结果值r做fn运算
            let tmp = fn.call(this, r, a); // 相加，比较大小...
            if (tmp.errorMsg) { // r,a两计算数运算出错，如：[1,2,[3]].Sum()
                return tmp.errorMsg;
            } else {
                r = tmp; // 存储中间结果，如Max运算中，r始终存储fn函数返回的最大值
            }
        } else {
            r = a; // a为第一个计算数，直接赋给结果值r
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

// Array
const funcArrayCount = {
    e: "value",
    fn: (context, source) => {
        /// <summary>获取集合元素个数</summary>
        /// <param name="source" type="Array"></param>
        /// <returns type="Object">个数</returns>
        let r = source.toValue().length;
        return context.genValue(r, "", null, "");
    },
    p: [],
    r: "number",
};
const funcArraySum = {
    e: "value",
    fn: (context, source, expr) => {
        /// <summary>获取集合元素的合计值</summary>
        /// <param name="source" type="Array"></param>
        /// <param name="expr" type="String">表达式</param>
        /// <returns type="Object">合计值</returns>
        expr = expr || "$0";
        let r = doCompCollection.call(context, source, expr, (a, b) => {
            return a.add(b);
        });
        return r;
    },
    p: ["expr?"],
    r: "undefined",
};
const funcArrayMax = {
    e: "value",
    fn: (context, source, expr) => {
        /// <summary>获取集合元素的最大值</summary>
        /// <param name="source" type="Array"></param>
        /// <param name="expr" type="String">表达式</param>
        /// <returns type="Object">最大值</returns>
        expr = expr || "$0";
        let r = doCompCollection.call(context, source, expr, (a, b) => {
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
const funcArrayMin = {
    e: "value",
    fn: (context, source, expr) => {
        /// <summary>获取集合元素的最小值</summary>
        /// <param name="source" type="Array"></param>
        /// <param name="expr" type="String">表达式</param>
        /// <returns type="Object">最小值</returns>
        expr = expr || "$0";
        let r = doCompCollection.call(context, source, expr, (a, b) => {
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
const funcArrayAverage = {
    e: "value",
    fn: (context, source, expr) => {
        /// <summary>获取集合元素的平均值</summary>
        /// <param name="source" type="Array"></param>
        /// <param name="expr" type="String">表达式</param>
        /// <returns type="Object">平均值</returns>
        expr = expr || "$0";
        let r = doCompCollection.call(context, source, expr, (a, b) => {
            return a.add(b);
        });
        if (r.errorMsg === "") {
            if (r.toValue() === null) {
                r = context.genValue(0);
            } else {
                let c = source.toValue().length;
                r = r.divide(context.genValue(c));
            }
        }
        return r;
    },
    p: ["expr?"],
    r: "number",
};
const funcArrayDistinct = {
    e: "data",
    fn: (context, source, expr) => {
        /// <summary>获取集合中唯一元素的集合</summary>
        /// <param name="source" type="Array"></param>
        /// <param name="expr" type="String">表达式</param>
        /// <returns type="Object">集合</returns>
        expr = expr || "$0";
        let r = context.genValue([], "array");
        let arr = [];
        if (source.entity) {
            r.entity = context.genEntityInfo(source.entity.fullName);
            r.entity.map = [];
            r.parentObj = source.parentObj;
        }
        let find = (v) => { // 查找表达式结果是否有重复值
            let f = false;
            for (let i = 0; i < arr.length; i++) {
                f = compare(arr[i], v);
                if (f) {
                    break;
                }
            }
            return f;
        };
        let msg = doEachCollection.call(context, source, expr, (a, i) => {
            let b = a.toValue();
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
const funcArrayWhere = {
    e: "data",
    fn: (context, source, expr) => {
        /// <summary>获取满足条件的元素集合</summary>
        /// <param name="source" type="Array"></param>
        /// <param name="expr" type="String">条件表达式</param>
        /// <returns type="Object">集合</returns>
        expr = expr || "true";
        let r = context.genValue([], "array");
        if (source.entity) {
            r.entity = context.genEntityInfo(source.entity.fullName);
            r.entity.map = [];
            r.parentObj = source.parentObj;
        }
        let msg = doEachCollection.call(context, source, expr, (a, i) => {
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
export default {
    Average: funcArrayAverage,
    Count: funcArrayCount,
    Distinct: funcArrayDistinct,
    Max: funcArrayMax,
    Min: funcArrayMin,
    Sum: funcArraySum,
    Where: funcArrayWhere,
};
