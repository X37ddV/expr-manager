//     expr-manager.js 0.0.4
//     https://github.com/X37ddV/expr-manager
//     (c) 2016-2017 X37ddV
//     Released under the MIT License.

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('moment'), require('decimal.js')) :
	typeof define === 'function' && define.amd ? define(['moment', 'decimal.js'], factory) :
	(global.ExprManager = factory(global.moment,global.Decimal));
}(this, (function (moment,Decimal) { 'use strict';

// 依赖第三方库
// ----------
// + **[decimal.js](https://github.com/MikeMcl/decimal.js 'An arbitrary-precision Decimal type for JavaScript')** 用于高精度计算<br />
// + **[moment.js](http://momentjs.com 'Parse, validate, manipulate, and display dates in javascript')** 用于日期计算

moment = 'default' in moment ? moment['default'] : moment;
Decimal = 'default' in Decimal ? Decimal['default'] : Decimal;

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

// 内部公共函数
// ----------
// 获取**值**类型
function getValueType(v) {
    return v === null ? "null" :
        Object.prototype.toString.call(v).replace("[object ", "").replace("]", "").toLowerCase();
}
// 是否为**字符串**
function isString(v) {
    return getValueType(v) === "string";
}
// 是否为**数字**
function isNumber(v) {
    return getValueType(v) === "number";
}
// 是否为**对象**
function isObject(v) {
    return getValueType(v) === "object";
}
// 是否为**数组**
function isArray(v) {
    return getValueType(v) === "array";
}
// 判断**tokenType**是否包含在**tokenTypes**中
function hasToken(tokenTypes, tokenType) {
    return (tokenTypes + ",").indexOf(tokenType + ",") >= 0;
}
// 是否为**数字**组成字符
function isN(s) {
    return "0123456789.".indexOf(s) >= 0;
}
// 是否为**八进制数字**组成字符
function isO(s) {
    return "01234567".indexOf(s) >= 0;
}
// 是否为**十六进制数字**组成字符
function isX(s) {
    return "0123456789abcdefABCDEF".indexOf(s) >= 0;
}
// 是否为**标识符**组成字符
function isC(s) {
    return s !== "." && isN(s) || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_".indexOf(s) >= 0;
}
// 是否至多包含一个"."
function isNS(s) {
    return s.replace(/[^\.]/g, "").length <= 1;
}
// 是否为不能识别的字符
function isUN(s) {
    return !isC(s) && " ()[]{}!<>=+-&|*/%'\",.".indexOf(s) < 0;
}
// 是否为变量标识符（排除函数名，对象属性名的情况）
function isIDENToken(token) {
    var p = token.parent;
    return !(p &&
        (hasToken("VTK_FUNCTION,TK_COLON", p.tokenType) && p.childs[0] === token ||
            p.tokenType === "TK_DOT" && p.childs[0] !== token));
}
// t是否为n(,,)函数形式中的","结点
function isFunctionToken(t, name) {
    return t && t.tokenType === "VTK_COMMA" &&
        t.parent && t.parent.tokenType === "VTK_PAREN" &&
        t.parent.parent && t.parent.parent.tokenType === "TK_IDEN" &&
        t.parent.parent.tokenValue === name;
}
// 遍历**语法树**
function eachToken(token, fn, scope) {
    var r = true;
    if (token.childs) {
        for (var _i = 0, _a = token.childs; _i < _a.length; _i++) {
            var item = _a[_i];
            if (eachToken(item, fn, scope) === false) {
                r = false;
                break;
            }
        }
    }
    return !r ? r : fn.call(scope, token);
}
// 格式化字符串str, 替换掉str中的{0}、{1}等
function format(str) {
    var values = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        values[_i - 1] = arguments[_i];
    }
    return str.replace(/\{(\d+)\}/g, function (m, i) { return values[i]; });
}
// 比较**数组**是否相等
function compareArray(farr, sarr, isKey) {
    var r = farr.length === sarr.length;
    if (r) {
        for (var i = 0; i < farr.length; i++) {
            if (isKey === true) {
                if (sarr.indexOf(farr[i]) === -1) {
                    r = false;
                    break;
                }
            }
            else {
                if (!compare(farr[i], sarr[i])) {
                    r = false;
                    break;
                }
            }
        }
    }
    return r;
}
// 比较**对象**是否相等
function compareObject(fobj, sobj) {
    var f = [];
    var s = [];
    var r = true;
    for (var i in fobj) {
        if (fobj.hasOwnProperty(i)) {
            f.push(i);
        }
    }
    for (var j in sobj) {
        if (sobj.hasOwnProperty(j)) {
            s.push(j);
        }
    }
    if (compareArray(f, s, true)) {
        for (var ele in fobj) {
            if (sobj.hasOwnProperty(ele) && !compare(fobj[ele], sobj[ele])) {
                r = false;
                break;
            }
        }
    }
    else {
        r = false;
    }
    return r;
}
// 比较**值**是否相等
function compare(fobj, sobj) {
    var r;
    if (fobj !== null && sobj !== null && fobj !== undefined && sobj !== undefined) {
        var ftype = typeof (fobj);
        var stype = typeof (sobj);
        if (ftype === stype) {
            if (ftype === "object") {
                r = fobj.constructor === Date && sobj.constructor === Date ? fobj.valueOf() === sobj.valueOf() :
                    fobj.constructor === Array && sobj.constructor === Array ? compareArray(fobj, sobj, false) :
                        fobj.constructor !== Array && sobj.constructor !== Array ? compareObject(fobj, sobj) :
                            false;
            }
            else {
                r = fobj === sobj;
            }
        }
        else {
            r = false;
        }
    }
    else {
        r = fobj === sobj;
    }
    return r;
}
// 遍历对象c中的属性, 将属性键值对依次添加到对象o中
function merger(o, c) {
    if (isObject(o) && isObject(c)) {
        for (var p in c) {
            if (c.hasOwnProperty(p)) {
                if (o[p] && isObject(o[p])) {
                    merger(o[p], c[p]);
                }
                else {
                    o[p] = c[p];
                }
            }
        }
    }
    return o;
}

// 表达式函数
// ----------
// 条件判断函数，如果第一个参数为true，则获取第二个参数，否则获取第三个参数
var funcIIf = {
    fn: function (context, source, bool, tv, fv) {
        return context.genValue(bool ? tv : fv);
    },
    p: ["boolean", "undefined", "undefined"],
    r: "undefined",
};
// 空值判断函数，如果第一个参数为null，则获取第二个参数，否则获取第一个参数
var funcIfNull = {
    fn: function (context, source, v, d) {
        return context.genValue((v !== null) ? v : d);
    },
    p: ["undefined", "undefined"],
    r: "undefined",
};
// 获取当前实体的父实体对象，如果当前为根则获取自己
var funcParent = {
    e: "parent",
    fn: function (context) {
        return context.getParentValue(null);
    },
    p: [],
    r: "object",
};
// 获取当前实体的索引号，没有记录返回-1
var funcRecNo = {
    e: "value",
    fn: function (context) {
        return context.getRecNo(null);
    },
    p: [],
    r: "number",
};
// 获取实体根对象
var funcRoot = {
    e: "root",
    fn: function (context) {
        return context.getRootValue();
    },
    p: [],
    r: "object",
};
// 获取本地当前日期时间
var funcNow = {
    fn: function (context) {
        return context.genValue(new Date());
    },
    p: [],
    r: "date",
};
// 获取当前字段唯一标识
var funcFieldName = {
    fn: function (context) {
        return context.getContextVariableValue("FieldName");
    },
    p: [],
    r: "string",
};
// 获取当前字段别名
var funcFieldDisplayName = {
    fn: function (context) {
        return context.getContextVariableValue("FieldDisplayName");
    },
    p: [],
    r: "string",
};
// 获取当前字段值
var funcFieldValue = {
    fn: function (context) {
        return context.getContextVariableValue("FieldValue");
    },
    p: [],
    r: "undefined",
};
// 获取对象属性值
var funcPropValue = {
    fn: function (context, source, obj, prop, delimiter) {
        var r;
        var o = obj;
        if (isString(delimiter) && isArray(o)) {
            r = "";
            for (var i = 0; i < o.length; i++) {
                r += isObject(o[i]) ? o[i][prop] : "";
                if (i < o.length - 1) {
                    r += delimiter;
                }
            }
        }
        else {
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
var funcRandom = {
    fn: function (context) {
        return context.genValue(Math.random());
    },
    p: [],
    r: "number",
};
var func__ = {
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

// 集合私有函数
// ----------
// 分别将source中每个值作为计算环境求出expr的值
function doEachCollection(source, expr, fn) {
    var r;
    var msg = "";
    if (source.isEntity()) {
        var curr = {};
        var pa = source.parentObj;
        while (pa) {
            if (pa.entity.name !== "" && !curr[pa.entity.name]) {
                curr[pa.entity.name] = pa.entity.recNo;
            }
            pa = pa.parentObj;
        }
        for (var en in curr) {
            if (curr.hasOwnProperty(en)) {
                this.pushEntityCurrent(en, curr[en]);
            }
        }
        var map = source.entity.map;
        for (var i = 0; i < map.length; i++) {
            r = this.calcEntityExpr(expr, source.entity.name, map[i]);
            msg = r.errorMsg;
            if (msg === "") {
                var x = fn.call(this, r, i);
                if (x !== undefined) {
                    msg = x;
                    break;
                }
            }
            else {
                break;
            }
        }
        for (var en in curr) {
            if (curr.hasOwnProperty(en)) {
                this.popEntityCurrent();
            }
        }
    }
    else {
        for (var j = 0; j < source.value.length; j++) {
            r = this.calcDataExpr(expr, source.value[j]);
            msg = r.errorMsg;
            if (msg === "") {
                var y = fn.call(this, r, j);
                if (y !== undefined) {
                    msg = y;
                    break;
                }
            }
            else {
                break;
            }
        }
    }
    return msg;
}
// 将source中求出的值经过fn处理后最终的结果
function doCompCollection(source, expr, fn) {
    var _this = this;
    var r;
    var msg;
    msg = doEachCollection.call(this, source, expr, function (a) {
        if (r) {
            var tmp = fn.call(_this, r, a);
            if (tmp.errorMsg) {
                return tmp.errorMsg;
            }
            else {
                r = tmp;
            }
        }
        else {
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
var funcArrayCount = {
    e: "value",
    fn: function (context, source) {
        var r = source.toValue().length;
        return context.genValue(r, "", null, "");
    },
    p: [],
    r: "number",
};
// 获取集合元素的合计值
var funcArraySum = {
    e: "value",
    fn: function (context, source, expr) {
        expr = expr || "$0";
        var r = doCompCollection.call(context, source, expr, function (a, b) {
            return a.add(b);
        });
        return r;
    },
    p: ["expr?"],
    r: "undefined",
};
// 获取集合元素的最大值
var funcArrayMax = {
    e: "value",
    fn: function (context, source, expr) {
        expr = expr || "$0";
        var r = doCompCollection.call(context, source, expr, function (a, b) {
            var v = a.compare(b, ">");
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
var funcArrayMin = {
    e: "value",
    fn: function (context, source, expr) {
        expr = expr || "$0";
        var r = doCompCollection.call(context, source, expr, function (a, b) {
            var v = a.compare(b, "<");
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
var funcArrayAverage = {
    e: "value",
    fn: function (context, source, expr) {
        expr = expr || "$0";
        var r = doCompCollection.call(context, source, expr, function (a, b) {
            return a.add(b);
        });
        if (r.errorMsg === "") {
            if (r.toValue() === null) {
                r = context.genValue(0);
            }
            else {
                var c = source.toValue().length;
                r = r.divide(context.genValue(c));
            }
        }
        return r;
    },
    p: ["expr?"],
    r: "number",
};
// 获取集合中唯一元素的集合
var funcArrayDistinct = {
    e: "data",
    fn: function (context, source, expr) {
        expr = expr || "$0";
        var r = context.genValue([], "array");
        var arr = [];
        if (source.entity) {
            r.entity = context.genEntityInfo(source.entity.fullName);
            r.entity.map = [];
            r.parentObj = source.parentObj;
        }
        var find = function (v) {
            var f = false;
            for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
                var item = arr_1[_i];
                f = compare(item, v);
                if (f) {
                    break;
                }
            }
            return f;
        };
        var msg = doEachCollection.call(context, source, expr, function (a, i) {
            var b = a.toValue();
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
var funcArrayWhere = {
    e: "data",
    fn: function (context, source, expr) {
        expr = expr || "true";
        var r = context.genValue([], "array");
        if (source.entity) {
            r.entity = context.genEntityInfo(source.entity.fullName);
            r.entity.map = [];
            r.parentObj = source.parentObj;
        }
        var msg = doEachCollection.call(context, source, expr, function (a, i) {
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
var func_array = {
    Average: funcArrayAverage,
    Count: funcArrayCount,
    Distinct: funcArrayDistinct,
    Max: funcArrayMax,
    Min: funcArrayMin,
    Sum: funcArraySum,
    Where: funcArrayWhere,
};

// 布尔函数
// ----------
// 转换布尔类型为字符串
var funcBooleanToString = {
    fn: function (context, source) {
        return context.genValue(source.toValue() + "");
    },
    p: [],
    r: "string",
};
var func_boolean = {
    ToString: funcBooleanToString,
};

// 日期函数
// ----------
// 转换日期时间类型为字符串
var funcDateToString = {
    fn: function (context, source, format) {
        return context.genValue(moment(source.toValue()).format(format || ""));
    },
    p: ["string?"],
    r: "string",
};
// 获取 Date 对象的日期部分
var funcDateDateOf = {
    fn: function (context, source) {
        return context.genValue(moment(source.toValue()).startOf("day").toDate());
    },
    p: [],
    r: "date",
};
// 从 Date 对象获取一个月中的某一天（1 ~ 31）
var funcDateDayOf = {
    fn: function (context, source) {
        return context.genValue(moment(source.toValue()).date());
    },
    p: [],
    r: "number",
};
// 得到一周中的星期几（0 ~ 6）
var funcDateDayOfWeek = {
    fn: function (context, source) {
        return context.genValue(moment(source.toValue()).day());
    },
    p: [],
    r: "number",
};
// 获取日期差
var funcDateDaysBetween = {
    fn: function (context, source, endDate) {
        return context.genValue(-moment(source.toValue()).diff(endDate, "days"));
    },
    p: ["date"],
    r: "number",
};
// 从 Date 对象获取一天中的第几个小时
var funcDateHourOf = {
    fn: function (context, source) {
        return context.genValue(moment(source.toValue()).hour());
    },
    p: [],
    r: "number",
};
// 获取小时差
var funcDateHoursBetween = {
    fn: function (context, source, endDate) {
        return context.genValue(-moment(source.toValue()).diff(endDate, "hours"));
    },
    p: ["date"],
    r: "number",
};
// 增加指定的天数
var funcDateIncDay = {
    fn: function (context, source, days) {
        return context.genValue(moment(source.toValue()).add(days, "days").toDate());
    },
    p: ["number"],
    r: "date",
};
// 增加指定的小时数
var funcDateIncHour = {
    fn: function (context, source, hours) {
        return context.genValue(moment(source.toValue()).add(hours, "hours").toDate());
    },
    p: ["number"],
    r: "date",
};
// 增加指定的分钟数
var funcDateIncMinute = {
    fn: function (context, source, minutes) {
        return context.genValue(moment(source.toValue()).add(minutes, "minutes").toDate());
    },
    p: ["number"],
    r: "date",
};
// 增加指定的月数
var funcDateIncMonth = {
    fn: function (context, source, months) {
        return context.genValue(moment(source.toValue()).add(months, "months").toDate());
    },
    p: ["number"],
    r: "date",
};
// 增加指定的秒数
var funcDateIncSecond = {
    fn: function (context, source, seconds) {
        return context.genValue(moment(source.toValue()).add(seconds, "seconds").toDate());
    },
    p: ["number"],
    r: "date",
};
// 增加指定的周数
var funcDateIncWeek = {
    fn: function (context, source, weeks) {
        return context.genValue(moment(source.toValue()).add(weeks, "weeks").toDate());
    },
    p: ["number"],
    r: "date",
};
// 增加指定的年数
var funcDateIncYear = {
    fn: function (context, source, years) {
        return context.genValue(moment(source.toValue()).add(years, "years").toDate());
    },
    p: ["number"],
    r: "date",
};
// 从 Date 对象获取毫秒
var funcDateMilliSecondOf = {
    fn: function (context, source) {
        return context.genValue(moment(source.toValue()).millisecond());
    },
    p: [],
    r: "number",
};
// 获取毫秒差
var funcDateMilliSecondsBetween = {
    fn: function (context, source, endDate) {
        return context.genValue(-moment(source.toValue()).diff(endDate, "milliseconds"));
    },
    p: ["date"],
    r: "number",
};
// 从 Date 对象获取分钟（0 ~ 59）
var funcDateMinuteOf = {
    fn: function (context, source) {
        return context.genValue(moment(source.toValue()).minute());
    },
    p: [],
    r: "number",
};
// 获取分钟差
var funcDateMinutesBetween = {
    fn: function (context, source, endDate) {
        return context.genValue(-moment(source.toValue()).diff(endDate, "minutes"));
    },
    p: ["date"],
    r: "number",
};
// 从 Date 对象获取月份（1 ~ 12）
var funcDateMonthOf = {
    fn: function (context, source) {
        return context.genValue(moment(source.toValue()).month() + 1);
    },
    p: [],
    r: "number",
};
// 获取月份差
var funcDateMonthsBetween = {
    fn: function (context, source, endDate) {
        return context.genValue(-moment(source.toValue()).diff(endDate, "months"));
    },
    p: ["date"],
    r: "number",
};
// 从 Date 对象获取秒数（0 ~ 59）
var funcDateSecondOf = {
    fn: function (context, source) {
        return context.genValue(moment(source.toValue()).second());
    },
    p: [],
    r: "number",
};
// 获取秒差
var funcDateSecondsBetween = {
    fn: function (context, source, endDate) {
        return context.genValue(-moment(source.toValue()).diff(endDate, "seconds"));
    },
    p: ["date"],
    r: "number",
};
// 从 Date 对象获取一年中的第几周（1 ~ 53）
var funcDateWeekOf = {
    fn: function (context, source) {
        return context.genValue(moment(source.toValue()).week());
    },
    p: [],
    r: "number",
};
// 获取周差
var funcDateWeeksBetween = {
    fn: function (context, source, endDate) {
        return context.genValue(-moment(source.toValue()).diff(endDate, "weeks"));
    },
    p: ["date"],
    r: "number",
};
// 从 Date 对象获取年份
var funcDateYearOf = {
    fn: function (context, source) {
        return context.genValue(moment(source.toValue()).year());
    },
    p: [],
    r: "number",
};
// 获取年差
var funcDateYearsBetween = {
    fn: function (context, source, endDate) {
        return context.genValue(-moment(source.toValue()).diff(endDate, "years"));
    },
    p: ["date"],
    r: "number",
};
var func_date = {
    DateOf: funcDateDateOf,
    DayOf: funcDateDayOf,
    DayOfWeek: funcDateDayOfWeek,
    DaysBetween: funcDateDaysBetween,
    HourOf: funcDateHourOf,
    HoursBetween: funcDateHoursBetween,
    IncDay: funcDateIncDay,
    IncHour: funcDateIncHour,
    IncMinute: funcDateIncMinute,
    IncMonth: funcDateIncMonth,
    IncSecond: funcDateIncSecond,
    IncWeek: funcDateIncWeek,
    IncYear: funcDateIncYear,
    MilliSecondOf: funcDateMilliSecondOf,
    MilliSecondsBetween: funcDateMilliSecondsBetween,
    MinuteOf: funcDateMinuteOf,
    MinutesBetween: funcDateMinutesBetween,
    MonthOf: funcDateMonthOf,
    MonthsBetween: funcDateMonthsBetween,
    SecondOf: funcDateSecondOf,
    SecondsBetween: funcDateSecondsBetween,
    ToString: funcDateToString,
    WeekOf: funcDateWeekOf,
    WeeksBetween: funcDateWeeksBetween,
    YearOf: funcDateYearOf,
    YearsBetween: funcDateYearsBetween,
};

// 数值函数
// ----------
// 转换数字类型为字符串
var funcNumberToString = {
    fn: function (context, source) {
        return context.genValue(source.toValue() + "");
    },
    p: [],
    r: "string",
};
// 获取数的绝对值
var funcNumberAbs = {
    fn: function (context, source) {
        return source.abs();
    },
    p: [],
    r: "number",
};
// 对数进行向上取整
var funcNumberCeil = {
    fn: function (context, source) {
        return source.ceil();
    },
    p: [],
    r: "number",
};
// 对数进行向下取整
var funcNumberFloor = {
    fn: function (context, source) {
        return source.floor();
    },
    p: [],
    r: "number",
};
// 获取数的余弦
var funcNumberCos = {
    fn: function (context, source) {
        return source.cos();
    },
    p: [],
    r: "number",
};
// 获取 e 的指数
var funcNumberExp = {
    fn: function (context, source) {
        return source.exp();
    },
    p: [],
    r: "number",
};
// 获取数的自然对数（底为 e）
var funcNumberLn = {
    fn: function (context, source) {
        return source.ln();
    },
    p: [],
    r: "number",
};
// 获取数的指定底数的对数
var funcNumberLog = {
    fn: function (context, source, base) {
        return source.log(base);
    },
    p: ["number"],
    r: "number",
};
// 获取数的指定指数的次幂
var funcNumberPower = {
    fn: function (context, source, exponent) {
        return source.power(exponent);
    },
    p: ["number"],
    r: "number",
};
// 根据保留的小数位数对数四舍五入
var funcNumberRound = {
    fn: function (context, source, scale) {
        return source.round(scale);
    },
    p: ["number"],
    r: "number",
};
// 获取数的正弦
var funcNumberSin = {
    fn: function (context, source) {
        return source.sin();
    },
    p: [],
    r: "number",
};
// 获取数的平方根
var funcNumberSqrt = {
    fn: function (context, source) {
        return source.sqrt();
    },
    p: [],
    r: "number",
};
// 获取树的正切值
var funcNumberTan = {
    fn: function (context, source) {
        return source.tan();
    },
    p: [],
    r: "number",
};
// 根据保留的小数位数对数进行截断
var funcNumberTrunc = {
    fn: function (context, source, scale) {
        return source.trunc(scale);
    },
    p: ["number"],
    r: "number",
};
// 获取人民币大写
var funcNumberToRMB = {
    fn: function (context, source, rmb, big) {
        var conversion = function (num, isRMB, isBig) {
            var cn = (isBig ? "零壹贰叁肆伍陆柒捌玖" : "零一二三四五六七八九").split("");
            var cq = (isBig ? "拾佰仟" : "十百千").split("");
            cq.unshift("");
            var cw = "万亿兆".split("");
            cw.unshift("");
            var cd = isRMB ? "元" : "点";
            var cl = "角分厘".split("");
            var cz = isRMB ? "整" : "";
            var cf = "负";
            var v = "";
            var s = (num + ".").split(".", 2);
            var x = s[0].split("");
            var y = s[1].split("");
            var isNegative = x[0] === "-";
            if (isNegative) {
                x.shift();
            }
            x = x.reverse();
            // - 处理整数部分
            var c = "";
            var i = 0;
            var t = [];
            var inZero = true;
            while (i < x.length) {
                t.push(x[i++]);
                if (t.length === 4 || i === x.length) {
                    // + 从个位数起以每四位数为一小节
                    for (var j = 0; j < t.length; j++) {
                        var n = Number(t[j]);
                        if (n === 0) {
                            // 1. 避免 "零" 的重覆出现;
                            // 2. 个位数的 0 不必转成 "零"
                            if (!inZero && j !== 0) {
                                c = cn[0] + c;
                            }
                            inZero = true;
                        }
                        else {
                            c = cn[n] + cq[j] + c;
                            inZero = false;
                        }
                    }
                    // + 加上该小节的位数
                    if (c.length === 0) {
                        if (v.length > 0 && v.split("")[0] !== cn[0]) {
                            v = cn[0] + v;
                        }
                    }
                    else {
                        v = c + (cw[Math.floor((i - 1) / 4)] || "") + v;
                    }
                    c = "";
                    t = [];
                }
            }
            // - 处理小数部分
            if (y.length > 0) {
                v += cd;
                for (var k = 0; k < y.length; k++) {
                    var m = Number(y[k]);
                    if (isRMB) {
                        // + 避免小数点后 "零" 的重覆出现
                        if ((m !== 0) || (v.substring(v.length - 1) !== cn[0]) || (k > 2)) {
                            v += cn[m];
                        }
                        if ((m !== 0) || (v.substring(v.length - 1) === cn[0]) && (k === 2)) {
                            v += cl[k] || "";
                        }
                    }
                    else {
                        v += cn[m];
                    }
                }
            }
            else {
                // + 处理无小数部分时整数部分的结尾
                if (v.length === 0) {
                    v = cn[0];
                }
                if (isRMB) {
                    v += cd + cz;
                }
            }
            // - 其他例外状况的处理, 非人民币则将 "壹拾" 或 "一十" 改为 "拾" 或 "十"
            if (!isRMB && v.substring(0, 2) === cn[1] + cq[1]) {
                v = v.substring(1);
            }
            // - 没有整数部分 且 有小数部分
            if (v.split("")[0] === cd) {
                v = isRMB ? v.substring(1) : cn[0] + v;
            }
            // - 是否为负数
            if (isNegative) {
                v = cf + v;
            }
            return v;
        };
        var v = source.toValue();
        return context.genValue(isNumber(v) ?
            conversion(v, rmb === undefined || rmb, big === undefined || big) : null);
    },
    p: ["boolean?", "boolean?"],
    r: "string",
};
var func_number = {
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

// 对象函数
// ----------
// 获取父实体对象，如果当前为根则获取自己
var funcObjectParent = {
    e: "parent",
    fn: function (context, source) {
        return context.getParentValue(source);
    },
    p: [],
    r: "object",
};
// 获取当前实体的索引号，没有实体返回-1
var funcObjectRecNo = {
    e: "value",
    fn: function (context, source) {
        return context.getRecNo(source);
    },
    p: [],
    r: "number",
};
var func_object = {
    Parent: funcObjectParent,
    RecNo: funcObjectRecNo,
};

// 多语言处理
// ----------
var Locale = (function () {
    function Locale() {
        this.localeName = "zh-cn";
        this.locales = {};
        this.functions = {};
    }
    // 定义多语言
    Locale.prototype.defineLocale = function (name, config) {
        if (config !== null) {
            this.locales[name] = merger(this.locales[name] || {}, config);
        }
        else {
            delete this.locales[name];
        }
        return;
    };
    // 获取多语言
    Locale.prototype.getLocale = function (name) {
        return this.locales[name || this.localeName];
    };
    // 定义函数描述
    Locale.prototype.defineFunction = function (name, config) {
        if (config !== null) {
            this.functions[name] = merger(this.functions[name] || {}, config);
        }
        else {
            delete this.functions[name];
        }
        return;
    };
    // 获取函数描述
    Locale.prototype.getFunction = function (name) {
        return this.functions[name || this.localeName];
    };
    return Locale;
}());
var locale = new Locale();

// 字符串函数
// ----------
// 转换字符串类型为字符串
var funcStringToString = {
    fn: function (context, source) {
        return context.genValue(source.toValue() + "");
    },
    p: [],
    r: "string",
};
// 转换字符串类型为数字
var funcStringToNumber = {
    fn: function (context, source) {
        var n = Number(source.toValue());
        return isNaN(n) ?
            context.genErrorValue(format(locale.getLocale().MSG_EF_STR_TO_NUM, source.toValue())) :
            context.genValue(n);
    },
    p: [],
    r: "number",
};
// 转换字符串类型为日期时间
var funcStringToDate = {
    fn: function (context, source, fmt) {
        fmt = fmt || "";
        var s = source.toValue();
        var m = moment(s, fmt);
        return m.isValid() ?
            context.genValue(m.toDate()) :
            context.genErrorValue(format(locale.getLocale().MSG_EF_STR_TO_NUM, s, fmt));
    },
    p: ["string?"],
    r: "date",
};
// 获取字符串长度
var funcStringLength = {
    fn: function (context, source) {
        var value = source.toValue();
        return context.genValue(isString(value) ? value.length : null);
    },
    p: [],
    r: "number",
};
// 转换字符串为大写
var funcStringUpper = {
    fn: function (context, source) {
        var value = source.toValue();
        return context.genValue(isString(value) ? value.toUpperCase() : null);
    },
    p: [],
    r: "string",
};
// 转换字符串为小写
var funcStringLower = {
    fn: function (context, source) {
        var value = source.toValue();
        return context.genValue(isString(value) ? value.toLowerCase() : null);
    },
    p: [],
    r: "string",
};
// 去除字符串两端空格
var funcStringTrim = {
    fn: function (context, source) {
        var value = source.toValue();
        return context.genValue(isString(value) ? value.trim() : null);
    },
    p: [],
    r: "string",
};
// 去除字符串左端空格
var funcStringTrimLeft = {
    fn: function (context, source) {
        var value = source.toValue();
        return context.genValue(isString(value) ? value.replace(/^\s+/g, "") : null);
    },
    p: [],
    r: "string",
};
// 去除字符串右端空格
var funcStringTrimRight = {
    fn: function (context, source) {
        var value = source.toValue();
        return context.genValue(isString(value) ? value.replace(/\s+$/g, "") : null);
    },
    p: [],
    r: "string",
};
// 获取字符串的子字符串，指定开始位置和长度
var funcStringSubString = {
    fn: function (context, source, start, len) {
        var value = source.toValue();
        var left = start >= 0 ? start : value.toString().length + start;
        var right = left + len;
        if (left > right) {
            right = left;
        }
        return context.genValue(isString(value) && isNumber(start) && isNumber(len) ?
            value.substring(left, right) : null);
    },
    p: ["number", "number"],
    r: "string",
};
// 获取字符串的左子字符串，指定长度
var funcStringLeftString = {
    fn: function (context, source, len) {
        var value = source.toValue();
        return context.genValue(isString(value) && isNumber(len) ? value.substring(0, len) : null);
    },
    p: ["number"],
    r: "string",
};
// 获取字符串的右子字符串，指定长度
var funcStringRightString = {
    fn: function (context, source, len) {
        var value = source.toValue();
        return context.genValue(isString(value) && isNumber(len) ?
            value.substring(value.length - len, value.length) : null);
    },
    p: ["number"],
    r: "string",
};
// 检索字符串，获取子字符串在字符串中的起始位置
var funcStringPos = {
    fn: function (context, source, subValue) {
        var value = source.toValue();
        return context.genValue(isString(value) && isString(subValue) ?
            value.indexOf(subValue) : null);
    },
    p: ["string"],
    r: "number",
};
// 字符串替换
var funcStringReplace = {
    fn: function (context, source, srcStr, desStr, model) {
        var r;
        var t;
        if (model === undefined) {
            model = "g";
        }
        var value = source.toValue();
        var index = 0;
        var length = srcStr.length;
        if (/^m?g?i?$/.test(model)) {
            if (/g/.test(model)) {
                if (/i/.test(model)) {
                    index = value.toUpperCase().indexOf(srcStr.toUpperCase(), index);
                    while (index !== -1) {
                        t = value.split("");
                        var param = [index, length];
                        param = param.concat(desStr.split(""));
                        Array.prototype.splice.apply(t, param);
                        value = t.join("");
                        index = value.toUpperCase().indexOf(srcStr.toUpperCase(), index);
                    }
                }
                else {
                    index = value.indexOf(srcStr, index);
                    while (index !== -1) {
                        t = value.split("");
                        var param = [index, length];
                        param = param.concat(desStr.split(""));
                        Array.prototype.splice.apply(t, param);
                        value = t.join("");
                        index = value.indexOf(srcStr, index);
                    }
                }
            }
            else {
                if (/i/.test(model)) {
                    index = value.toUpperCase().indexOf(srcStr.toUpperCase(), index);
                    if (index !== -1) {
                        t = value.split("");
                        var param = [index, length];
                        param = param.concat(desStr.split(""));
                        Array.prototype.splice.apply(t, param);
                        value = t.join("");
                    }
                }
                else {
                    value = value.replace(srcStr, desStr);
                }
            }
        }
        else {
            r = context.genErrorValue(format(locale.getLocale().MSG_EF_MODEL, model));
        }
        if (!r) {
            r = context.genValue(value);
        }
        return r;
    },
    p: ["string", "string", "string?"],
    r: "string",
};
// 正则替换
var funcStringReplaceReg = {
    fn: function (context, source, srcStr, desStr, model) {
        var r;
        if (model === undefined) {
            model = "g";
        }
        var value = source.toValue();
        var regexp;
        try {
            regexp = new RegExp(srcStr, model);
        }
        catch (e) {
            r = context.genErrorValue(format(locale.getLocale().MSG_EF_MODEL, model));
        }
        value = value.replace(regexp, desStr);
        if (!r) {
            r = context.genValue(value);
        }
        return r;
    },
    p: ["string", "string", "string?"],
    r: "string",
};
var func_string = {
    LeftString: funcStringLeftString,
    Length: funcStringLength,
    Lower: funcStringLower,
    Pos: funcStringPos,
    Replace: funcStringReplace,
    ReplaceReg: funcStringReplaceReg,
    RightString: funcStringRightString,
    SubString: funcStringSubString,
    ToDate: funcStringToDate,
    ToNumber: funcStringToNumber,
    ToString: funcStringToString,
    Trim: funcStringTrim,
    TrimLeft: funcStringTrimLeft,
    TrimRight: funcStringTrimRight,
    Upper: funcStringUpper,
};

var func = {
    _: func__,
    array: func_array,
    boolean: func_boolean,
    date: func_date,
    number: func_number,
    object: func_object,
    string: func_string,
};

// 词法分析器
// ----------
var Lexer = (function () {
    function Lexer() {
        this.expr = []; // 表达式字符数组
        this.index = 0; // 当前索引位置
    }
    // 设置表达式
    Lexer.prototype.setExpr = function (expr) {
        this.expr = expr ? expr.split("") : [];
        this.reset();
        return this;
    };
    // 重置词法分析器，以便再次从头开始解析
    Lexer.prototype.reset = function () {
        this.index = 0;
        return this;
    };
    // 下一个Token结点
    Lexer.prototype.nextToken = function () {
        var s = this.expr;
        var n = this.index;
        var hasWrong = false;
        var token;
        while (n < s.length) {
            if (s[n] !== " ") {
                break;
            }
            else {
                n++;
            }
        }
        var tValue = "";
        var tType = "";
        var tText = "";
        var tIndex = n + 1;
        if (n < s.length) {
            switch (s[n]) {
                case "[":
                case "]":
                case "{":
                case "}":
                case ".":
                case "(":
                case ")":
                case "*":
                case "/":
                case "%":
                case "+":
                case "-":
                case ":":
                case ",":
                    tText = tValue = s[n++];
                    tType =
                        tValue === "[" ? "TK_LA" :
                            tValue === "]" ? "TK_RA" :
                                tValue === "{" ? "TK_LO" :
                                    tValue === "}" ? "TK_RO" :
                                        tValue === "." ? "TK_DOT" :
                                            tValue === "(" ? "TK_LP" :
                                                tValue === ")" ? "TK_RP" :
                                                    tValue === "*" ? "TK_MULTI" :
                                                        tValue === "/" ? "TK_DIV" :
                                                            tValue === "%" ? "TK_MOD" :
                                                                tValue === "+" ? "TK_PLUS" :
                                                                    tValue === "-" ? "TK_MINUS" :
                                                                        tValue === ":" ? "TK_COLON" :
                                                                            tValue === "," ? "TK_COMMA" :
                                                                                "";
                    break;
                case "!":
                    tValue = s[n++];
                    if (n < s.length && s[n] === "=") {
                        tValue += s[n++];
                        tType = "TK_CO";
                    }
                    else {
                        tType = "TK_NOT";
                    }
                    tText = tValue;
                    break;
                case ">":
                case "<":
                    tValue = s[n++];
                    if (n < s.length && s[n] === "=") {
                        tValue += s[n++];
                    }
                    tText = tValue;
                    tType = "TK_CO";
                    break;
                case "=":
                case "&":
                case "|":
                    tValue = s[n++];
                    if (n < s.length && s[n] === tValue) {
                        tType =
                            tValue === "&" ? "TK_AND" :
                                tValue === "|" ? "TK_OR" :
                                    "TK_CO";
                        tValue += s[n++];
                    }
                    else {
                        tType = "TK_UNKNOWN";
                    }
                    tText = tValue;
                    break;
                case "'":
                case "\"":
                    var start = s[n];
                    var v = [];
                    var endFlag = false;
                    tValue += s[n++];
                    while (!hasWrong && n < s.length) {
                        if (s[n] === "\\") {
                            switch (s[n + 1]) {
                                case "\\":
                                    n++;
                                    v.push("\\");
                                    break;
                                case "n":
                                    n++;
                                    v.push("\n");
                                    break;
                                case "\'":
                                    n++;
                                    v.push("\'");
                                    break;
                                case "\"":
                                    n++;
                                    v.push("\"");
                                    break;
                                case "t":
                                    n++;
                                    v.push("\t");
                                    break;
                                case "b":
                                    n++;
                                    v.push("\b");
                                    break;
                                case "r":
                                    n++;
                                    v.push("\r");
                                    break;
                                case "f":
                                    n++;
                                    v.push("\f");
                                    break;
                                case "u":
                                    var strU = s.join("").substring(n + 2, n + 6);
                                    if (isX(s[n + 2]) && isX(s[n + 3]) && isX(s[n + 4]) && isX(s[n + 5])) {
                                        v.push(String.fromCharCode(parseInt(strU, 16)));
                                        n += 5;
                                    }
                                    else {
                                        hasWrong = true;
                                        token = {
                                            tokenErrorMsg: format(locale.getLocale().MSG_EL_SYNTAX_UC, "\\u" + strU),
                                            tokenIndex: n,
                                            tokenType: "TK_STRING",
                                        };
                                    }
                                    break;
                                case "x":
                                    var strX = s.join("").substring(n + 2, n + 4);
                                    if (isX(s[n + 2]) && isX(s[n + 3])) {
                                        v.push(String.fromCharCode(parseInt(strX, 16)));
                                        n += 3;
                                    }
                                    else {
                                        hasWrong = true;
                                        token = {
                                            tokenErrorMsg: format(locale.getLocale().MSG_EL_SYNTAX_XN, "\\x" + strX),
                                            tokenIndex: n,
                                            tokenType: "TK_STRING",
                                        };
                                    }
                                    break;
                                case "0":
                                case "1":
                                case "2":
                                case "3":
                                case "4":
                                case "5":
                                case "6":
                                case "7":
                                    var strN = s.join("").substring(n + 1, n + 4);
                                    if (isO(s[n + 1]) && isO(s[n + 2]) && isO(s[n + 3])) {
                                        v.push(String.fromCharCode(parseInt(strN, 8)));
                                        n += 3;
                                    }
                                    else {
                                        hasWrong = true;
                                        token = {
                                            tokenErrorMsg: format(locale.getLocale().MSG_EL_SYNTAX_ON, "\\" + strN),
                                            tokenIndex: n,
                                            tokenType: "TK_STRING",
                                        };
                                    }
                                    break;
                                default:
                                    n++;
                                    v.push(s[n]);
                                    break;
                            }
                        }
                        else if (s[n] === start) {
                            endFlag = true;
                            break;
                        }
                        else {
                            v.push(s[n]);
                        }
                        n++;
                    }
                    if (!hasWrong) {
                        if (endFlag === true) {
                            tValue += v.join("") + start;
                        }
                        else {
                            hasWrong = true;
                            token = {
                                tokenErrorMsg: format(locale.getLocale().MSG_EL_SYNTAX_S, tValue + v.join("")),
                                tokenIndex: n,
                                tokenType: "TK_STRING",
                            };
                            break;
                        }
                        n++;
                        tText = tValue;
                        tValue = v.join("");
                        tType = "TK_STRING";
                    }
                    break;
                default:
                    tValue = s[n++];
                    if (isN(tValue)) {
                        while (n < s.length) {
                            if (!isN(s[n]) || (s[n] === "." && !isN(s[n + 1]))) {
                                break;
                            }
                            tValue += s[n++];
                        }
                        tType = isNS(tValue) ? "TK_NUMBER" : "TK_UNKNOWN";
                    }
                    else if (isC(tValue)) {
                        while (n < s.length) {
                            if (!isC(s[n])) {
                                break;
                            }
                            tValue += s[n++];
                        }
                        switch (tValue) {
                            case "true":
                            case "false":
                                tType = "TK_BOOL";
                                break;
                            case "null":
                                tType = "TK_NULL";
                                break;
                            default:
                                tType = "TK_IDEN";
                        }
                    }
                    else {
                        while (n < s.length) {
                            if (!isUN(s[n])) {
                                break;
                            }
                            tValue += s[n++];
                        }
                        tType = "TK_UNKNOWN";
                    }
                    tText = tValue;
            }
        }
        else {
            return null;
        }
        if (tType === "TK_PLUS" || tType === "TK_MINUS") {
            var j = n - tText.length - 1;
            while (j >= 0) {
                if ("({[+-*/%><=&|:,".indexOf(s[j]) >= 0) {
                    tType = "TK_UNARY";
                    break;
                }
                else if (s[j] !== " ") {
                    break;
                }
                j--;
            }
            if (j === -1) {
                tType = "TK_UNARY";
            }
        }
        this.index = n;
        if (!hasWrong) {
            token = {
                tokenIndex: tIndex,
                tokenText: tText,
                tokenType: tType,
                tokenValue: tValue,
            };
        }
        return token;
    };
    return Lexer;
}());

// 语法规则
// ----------
// 节点类型
var tokens = ("TK_UNKNOWN,TK_STRING,TK_NUMBER,TK_BOOL,TK_NULL,TK_IDEN,TK_DOT,TK_LP,TK_LA," +
    "TK_LO,TK_RP,TK_RA,TK_RO,TK_UNARY,TK_NOT,TK_MULTI,TK_DIV,TK_MOD,TK_PLUS,TK_MINUS," +
    "TK_CO,TK_AND,TK_OR,TK_COLON,TK_COMMA").split(",");
var genTokenState = function (tks, opts) {
    var r = {};
    tks.forEach(function (v, i) { return r[v] = opts[i] === "1"; });
    return r;
};
// 起始节点规则
var RULE_BTOKENS = genTokenState(tokens, "0111110111000110000000000".split(""));
// 结束节点规则
var RULE_ETOKENS = genTokenState(tokens, "0111110000111000000000000".split(""));
// 后序节点规则
var RULE_LEXICAL = (function (tks, opts) {
    var r = {};
    tks.forEach(function (v, i) { return r[v] = genTokenState(tks, opts[i].split("")); });
    return r;
})(tokens, ("0000000000000000000000000," +
    "0000001010111001111111111," +
    "0000001000111001111111111," +
    "0000001000111001111111111," +
    "0000000000111001111111111," +
    "0000001110111001111111111," +
    "0000010000000000000000000," +
    "0111110111100110000000000," +
    "0111110111010110000000000," +
    "0111110000001000000000000," +
    "0000001010111001111111101," +
    "0000001010111001111111101," +
    "0000001011111001111111101," +
    "0111110111000110000000000," +
    "0111110111000110000000000," +
    "0111110111000110000000000," +
    "0111110111000110000000000," +
    "0111110111000110000000000," +
    "0111110111000110000000000," +
    "0111110111000110000000000," +
    "0111110111000110000000000," +
    "0111110111000110000000000," +
    "0111110111000110000000000," +
    "0111110111000110000000000," +
    "0111110111000110000000000"
).split(","));

// 语法解析器
// ----------
var Parser = (function () {
    function Parser() {
        this.tokens = [];
        this.rootToken = null;
        this.errorMsg = "";
        this.lexer = new Lexer();
    }
    // 表达式解析
    Parser.prototype.parser = function (expr) {
        // - 初始化
        this.doInit(expr);
        // - 构建Token双向链表
        if (this.errorMsg === "") {
            this.errorMsg = this.doDoublyLinkedList();
        }
        // - 构建语法树，返回根节点
        if (this.errorMsg === "") {
            this.rootToken = this.doParser(this.tokens);
        }
        // - 检查语法错误
        if (this.errorMsg === "" && this.rootToken) {
            this.errorMsg = this.doCheckSyntax(this.rootToken);
        }
        // - 返回自己
        return this;
    };
    // 初始化语法分析器对象，清空rootToken，tokens和errorMsg
    Parser.prototype.doInit = function (expr) {
        if (!expr) {
            this.errorMsg = locale.getLocale().MSG_EP_EMPTY;
        }
        else {
            this.rootToken = null;
            this.tokens = [];
            this.errorMsg = "";
            this.lexer.setExpr(expr);
        }
    };
    // 创建虚节点
    Parser.prototype.doCreateVirtualToken = function (type) {
        var v;
        switch (type) {
            case "VTK_COMMA":
                v = ",";
                break;
            case "VTK_PAREN":
                v = "()";
                break;
            case "VTK_ARRAY":
                v = "[]";
                break;
            case "VTK_OBJECT":
                v = "{}";
                break;
            case "VTK_SUBSCRIPT":
                v = "[n]";
                break;
            case "VTK_FUNCTION":
                v = "Fn()";
                break;
            default:
                v = "";
        }
        return {
            childs: [],
            parent: null,
            tokenText: v,
            tokenType: type,
            tokenValue: v,
        };
    };
    // 将表达式构建成Token双向链表
    Parser.prototype.doDoublyLinkedList = function () {
        var t = this.lexer.nextToken();
        var ts = this.tokens;
        var stack = [];
        var r = "";
        while (!r && t) {
            if (t.tokenType === "TK_UNKNOWN") {
                r = format(locale.getLocale().MSG_EP_UNKNOWN, t.tokenText);
                break;
            }
            else if (t.tokenType === "TK_STRING") {
                if (t.tokenErrorMsg) {
                    r = t.tokenErrorMsg;
                    break;
                }
            }
            t.parent = null;
            t.childs = [];
            this.tokens.push(t);
            // - 检查前后依赖关系正确性
            if (ts.length === 1 && !RULE_BTOKENS[t.tokenType]) {
                r = format(locale.getLocale().MSG_EP_LEXICAL_B, t.tokenText);
                break;
            }
            else if (ts.length !== 1 && !RULE_LEXICAL[ts[ts.length - 2].tokenType][t.tokenType]) {
               
                r = format(locale.getLocale().MSG_EP_LEXICAL_L, ts[ts.length - 2].tokenText, t.tokenText);
                break;
            }
            // - 检查括号匹配正确性
            switch (t.tokenType) {
                case "TK_LP":
                case "TK_LA":
                case "TK_LO":
                    stack.push(t);
                    break;
                case "TK_RP":
                case "TK_RA":
                case "TK_RO":
                    if (stack.length) {
                        if (t.tokenType.replace("R", "L") === stack[stack.length - 1].tokenType) {
                            stack.pop();
                        }
                        else {
                            r = format(locale.getLocale().MSG_EP_MATCH, stack[stack.length - 1].tokenText);
                        }
                    }
                    else {
                        r = format(locale.getLocale().MSG_EP_MATCH, t.tokenText);
                    }
                    break;
                default:
                    break;
            }
            t = this.lexer.nextToken();
        }
        if (!r && !RULE_ETOKENS[ts[ts.length - 1].tokenType]) {
            r = format(locale.getLocale().MSG_EP_LEXICAL_E, ts[ts.length - 1].tokenText);
        }
        if (!r && stack.length) {
            r = format(locale.getLocale().MSG_EP_MATCH, stack[stack.length - 1].tokenText);
        }
        return r;
    };
    // 构建语法树，返回根节点
    Parser.prototype.doParser = function (ts) {
        var p = null;
        if (ts && !ts.length) {
            return p;
        }
        // - 处理 ()[]{} 括号节点
        p = this.doParser_0(ts);
        // - 处理能构成 function 的节点
        p = this.doParser_1(p);
        // - 处理 . [] 节点构成的子项调用
        p = this.doParser_2(p);
        // - 处理 + - ! 单目运算节点
        p = this.doParser_3(p);
        // - 处理 * / % 四则运算
        p = this.doParser_4(p, "TK_MULTI,TK_DIV,TK_MOD");
        // - 处理 + - 四则运算
        p = this.doParser_4(p, "TK_PLUS,TK_MINUS");
        // - 处理 < <= > >= == != 比较运算符
        p = this.doParser_4(p, "TK_CO,TK_EO");
        // - 处理 && 与运算
        p = this.doParser_4(p, "TK_AND");
        // - 处理 || 或运算
        p = this.doParser_4(p, "TK_OR");
        // - 处理 : 冒号
        p = this.doParser_4(p, "TK_COLON");
        // - 处理 , 逗号
        p = this.doParser_5(p);
        if (p.length > 1) {
            this.errorMsg = "语法解析错误";
        }
        return p[0];
    };
    // 检查语法错误
    Parser.prototype.doCheckSyntax = function (rootToken) {
        var msg = "";
        var s;
        var id = 0;
        eachToken(this.rootToken, function (t) {
            t.id = id++;
            s = t.tokenText;
            switch (t.tokenType) {
                // - 点操作符检查
                case "TK_DOT":
                    if (t.childs[1].tokenType === "TK_IDEN" &&
                        !hasToken("VTK_FUNCTION,TK_IDEN,TK_DOT,VTK_SUBSCRIPT,VTK_PAREN,VTK_OBJECT", t.childs[0].tokenType)) {
                        msg = format(locale.getLocale().MSG_EP_SYNTAX_D, t.childs[0].tokenType);
                    }
                    break;
                // - 冒号操作符检查
                case "TK_COLON":
                    if (!t.parent || !hasToken("VTK_OBJECT,VTK_COMMA", t.parent.tokenType)) {
                        msg = format(locale.getLocale().MSG_EP_SYNTAX_P, s);
                    }
                    else if (t.childs && t.childs[0] && t.childs[0].childs &&
                        t.childs[0].childs.length > 0) {
                        msg = format(locale.getLocale().MSG_EP_SYNTAX_E, s);
                    }
                    break;
                // - 逗号操作符检查
                case "VTK_COMMA":
                    if (!t.parent || !hasToken("VTK_OBJECT,VTK_ARRAY,VTK_PAREN", t.parent.tokenType)) {
                        msg = format(locale.getLocale().MSG_EP_SYNTAX_C, s);
                    }
                    break;
                // - 小括号检查
                case "VTK_PAREN":
                    if (t.parent && t.parent.tokenType !== "TK_IDEN" || !t.parent) {
                        if (t.childs.length === 0) {
                            msg = format(locale.getLocale().MSG_EP_SYNTAX_N, s);
                        }
                        else if (t.childs[0].tokenType === "VTK_COMMA") {
                            msg = format(locale.getLocale().MSG_EP_SYNTAX_M, s);
                        }
                    }
                    break;
                // - 中括号检查
                case "VTK_ARRAY":
                    if (t.childs && t.childs.length > 0) {
                        if (t.childs[0] === "TK_COLON") {
                            msg = format(locale.getLocale().MSG_EP_SYNTAX_A, ":");
                        }
                        else if (t.childs[0].tokenType === "VTK_COMMA") {
                            if (t.parent && t.parent.tokenType === "VTK_SUBSCRIPT" &&
                                t.parent.childs[0] !== t) {
                                msg = format(locale.getLocale().MSG_EP_SYNTAX_SUB, ",");
                            }
                            if (t.childs[0].childs) {
                                for (var _i = 0, _a = t.childs[0].childs; _i < _a.length; _i++) {
                                    var item = _a[_i];
                                    if (item.tokenType === "TK_COLON") {
                                        msg = format(locale.getLocale().MSG_EP_SYNTAX_A, ":");
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    break;
                // - 大括号检查
                case "VTK_OBJECT":
                    var y = false;
                    if (t.childs && (t.childs.length === 0 || hasToken("TK_COLON,VTK_COMMA", t.childs[0].tokenType))) {
                        if (t.childs.length > 0 && t.childs[0].tokenType === "VTK_COMMA") {
                            if (t.childs[0].childs) {
                                for (var _b = 0, _c = t.childs[0].childs; _b < _c.length; _b++) {
                                    var item = _c[_b];
                                    y = item.tokenType === "TK_COLON";
                                    if (!y) {
                                        break;
                                    }
                                }
                            }
                        }
                        else {
                            y = true;
                        }
                    }
                    if (!y) {
                        msg = locale.getLocale().MSG_EP_SYNTAX_O;
                    }
                    break;
                default:
                    break;
            }
            if (msg !== "") {
                return false;
            }
        }, this);
        return msg;
    };
    // () [] {}，将括号中的多个token拿出来计算并生成虚Token插入到原来的Token数组中
    Parser.prototype.doParser_0 = function (ts) {
        var t;
        var l = [];
        var counter = 0;
        var queue = [];
        var i = 0;
        while (i < ts.length) {
            t = ts[i];
            if (hasToken("TK_LP,TK_LA,TK_LO", t.tokenType)) {
                counter++;
            }
            else if (hasToken("TK_RP,TK_RA,TK_RO", t.tokenType)) {
                counter--;
            }
            if (counter > 0) {
                queue.push(t);
            }
            else if (queue.length > 0) {
                var root = queue.shift();
                var rootType = void 0;
                switch (root.tokenType) {
                    case "TK_LP":
                        rootType = "VTK_PAREN";
                        break;
                    case "TK_LA":
                        rootType = "VTK_ARRAY";
                        break;
                    case "TK_LO":
                        rootType = "VTK_OBJECT";
                        break;
                    default: break;
                }
                t = this.doCreateVirtualToken(rootType);
                t.tokenIndex = root.tokenIndex;
                var tmp = this.doParser(queue);
                if (tmp) {
                    t.childs.push(tmp);
                    tmp.parent = t;
                }
                l.push(t);
                queue = [];
            }
            else {
                l.push(t);
            }
            i++;
        }
        return l;
    };
    // 标识符与()相连构成函数
    Parser.prototype.doParser_1 = function (ts) {
        var t;
        var n;
        var l = [];
        var i = 0;
        while (i < ts.length) {
            t = ts[i];
            n = ts[i + 1];
           
            if (t.tokenType === "TK_IDEN" && n && n.tokenType === "VTK_PAREN") {
                var tmp = this.doCreateVirtualToken("VTK_FUNCTION");
                tmp.tokenIndex = t.tokenIndex;
                tmp.childs.push(t);
                t.parent = tmp;
                tmp.childs.push(n);
                n.parent = t;
                i++;
                l.push(tmp);
            }
            else {
                l.push(t);
            }
            i++;
        }
        return l;
    };
    // 处理 . [] 与标识符、string、()、[]、{}一起构成下标访问属性访问
    Parser.prototype.doParser_2 = function (ts) {
        var t;
        var n;
        var l = [];
        var i = 0;
        while (i < ts.length) {
            t = ts[i];
            n = ts[i + 1];
            if (n && (n.tokenType === "TK_DOT" || n.tokenType === "VTK_ARRAY" && hasToken("TK_IDEN,TK_STRING,VTK_PAREN,VTK_FUNCTION,VTK_ARRAY,VTK_OBJECT", t.tokenType))) {
                do {
                    switch (n.tokenType) {
                        case "TK_DOT":
                            n.childs.push(t);
                            t.parent = n;
                            i += 2;
                            t = ts[i];
                            n.childs.push(t);
                            t.parent = n;
                            t = n;
                            n = ts[i + 1];
                            break;
                        case "VTK_ARRAY":
                            var tmp = this.doCreateVirtualToken("VTK_SUBSCRIPT");
                            tmp.childs.push(t);
                            t.parent = tmp;
                            tmp.childs.push(n);
                            n.parent = tmp;
                            t = tmp;
                            i++;
                            n = ts[i + 1];
                            break;
                        default:
                            break;
                    }
                } while (n && (n.tokenType === "TK_DOT" || n.tokenType === "VTK_ARRAY"));
                l.push(t);
            }
            else {
                l.push(t);
            }
            i++;
        }
        return l;
    };
    // 处理 + - ! 单目运算
    Parser.prototype.doParser_3 = function (ts) {
        var t;
        var l = [];
        var i = 0;
        while (i < ts.length) {
            t = ts[i];
            if (hasToken("TK_UNARY,TK_NOT", t.tokenType)) {
                l.push(t);
                do {
                    var tmp = ts[++i];
                    t.childs.push(tmp);
                    tmp.parent = t;
                    t = ts[i];
                } while (hasToken("TK_UNARY,TK_NOT", t.tokenType));
            }
            else {
                l.push(t);
            }
            i++;
        }
        return l;
    };
    // 处理 1.* / % 2.+ - 3.< <= > >= == != 4.&& 5.|| 6.: 优先级
    Parser.prototype.doParser_4 = function (ts, tts) {
        var t;
        var n;
        var l = [];
        var i = 0;
        while (i < ts.length) {
            t = ts[i];
            n = ts[i + 1];
            if (n && hasToken(tts, n.tokenType)) {
                var tmp = void 0;
                do {
                    n.childs.push(t);
                    t.parent = n;
                    tmp = n;
                    i += 2;
                    t = ts[i];
                    n = ts[i + 1];
                    tmp.childs.push(t);
                    t.parent = tmp;
                    if (n && hasToken(tts, n.tokenType)) {
                        t = tmp;
                    }
                    else {
                        break;
                    }
                } while (true);
                l.push(tmp);
            }
            else {
                l.push(t);
            }
            i++;
        }
        return l;
    };
    // 处理 , 即对象字段分隔{a:1,b:'re'}或数组元素[1,2,3]，函数参数分隔符fun(a,b)
    Parser.prototype.doParser_5 = function (ts) {
        var t;
        var n;
        var l = [];
        var i = 0;
        while (i < ts.length) {
            t = ts[i];
            n = ts[i + 1];
            if (n && n.tokenType === "TK_COMMA") {
                var tmp = this.doCreateVirtualToken("VTK_COMMA");
                tmp.tokenIndex = n.tokenIndex;
                while (n && n.tokenType === "TK_COMMA") {
                    tmp.childs.push(t);
                    t.parent = tmp;
                    i += 2;
                    t = ts[i];
                    n = ts[i + 1];
                }
                tmp.childs.push(t);
                t.parent = tmp;
                l.push(tmp);
            }
            else {
                l.push(t);
            }
            i++;
        }
        return l;
    };
    return Parser;
}());

// 类型
// ----------
var Type = (function () {
    // 类型构造函数
    function Type(context, type, info, data, entity, depends, errorMsg) {
        this.context = context;
        this.type = type || "undefined";
        this.info = info || type;
        this.data = data;
        this.entity = entity || null;
        this.depends = depends || null;
        this.errorMsg = errorMsg || "";
    }
    // 生成类型对象
    Type.prototype.genType = function (type, info, data, entity, depends, errorMsg) {
        return new Type(this.context, type, info, data, entity, depends, errorMsg);
    };
    // 生成错误类型对象
    Type.prototype.genErrorType = function (errorMsg) {
        return this.genType(undefined, undefined, undefined, undefined, undefined, errorMsg);
    };
    // 该类型对象是否包含了数据
    Type.prototype.hasData = function () {
        return this.data !== undefined;
    };
    // 得到类型值
    Type.prototype.toValue = function () {
        return this.type;
    };
    // 追加数组元素
    Type.prototype.arrayPush = function (et) {
        if (this.type === "array") {
            this.info.push(et.info);
            this.data.push(et.data);
        }
        return this;
    };
    // 连接数组元素
    Type.prototype.arrayConcat = function (et) {
        if (this.type === "array" && et.type === "array") {
            this.info = this.info.concat(et.info);
            this.data = this.data.concat(et.data);
        }
        return this;
    };
    // 设置对象属性
    Type.prototype.objectSetProperty = function (et) {
        if (this.type === "object") {
            var h = et.info;
            this.info[h.key] = h.value;
            var d = et.data;
            this.data[d.key] = d.value;
        }
        return this;
    };
    // 批量设置对象属性
    Type.prototype.objectSetProperties = function (et) {
        if (this.type === "object" && et.type === "array") {
            for (var _i = 0, _a = et.info; _i < _a.length; _i++) {
                var item = _a[_i];
                this.info[item.key] = item.value;
            }
            for (var _b = 0, _c = et.data; _b < _c.length; _b++) {
                var item = _c[_b];
                this.data[item.key] = item.value;
            }
        }
        return this;
    };
    // 取正/负值
    Type.prototype.negative = function (op) {
        var t;
        if (this.type === "null" || this.type === "undefined" || this.type === "number") {
            t = this.genType("number");
        }
        else {
            t = op === "-" ? locale.getLocale().MSG_EX_NEGATIVE : locale.getLocale().MSG_EX_POSITIVE;
            t = this.genErrorType(format(t, this.type));
        }
        return t;
    };
    // 非运算
    Type.prototype.not = function () {
        return this.genType("boolean");
    };
    // 乘法
    Type.prototype.multiply = function (et) {
        return (this.type === "null" && et.type === "null") ? this.genType("null") :
            ((this.type === "number" || this.type === "null" || this.type === "undefined") &&
                (et.type === "number" || et.type === "null" || et.type === "undefined")) ? this.genType("number") :
                this.genErrorType(format(locale.getLocale().MSG_EX_MULTIPLY, this.type, et.type));
    };
    // 除法
    Type.prototype.divide = function (et) {
        var t;
        if (this.type === "null" && et.type === "null") {
            t = this.genType("null");
        }
        else if ((this.type === "number" || this.type === "null" || this.type === "undefined") &&
            (et.type === "number" || et.type === "undefined")) {
            t = (et.hasData() && (et.data === "null" || et.type === "number" && Number(et.data) === 0)) ?
                this.genErrorType(format(locale.getLocale().MSG_EX_DIVIDE_N, et.info)) :
                this.genType("number");
        }
        else {
            t = this.genErrorType(format(locale.getLocale().MSG_EX_DIVIDE, this.type, et.type));
        }
        return t;
    };
    // 求余
    Type.prototype.remainder = function (et) {
        var t;
        if (this.type === "null" && et.type === "null") {
            t = this.genType("null");
        }
        else if ((this.type === "number" || this.type === "null" || this.type === "undefined") &&
            (et.type === "number" || et.type === "undefined")) {
            t = (et.hasData() && (et.data === "null" || et.type === "number" && Number(et.data) === 0)) ?
                this.genErrorType(format(locale.getLocale().MSG_EX_REMAINDER_N, et.info)) :
                this.genType("number");
        }
        else {
            t = this.genErrorType(format(locale.getLocale().MSG_EX_REMAINDER, this.type, et.type));
        }
        return t;
    };
    // 加法
    Type.prototype.add = function (et) {
        return (this.type === "undefined" && et.type === "undefined") ? this.genType("undefined") :
            (this.type === "null" && et.type === "null") ? this.genType("null") :
                ((this.type === "number" || this.type === "null" || this.type === "undefined") &&
                    (et.type === "number" || et.type === "null" || et.type === "undefined")) ? this.genType("number") :
                    ((this.type === "string" || this.type === "number" || this.type === "null" ||
                        this.type === "undefined") && (et.type === "string" || et.type === "number" ||
                        et.type === "null" || et.type === "undefined")) ? this.genType("string") :
                        ((this.type === "array" || this.type === "null" || this.type === "undefined") &&
                            (et.type === "array" || et.type === "null" ||
                                et.type === "undefined")) ? this.genType("array") :
                            this.genErrorType(format(locale.getLocale().MSG_EX_ADD, this.type, et.type));
    };
    // 减法
    Type.prototype.subtract = function (et) {
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
    };
    // 等于
    Type.prototype.equal = function (et, op) {
        var t;
        var b = op === "==";
        if (this.type === "undefined" || et.type === "undefined" || this.type === "null" || et.type === "null" ||
            this.type === et.type) {
            t = this.genType("boolean");
        }
        else {
            t = b ? locale.getLocale().MSG_EX_EQUAL : locale.getLocale().MSG_EX_EQUAL_N;
            t = this.genErrorType(format(t, this.type, et.type));
        }
        return t;
    };
    // 比较运算
    Type.prototype.compare = function (et, op) {
        if (op === "==" || op === "!=") {
            return this.equal(et, op);
        }
        else {
            var t = void 0;
            if (this.type === "undefined" || et.type === "undefined" || this.type === "null" || et.type === "null" ||
                (this.type === et.type && (et.type === "string" || et.type === "date" || et.type === "number"))) {
                t = this.genType("boolean");
            }
            else {
                switch (op) {
                    case ">":
                        t = locale.getLocale().MSG_EX_COMPARE_A;
                        break;
                    case "<":
                        t = locale.getLocale().MSG_EX_COMPARE_B;
                        break;
                    case ">=":
                        t = locale.getLocale().MSG_EX_COMPARE_C;
                        break;
                    case "<=":
                        t = locale.getLocale().MSG_EX_COMPARE_D;
                        break;
                    default: break;
                }
                t = this.genErrorType(format(t, this.type, et.type));
            }
            return t;
        }
    };
    // 与运算
    Type.prototype.and = function (et) {
        return (this.type === "undefined" || et.type === "undefined" || this.type === "null" || et.type === "null" ||
            (this.type === "boolean" && et.type === "boolean")) ?
            this.genType("boolean") :
            this.genErrorType(format(locale.getLocale().MSG_EX_AND, this.type, et.type));
    };
    // 或运算
    Type.prototype.or = function (et) {
        return (this.type === "undefined" || et.type === "undefined" || this.type === "null" || et.type === "null" ||
            (this.type === "boolean" && et.type === "boolean")) ?
            this.genType("boolean") :
            this.genErrorType(format(locale.getLocale().MSG_EX_OR, this.type, et.type));
    };
    // 下标运算
    Type.prototype.subscript = function (et) {
        var t;
        var i = (et.type === "array") ?
            et.info[0] :
            et.info;
        if (this.type === "string" || this.type === "array") {
            if (i === "number") {
                t = (this.type === "array" && this.entity) ?
                    this.context.getEntityType(this) :
                    (this.type === "string") ?
                        this.genType("string") :
                        this.genType("undefined");
            }
            else {
                t = this.genErrorType(format(locale.getLocale().MSG_EX_SUBSCRIPT_T, i));
            }
        }
        else if (this.type === "object") {
            t = this.genType("string", "string", i);
            t = t.getVariableType(this);
        }
        else {
            t = (this.type === "undefined") ?
                this.genType("undefined") :
                this.genErrorType(format(locale.getLocale().MSG_EX_SUBSCRIPT, this.type));
        }
        return t;
    };
    // 获取{key:...,value:...}键值对对象
    Type.prototype.hashItem = function (et) {
        return this.genType("object", { key: this.data, value: et.info }, { key: this.data, value: et.data });
    };
    // 获取变量值类型对象
    Type.prototype.getVariableType = function (et) {
        return this.context.getVariableType(this.data, et);
    };
    // 获取函数返回结果类型对象
    Type.prototype.getFunctionType = function (et) {
        return this.context.getFunctionType(this.info.key, et, this.info.value, this.data.value);
    };
    return Type;
}());

// 大数据值计算对象
var Big = function (v) {
    return new Decimal(v);
};
// 值
// ----------
var Value = (function () {
    // 值构造函数
    function Value(context, value, type, entity, errorMsg, parentObj) {
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
    Value.prototype.genValue = function (value, type, entity, errorMsg, parentObj) {
        return new Value(this.context, value, type, entity, errorMsg, parentObj);
    };
    // 生成错误值对象
    Value.prototype.genErrorValue = function (errorMsg) {
        return this.genValue(undefined, undefined, undefined, errorMsg, undefined);
    };
    // 得到值内容
    Value.prototype.toValue = function () {
        return this.type === "number" ? Number(this.value) : this.value;
    };
    // 是否为实体
    Value.prototype.isEntity = function () {
        return this.entity != null;
    };
    // 追加数组元素
    Value.prototype.arrayPush = function (ev) {
        if (this.type === "array") {
            ev = ev || this.genValue(null);
            this.toValue().push(ev.toValue());
        }
        return this;
    };
    // 连接数组元素
    Value.prototype.arrayConcat = function (ev) {
        if (this.type === "array" && ev.type === "array") {
            this.value = this.toValue().concat(ev.toValue());
        }
        return this;
    };
    // 设置对象属性
    Value.prototype.objectSetProperty = function (ev) {
        if (this.type === "object") {
            var h = ev.toValue();
            this.value[h.key] = h.value;
        }
        return this;
    };
    // 批量设置对象属性
    Value.prototype.objectSetProperties = function (ev) {
        if (this.type === "object" && ev.type === "array") {
            var h = ev.toValue();
            for (var _i = 0, h_1 = h; _i < h_1.length; _i++) {
                var item = h_1[_i];
                this.value[item.key] = item.value;
            }
        }
        return this;
    };
    // 取正/负值
    Value.prototype.negative = function (op) {
        var v;
        if (this.type === "null") {
            v = this.genValue("0", "number");
        }
        else if (this.type === "number") {
            v = op === "-" ? Big(this.value).times(Big(-1)).toString() : this.value;
            v = this.genValue(v, "number");
        }
        else {
            v = op === "-" ? locale.getLocale().MSG_EX_NEGATIVE : locale.getLocale().MSG_EX_POSITIVE;
            v = this.genErrorValue(format(v, this.type));
        }
        return v;
    };
    // 非运算
    Value.prototype.not = function () {
        return (this.type === "boolean") ?
            this.genValue(!this.value, "boolean") :
            (this.type === "string" && this.value === "" || this.type === "number" && this.value === "0"
                || this.type === "null") ?
                this.genValue(true, "boolean") :
                this.genValue(false, "boolean");
    };
    // 乘法
    Value.prototype.multiply = function (ev) {
        var v;
        if (this.type === "null" && ev.type === "null") {
            v = this.genValue(null, "null");
        }
        else if ((this.type === "number" || this.type === "null") && (ev.type === "number" || ev.type === "null")) {
            var vl = Big(this.value || "0");
            var vr = Big(ev.value || "0");
            v = this.genValue(vl.times(vr).toString(), "number");
        }
        else {
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_MULTIPLY, this.type, ev.type));
        }
        return v;
    };
    // 除法
    Value.prototype.divide = function (ev) {
        var v;
        if (this.type === "null" && ev.type === "null") {
            v = this.genValue(null, "null");
        }
        else if (ev.type === "null" || ev.type === "number" && ev.value === "0") {
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_DIVIDE_N, ev.value));
        }
        else if ((this.type === "number" || this.type === "null") && (ev.type === "number")) {
            var vl = Big(this.value || "0");
            var vr = Big(ev.value);
            v = this.genValue(vl.div(vr).toString(), "number");
        }
        else {
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_DIVIDE, this.type, ev.type));
        }
        return v;
    };
    // 求余
    Value.prototype.remainder = function (ev) {
        var v;
        if (this.type === "null" && ev.type === "null") {
            v = this.genValue(null, "null");
        }
        else if (ev.type === "null" || ev.type === "number" && ev.value === "0") {
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_REMAINDER_N, ev.value));
        }
        else if ((this.type === "number" || this.type === "null") && (ev.type === "number")) {
            var vl = Big(this.value || "0");
            var vr = Big(ev.value);
            v = this.genValue(vl.mod(vr).toString(), "number");
        }
        else {
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_REMAINDER, this.type, ev.type));
        }
        return v;
    };
    // 加法
    Value.prototype.add = function (ev) {
        var v;
        var vl;
        var vr;
        if (this.type === "null" && ev.type === "null") {
            v = this.genValue(null, "null");
        }
        else if ((this.type === "number" || this.type === "null") && (ev.type === "number" || ev.type === "null")) {
            vl = Big(this.value || "0");
            vr = Big(ev.value || "0");
            v = this.genValue(vl.plus(vr).toString(), "number");
        }
        else if ((this.type === "string" || this.type === "null") && (ev.type === "string" || ev.type === "null")) {
            vl = this.toValue();
            vr = ev.toValue();
            vl = vl || "";
            vr = vr || "";
            v = this.genValue(vl + vr, "string");
        }
        else if ((this.type === "array" || this.type === "null") && (ev.type === "array" || ev.type === "null")) {
            vl = this.value || [];
            vr = ev.value || [];
            v = this.genValue(vl.concat(vr), "array");
        }
        else {
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_ADD, this.type, ev.type));
        }
        return v;
    };
    // 减法
    Value.prototype.subtract = function (ev) {
        var v;
        var vl;
        var vr;
        if (this.type === "null" && ev.type === "null") {
            v = this.genValue(null, "null");
        }
        else if ((this.type === "number" || this.type === "null") && (ev.type === "number" || ev.type === "null")) {
            vl = Big(this.value || "0");
            vr = Big(ev.value || "0");
            v = this.genValue(vl.minus(vr).toString(), "number");
        }
        else if ((this.type === "array" || this.type === "null") && (ev.type === "array" || ev.type === "null")) {
            vl = this.value || [];
            vr = ev.value || [];
            v = [];
            var found = void 0;
            for (var _i = 0, vl_1 = vl; _i < vl_1.length; _i++) {
                var left = vl_1[_i];
                found = false;
                for (var _a = 0, vr_1 = vr; _a < vr_1.length; _a++) {
                    var right = vr_1[_a];
                    found = compare(left, right);
                    if (found) {
                        break;
                    }
                }
                if (!found) {
                    v.push(left);
                }
            }
            v = this.genValue(v, "array");
        }
        else {
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_SUBTRACT, this.type, ev.type));
        }
        return v;
    };
    // 等于
    Value.prototype.equal = function (ev, op) {
        var v;
        var vl;
        var vr;
        var b = op === "==";
        if (this.type === "null" && ev.type === "null") {
            v = this.genValue(b, "boolean");
        }
        else if (this.type === "null" || ev.type === "null") {
            v = this.genValue(!b, "boolean");
        }
        else if (this.type === "number" && ev.type === "number") {
            vl = Big(this.value);
            vr = Big(ev.value);
            v = vl.equals(vr);
            v = this.genValue(b ? v : !v, "boolean");
        }
        else if (this.type === ev.type) {
            v = compare(this.value, ev.value);
            v = this.genValue(b ? v : !v, "boolean");
        }
        else {
            v = b ? locale.getLocale().MSG_EX_EQUAL : locale.getLocale().MSG_EX_EQUAL_N;
            v = this.genErrorValue(format(v, this.type, ev.type));
        }
        return v;
    };
    // 比较运算
    Value.prototype.compare = function (ev, op) {
        if (op === "==" || op === "!=") {
            return this.equal(ev, op);
        }
        else {
            var v = void 0;
            if ((this.type === "string" || this.type === "null") && (ev.type === "string" || ev.type === "null")) {
                switch (op) {
                    case ">":
                        v = this.value > ev.value;
                        break;
                    case "<":
                        v = this.value < ev.value;
                        break;
                    case ">=":
                        v = this.value >= ev.value;
                        break;
                    case "<=":
                        v = this.value <= ev.value;
                        break;
                    default: break;
                }
                v = this.genValue(v, "boolean");
            }
            else if ((this.type === "date" || this.type === "null") && (ev.type === "date" || ev.type === "null")) {
                v = this.value - ev.value;
                switch (op) {
                    case ">":
                        v = v > 0;
                        break;
                    case "<":
                        v = v < 0;
                        break;
                    case ">=":
                        v = v >= 0;
                        break;
                    case "<=":
                        v = v <= 0;
                        break;
                    default: break;
                }
                v = this.genValue(v, "boolean");
            }
            else if ((this.type === "number" || this.type === "null") &&
                (ev.type === "number" || ev.type === "null")) {
                var vl = void 0;
                var vr = void 0;
                vl = Big(this.value || "0");
                vr = Big(ev.value || "0");
                switch (op) {
                    case ">":
                        v = vl.greaterThan(vr);
                        break;
                    case "<":
                        v = vl.lessThan(vr);
                        break;
                    case ">=":
                        v = vl.greaterThanOrEqualTo(vr);
                        break;
                    case "<=":
                        v = vl.lessThanOrEqualTo(vr);
                        break;
                    default: break;
                }
                v = this.genValue(v, "boolean");
            }
            else {
                switch (op) {
                    case ">":
                        v = locale.getLocale().MSG_EX_COMPARE_A;
                        break;
                    case "<":
                        v = locale.getLocale().MSG_EX_COMPARE_B;
                        break;
                    case ">=":
                        v = locale.getLocale().MSG_EX_COMPARE_C;
                        break;
                    case "<=":
                        v = locale.getLocale().MSG_EX_COMPARE_D;
                        break;
                    default: break;
                }
                v = this.genErrorValue(format(v, this.type, ev.type));
            }
            return v;
        }
    };
    // 与运算
    Value.prototype.and = function (ev) {
        var v;
        if (!ev) {
            v = (this.type === "boolean" || this.type === "null") ?
                this.genValue(false, "boolean") :
                this.genErrorValue(format(locale.getLocale().MSG_EX_AND_L, this.type));
        }
        else {
            v = (this.type === "boolean" && (ev.type === "boolean" || ev.type === "null")) ?
                this.genValue(!!(this.value && ev.value), "boolean") :
                this.genErrorValue(format(locale.getLocale().MSG_EX_AND, this.type, ev.type));
        }
        return v;
    };
    // 或运算
    Value.prototype.or = function (ev) {
        var v;
        if (!ev) {
            v = (this.type === "boolean") ?
                this.genValue(true, "boolean") :
                this.genErrorValue(format(locale.getLocale().MSG_EX_OR_L, this.type));
        }
        else {
            v = ((this.type === "boolean" || this.type === "null") && (ev.type === "boolean" || ev.type === "null")) ?
                this.genValue(!!(this.value || ev.value), "boolean") :
                this.genErrorValue(format(locale.getLocale().MSG_EX_OR, this.type, ev.type));
        }
        return v;
    };
    // 下标运算
    Value.prototype.subscript = function (ev) {
        var v;
        var i;
        var t;
        if (ev.type === "array") {
            i = ev.toValue()[0];
            t = getValueType(i);
        }
        else {
            i = ev.toValue();
            t = ev.type;
        }
        if (this.type === "string" || this.type === "array") {
            if (t === "number") {
                v = this.toValue();
                if (v.length > i && i >= 0 && v.length > 0) {
                    if (this.type === "array" && this.entity) {
                        v = this.context.getEntityValue(this, i);
                    }
                    else {
                        v = v[i];
                        v = this.genValue(v, getValueType(v), null);
                    }
                }
                else {
                    v = this.genErrorValue(format(locale.getLocale().MSG_EX_SUBSCRIPT_U, this.type, i));
                }
            }
            else {
                v = this.genErrorValue(format(locale.getLocale().MSG_EX_SUBSCRIPT_T, i));
            }
        }
        else if (this.type === "object") {
            v = this.genValue(i);
            v = v.getVariableValue(this);
        }
        else {
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_SUBSCRIPT, this.type));
        }
        return v;
    };
    // 获取{key:...,value:...}键值对对象
    Value.prototype.hashItem = function (ev) {
        return this.genValue({ key: this.toValue(), value: ev.toValue() }, "object");
    };
    // 获取变量值
    Value.prototype.getVariableValue = function (ev) {
        return (ev && ev.type !== "object") ?
            this.genErrorValue(format(locale.getLocale().MSG_EX_DOT, ev.type)) :
            this.context.getVariableValue(this.toValue(), ev);
    };
    // 获取函数返回结果值
    Value.prototype.getFunctionValue = function (ev) {
        var v = this.toValue();
        return (ev && ev.value === null) ?
            this.genErrorValue(format(locale.getLocale().MSG_EX_FUNC_NULL, v.key)) :
            this.context.getFunctionValue(v.key, ev, v.value);
    };
    // 绝对值
    Value.prototype.abs = function () {
        var v = Big(this.value || "0");
        return this.genValue(v.abs().toString(), "number");
    };
    // 向上取整
    Value.prototype.ceil = function () {
        var v = Big(this.value || "0");
        return this.genValue(v.ceil().toString(), "number");
    };
    // 向下取整
    Value.prototype.floor = function () {
        var v = Big(this.value || "0");
        return this.genValue(v.floor().toString(), "number");
    };
    // 四舍五入保留scale位小数
    Value.prototype.round = function (scale) {
        var v;
        if (scale >= 0) {
            v = Big(this.value || "0");
            v = v.toDecimalPlaces(scale, 4);
            v = this.genValue(v.toString(), "number");
        }
        else {
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_ROUND, scale));
        }
        return v;
    };
    // 按精度截断数据
    Value.prototype.trunc = function (scale) {
        var v;
        if (scale >= 0) {
            v = Big(this.value || "0");
            v = v.toDecimalPlaces(scale, 1);
            v = this.genValue(v.toString(), "number");
        }
        else {
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_TRUNC, scale));
        }
        return v;
    };
    // 获取数的余弦
    Value.prototype.cos = function () {
        var v = Big(this.value || "0");
        var name = "cos";
        v = v[name]();
        return this.genValue(v.toString(), "number");
    };
    // 获取 e 的指数
    Value.prototype.exp = function () {
        var v = Big(this.value || "0");
        v = v.exp();
        return this.genValue(v.toString(), "number");
    };
    // 获取数的自然对数（底为 e）
    Value.prototype.ln = function () {
        var value;
        var v = Big(this.value || "0");
        if (v.greaterThan("0")) {
            v = v.ln();
            value = this.genValue(v.toString(), "number");
        }
        else {
            value = this.genErrorValue(format(locale.getLocale().MSG_EX_LN, v.toString()));
        }
        return value;
    };
    // 获取数的指定底数的对数
    Value.prototype.log = function (base) {
        var value;
        var v = Big(this.value || "0");
        if (v.greaterThan("0") && base > 0 && base !== 1) {
            v = v.log(base);
            value = this.genValue(v.toString(), "number");
        }
        else {
            value = this.genErrorValue(format(locale.getLocale().MSG_EX_LOG, base, v.toString()));
        }
        return value;
    };
    // 获取数的指定指数的次幂
    Value.prototype.power = function (exponent) {
        var v = Big(this.value || "0");
        v = v.pow(exponent);
        return this.genValue(v.toString(), "number");
    };
    // 获取数的正弦
    Value.prototype.sin = function () {
        var v = Big(this.value || "0");
        var name = "sin";
        v = v[name]();
        return this.genValue(v.toString(), "number");
    };
    // 获取数的平方根
    Value.prototype.sqrt = function () {
        var v = Big(this.value || "0");
        v = v.sqrt();
        return this.genValue(v.toString(), "number");
    };
    // 获取树的正切值
    Value.prototype.tan = function () {
        var v = Big(this.value || "0");
        var name = "tan";
        v = v[name]();
        return this.genValue(v.toString(), "number");
    };
    return Value;
}());

// 上下文基类
// ----------
var Context = (function () {
    function Context() {
        this.exprList = [];
    }
    // 生成ExprValue对象
    Context.prototype.genValue = function (value, type, entity, errorMsg, parentObj) {
        return new Value(this, value, type, entity, errorMsg, parentObj);
    };
    // 有错误时，生成对应的ExprValue对象
    Context.prototype.genErrorValue = function (errorMsg) {
        return this.genValue(undefined, undefined, undefined, errorMsg, undefined);
    };
    // 生成ExprType对象
    Context.prototype.genType = function (type, info, data, entity, depends, errorMsg) {
        return new Type(this, type, info, data, entity, depends, errorMsg);
    };
    // 有错误时，生成对应的ExprType对象
    Context.prototype.genErrorType = function (errorMsg) {
        return this.genType(undefined, undefined, undefined, undefined, undefined, errorMsg);
    };
    // 得到函数source.name(paramValue)返回值的ExprType对象
    Context.prototype.getFunctionType = function (name, source, paramType, paramData) {
        return this.doGetFunctionType(name, source, paramType, paramData);
    };
    // 得到函数source.name(paramValue)执行结果
    Context.prototype.getFunctionValue = function (name, source, paramValue) {
        return this.doGetFunctionValue(name, source, paramValue);
    };
    // 得到变量类型
    Context.prototype.getVariableType = function (name, source) {
        return this.doGetVariableType(name, source);
    };
    // 得到对象source的name属性值
    Context.prototype.getVariableValue = function (name, source) {
        return this.doGetVariableValue(name, source);
    };
    // 得到实体类型
    Context.prototype.getEntityType = function (source) {
        return this.doGetEntityType(source);
    };
    // 从实体数组source中取出第index条实体记录
    Context.prototype.getEntityValue = function (source, index) {
        return this.doGetEntityValue(source, index);
    };
    // 得到解析信息
    Context.prototype.getParserInfo = function (expr) {
        expr = expr.trim();
        var index = -1;
        for (var i = 0; i < this.exprList.length; i++) {
            if (this.exprList[i].text === expr) {
                index = i;
                break;
            }
        }
        var r;
        if (index >= 0) {
            r = this.exprList[index].parser;
        }
        else {
            var p = new Parser();
            r = p.parser(expr);
            this.exprList.push({
                parser: r,
                text: expr,
            });
        }
        return r;
    };
    // 是否为IfNull(1,2)函数形式的","结点
    Context.prototype.isIfNullToken = function (token) {
        return isFunctionToken(token, this.doGetIfNullName());
    };
    // 是否为IIf(true,1,2)函数形式的","结点
    Context.prototype.isIIfToken = function (token) {
        return isFunctionToken(token, this.doGetIIfName());
    };
    Context.prototype.doGetIfNullName = function () { return ""; };
    Context.prototype.doGetIIfName = function () { return ""; };
    Context.prototype.doGetVariableType = function (name, source) {
        //
    };
    Context.prototype.doGetVariableValue = function (name, source) {
        //
    };
    Context.prototype.doGetFunctionType = function (name, source, paramType, paramData) {
        //
    };
    Context.prototype.doGetFunctionValue = function (name, source, paramValue) {
        //
    };
    Context.prototype.doGetEntityType = function (source) {
        //
    };
    Context.prototype.doGetEntityValue = function (source, index) {
        //
    };
    return Context;
}());

// 表达式计算
// ----------
var Calc = (function () {
    function Calc() {
        this.context = null;
        this.values = {};
    }
    // 生成ExprValue对象
    Calc.prototype.genValue = function (value, type, entity, errorMsg, parentObj) {
        return new Value(this.context, value, type, entity, errorMsg, parentObj);
    };
    // 有错误时，生成对应的ExprValue对象
    Calc.prototype.genErrorValue = function (errorMsg) {
        return this.genValue(undefined, undefined, undefined, errorMsg, undefined);
    };
    // 根据token结点ID返回对应的ExprValue对象
    Calc.prototype.getValue = function (tokenId) {
        return this.values[tokenId];
    };
    // 设置某token结点ID对应的ExprValue对象
    Calc.prototype.setValue = function (tokenId, v) {
        this.values[tokenId] = v;
    };
    // 对表达式进行语法分析和数值计算
    Calc.prototype.calc = function (expr, context) {
        this.context = context || new Context();
        var r;
        var p = this.context.getParserInfo(expr);
        if (p.errorMsg === "") {
            var msg = this.doCalc(p.rootToken);
            if (msg === "") {
                r = this.getValue(p.rootToken.id);
                r.tokens = p.tokens;
                r.rootToken = p.rootToken;
            }
            else {
                r = this.genErrorValue(msg);
            }
        }
        else {
            r = this.genErrorValue(p.errorMsg);
        }
        return r;
    };
    // 对表达式进行数值计算
    Calc.prototype.doCalc = function (rootToken) {
        var t = rootToken;
        var p = t.parent;
        var msg = "";
        var l;
        var r;
        var tv = null;
        var lv;
        var rv;
        if (t.childs) {
            var isIfNull = this.context.isIfNullToken(t);
            var isIIf = this.context.isIIfToken(t);
            for (var i = 0; i < t.childs.length; i++) {
                msg = this.doCalc(t.childs[i]);
                if (msg !== "") {
                    break;
                }
                else if (i === 0) {
                    l = t.childs[0];
                    lv = this.getValue(l.id);
                    if (isIfNull && lv.toValue() !== null) {
                        break;
                    }
                    else if (isIIf && !lv.toValue()) {
                        i++;
                    }
                    else if (t.tokenType === "TK_OR" && !!lv.toValue() === true ||
                        t.tokenType === "TK_AND" && !!lv.toValue() === false) {
                        break;
                    }
                }
                else if (i === 1) {
                    r = t.childs[1];
                    rv = this.getValue(r.id);
                    if (isIIf) {
                        break;
                    }
                }
            }
        }
        if (msg === "") {
            switch (t.tokenType) {
                case "TK_STRING":
                    tv = this.genValue(t.tokenValue, "string");
                    break;
                case "TK_NUMBER":
                    tv = this.genValue(t.tokenValue, "number");
                    break;
                case "TK_BOOL":
                    tv = this.genValue(t.tokenValue === "true", "boolean");
                    break;
                case "TK_NULL":
                    tv = this.genValue(null, "null");
                    break;
                case "TK_IDEN":
                    tv = this.genValue(t.tokenValue, "string");
                    if (isIDENToken(t)) {
                        tv = tv.getVariableValue(null);
                    }
                    break;
                case "TK_UNARY":
                    tv = lv.negative(t.tokenValue);
                    break;
                case "TK_NOT":
                    tv = lv.not();
                    break;
                case "TK_MULTI":
                    tv = lv.multiply(rv);
                    break;
                case "TK_DIV":
                    tv = lv.divide(rv);
                    break;
                case "TK_MOD":
                    tv = lv.remainder(rv);
                    break;
                case "TK_PLUS":
                    tv = lv.add(rv);
                    break;
                case "TK_MINUS":
                    tv = lv.subtract(rv);
                    break;
                case "TK_CO":
                    tv = lv.compare(rv, t.tokenValue);
                    break;
                case "TK_AND":
                    tv = lv.and(rv);
                    break;
                case "TK_OR":
                    tv = lv.or(rv);
                    break;
                case "TK_COLON":
                    tv = lv.hashItem(rv);
                    break;
                case "TK_DOT":
                    switch (r.tokenType) {
                        case "VTK_FUNCTION":
                            tv = rv.getFunctionValue(lv);
                            break;
                        case "TK_IDEN":
                            tv = rv.getVariableValue(lv);
                            break;
                        default:
                            break;
                    }
                    break;
                case "VTK_COMMA":
                    tv = this.genValue([], "array");
                    for (var _i = 0, _a = t.childs; _i < _a.length; _i++) {
                        var item = _a[_i];
                        lv = this.getValue(item.id);
                        tv.arrayPush(lv);
                    }
                    break;
                case "VTK_PAREN":
                    tv = (t.childs.length === 0) ?
                        this.genValue([], "array") :
                        (p && p.tokenType === "TK_IDEN" && l.tokenType !== "VTK_COMMA") ?
                            this.genValue([], "array").arrayPush(lv) :
                            lv;
                    break;
                case "VTK_ARRAY":
                    tv = this.genValue([], "array");
                    if (t.childs.length > 0) {
                        if (l.tokenType === "VTK_COMMA") {
                            tv.arrayConcat(lv);
                        }
                        else {
                            tv.arrayPush(lv);
                        }
                    }
                    break;
                case "VTK_OBJECT":
                    tv = this.genValue({}, "object");
                    if (t.childs.length > 0) {
                        if (l.tokenType === "VTK_COMMA") {
                            tv.objectSetProperties(lv);
                        }
                        else {
                            tv.objectSetProperty(lv);
                        }
                    }
                    break;
                case "VTK_SUBSCRIPT":
                    tv = lv.subscript(rv);
                    break;
                case "VTK_FUNCTION":
                    tv = (p && p.tokenType === "TK_DOT" && p.childs[0] !== t) ?
                        lv.hashItem(rv) :
                        lv.hashItem(rv).getFunctionValue(null);
                    break;
                default:
                    break;
            }
            msg = tv.errorMsg;
            if (msg === "") {
                this.setValue(t.id, tv);
            }
        }
        return msg;
    };
    return Calc;
}());

// 表达式检查
// ----------
var Check = (function () {
    function Check() {
        this.context = null;
        this.types = {};
    }
    // 生成ExprType对象
    Check.prototype.genType = function (type, info, data, entity, depends, errorMsg) {
        return new Type(this.context, type, info, data, entity, depends, errorMsg);
    };
    // 有错误时，生成对应的ExprType对象
    Check.prototype.genErrorType = function (errorMsg) {
        return this.genType(undefined, undefined, undefined, undefined, undefined, errorMsg);
    };
    // 根据token结点ID返回对应ExprType对象
    Check.prototype.getType = function (tokenId) {
        return this.types[tokenId];
    };
    // 设置某token结点ID对应的ExprType对象
    Check.prototype.setType = function (tokenId, t) {
        this.types[tokenId] = t;
    };
    // 对表达式进行语法分析和依赖关系计算
    Check.prototype.check = function (expr, context) {
        var _this = this;
        this.context = context || new Context();
        var r;
        var p = this.context.getParserInfo(expr);
        if (p.errorMsg === "") {
            var msg = this.doCheck(p.rootToken);
            if (msg === "") {
                r = this.getType(p.rootToken.id);
                r.tokens = p.tokens;
                r.rootToken = p.rootToken;
                var ds_1 = [];
                var pushDepends_1 = function (d) {
                    if (getValueType(d) === "array") {
                        for (var _i = 0, d_1 = d; _i < d_1.length; _i++) {
                            var item = d_1[_i];
                            pushDepends_1(item);
                        }
                    }
                    else {
                        var f = false;
                        for (var _a = 0, ds_2 = ds_1; _a < ds_2.length; _a++) {
                            var item = ds_2[_a];
                            f = item === d;
                            if (f) {
                                break;
                            }
                        }
                        if (!f) {
                            ds_1.push(d);
                        }
                    }
                };
                eachToken(r.rootToken, function (token) {
                    var tt = _this.getType(token.id);
                    if (tt) {
                        if (tt.depends) {
                            pushDepends_1(tt.depends);
                        }
                        var e = tt.entity;
                        if (e) {
                            var pp = token.parent;
                            var pt = pp ? _this.getType(pp.id) : null;
                            if (!pt || !pt.entity) {
                                pushDepends_1(e.fullName);
                            }
                        }
                    }
                    return true;
                }, this);
                r.dependencies = ds_1;
            }
            else {
                r = this.genErrorType(msg);
            }
        }
        else {
            r = this.genErrorType(p.errorMsg);
        }
        return r;
    };
    // 检查表达式运算关系正确性
    Check.prototype.doCheck = function (rootToken) {
        var t = rootToken;
        var p = t.parent;
        var msg = "";
        var l;
        var r;
        var tt = null;
        var lt;
        var rt;
        if (t.childs) {
            for (var i = 0; i < t.childs.length; i++) {
                msg = this.doCheck(t.childs[i]);
                if (msg !== "") {
                    break;
                }
                else if (i === 0) {
                    l = t.childs[0];
                    lt = this.getType(l.id);
                }
                else if (i === 1) {
                    r = t.childs[1];
                    rt = this.getType(r.id);
                }
            }
        }
        if (msg === "") {
            switch (t.tokenType) {
                case "TK_STRING":
                    tt = this.genType("string", "string", t.tokenValue);
                    break;
                case "TK_NUMBER":
                    tt = this.genType("number", "number", t.tokenValue);
                    break;
                case "TK_BOOL":
                    tt = this.genType("boolean", "boolean", t.tokenValue);
                    break;
                case "TK_NULL":
                    tt = this.genType("null", "null", t.tokenValue);
                    break;
                case "TK_IDEN":
                    tt = this.genType("string", "string", t.tokenValue);
                    if (isIDENToken(t)) {
                        tt = tt.getVariableType(null);
                    }
                    break;
                case "TK_UNARY":
                    tt = lt.negative(t.tokenValue);
                    break;
                case "TK_NOT":
                    tt = lt.not();
                    break;
                case "TK_MULTI":
                    tt = lt.multiply(rt);
                    break;
                case "TK_DIV":
                    tt = lt.divide(rt);
                    break;
                case "TK_MOD":
                    tt = lt.remainder(rt);
                    break;
                case "TK_PLUS":
                    tt = lt.add(rt);
                    break;
                case "TK_MINUS":
                    tt = lt.subtract(rt);
                    break;
                case "TK_CO":
                    tt = lt.compare(rt, t.tokenValue);
                    break;
                case "TK_AND":
                    tt = lt.and(rt);
                    break;
                case "TK_OR":
                    tt = lt.or(rt);
                    break;
                case "TK_COLON":
                    tt = lt.hashItem(rt);
                    break;
                case "TK_DOT":
                    switch (r.tokenType) {
                        case "VTK_FUNCTION":
                            tt = rt.getFunctionType(lt);
                            break;
                        case "TK_IDEN":
                            tt = rt.getVariableType(lt);
                            break;
                        default:
                            break;
                    }
                    break;
                case "VTK_COMMA":
                    tt = this.genType("array", [], []);
                    for (var _i = 0, _a = t.childs; _i < _a.length; _i++) {
                        var item = _a[_i];
                        lt = this.getType(item.id);
                        tt.arrayPush(lt);
                    }
                    break;
                case "VTK_PAREN":
                    if (t.childs.length === 0) {
                        tt = (p && p.tokenType === "TK_IDEN") ?
                            this.genType("array", [], []) :
                            this.genType("undefined");
                    }
                    else {
                        tt = (p && p.tokenType === "TK_IDEN" && l.tokenType !== "VTK_COMMA") ?
                            this.genType("array", [], []).arrayPush(lt) :
                            lt;
                    }
                    break;
                case "VTK_ARRAY":
                    tt = this.genType("array", [], []);
                    if (t.childs.length > 0) {
                        if (l.tokenType === "VTK_COMMA") {
                            tt.arrayConcat(lt);
                        }
                        else {
                            tt.arrayPush(lt);
                        }
                    }
                    break;
                case "VTK_OBJECT":
                    tt = this.genType("object", {}, {});
                    if (t.childs.length > 0) {
                        if (l.tokenType === "VTK_COMMA") {
                            tt.objectSetProperties(lt);
                        }
                        else {
                            tt.objectSetProperty(lt);
                        }
                    }
                    break;
                case "VTK_SUBSCRIPT":
                    tt = lt.subscript(rt);
                    break;
                case "VTK_FUNCTION":
                    tt = (p && p.tokenType === "TK_DOT" && p.childs[0] !== t) ?
                        lt.hashItem(rt) :
                        lt.hashItem(rt).getFunctionType(null);
                    break;
                default:
                    break;
            }
            msg = tt.errorMsg;
            if (msg === "") {
                this.setType(t.id, tt);
            }
        }
        return msg;
    };
    return Check;
}());

// 表达式游标
// ----------
var ExprCurrent = (function () {
    function ExprCurrent() {
        this.curr = [];
    }
    // 设置数据游标
    ExprCurrent.prototype.setDataCursor = function (cursor) {
        this.dataCursor = cursor;
    };
    // 向栈顶添加新的计算环境
    ExprCurrent.prototype.push = function (c) {
        this.curr.unshift({ pIndex: 0, params: c });
    };
    // 删除栈顶的计算环境
    ExprCurrent.prototype.pop = function () {
        this.curr.shift();
    };
    // 栈顶计算环境的params属性是否存在第index条记录
    ExprCurrent.prototype.isValid = function (index) {
        return index >= 0 && this.curr.length > 0 && index < this.curr[0].params.length;
    };
    // 栈顶计算环境的params属性的第index条记录是否为实体数据
    ExprCurrent.prototype.isEntityData = function (index) {
        if (this.curr.length > 0) {
            var c = this.curr[0];
            c.pIndex = index || 0;
            return c.params[c.pIndex].isEntityData;
        }
        else {
            return false;
        }
    };
    // 得到栈顶计算环境的params属性的第index条记录存储的实体名
    ExprCurrent.prototype.getEntityName = function (index) {
        return this.getData(index) || "";
    };
    // 得到实体全名称entityName的访问游标
    ExprCurrent.prototype.getEntityDataCursor = function (entityName, index) {
        var r = entityName ? this.dataCursor[entityName] : 0;
       
        for (var i = 0; i < this.curr.length; i++) {
            var c = this.curr[i];
            if (i === 0) {
                c.pIndex = index || 0;
            }
            var cc = c.params[c.pIndex];
            if (cc.isEntityData && cc.current === entityName) {
                r = cc.cursor;
                break;
            }
        }
        return r;
    };
    // 得到栈顶计算环境的params属性的第index条记录存储的数据
    ExprCurrent.prototype.getData = function (index) {
        var r;
        if (this.curr.length > 0) {
            var c = this.curr[0];
            c.pIndex = index || 0;
            r = c.params[c.pIndex].current;
        }
        return r;
    };
    return ExprCurrent;
}());

// 表达式上下文
// ----------
var ExprContext = (function (_super) {
    __extends(ExprContext, _super);
    function ExprContext() {
        _super.apply(this, arguments);
        this.exprContext = new ExprCurrent();
        this.pageContext = { $C: {} };
        this.contextVariables = [];
        this.functions = {};
    }
    // 设置数据游标
    ExprContext.prototype.setDataCursor = function (cursor) {
        this.exprContext.setDataCursor(cursor);
    };
    // 设置页面上下文
    ExprContext.prototype.setPageContext = function (ctx) {
        this.pageContext.$C = ctx;
    };
    // 设置数据上下文
    ExprContext.prototype.setDataContext = function (ctx) {
        this.dataContext = ctx;
    };
    // 设置数据
    ExprContext.prototype.setData = function (d) {
        this.data = d;
    };
    // 添加函数
    ExprContext.prototype.addFunction = function (func) {
        var gs;
        gs = {};
        gs[""] = func._ || {};
        gs.array = func.array || {};
        gs.boolean = func.boolean || {};
        gs.date = func.date || {};
        gs.number = func.number || {};
        gs.object = func.object || {};
        gs.string = func.string || {};
        for (var g in gs) {
            if (gs.hasOwnProperty(g)) {
                var group = gs[g];
                for (var n in group) {
                    if (group.hasOwnProperty(n)) {
                        var fullName = g ? g + "." + n : n;
                        group[n].getLocale = (function (key) { return function () { return locale.getFunction()[key]; }; })(fullName);
                    }
                }
            }
        }
        return merger(this.functions, gs);
    };
    // 获取函数
    ExprContext.prototype.getFunction = function () {
        return this.functions;
    };
    // 获取IfNull函数名
    ExprContext.prototype.doGetIfNullName = function () {
        return "IfNull";
    };
    // 获取IIf函数名
    ExprContext.prototype.doGetIIfName = function () {
        return "IIf";
    };
    // 获取函数返回结果类型对象
    ExprContext.prototype.doGetFunctionType = function (name, source, paramType, paramData) {
        var r;
        var t = (source !== null) ?
            (source.entity ? source.entity.type : source.type) :
            "";
        var ft = this.getFuncType(t, name, paramType);
        if (ft === null) {
            r = this.genErrorType(format(locale.getLocale().MSG_EC_FUNC_T, t, name));
        }
        else {
            var depends = [];
            if (ft.p) {
                var pd = paramData;
                for (var i = 0; i < ft.p.length; i++) {
                    if (ft.p[i] === "expr" && paramType[i] === "string" && getValueType(pd[i]) === "string") {
                        var dr = (source && source.entity) ?
                            this.calcEntityDependencies(pd[i], source.entity.fullName) :
                            this.calcEntityDependencies(pd[i]);
                        if (dr.errorMsg === "") {
                            depends = depends.concat(dr.dependencies);
                        }
                        else {
                            r = this.genErrorType(dr.errorMsg);
                            break;
                        }
                    }
                }
            }
            if (!r) {
                var entity = null;
                var type = void 0;
                switch (ft.e) {
                    case "root":
                        entity = "";
                        type = "object";
                        break;
                    case "parent":
                        if (source === null) {
                            entity = this.getParentName(this.exprContext.getEntityName());
                            type = "object";
                        }
                        else if (source.entity) {
                            entity = this.getParentName(source.entity.fullName);
                            type = "object";
                        }
                        else {
                            r = this.genErrorType(format(locale.getLocale().MSG_EC_FUNC_E, "Parent"));
                        }
                        break;
                    case "data":
                    case "value":
                        var n = null;
                        if (source === null) {
                            n = this.exprContext.getEntityName();
                        }
                        else if (source.entity) {
                            n = source.entity.fullName;
                        }
                        if (n !== null) {
                            if (ft.e === "data") {
                                entity = n;
                            }
                            depends.push(n);
                        }
                        break;
                    default:
                        break;
                }
                if (!r) {
                    if (entity !== null) {
                        entity = this.genEntityInfo(entity, type);
                    }
                    if (depends.length === 0) {
                        depends = null;
                    }
                    r = this.genType(ft.r, ft.r, undefined, entity, depends);
                }
            }
        }
        return r;
    };
    // 获取函数返回值
    ExprContext.prototype.doGetFunctionValue = function (name, source, paramValue) {
        var t = (source !== null) ?
            (source.entity ? source.entity.type : source.type) :
            "";
        var p = [source].concat(paramValue);
        var pt = [];
        for (var _i = 0, paramValue_1 = paramValue; _i < paramValue_1.length; _i++) {
            var item = paramValue_1[_i];
            pt.push(getValueType(item));
        }
        var f = this.getFunc(t, name, pt);
        var r = f ?
            f.fn.apply(this, [this].concat(p)) :
            this.genErrorValue(format(locale.getLocale().MSG_EC_FUNC_P, t, name));
        return r;
    };
    // 获取变量类型对象
    ExprContext.prototype.doGetVariableType = function (name, source) {
        var r;
        var pIndex;
        pIndex = 0;
        if (source === null && name.split("")[0] === "$") {
            pIndex = name.substr(1);
            if (pIndex === "C") {
                r = this.genType(getValueType(this.pageContext.$C));
            }
            else {
                pIndex = Number(pIndex);
                if (!isNaN(pIndex)) {
                    if (this.exprContext.isValid(pIndex)) {
                        name = "";
                    }
                    else {
                        r = this.genErrorType(format(locale.getLocale().MSG_EC_VARI_N, name));
                    }
                }
                else {
                    r = this.genErrorType(format(locale.getLocale().MSG_EC_VARI_I, name));
                }
            }
        }
        if (!r) {
            if (this.exprContext.isEntityData(pIndex)) {
                var entity = void 0;
                var type = void 0;
                if (source === null) {
                    entity = this.genEntityInfo(this.getPropertyName(this.exprContext.getEntityName(pIndex), name));
                    if (entity) {
                        type = entity.type;
                    }
                    else {
                        r = this.genErrorType(format(locale.getLocale().MSG_EC_PROP_N, name));
                    }
                }
                else {
                    if (source.entity) {
                        entity = this.genEntityInfo(this.getPropertyName(source.entity.fullName, name));
                        if (entity) {
                            type = entity.type;
                        }
                        else if (source.entity.type === "object" && source.entity.field !== "") {
                            type = "undefined";
                        }
                        else {
                            r = this.genErrorType(format(locale.getLocale().MSG_EC_PROP_N, name));
                        }
                    }
                    else {
                        entity = null;
                        type = "undefined";
                    }
                }
                if (!r) {
                    r = this.genType(type, type, name, entity);
                }
            }
            else {
                r = this.genType();
            }
        }
        return r;
    };
    // 获取变量值
    ExprContext.prototype.doGetVariableValue = function (name, source) {
        var r;
        var pIndex;
        pIndex = 0;
        if (source === null && name.split("")[0] === "$") {
            pIndex = name.substr(1);
            if (pIndex === "C") {
                r = this.genValue(this.pageContext.$C);
            }
            else {
                pIndex = Number(pIndex);
                if (!isNaN(pIndex)) {
                    if (this.exprContext.isValid(pIndex)) {
                        name = "";
                    }
                    else {
                        r = this.genErrorValue(format(locale.getLocale().MSG_EC_VARI_N, name));
                    }
                }
                else {
                    r = this.genErrorValue(format(locale.getLocale().MSG_EC_VARI_I, name));
                }
            }
        }
        if (!r) {
            var value = void 0;
            if (this.exprContext.isEntityData(pIndex)) {
                var entity = void 0;
                var parentObj = void 0;
                if (source === null) {
                    entity = this.genEntityInfo(this.getPropertyName(this.exprContext.getEntityName(pIndex), name));
                    if (!entity) {
                        r = this.genErrorValue(format(locale.getLocale().MSG_EC_PROP_N, name));
                    }
                    else {
                        value = (entity.field !== "" || name === "") ?
                            this.getEntityData(entity.name, pIndex) :
                            this.getEntityData(this.getParentName(entity.name), pIndex);
                    }
                    parentObj = null;
                }
                else {
                    value = source.toValue();
                    if (source.entity &&
                        !(source.entity.type === "object" && source.entity.field !== "")) {
                        entity = this.genEntityInfo(this.getPropertyName(source.entity.fullName, name));
                        if (!entity) {
                            r = this.genErrorValue(format(locale.getLocale().MSG_EC_PROP_N, name));
                        }
                        else if (entity.field === "") {
                            parentObj = source;
                        }
                    }
                    else {
                        entity = null;
                    }
                }
                if (!r) {
                    if (value) {
                       
                        if (!(source === null && name === "")) {
                            value = value[name];
                        }
                        if (value === undefined) {
                            value = null;
                            if (entity) {
                                if (entity.type === "object") {
                                    value = {};
                                }
                                else if (entity.type === "array") {
                                    value = [];
                                }
                            }
                        }
                        r = this.genValue(value, null, entity, "", parentObj);
                        if (r && r.type === "array" && r.entity) {
                            r.entity.map = [];
                            for (var i = 0; i < value.length; i++) {
                                r.entity.map.push(i);
                            }
                        }
                    }
                    else {
                        r = this.genErrorValue(format(locale.getLocale().MSG_EC_PROP_E, value, name));
                    }
                }
            }
            else {
                value = (source === null) ?
                    this.getData(pIndex) :
                    value = source.toValue();
                if (!(source === null && name === "")) {
                    switch (getValueType(value)) {
                        case "object":
                        case "array":
                        case "string":
                            value = value[name];
                            break;
                        default:
                            r = this.genErrorValue(format(locale.getLocale().MSG_EC_PROP_E, value, name));
                    }
                }
                if (!r) {
                    r = this.genValue(value);
                }
            }
        }
        return r;
    };
    // 获取实体类型对象
    ExprContext.prototype.doGetEntityType = function (source) {
        var e = this.genEntityInfo(source.entity, "object");
        var t = this.genType("object", "object", undefined, e, [e.fullName]);
        return t;
    };
    // 获取实体值，根据游标索引
    ExprContext.prototype.doGetEntityValue = function (source, index) {
        var v = source.toValue()[index];
        var e = this.genEntityInfo(source.entity, "object");
        e.recNo = source.entity.map[index];
        var parentObj = source.parentObj;
        var r = this.genValue(v, getValueType(v), e, "", parentObj);
        return r;
    };
    // 获取实体信息
    ExprContext.prototype.genEntityInfo = function (fullName, type) {
        if (getValueType(fullName) === "object") {
            fullName = fullName.fullName;
        }
        var name = [];
        var field = [];
        var dataType;
        if (fullName !== "") {
            var p = fullName.split(".");
            var x = p[0];
            var c = this.dataContext;
            var t = c[x];
            if (t) {
                name.push(x);
                for (var i = 1; i < p.length; i++) {
                    x = p[i];
                    if (t.childs && t.childs[x] && field.length === 0) {
                        name.push(x);
                        t = t.childs[x];
                    }
                    else {
                        var f = field.join(".");
                        if (f !== "") {
                            f += ".";
                        }
                        f += x;
                        if (t.fields && t.fields[f]) {
                            field.push(x);
                            dataType = t.fields[f].type;
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        }
        var r = {
            field: field.join("."),
            fullName: (fullName),
            name: name.join("."),
            recNo: -1,
            type: dataType,
        };
        if (r.name === r.fullName) {
            r.type = "array";
        }
        else if (r.name + "." + r.field !== r.fullName) {
            r = null;
        }
        if (r && type) {
            r.type = type;
        }
        return r;
    };
    // 获取根数据值
    ExprContext.prototype.getRootValue = function () {
        var entity = this.genEntityInfo("", "object");
        entity.recNo = 0;
        return this.genValue(this.data, "object", entity, "");
    };
    // 获取父实体值
    ExprContext.prototype.getParentValue = function (source) {
        var r;
        if (this.exprContext.isEntityData()) {
            var entity = void 0;
            if (source === null) {
                entity = this.exprContext.getEntityName();
            }
            else if (source.entity && source.entity.field === "") {
                if (source.parentObj) {
                    r = source.parentObj;
                }
                else {
                    entity = source.entity.fullName;
                }
            }
            else {
                r = this.genErrorValue(format(locale.getLocale().MSG_EC_FUNC_E, "Parent"));
            }
            if (!r) {
                entity = this.genEntityInfo(this.getParentName(entity), "object");
                entity.recNo = this.exprContext.getEntityDataCursor(entity.name);
                var value = this.getEntityData(entity.name);
                r = this.genValue(value, "", entity);
            }
        }
        else {
            r = this.genValue(null);
        }
        return r;
    };
    // 获取实体数据，根据游标索引
    ExprContext.prototype.getEntityData = function (entityName, index) {
        var d = this.data;
        if (entityName !== "") {
            var p = entityName.split(".");
            var cp = [];
            for (var _i = 0, p_1 = p; _i < p_1.length; _i++) {
                var prop = p_1[_i];
                cp.push(prop);
                d = d[prop];
                var cursor = this.exprContext.getEntityDataCursor(cp.join("."), index);
                d = d[cursor];
                if (d === undefined) {
                    break;
                }
            }
        }
        return d;
    };
    // 根据索引获取数据
    ExprContext.prototype.getData = function (index) {
        return this.exprContext.getData(index);
    };
    // 获取父名称
    ExprContext.prototype.getParentName = function (name) {
        var p = name.split(".");
        var r;
        if (p.length > 0) {
            p.pop();
            r = p.join(".");
        }
        else {
            r = "";
        }
        return r;
    };
    // 获取实体属性全名称
    ExprContext.prototype.getPropertyName = function (name, prop) {
        return (name && prop) ?
            (name + "." + prop) :
            (name ? name : prop);
    };
    // 获取当前实体的索引号，没有实体返回-1
    ExprContext.prototype.getRecNo = function (source) {
        var r;
        if (this.exprContext.isEntityData()) {
            var entity = void 0;
            if (source === null) {
                entity = this.exprContext.getEntityName();
                var value = this.exprContext.getEntityDataCursor(entity);
                r = this.genValue(value);
            }
            else {
                r = (source.entity && source.entity.field === "") ?
                    this.genValue(source.entity.recNo) :
                    this.genErrorValue(format(locale.getLocale().MSG_EC_FUNC_E, "RecNo"));
            }
        }
        else {
            r = this.genValue(-1);
        }
        return r;
    };
    // 设置字段名
    ExprContext.prototype.setFieldName = function (value) { this.fieldName = value; };
    // 获取字段名
    ExprContext.prototype.getFieldName = function () { return this.fieldName || ""; };
    // 设置字段显示名称
    ExprContext.prototype.setFieldDisplayName = function (value) { this.fieldDisplayName = value; };
    // 获取字段显示名称
    ExprContext.prototype.getFieldDisplayName = function () { return this.fieldDisplayName || ""; };
    // 设置字段值
    ExprContext.prototype.setFieldValue = function (value) { this.fieldValue = value; };
    // 获取字段值
    ExprContext.prototype.getFieldValue = function () { return this.fieldValue || null; };
    // 检测参数类型数组是否匹配
    ExprContext.prototype.findParams = function (ps, p) {
        var r = [];
        var pt = [];
        var pl = ps.length;
        for (var i = 0; i < ps.length; i++) {
            var x = ps[i];
            if (x.indexOf("?") === x.length - 1) {
                x = x.replace("?", "");
                pl--;
            }
            pt.push(x);
            if (i < p.length) {
                r.push(x);
            }
        }
        var b = p.length >= pl && p.length <= pt.length;
        if (b) {
            for (var j = 0; j < r.length; j++) {
                b = r[j] === "undefined" || p[j] === "undefined" || p[j] === "null" ||
                    r[j] === p[j] || r[j] === "expr" && p[j] === "string" || r[j] === "array" &&
                    r[j] === getValueType(p[j]) || r[j] === "object" && r[j] === getValueType(p[j]);
                if (!b) {
                    break;
                }
            }
        }
        if (!b) {
            r = null;
        }
        return r;
    };
    // 获取参数个数和类型都匹配的函数
    ExprContext.prototype.getFunc = function (type, name, params) {
        var r;
        if (type === "undefined") {
            var f = void 0;
            var fList = [];
            for (var i in this.functions) {
                if (this.functions.hasOwnProperty(i)) {
                    f = this.functions[i][name];
                    if (f && this.findParams(f.p, params) !== null) {
                        fList.push(f);
                    }
                }
            }
            r = (fList.length > 1) ? fList :
                ((fList.length === 1) ? fList[0] : null);
        }
        else {
            r = this.functions[type][name];
            if (!r || !r.fn || this.findParams(r.p, params) === null) {
                r = null;
            }
        }
        return r;
    };
    // 获取参数个数和类型都匹配的函数的返回值类型
    ExprContext.prototype.getFuncType = function (type, name, params) {
        var r = null;
        var fn = this.getFunc(type, name, params);
        if (getValueType(fn) === "array") {
            var t = "";
            for (var _i = 0, fn_1 = fn; _i < fn_1.length; _i++) {
                var item = fn_1[_i];
                if (r === null) {
                    t = item.r;
                }
                else if (item.r !== type) {
                    t = "undefined";
                    break;
                }
            }
            if (t !== "") {
                r = {
                    r: t,
                };
            }
        }
        else if (fn !== null) {
            r = {
                e: fn.e,
                p: this.findParams(fn.p, params),
                r: fn.r,
            };
        }
        return r;
    };
    // 获取上下文变量值
    ExprContext.prototype.getContextVariableValue = function (key) {
        var r;
        var v = this.contextVariables;
        if (v.length > 0) {
            r = v[v.length - 1][key];
        }
        if (r === undefined) {
            r = null;
        }
        return this.genValue(r);
    };
    // 上下文变量压栈
    ExprContext.prototype.pushContextVariables = function (v) {
        this.contextVariables.push(v);
    };
    // 上下文变量出栈
    ExprContext.prototype.popContextVariables = function () {
        this.contextVariables.pop();
    };
    // 计算表达式
    ExprContext.prototype._calcExpr = function (expr, curr) {
        if (curr.length > 0) {
            this.exprContext.push(curr);
        }
        var e = new Calc();
        var r = e.calc(expr, this);
        if (curr.length > 0) {
            this.exprContext.pop();
        }
        return r;
    };
    // 在实体计算环境下计算表达式的值
    ExprContext.prototype.calcEntityExpr = function (expr, entityName, cursor) {
        var c = [];
        var i = 1;
        while (i < arguments.length) {
            c.push({
                current: arguments[i],
                cursor: arguments[i + 1],
                isEntityData: true,
            });
            i += 2;
        }
        return this._calcExpr(expr, c);
    };
    // 在数据计算环境下计算表达式的值
    ExprContext.prototype.calcDataExpr = function (expr, data) {
        var c = [];
        var i = 1;
        while (i < arguments.length) {
            c.push({
                current: arguments[i],
                isEntityData: false,
            });
            i++;
        }
        return this._calcExpr(expr, c);
    };
    // 计算表达式的依赖关系
    ExprContext.prototype.calcDependencies = function (expr, curr) {
        if (curr.length > 0) {
            this.exprContext.push(curr);
        }
        var p = new Check();
        var r = p.check(expr, this);
        if (curr.length > 0) {
            this.exprContext.pop();
        }
        return r;
    };
    // 在实体计算环境下计算表达式的依赖关系
    ExprContext.prototype.calcEntityDependencies = function (expr, entityName) {
        var c = [];
        var i = 1;
        while (i < arguments.length) {
            c.push({
                current: arguments[i],
                isEntityData: true,
            });
            i++;
        }
        return this.calcDependencies(expr, c);
    };
    // 在数据计算环境下计算表达式的依赖关系
    ExprContext.prototype.calcDataDependencies = function (expr) {
        var c = [];
        var i = 1;
        while (i < arguments.length) {
            c.push({
                isEntityData: false,
            });
            i++;
        }
        return this.calcDependencies(expr, c);
    };
    // 向栈顶添加新的计算环境
    ExprContext.prototype.pushEntityCurrent = function (entityName, cursor) {
        this.exprContext.push([{
                current: entityName,
                cursor: (cursor),
                isEntityData: true,
            }]);
    };
    // 删除栈顶的计算环境
    ExprContext.prototype.popEntityCurrent = function () {
        this.exprContext.pop();
    };
    return ExprContext;
}(Context));

// 表达式列表
// ----------
var ExprList = (function () {
    function ExprList() {
        this.list = [];
        this.cache = {};
        this.sorted = false;
    }
    ExprList.prototype._getExprs = function (entity, property, type) {
        var name = property ? entity + "." + property : entity;
        var isLoadOrAdd = type === "L" || type === "A";
        var key = name + "|" + type;
        var r = this.sorted ? this.cache[key] : [];
        if (!r) {
            r = [];
            var s_1 = {};
            var l_1 = {};
            var list_1 = [];
            for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
                var item = _a[_i];
                if (item.types) {
                    if (item.types.indexOf(type) >= 0) {
                        list_1.push(item);
                    }
                }
                else {
                    list_1.push(item);
                }
            }
            var fn_1 = function (fullName, entityName) {
                for (var i = 0; i < list_1.length; i++) {
                    if (l_1[i] !== true) {
                        l_1[i] = true;
                        var x = list_1[i];
                        var f = isLoadOrAdd && (x.entityName === entityName && x.entityName !== "");
                        if (!f && x.dependencies) {
                            for (var _i = 0, _a = x.dependencies; _i < _a.length; _i++) {
                                var dependency = _a[_i];
                                f = dependency === fullName;
                                if (f) {
                                    break;
                                }
                            }
                        }
                        if (f && !s_1[i]) {
                            s_1[i] = true;
                            fn_1(x.fullName, entityName);
                        }
                        l_1[i] = false;
                    }
                }
            };
            fn_1(name, name);
            for (var k = 0; k < list_1.length; k++) {
                if (s_1[k]) {
                    var o = {};
                    for (var p in list_1[k]) {
                        if (list_1[k].hasOwnProperty(p)) {
                            o[p] = list_1[k][p];
                        }
                    }
                    r.push(o);
                }
            }
            this._doUpdateMode(r, type, name, entity, property);
            this.cache[key] = r;
        }
        return r;
    };
    ExprList.prototype._doUpdateMode = function (r, t, name, entity, property) {
        var updateList = [{
                entityName: entity,
                fullName: name,
                propertyName: property,
                type: t,
                updateMode: "Single",
                updateTarget: "",
            }];
        for (var _i = 0, r_1 = r; _i < r_1.length; _i++) {
            var item = r_1[_i];
            this._doGetMode(updateList, item);
            updateList.push({
                entityName: item.entityName,
                fullName: item.fullName,
                propertyName: item.propertyName,
                type: "U",
                updateMode: item.updateMode,
                updateTarget: item.updateTarget,
            });
        }
    };
    ExprList.prototype._doGetMode = function (updateList, l) {
        var modeList = [];
       
        if (updateList && l && l.dependencies) {
            for (var _i = 0, _a = updateList.length; _i < _a.length; _i++) {
                var updateItem = _a[_i];
                for (var _b = 0, _c = l.dependencies; _b < _c.length; _b++) {
                    var dependency = _c[_b];
                    if (updateItem.fullName === dependency) {
                        var commonAncestry = true;
                        var isSubChange = false;
                       
                        if (updateItem.type === "U") {
                           
                            var isDependEntity = false;
                            for (var _d = 0, _e = l.dependencies; _d < _e.length; _d++) {
                                var depend = _e[_d];
                                isDependEntity = (updateItem.fullName.indexOf(depend + ".") === 0);
                                if (isDependEntity) {
                                    break;
                                }
                            }
                            if (updateItem.entityName === l.entityName) {
                               
                                if (isDependEntity) {
                                    modeList.push({ updateMode: "All" });
                                }
                                else {
                                    modeList.push({ updateMode: "Single" });
                                }
                            }
                            else if (l.entityName.indexOf(updateItem.entityName + ".") === 0) {
                               
                                if (isDependEntity) {
                                    modeList.push({ updateMode: "All" });
                                }
                                else {
                                    modeList.push({
                                        updateMode: "BranchUpdate",
                                        updateTarget: this._doGetUpdateTarget(updateItem.entityName, l.entityName),
                                    });
                                }
                            }
                            else if (updateItem.entityName.indexOf(l.entityName + ".") === 0) {
                               
                                modeList.push({ updateMode: "Single" });
                                isSubChange = true;
                            }
                            else {
                               
                                modeList.push({ updateMode: "All" });
                                commonAncestry = false;
                            }
                        }
                        else if (updateItem.type === "R") {
                           
                            if (updateItem.entityName === l.entityName) {
                               
                                modeList.push({ updateMode: "All" });
                            }
                            else if (l.entityName.indexOf(updateItem.entityName + ".") === 0) {
                               
                                modeList.push({
                                    updateMode: "BranchDelete",
                                    updateTarget: this._doGetUpdateTarget(updateItem.entityName, l.entityName),
                                });
                            }
                            else if (updateItem.entityName.indexOf(l.entityName + ".") === 0) {
                               
                                modeList.push({ updateMode: "Single" });
                                isSubChange = true;
                            }
                            else {
                               
                                modeList.push({ updateMode: "All" });
                                commonAncestry = false;
                            }
                        }
                        else {
                           
                            if (updateItem.entityName === l.entityName) {
                               
                                modeList.push({ updateMode: "All" });
                            }
                            else if (l.entityName.indexOf(updateItem.entityName + ".") === 0) {
                               
                                modeList.push({ updateMode: "All" });
                            }
                            else if (updateItem.entityName.indexOf(l.entityName + ".") === 0) {
                               
                                modeList.push({ updateMode: "Single" });
                                isSubChange = true;
                            }
                            else {
                               
                                modeList.push({ updateMode: "All" });
                                commonAncestry = false;
                            }
                        }
                        if (commonAncestry && !isSubChange) {
                            modeList.push({ updateMode: updateItem.updateMode, updateTarget: updateItem.updateTarget });
                        }
                    }
                }
            }
        }
       
        var a = "Single";
        var at = "";
        var b;
        var bt;
        for (var _f = 0, modeList_1 = modeList; _f < modeList_1.length; _f++) {
            var item = modeList_1[_f];
            b = item.updateMode;
            bt = item.updateTarget || "";
            if (a === b && (a === "BranchDelete" || a === "BranchUpdate")) {
                if (at.length > bt.length) {
                    at = bt;
                }
            }
            else if (b === "BranchDelete" || a === "Single") {
                a = b;
                at = bt;
            }
            else if (a === "BranchDelete" || b === "Single") {
            }
            else if (b === "All") {
                a = b;
                at = bt;
            }
        }
        l.updateMode = a;
        l.updateTarget = at;
    };
    ExprList.prototype._doGetUpdateTarget = function (parent, me) {
        var p = parent.split(".");
        var m = me.split(".");
        p.push(m[p.length]);
        return p.join(".");
    };
    // 重置表达式列表对象
    ExprList.prototype.reset = function () {
        this.list = [];
        this.cache = {};
        this.sorted = false;
    };
    // 添加表达式
    ExprList.prototype.add = function (expr, entityName, propertyName, types, callback, scope) {
        this.cache = {};
        this.sorted = false;
        var index = -1;
        for (var i = 0; i < this.list.length; i++) {
            var item = this.list[i];
            if (item.expr === expr && item.entityName === entityName && item.propertyName === propertyName &&
                item.types === types && item.callback === callback && item.scope === scope) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            this.list.push({
                callback: (callback),
                entityName: entityName || "",
                expr: expr || "",
                fullName: propertyName ? entityName + "." + propertyName : entityName || "",
                propertyName: propertyName || "",
                scope: (scope),
                types: (types),
            });
        }
    };
    // 删除表达式
    ExprList.prototype.remove = function (expr, entityName, propertyName, types, callback, scope) {
        this.cache = {};
        this.sorted = false;
        for (var i = 0; i < this.list.length; i++) {
            var item = this.list[i];
            if (item.expr === expr && item.entityName === entityName && item.propertyName === propertyName &&
                item.types === types && item.callback === callback && item.scope === scope) {
                this.list.splice(i, 1);
                break;
            }
        }
    };
    // 检查和排序表达式列表
    ExprList.prototype.checkAndSort = function (dependCallback) {
        this.cache = {};
        this.sorted = true;
        var msg = "";
        for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
            var item = _a[_i];
            if (!item.dependencies && dependCallback) {
                var d = dependCallback(item.expr, item.entityName);
                msg = d.errorMsg;
                if (msg === "") {
                    item.dependencies = d.dependencies;
                }
                else {
                    msg = format(locale.getLocale().MSG_ES_PARSER, item.entityName, item.expr, msg);
                    break;
                }
            }
        }
        if (msg === "") {
           
            var fillList_1 = [];
            var newList_1 = [];
            var findItem_1 = function (list, item) {
                var r = false;
                for (var _i = 0, list_2 = list; _i < list_2.length; _i++) {
                    var listItem = list_2[_i];
                    if (listItem === item) {
                        r = true;
                    }
                }
                return r;
            };
            var depends_1 = function (item, stack) {
                if (!findItem_1(stack, item)) {
                    for (var _i = 0, fillList_2 = fillList_1; _i < fillList_2.length; _i++) {
                        var fillItem = fillList_2[_i];
                        var f = false;
                        if (item && item.dependencies) {
                            for (var _a = 0, _b = item.dependencies; _a < _b.length; _a++) {
                                var dependency = _b[_a];
                                f = fillItem.fullName === dependency;
                                if (f) {
                                    break;
                                }
                            }
                        }
                        if (f) {
                            stack.push(item);
                            depends_1(fillItem, stack);
                        }
                    }
                    if (!findItem_1(newList_1, item)) {
                        newList_1.push(item);
                    }
                }
            };
            for (var _b = 0, _c = this.list; _b < _c.length; _b++) {
                var item = _c[_b];
                if (item.fullName !== "") {
                    fillList_1.push(item);
                }
            }
            for (var _d = 0, fillList_3 = fillList_1; _d < fillList_3.length; _d++) {
                var fillItem = fillList_3[_d];
                depends_1(fillItem, []);
            }
            for (var _e = 0, _f = this.list; _e < _f.length; _e++) {
                var item = _f[_e];
                if (item.fullName === "") {
                    newList_1.push(item);
                }
            }
            this.list = newList_1;
        }
        return msg;
    };
    ExprList.prototype.getExprsByUpdate = function (entityName, propertyName) {
        return this._getExprs(entityName, propertyName, "U");
    };
    ExprList.prototype.getExprsByLoad = function (entityName) {
        return this._getExprs(entityName, "", "L");
    };
    ExprList.prototype.getExprsByAdd = function (entityName) {
        return this._getExprs(entityName, "", "A");
    };
    ExprList.prototype.getExprsByRemove = function (entityName) {
        return this._getExprs(entityName, "", "R");
    };
    return ExprList;
}());

// 多语言 - 中文
// ----------
locale.defineLocale("zh-cn", {
    // context
    MSG_EC_FUNC_E: "只有实体对象才可以调用 {0} 方法",
    MSG_EC_FUNC_P: "{0} 没有名称为 {1} 的方法或参数不匹配",
    MSG_EC_FUNC_T: "{0} 没有与名称为 {1} 的相匹配的方法",
    MSG_EC_PROP_E: "{0} 无法获取属性: {1}",
    MSG_EC_PROP_N: "属性不存在: {0}",
    MSG_EC_VARI_I: "参数索引不存在: {0}",
    MSG_EC_VARI_N: "参数不存在: {0}",
    // funtion
    MSG_EF_MODEL: "\"{0}\" 不是合法的匹配模式",
    MSG_EF_STR_TO_DATE: "\"{0}\" 无法被 \"{1}\" 格式化为日期时间",
    MSG_EF_STR_TO_NUM: "\"{0}\" 无法被转换为数字",
    // lexer
    MSG_EL_SYNTAX_ON: "{0} 不是合法的八进制数",
    MSG_EL_SYNTAX_S: "{0} 引号不匹配",
    MSG_EL_SYNTAX_UC: "{0} 不是合法的unicode字符",
    MSG_EL_SYNTAX_XN: "{0} 不是合法的十六进制数",
    // parser
    MSG_EP_EMPTY: "表达式不能为空",
    MSG_EP_LEXICAL_B: "{0} 无法作为表达式的开头",
    MSG_EP_LEXICAL_E: "{0} 无法作为表达式的结尾",
    MSG_EP_LEXICAL_L: "{0} 后不允许出现 {1}",
    MSG_EP_MATCH: "{0} 不匹配",
    MSG_EP_SYNTAX_A: "数组中不允许使用 {0} 操作符",
    MSG_EP_SYNTAX_C: "{0} 操作符必须存在于{}、[]、()中",
    MSG_EP_SYNTAX_D: "{0} 无法做属性访问操作",
    MSG_EP_SYNTAX_E: "{0} 前不允许表达式存在",
    MSG_EP_SYNTAX_M: "{0} 在不是函数参数列表时不允许出现\",\"分隔符",
    MSG_EP_SYNTAX_N: "该处 {0} 无意义",
    MSG_EP_SYNTAX_O: "对象书写格式不正确",
    MSG_EP_SYNTAX_P: "{0} 操作符必须存在于{}中",
    MSG_EP_SYNTAX_SUB: "[]用作下标访问时不允许出现 {0} 分隔符",
    MSG_EP_UNKNOWN: "无法识别 {0}",
    // list
    MSG_ES_PARSER: "作用于实体“{0}”上的表达式“{1}”解析出错：{2}",
    // type & value
    MSG_EX_ADD: "{0} 和 {1} 无法做加法运算",
    MSG_EX_AND: "{0} 和 {1} 无法做逻辑与运算",
    MSG_EX_AND_L: "{0} 无法做逻辑与运算的左运算数",
    MSG_EX_COMPARE_A: "{0} 和 {1} 无法做大于运算",
    MSG_EX_COMPARE_B: "{0} 和 {1} 无法做小于运算",
    MSG_EX_COMPARE_C: "{0} 和 {1} 无法做大于等于运算",
    MSG_EX_COMPARE_D: "{0} 和 {1} 无法做小于等于运算",
    MSG_EX_DIVIDE: "{0} 和 {1} 无法做除法运算",
    MSG_EX_DIVIDE_N: "{0} 不能作为除数使用",
    MSG_EX_DOT: "{0} 无法做属性访问操作",
    MSG_EX_EQUAL: "{0} 和 {1} 无法做相等运算",
    MSG_EX_EQUAL_N: "{0} 和 {1} 无法做不等运算",
    MSG_EX_FUNC_NULL: "null 不能调用 {0} 方法",
    MSG_EX_LN: "{0} 无法做自然对数运算",
    MSG_EX_LOG: "无法做以 {0} 为底 {1} 的对数运算",
    MSG_EX_MULTIPLY: "{0} 和 {1} 无法做乘法运算",
    MSG_EX_NEGATIVE: "{0} 无法做一元负数运算",
    MSG_EX_OR: "{0} 和 {1} 无法做逻辑或运算",
    MSG_EX_OR_L: "{0} 无法做逻辑或运算的左运算数",
    MSG_EX_POSITIVE: "{0} 无法做一元正数运算",
    MSG_EX_REMAINDER: "{0} 和 {1} 无法做余数运算",
    MSG_EX_REMAINDER_N: "{0} 不能作为除数使用",
    MSG_EX_ROUND: "做四舍五入运算时，保留小数位数不能为负数: {0}",
    MSG_EX_SUBSCRIPT: "{0} 无法做下标操作",
    MSG_EX_SUBSCRIPT_T: "下标必须为数字: {0}",
    MSG_EX_SUBSCRIPT_U: "{0} 下标越界: {1}",
    MSG_EX_SUBTRACT: "{0} 和 {1} 无法做减法运算",
    MSG_EX_TRUNC: "做截断运算时，保留小数位数不能为负数: {0}",
});
// 函数描述
locale.defineFunction("zh-cn", {
    "FieldDisplayName": { fn: "获取当前字段别名", p: [], r: "字段别名（显示名称）" },
    "FieldName": { fn: "获取当前字段唯一标识", p: [], r: "字段唯一标识" },
    "FieldValue": { fn: "获取当前字段值", p: [], r: "字段值" },
    "IIf": { fn: "条件判断函数，如果第一个参数为true，则获取第二个参数，否则获取第三个参数", p: ["条件值", "真值", "假值"], r: "第二个参数或第三个参数" },
    "IfNull": { fn: "空值判断函数，如果第一个参数为null，则获取第二个参数，否则获取第一个参数", p: ["值", "默认值"], r: "第一个参数或第二个参数" },
    "Now": { fn: "获取本地当前日期时间", p: [], r: "本地当前日期时间" },
    "Parent": { fn: "获取当前实体的父实体对象，如果当前为根则获取自己", p: [], r: "父实体对象" },
    "PropValue": { fn: "获取对象属性值", p: ["对象或数组(没有分隔符则获取数组第一个元素，有分隔符获取数组所有元素集合)", "属性名", "分隔符?"], r: "属性值" },
    "Random": { fn: "返回介于 0 ~ 1 之间的一个随机数", p: [], r: "数字" },
    "RecNo": { fn: "获取当前实体的索引号，没有记录返回-1", p: [], r: "索引号" },
    "Root": { fn: "获取实体根对象", p: [], r: "实体根对象" },
    "array.Average": { fn: "获取集合元素的平均值", p: ["表达式?"], r: "平均值" },
    "array.Count": { fn: "获取集合元素个数", p: [], r: "个数" },
    "array.Distinct": { fn: "获取集合中唯一元素的集合", p: ["表达式?"], r: "集合" },
    "array.Max": { fn: "获取集合元素的最大值", p: ["表达式?"], r: "最大值" },
    "array.Min": { fn: "获取集合元素的最小值", p: ["表达式?"], r: "最小值" },
    "array.Sum": { fn: "获取集合元素的合计值", p: ["表达式?"], r: "合计值" },
    "array.Where": { fn: "获取满足条件的元素集合", p: ["条件表达式"], r: "集合" },
    "boolean.ToString": { fn: "转换布尔类型为字符串", p: [], r: "字符串" },
    "date.DateOf": { fn: "获取 Date 对象的日期部分", p: [], r: "日期" },
    "date.DayOf": { fn: "从 Date 对象获取一个月中的某一天（1 ~ 31）", p: [], r: "日" },
    "date.DayOfWeek": { fn: "得到一周中的星期几（0 ~ 6）", p: [], r: "周" },
    "date.DaysBetween": { fn: "获取日期差", p: ["结束日期时间"], r: "日差" },
    "date.HourOf": { fn: "从 Date 对象获取一天中的第几个小时", p: [], r: "时" },
    "date.HoursBetween": { fn: "获取小时差", p: ["结束日期时间"], r: "时差" },
    "date.IncDay": { fn: "增加指定的天数", p: ["天数"], r: "日期时间" },
    "date.IncHour": { fn: "增加指定的小时数", p: ["小时数"], r: "日期时间" },
    "date.IncMinute": { fn: "增加指定的分钟数", p: ["分钟数"], r: "日期时间" },
    "date.IncMonth": { fn: "增加指定的月数", p: ["月数"], r: "日期时间" },
    "date.IncSecond": { fn: "增加指定的秒数", p: ["秒数"], r: "日期时间" },
    "date.IncWeek": { fn: "增加指定的周数", p: ["周数"], r: "日期时间" },
    "date.IncYear": { fn: "增加指定的年数", p: ["年数"], r: "日期时间" },
    "date.MilliSecondOf": { fn: "从 Date 对象获取毫秒", p: [], r: "毫秒" },
    "date.MilliSecondsBetween": { fn: "获取毫秒差", p: ["结束日期时间"], r: "毫秒差" },
    "date.MinuteOf": { fn: "从 Date 对象获取分钟（0 ~ 59）", p: [], r: "分" },
    "date.MinutesBetween": { fn: "获取分钟差", p: ["结束日期时间"], r: "分差" },
    "date.MonthOf": { fn: "从 Date 对象获取月份（1 ~ 12）", p: [], r: "月" },
    "date.MonthsBetween": { fn: "获取月份差", p: ["结束日期时间"], r: "月差" },
    "date.SecondOf": { fn: "从 Date 对象获取秒数（0 ~ 59）", p: [], r: "秒" },
    "date.SecondsBetween": { fn: "获取秒差", p: ["结束日期时间"], r: "秒差" },
    "date.ToString": { fn: "转换日期时间类型为字符串", p: ["日期时间格式?"], r: "字符串" },
    "date.WeekOf": { fn: "从 Date 对象获取一年中的第几周（1 ~ 53）", p: [], r: "周" },
    "date.WeeksBetween": { fn: "获取周差", p: ["结束日期时间"], r: "周差" },
    "date.YearOf": { fn: "从 Date 对象获取年份", p: [], r: "年" },
    "date.YearsBetween": { fn: "获取年差", p: ["结束日期时间"], r: "年差" },
    "number.Abs": { fn: "获取数的绝对值", p: [], r: "绝对值" },
    "number.Ceil": { fn: "对数进行向上取整", p: [], r: "数值" },
    "number.Cos": { fn: "获取数的余弦", p: [], r: "余弦" },
    "number.Exp": { fn: "获取 e 的指数", p: [], r: "指数" },
    "number.Floor": { fn: "对数进行向下取整", p: [], r: "数值" },
    "number.Ln": { fn: "获取数的自然对数（底为 e）", p: [], r: "自然对数" },
    "number.Log": { fn: "获取数的指定底数的对数", p: ["底数"], r: "对数" },
    "number.Power": { fn: "获取数的指定指数的次幂", p: ["指数"], r: "次幂" },
    "number.Round": { fn: "根据保留的小数位数对数四舍五入", p: ["保留小数位数"], r: "数值" },
    "number.Sin": { fn: "获取数的正弦", p: [], r: "正弦" },
    "number.Sqrt": { fn: "获取数的平方根", p: [], r: "平方根" },
    "number.Tan": { fn: "获取树的正切值", p: [], r: "正切值" },
    "number.ToRMB": { fn: "获取人民币大写", p: ["是否人民币(默认true)?", "是否大写(默认true)?"], r: "人民币大写" },
    "number.ToString": { fn: "转换数字类型为字符串", p: [], r: "字符串" },
    "number.Trunc": { fn: "根据保留的小数位数对数进行截断", p: ["保留小数位数"], r: "数值" },
    "object.Parent": { fn: "获取父实体对象，如果当前为根则获取自己", p: [], r: "父实体对象" },
    "object.RecNo": { fn: "获取当前实体的索引号，没有实体返回-1", p: [], r: "索引号" },
    "string.LeftString": { fn: "获取字符串的左子字符串，指定长度", p: ["长度"], r: "子字符串" },
    "string.Length": { fn: "获取字符串长度", p: [], r: "字符串长度" },
    "string.Lower": { fn: "转换字符串为小写", p: [], r: "小写字符串" },
    "string.Pos": { fn: "检索字符串，获取子字符串在字符串中的起始位置", p: ["子字符串"], r: "位置索引" },
    "string.Replace": { fn: "字符串替换", p: ["被搜索的子字符串", "用于替换的子字符串", "匹配模式?"], r: "替换后的新字符串" },
    "string.ReplaceReg": { fn: "正则替换", p: ["用于匹配子字符串的正则表达式", "用于替换的子字符串", "匹配模式?"], r: "替换后的新字符串" },
    "string.RightString": { fn: "获取字符串的右子字符串，指定长度", p: ["长度"], r: "子字符串" },
    "string.SubString": { fn: "获取字符串的子字符串，指定开始位置和长度", p: ["开始位置", "长度"], r: "子字符串" },
    "string.ToDate": { fn: "转换字符串类型为日期时间", p: ["日期时间格式?"], r: "日期时间" },
    "string.ToNumber": { fn: "转换字符串类型为数字", p: [], r: "数字" },
    "string.ToString": { fn: "转换字符串类型为字符串", p: [], r: "字符串" },
    "string.Trim": { fn: "去除字符串两端空格", p: [], r: "字符串" },
    "string.TrimLeft": { fn: "去除字符串左端空格", p: [], r: "字符串" },
    "string.TrimRight": { fn: "去除字符串右端空格", p: [], r: "字符串" },
    "string.Upper": { fn: "转换字符串为大写", p: [], r: "大写字符串" },
});

// 表达式管理器
// ----------
var ExprManager = (function () {
    // 构造函数
    function ExprManager() {
        this.exprContext = new ExprContext();
        this.exprList = new ExprList();
        this.addFunction(func);
    }
    // 注册函数
    ExprManager.prototype.addFunction = function (funcs) {
        return this.exprContext.addFunction(funcs);
    };
    // 获取函数列表对象
    ExprManager.prototype.getFunction = function () {
        return this.exprContext.getFunction();
    };
    // 获取表达式列表对象
    ExprManager.prototype.getExpressionList = function () {
        return this.exprList;
    };
    // 检查和排序表达式列表
    ExprManager.prototype.checkAndSort = function () {
        return this.exprList.checkAndSort((function (context) { return function (expr, entityName) {
            return context.calcEntityDependencies(expr, entityName);
        }; })(this.exprContext));
    };
    // 添加表达式
    ExprManager.prototype.addExpression = function (expr, entityName, propertyName, types, callback, scope) {
       
        this.exprList.add(expr, entityName, propertyName, types, callback, scope);
        return this;
    };
    // 删除表达式
    ExprManager.prototype.removeExpression = function (expr, entityName, propertyName, types, callback, scope) {
       
        this.exprList.remove(expr, entityName, propertyName, types, callback, scope);
        return this;
    };
    // 重置表达式列表对象
    ExprManager.prototype.resetExpression = function () {
        this.exprList.reset();
        return this;
    };
    // 计算表达式
    ExprManager.prototype.calcExpression = function (type, info) {
        var list;
        switch (type) {
            case "load":
                list = this.exprList.getExprsByLoad(info.entityName);
                break;
            case "add":
                list = this.exprList.getExprsByAdd(info.entityName);
                break;
            case "update":
                list = this.exprList.getExprsByUpdate(info.entityName, info.propertyName);
                break;
            case "remove":
                list = this.exprList.getExprsByRemove(info.entityName);
                break;
            default:
                break;
        }
        for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
            var item = list_1[_i];
            info.exprInfo = item;
            item.callback.call(item.scope, type, info);
        }
        return this;
    };
    // 初始化
    ExprManager.prototype.init = function (data, dataContext, context) {
        this.exprContext.setData(data);
        this.exprContext.setDataContext(dataContext);
        this.exprContext.setPageContext(context || {});
        return this;
    };
    // 计算表达式的依赖关系
    ExprManager.prototype.calcDependencies = function (expr, entityName) {
        return this.exprContext.calcEntityDependencies(expr, entityName);
    };
    // 计算表达式的值
    ExprManager.prototype.calcExpr = function (expr, entityName, dataCursor, field) {
       
        this.exprContext.setDataCursor(dataCursor);
        if (field) {
            this.exprContext.pushContextVariables(field);
        }
        var r = this.exprContext.calcEntityExpr(expr, entityName, dataCursor[entityName]);
        if (field) {
            this.exprContext.popContextVariables();
        }
        return r;
    };
    // 计算表达式的值
    ExprManager.prototype.calc = function (expr, data) {
        return this.exprContext.calcDataExpr(expr, data);
    };
    return ExprManager;
}());

return ExprManager;

})));
