//     expr-manager.js 0.2.3
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

moment = moment && 'default' in moment ? moment['default'] : moment;
Decimal = Decimal && 'default' in Decimal ? Decimal['default'] : Decimal;

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
    for (var _i = 0, _a = token.childs || []; _i < _a.length; _i++) {
        var item = _a[_i];
        if (eachToken(item, fn, scope) === false) {
            r = false;
            break;
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
// 比较**值**是否相等
function compare(fobj, sobj) {
    return JSON.stringify(fobj) === JSON.stringify(sobj);
}
// 合并对象，浅遍历
function merger(o, c) {
    for (var p in c) {
        if (c.hasOwnProperty(p)) {
            o[p] = c[p];
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
        return context.genValue(r, undefined, null, "");
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
            var r = "";
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
                        if (r.length > 0 && r.split("")[0] !== cn[0]) {
                            r = cn[0] + r;
                        }
                    }
                    else {
                        r = c + (cw[Math.floor((i - 1) / 4)] || "") + r;
                    }
                    c = "";
                    t = [];
                }
            }
            // - 处理小数部分
            if (y.length > 0) {
                r += cd;
                for (var k = 0; k < y.length; k++) {
                    var m = Number(y[k]);
                    if (isRMB) {
                        // + 避免小数点后 "零" 的重覆出现
                        if ((m !== 0) || (r.substring(r.length - 1) !== cn[0]) || (k > 2)) {
                            r += cn[m];
                        }
                        if ((m !== 0) || (r.substring(r.length - 1) === cn[0]) && (k === 2)) {
                            r += cl[k] || "";
                        }
                    }
                    else {
                        r += cn[m];
                    }
                }
            }
            else {
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
        return context.genValue(conversion(source.toValue(), rmb === undefined || rmb, big === undefined || big));
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
        this.localeName = "en";
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
        return context.genValue(source.toValue().length);
    },
    p: [],
    r: "number",
};
// 转换字符串为大写
var funcStringUpper = {
    fn: function (context, source) {
        return context.genValue(source.toValue().toUpperCase());
    },
    p: [],
    r: "string",
};
// 转换字符串为小写
var funcStringLower = {
    fn: function (context, source) {
        return context.genValue(source.toValue().toLowerCase());
    },
    p: [],
    r: "string",
};
// 去除字符串两端空格
var funcStringTrim = {
    fn: function (context, source) {
        return context.genValue(source.toValue().trim());
    },
    p: [],
    r: "string",
};
// 去除字符串左端空格
var funcStringTrimLeft = {
    fn: function (context, source) {
        return context.genValue(source.toValue().replace(/^\s+/g, ""));
    },
    p: [],
    r: "string",
};
// 去除字符串右端空格
var funcStringTrimRight = {
    fn: function (context, source) {
        return context.genValue(source.toValue().replace(/\s+$/g, ""));
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
        return context.genValue(value.substring(left, right));
    },
    p: ["number", "number"],
    r: "string",
};
// 获取字符串的左子字符串，指定长度
var funcStringLeftString = {
    fn: function (context, source, len) {
        return context.genValue(source.toValue().substring(0, len));
    },
    p: ["number"],
    r: "string",
};
// 获取字符串的右子字符串，指定长度
var funcStringRightString = {
    fn: function (context, source, len) {
        var value = source.toValue();
        return context.genValue(value.substring(value.length - len, value.length));
    },
    p: ["number"],
    r: "string",
};
// 检索字符串，获取子字符串在字符串中的起始位置
var funcStringPos = {
    fn: function (context, source, subValue) {
        return context.genValue(source.toValue().indexOf(subValue));
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
                    if (index >= 0) {
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
    "": func__,
    "array": func_array,
    "boolean": func_boolean,
    "date": func_date,
    "number": func_number,
    "object": func_object,
    "string": func_string,
};

// 表达式计算
// ----------
var Calc = (function () {
    function Calc() {
        this.values = {};
    }
    // 对表达式进行语法分析和数值计算
    Calc.prototype.calc = function (expr, context) {
        var r;
        var p = context.getParserInfo(expr);
        if (p.errorMsg === "") {
            var msg = this.doCalc(p.rootToken, context);
            if (msg === "") {
                r = this.values[p.rootToken.id];
                r.tokens = p.tokens;
                r.rootToken = p.rootToken;
            }
            else {
                r = context.genErrorValue(msg);
            }
        }
        else {
            r = context.genErrorValue(p.errorMsg);
        }
        return r;
    };
    // 对表达式进行数值计算
    Calc.prototype.doCalc = function (rootToken, context) {
        var t = rootToken;
        var p = t.parent;
        var msg = "";
        var l;
        var r;
        var tv;
        var lv;
        var rv;
        var isIfNull = context.isIfNullToken(t);
        var isIIf = context.isIIfToken(t);
        for (var i = 0; i < t.childs.length; i++) {
            msg = this.doCalc(t.childs[i], context);
            if (msg !== "") {
                break;
            }
            else if (i === 0) {
                l = t.childs[0];
                lv = this.values[l.id];
                if (isIfNull && lv.toValue() !== null) {
                    break;
                }
                else if (isIIf && !lv.toValue()) {
                    i++;
                }
                else if (t.tokenType === "TK_OR" && lv.toValue() === true ||
                    t.tokenType === "TK_AND" &&
                        (lv.toValue() === false || lv.type === "null")) {
                    break;
                }
            }
            else if (i === 1) {
                r = t.childs[1];
                rv = this.values[r.id];
                if (isIIf) {
                    break;
                }
            }
        }
        if (msg === "") {
            switch (t.tokenType) {
                case "TK_STRING":
                    tv = context.genValue(t.tokenValue, "string");
                    break;
                case "TK_NUMBER":
                    tv = context.genValue(t.tokenValue, "number");
                    break;
                case "TK_BOOL":
                    tv = context.genValue(t.tokenValue === "true", "boolean");
                    break;
                case "TK_NULL":
                    tv = context.genValue(null, "null");
                    break;
                case "TK_IDEN":
                    tv = context.genValue(t.tokenValue, "string");
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
                case "TK_EO":
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
                    }
                    break;
                case "VTK_COMMA":
                    tv = context.genValue([], "array");
                    for (var _i = 0, _a = t.childs; _i < _a.length; _i++) {
                        var item = _a[_i];
                        lv = this.values[item.id];
                        tv.arrayPush(lv);
                    }
                    break;
                case "VTK_PAREN":
                    tv = (t.childs.length === 0) ?
                        context.genValue([], "array") :
                        (p && p.tokenType === "TK_IDEN" && l.tokenType !== "VTK_COMMA") ?
                            context.genValue([], "array").arrayPush(lv) :
                            lv;
                    break;
                case "VTK_ARRAY":
                    tv = context.genValue([], "array");
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
                    tv = context.genValue({}, "object");
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
            }
            msg = tv.errorMsg;
            if (msg === "") {
                this.values[t.id] = tv;
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
        this.types = {};
    }
    // 对表达式进行语法分析和依赖关系计算
    Check.prototype.check = function (expr, context) {
        var _this = this;
        var r;
        var p = context.getParserInfo(expr);
        if (p.errorMsg === "") {
            var msg = this.doCheck(p.rootToken, context);
            if (msg === "") {
                r = this.types[p.rootToken.id];
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
                    var tt = _this.types[token.id];
                    if (tt && tt.depends) {
                        pushDepends_1(tt.depends);
                    }
                    if (tt && tt.entity) {
                        var pp = token.parent;
                        var pt = pp ? _this.types[pp.id] : null;
                        if (!pt || !pt.entity) {
                            pushDepends_1(tt.entity.fullName);
                        }
                    }
                    return true;
                }, this);
                r.dependencies = ds_1;
            }
            else {
                r = context.genErrorType(msg);
            }
        }
        else {
            r = context.genErrorType(p.errorMsg);
        }
        return r;
    };
    // 检查表达式运算关系正确性
    Check.prototype.doCheck = function (rootToken, context) {
        var t = rootToken;
        var p = t.parent;
        var msg = "";
        var l;
        var r;
        var tt;
        var lt;
        var rt;
        for (var i = 0; i < t.childs.length; i++) {
            msg = this.doCheck(t.childs[i], context);
            if (msg !== "") {
                break;
            }
            else if (i === 0) {
                l = t.childs[0];
                lt = this.types[l.id];
            }
            else if (i === 1) {
                r = t.childs[1];
                rt = this.types[r.id];
            }
        }
        if (msg === "") {
            switch (t.tokenType) {
                case "TK_STRING":
                    tt = context.genType("string", "string", t.tokenValue);
                    break;
                case "TK_NUMBER":
                    tt = context.genType("number", "number", t.tokenValue);
                    break;
                case "TK_BOOL":
                    tt = context.genType("boolean", "boolean", t.tokenValue);
                    break;
                case "TK_NULL":
                    tt = context.genType("null", "null", t.tokenValue);
                    break;
                case "TK_IDEN":
                    tt = context.genType("string", "string", t.tokenValue);
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
                case "TK_EO":
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
                    }
                    break;
                case "VTK_COMMA":
                    tt = context.genType("array", [], []);
                    for (var _i = 0, _a = t.childs; _i < _a.length; _i++) {
                        var item = _a[_i];
                        lt = this.types[item.id];
                        tt.arrayPush(lt);
                    }
                    break;
                case "VTK_PAREN":
                    if (t.childs.length === 0) {
                        tt = context.genType("array", [], []);
                    }
                    else {
                        tt = (p && p.tokenType === "TK_IDEN" && l.tokenType !== "VTK_COMMA") ?
                            context.genType("array", [], []).arrayPush(lt) :
                            lt;
                    }
                    break;
                case "VTK_ARRAY":
                    tt = context.genType("array", [], []);
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
                    tt = context.genType("object", {}, {});
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
            }
            msg = tt.errorMsg;
            if (msg === "") {
                this.types[t.id] = tt;
            }
        }
        return msg;
    };
    return Check;
}());

// 词法分析器
// ----------
var Lexer = (function () {
    function Lexer() {
        this.expr = []; // 表达式字符数组
        this.index = 0; // 当前索引位置
    }
    // 设置表达式
    Lexer.prototype.setExpr = function (expr) {
        this.expr = expr.split("");
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
                    switch (tValue) {
                        case "[":
                            tType = "TK_LA";
                            break;
                        case "]":
                            tType = "TK_RA";
                            break;
                        case "{":
                            tType = "TK_LO";
                            break;
                        case "}":
                            tType = "TK_RO";
                            break;
                        case ".":
                            tType = "TK_DOT";
                            break;
                        case "(":
                            tType = "TK_LP";
                            break;
                        case ")":
                            tType = "TK_RP";
                            break;
                        case "*":
                            tType = "TK_MULTI";
                            break;
                        case "/":
                            tType = "TK_DIV";
                            break;
                        case "%":
                            tType = "TK_MOD";
                            break;
                        case "+":
                            tType = "TK_PLUS";
                            break;
                        case "-":
                            tType = "TK_MINUS";
                            break;
                        case ":":
                            tType = "TK_COLON";
                            break;
                        case ",":
                            tType = "TK_COMMA";
                            break;
                    }
                    break;
                case "!":
                    tValue = s[n++];
                    if (n < s.length && s[n] === "=") {
                        tValue += s[n++];
                        tType = "TK_EO";
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
                    tValue = s[n++];
                    if (n < s.length && s[n] === "=") {
                        tValue += s[n++];
                        tType = "TK_EO";
                    }
                    else {
                        tType = "TK_UNKNOWN";
                    }
                    tText = tValue;
                    break;
                case "&":
                case "|":
                    tValue = s[n++];
                    if (n < s.length && s[n] === tValue) {
                        switch (tValue) {
                            case "&":
                                tType = "TK_AND";
                                break;
                            case "|":
                                tType = "TK_OR";
                                break;
                        }
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
    "TK_CO,TK_EO,TK_AND,TK_OR,TK_COLON,TK_COMMA").split(",");
var genTokenState = function (tks, opts) {
    var r = {};
    tks.forEach(function (v, i) { return r[v] = opts[i] === "1"; });
    return r;
};
// 起始节点规则
var RULE_BTOKENS = genTokenState(tokens, "01111101110001100000000000".split(""));
// 结束节点规则
var RULE_ETOKENS = genTokenState(tokens, "01111100001110000000000000".split(""));
// 后序节点规则
var RULE_LEXICAL = (function (tks, opts) {
    var r = {};
    tks.forEach(function (v, i) { return r[v] = genTokenState(tks, opts[i].split("")); });
    return r;
})(tokens, ("00000000000000000000000000," +
    "00000010101110011111111111," +
    "00000010001110011111111111," +
    "00000010001110011111111111," +
    "00000000001110011111111111," +
    "00000011101110011111111111," +
    "00000100000000000000000000," +
    "01111101111001100000000000," +
    "01111101110101100000000000," +
    "01111100000010000000000000," +
    "00000010101110011111111101," +
    "00000010101110011111111101," +
    "00000010111110011111111101," +
    "01111101110001100000000000," +
    "01111101110001100000000000," +
    "01111101110001100000000000," +
    "01111101110001100000000000," +
    "01111101110001100000000000," +
    "01111101110001100000000000," +
    "01111101110001100000000000," +
    "01111101110001100000000000," +
    "01111101110001100000000000," +
    "01111101110001100000000000," +
    "01111101110001100000000000," +
    "01111101110001100000000000," +
    "01111101110001100000000000"
).split(","));

// 语法解析器
// ----------
var Parser = (function () {
    function Parser() {
        this.errorMsg = "";
        this.tokens = [];
        this.rootToken = null;
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
        var v = "";
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
        // - 处理 < <= > >= 比较运算符
        p = this.doParser_4(p, "TK_CO");
        // - 处理 == != 等于运算符
        p = this.doParser_4(p, "TK_EO");
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
                        msg = format(locale.getLocale().MSG_EP_SYNTAX_D, t.childs[0].tokenText);
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
                        if (t.childs[0].tokenType === "VTK_COMMA") {
                            if (t.parent && t.parent.tokenType === "VTK_SUBSCRIPT" &&
                                t.parent.childs[0] !== t) {
                                msg = format(locale.getLocale().MSG_EP_SYNTAX_SUB, ",");
                            }
                            for (var _i = 0, _a = t.childs[0].childs; _i < _a.length; _i++) {
                                var item = _a[_i];
                                if (item.tokenType === "TK_COLON") {
                                    msg = format(locale.getLocale().MSG_EP_SYNTAX_A, ":");
                                    break;
                                }
                            }
                        }
                    }
                    break;
                // - 大括号检查
                case "VTK_OBJECT":
                    var y = void 0;
                    if (t.childs && (t.childs.length === 0 || hasToken("TK_COLON,VTK_COMMA", t.childs[0].tokenType))) {
                        if (t.childs.length > 0 && t.childs[0].tokenType === "VTK_COMMA") {
                            for (var _b = 0, _c = t.childs[0].childs; _b < _c.length; _b++) {
                                var item = _c[_b];
                                y = item.tokenType === "TK_COLON";
                                if (!y) {
                                    break;
                                }
                            }
                        }
                        else {
                            y = true;
                        }
                    }
                    else {
                        y = false;
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
        this.errorMsg = (errorMsg || "").trim();
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
    // 追加数组元素
    Type.prototype.arrayPush = function (et) {
        this.info.push(et.info);
        this.data.push(et.data);
        return this;
    };
    // 连接数组元素
    Type.prototype.arrayConcat = function (et) {
        this.info = this.info.concat(et.info);
        this.data = this.data.concat(et.data);
        return this;
    };
    // 设置对象属性
    Type.prototype.objectSetProperty = function (et) {
        var h = et.info;
        this.info[h.key] = h.value;
        var d = et.data;
        this.data[d.key] = d.value;
        return this;
    };
    // 批量设置对象属性
    Type.prototype.objectSetProperties = function (et) {
        for (var _i = 0, _a = et.info; _i < _a.length; _i++) {
            var item = _a[_i];
            this.info[item.key] = item.value;
        }
        for (var _b = 0, _c = et.data; _b < _c.length; _b++) {
            var item = _c[_b];
            this.data[item.key] = item.value;
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
            (et.type === "number" || et.type === "undefined" || et.type === "null")) {
            t = (et.hasData() && (et.data === "null" || et.type === "number" && Number(et.data) === 0)) ?
                this.genErrorType(format(locale.getLocale().MSG_EX_DIVIDE_N, et.data)) :
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
                this.genErrorType(format(locale.getLocale().MSG_EX_REMAINDER_N, et.data)) :
                this.genType("number");
        }
        else {
            t = this.genErrorType(format(locale.getLocale().MSG_EX_REMAINDER, this.type, et.type));
        }
        return t;
    };
    // 加法
    Type.prototype.add = function (et) {
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
        if (et.info && et.info.length === 1) {
            var i = et.info[0];
            if (this.type === "string" || this.type === "array") {
                if (i === "number" || i === "undefined") {
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
        }
        else {
            t = this.genErrorType(format(locale.getLocale().MSG_EX_SUBSCRIPT_N));
        }
        return t;
    };
    // 获取{key:...,value:...}键值对对象
    Type.prototype.hashItem = function (et) {
        return this.genType("object", { key: this.data, value: et.info }, { key: this.data, value: et.data });
    };
    // 获取变量值类型对象
    Type.prototype.getVariableType = function (et) {
        return (et && et.type !== "object" && et.type !== "undefined") ?
            this.genErrorType(format(locale.getLocale().MSG_EX_DOT, et.type)) :
            this.context.getVariableType(this.data, et);
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
        this.errorMsg = (errorMsg || "").trim();
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
        ev = ev || this.genValue(null);
        this.toValue().push(ev.toValue());
        return this;
    };
    // 连接数组元素
    Value.prototype.arrayConcat = function (ev) {
        this.value = this.toValue().concat(ev.toValue());
        return this;
    };
    // 设置对象属性
    Value.prototype.objectSetProperty = function (ev) {
        var h = ev.toValue();
        this.value[h.key] = h.value;
        return this;
    };
    // 批量设置对象属性
    Value.prototype.objectSetProperties = function (ev) {
        var h = ev.toValue();
        for (var _i = 0, h_1 = h; _i < h_1.length; _i++) {
            var item = h_1[_i];
            this.value[item.key] = item.value;
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
            var errorMsg = op === "-" ? locale.getLocale().MSG_EX_NEGATIVE : locale.getLocale().MSG_EX_POSITIVE;
            v = this.genErrorValue(format(errorMsg, this.type));
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
        else if ((this.type === "number" || this.type === "null") &&
            (ev.type === "number" || ev.type === "null")) {
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
        else if ((ev.type === "null" || ev.type === "number" && ev.value === "0")) {
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
        else if ((ev.type === "null" || ev.type === "number" && ev.value === "0")) {
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
            var val = [];
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
                    val.push(left);
                }
            }
            v = this.genValue(val, "array");
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
            var val = vl.equals(vr);
            v = this.genValue(b ? val : !val, "boolean");
        }
        else if (this.type === ev.type) {
            var val = compare(this.value, ev.value);
            v = this.genValue(b ? val : !val, "boolean");
        }
        else {
            var val = b ? locale.getLocale().MSG_EX_EQUAL : locale.getLocale().MSG_EX_EQUAL_N;
            v = this.genErrorValue(format(val, this.type, ev.type));
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
            v = this.genValue(false, "boolean");
        }
        else {
            v = ((this.type === "boolean" || this.type === "null") && (ev.type === "boolean" || ev.type === "null")) ?
                this.genValue(!!(this.value && ev.value), "boolean") :
                this.genErrorValue(format(locale.getLocale().MSG_EX_AND, this.type, ev.type));
        }
        return v;
    };
    // 或运算
    Value.prototype.or = function (ev) {
        var v;
        if (!ev) {
            v = this.genValue(true, "boolean");
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
                v = this.genErrorValue(format(locale.getLocale().MSG_EX_SUBSCRIPT_T, t));
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
        var v = Big(this.value);
        return this.genValue(v.abs().toString(), "number");
    };
    // 向上取整
    Value.prototype.ceil = function () {
        var v = Big(this.value);
        return this.genValue(v.ceil().toString(), "number");
    };
    // 向下取整
    Value.prototype.floor = function () {
        var v = Big(this.value);
        return this.genValue(v.floor().toString(), "number");
    };
    // 四舍五入保留scale位小数
    Value.prototype.round = function (scale) {
        var v;
        if (scale >= 0) {
            v = Big(this.value);
            v = v.toDecimalPlaces(scale, 4);
            v = this.genValue(v.toString(), "number");
        }
        else {
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_ROUND, scale.toString()));
        }
        return v;
    };
    // 按精度截断数据
    Value.prototype.trunc = function (scale) {
        var v;
        if (scale >= 0) {
            v = Big(this.value);
            v = v.toDecimalPlaces(scale, 1);
            v = this.genValue(v.toString(), "number");
        }
        else {
            v = this.genErrorValue(format(locale.getLocale().MSG_EX_TRUNC, scale.toString()));
        }
        return v;
    };
    // 获取数的余弦
    Value.prototype.cos = function () {
        var v = Big(this.value);
        var name = "cos";
        v = v[name]();
        return this.genValue(v.toString(), "number");
    };
    // 获取 e 的指数
    Value.prototype.exp = function () {
        var v = Big(this.value);
        v = v.exp();
        return this.genValue(v.toString(), "number");
    };
    // 获取数的自然对数（底为 e）
    Value.prototype.ln = function () {
        var value;
        var v = Big(this.value);
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
        var v = Big(this.value);
        if (v.greaterThan("0") && base > 0 && base !== 1) {
            v = v.log(base);
            value = this.genValue(v.toString(), "number");
        }
        else {
            value = this.genErrorValue(format(locale.getLocale().MSG_EX_LOG, base.toString(), v.toString()));
        }
        return value;
    };
    // 获取数的指定指数的次幂
    Value.prototype.power = function (exponent) {
        var v = Big(this.value);
        v = v.pow(exponent);
        return this.genValue(v.toString(), "number");
    };
    // 获取数的正弦
    Value.prototype.sin = function () {
        var v = Big(this.value);
        var name = "sin";
        v = v[name]();
        return this.genValue(v.toString(), "number");
    };
    // 获取数的平方根
    Value.prototype.sqrt = function () {
        var v = Big(this.value);
        v = v.sqrt();
        return this.genValue(v.toString(), "number");
    };
    // 获取树的正切值
    Value.prototype.tan = function () {
        var v = Big(this.value);
        var name = "tan";
        v = v[name]();
        return this.genValue(v.toString(), "number");
    };
    return Value;
}());

var Context = (function () {
    function Context() {
        this.exprCache = {};
    }
    // 得到解析信息
    Context.prototype.getParserInfo = function (expr) {
        var r = this.exprCache[expr];
        if (!r) {
            r = new Parser().parser(expr);
            this.exprCache[expr] = r;
            if (!r.errorMsg) {
                var p = new Check();
                r.errorMsg = p.check(expr, this).errorMsg;
            }
        }
        return r;
    };
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
    // 获取函数返回结果类型对象
    Context.prototype.getFunctionType = function (name, source, paramType, paramData) {
        return this.doGetFunctionType(name, source, paramType, paramData);
    };
    // 获取函数返回值
    Context.prototype.getFunctionValue = function (name, source, paramValue) {
        return this.doGetFunctionValue(name, source, paramValue);
    };
    // 获取变量类型对象
    Context.prototype.getVariableType = function (name, source) {
        return this.doGetVariableType(name, source);
    };
    // 获取变量值
    Context.prototype.getVariableValue = function (name, source) {
        return this.doGetVariableValue(name, source);
    };
    // 获取实体类型对象
    Context.prototype.getEntityType = function (source) {
        return this.doGetEntityType(source);
    };
    // 获取实体值，根据游标索引
    Context.prototype.getEntityValue = function (source, index) {
        return this.doGetEntityValue(source, index);
    };
    // 是否为IfNull(1,2)函数形式的","结点
    Context.prototype.isIfNullToken = function (token) {
        return isFunctionToken(token, this.doGetIsIfNullTokenName());
    };
    // 是否为IIf(true,1,2)函数形式的","结点
    Context.prototype.isIIfToken = function (token) {
        return isFunctionToken(token, this.doGetIsIIfTokenName());
    };
    return Context;
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
        var c = this.curr[0];
        c.pIndex = index || 0;
        return c.params[c.pIndex].isEntityData;
    };
    // 得到栈顶计算环境的params属性的第index条记录存储的实体名
    ExprCurrent.prototype.getEntityName = function (index) {
        return this.isEntityData(index) ? this.getData(index) : "";
    };
    // 得到实体全名称entityName的访问游标
    ExprCurrent.prototype.getEntityDataCursor = function (entityName, index) {
        var r = this.dataCursor[entityName];
       
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
        var c = this.curr[0];
        c.pIndex = index || 0;
        var p = c.params[c.pIndex];
        return c.params[c.pIndex].current;
    };
    return ExprCurrent;
}());

// 表达式上下文
// ----------
var ExprContext = (function (_super) {
    __extends(ExprContext, _super);
    function ExprContext() {
        _super.apply(this, arguments);
        this.exprCurrent = new ExprCurrent();
        this.pageContext = { $C: {} };
        this.contextVariables = [];
        this.functions = {};
    }
    // 获取函数返回结果类型对象
    ExprContext.prototype.doGetFunctionType = function (name, source, paramType, paramData) {
        var r;
        var t = (source !== null) ?
            (source.entity ? source.entity.type : source.type) :
            "";
        var ft = this.getFuncType(t, name, paramType);
        if (ft === null) {
            r = this.genErrorType(format(locale.getLocale().MSG_EC_FUNC_P, t === "undefined" ? "" : t, name));
        }
        else {
            var depends = [];
            if (ft.p) {
                var pd = paramData;
                for (var i = 0; i < ft.p.length; i++) {
                    if (ft.p[i] === "expr" && paramType[i] === "string" && getValueType(pd[i]) === "string") {
                        var dr = (source && source.entity) ?
                            this.calcEntityDependencies(pd[i], source.entity.fullName) :
                            this.calcDataDependencies(pd[i]);
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
                        if (source === null || source.entity) {
                            var entityName = source === null ?
                                this.exprCurrent.getEntityName() :
                                source.entity.fullName;
                            entity = this.getParentName(entityName);
                            if (entity) {
                                type = "object";
                            }
                            else {
                                r = this.genErrorType(format(locale.getLocale().MSG_EC_FUNC_R, "Parent"));
                            }
                        }
                        else {
                            r = this.genErrorType(format(locale.getLocale().MSG_EC_FUNC_E, "Parent"));
                        }
                        break;
                    case "data":
                    case "value":
                        var n = null;
                        if (source === null) {
                            n = this.exprCurrent.getEntityName();
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
                    if (this.exprCurrent.isValid(pIndex)) {
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
            if (this.exprCurrent.isEntityData(pIndex)) {
                var entity = void 0;
                var type = void 0;
                if (source === null) {
                    entity = this.genEntityInfo(this.getPropertyName(this.exprCurrent.getEntityName(pIndex), name));
                    if (entity) {
                        type = name === "" ? "object" : entity.type;
                    }
                    else {
                        r = this.genErrorType(format(locale.getLocale().MSG_EC_PROP_N, name));
                    }
                }
                else {
                    if (source.entity) {
                        entity = this.genEntityInfo(this.getPropertyName(source.entity.fullName, name));
                        type = entity ? entity.type : "undefined";
                    }
                    else {
                        type = "undefined";
                    }
                }
                if (!r) {
                    r = this.genType(type, type, name, entity);
                }
            }
            else {
                r = this.genType("undefined");
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
                name = "";
            }
        }
        if (!r) {
            var value = void 0;
            if (this.exprCurrent.isEntityData(pIndex)) {
                var entity = void 0;
                var parentObj = void 0;
                if (source === null) {
                    entity = this.genEntityInfo(this.getPropertyName(this.exprCurrent.getEntityName(pIndex), name));
                    if (!entity) {
                        r = this.genErrorValue(format(locale.getLocale().MSG_EC_PROP_N, name));
                    }
                    else {
                        value = (entity.field !== "" || name === "") ?
                            this.getEntityData(entity.name, pIndex) :
                            this.getEntityData(this.getParentName(entity.name), pIndex);
                        parentObj = null;
                    }
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
                   
                    if (value && !(source === null && name === "")) {
                        value = value[name];
                    }
                    if (value === undefined) {
                        value = null;
                    }
                    r = this.genValue(value, null, entity, "", parentObj);
                    if (r && r.type === "array" && r.entity) {
                        r.entity.map = [];
                        for (var i = 0; i < value.length; i++) {
                            r.entity.map.push(i);
                        }
                    }
                }
            }
            else {
                value = (source === null) ?
                    this.exprCurrent.getData(pIndex) :
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
                    if (value === undefined) {
                        value = null;
                    }
                    r = this.genValue(value);
                }
            }
        }
        return r;
    };
    // 获取实体类型对象
    ExprContext.prototype.doGetEntityType = function (source) {
        var e = this.genEntityInfo(source.entity.fullName, "object");
        var t = this.genType("object", "object", undefined, e, [e.fullName]);
        return t;
    };
    // 获取实体值，根据游标索引
    ExprContext.prototype.doGetEntityValue = function (source, index) {
        var v = source.toValue()[index];
        var e = this.genEntityInfo(source.entity.fullName, "object");
        e.recNo = source.entity.map[index];
        var parentObj = source.parentObj;
        var r = this.genValue(v, getValueType(v), e, "", parentObj);
        return r;
    };
    // 获取IfNull函数名称
    ExprContext.prototype.doGetIsIfNullTokenName = function () {
        return "IfNull";
    };
    // 获取IIf函数名称
    ExprContext.prototype.doGetIsIIfTokenName = function () {
        return "IIf";
    };
    // 设置数据游标
    ExprContext.prototype.setDataCursor = function (cursor) {
        this.exprCurrent.setDataCursor(cursor);
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
    // 注册函数
    ExprContext.prototype.regFunction = function (func) {
        for (var g in func) {
            if (func.hasOwnProperty(g)) {
                var group = func[g];
                for (var n in group) {
                    if (group.hasOwnProperty(n)) {
                        var fullName = g ? g + "." + n : n;
                        group[n].getLocale = (function (key) { return function () { return locale.getFunction()[key]; }; })(fullName);
                    }
                }
            }
        }
        return merger(this.functions, func);
    };
    // 获取函数
    ExprContext.prototype.getFunction = function () {
        return this.functions;
    };
    // 获取实体信息
    ExprContext.prototype.genEntityInfo = function (fullName, type) {
        var name = [];
        var field = [];
        var dataType;
        if (fullName !== "") {
            var p = fullName.split(".");
            var x = p[0];
            var c = this.dataContext;
            if (c && x && c[x]) {
                var t = c[x];
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
        if (this.exprCurrent.isEntityData()) {
            var entityName = void 0;
            if (source === null) {
                entityName = this.exprCurrent.getEntityName();
            }
            else if (source.entity && source.entity.field === "") {
                if (source.parentObj && this.getParentName(source.entity.fullName)) {
                    r = source.parentObj;
                }
                else {
                    entityName = source.entity.fullName;
                }
            }
            else {
                r = this.genErrorValue(format(locale.getLocale().MSG_EC_FUNC_E, "Parent"));
            }
            if (!r && entityName) {
                var entity = this.genEntityInfo(this.getParentName(entityName), "object");
                entity.recNo = this.exprCurrent.getEntityDataCursor(entity.name);
                var value = this.getEntityData(entity.name);
                r = this.genValue(value, undefined, entity);
            }
        }
        return r ? r : this.genValue(null);
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
                var cursor = this.exprCurrent.getEntityDataCursor(cp.join("."), index);
                d = d[cursor];
                if (d === undefined) {
                    break;
                }
            }
        }
        return d;
    };
    // 获取父名称
    ExprContext.prototype.getParentName = function (name) {
        var p = name.split(".");
        p.pop();
        return p.join(".");
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
        if (this.exprCurrent.isEntityData()) {
            var entity = void 0;
            if (source === null) {
                entity = this.exprCurrent.getEntityName();
                var value = this.exprCurrent.getEntityDataCursor(entity);
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
                b = r[j] === "undefined" || p[j] === "undefined" || p[j] === "null" || r[j] === p[j] ||
                    r[j] === getValueType(p[j]) && (r[j] === "array" || r[j] === "object") ||
                    r[j] === "expr" && p[j] === "string";
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
                if (t === "") {
                    t = item.r;
                }
                else if (item.r !== t) {
                    t = "";
                    break;
                }
            }
            r = {
                r: t || "undefined",
            };
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
        this.exprCurrent.push(curr);
        var e = new Calc();
        var r = e.calc(expr, this);
        this.exprCurrent.pop();
        return r;
    };
    // 在实体计算环境下计算表达式的值
    ExprContext.prototype.calcEntityExpr = function (expr, entityName, cursor) {
        return this._calcExpr(expr, [{
                current: entityName,
                cursor: (cursor),
                isEntityData: true,
            }]);
    };
    // 在数据计算环境下计算表达式的值
    ExprContext.prototype.calcDataExpr = function (expr, data) {
        return this._calcExpr(expr, [{
                current: data,
                cursor: 0,
                isEntityData: false,
            }]);
    };
    // 计算表达式的依赖关系
    ExprContext.prototype.calcDependencies = function (expr, curr) {
        this.exprCurrent.push(curr);
        var p = new Check();
        var r = p.check(expr, this);
        this.exprCurrent.pop();
        return r;
    };
    // 在实体计算环境下计算表达式的依赖关系
    ExprContext.prototype.calcEntityDependencies = function (expr, entityName) {
        return this.calcDependencies(expr, [{
                current: entityName,
                cursor: 0,
                isEntityData: true,
            }]);
    };
    // 在数据计算环境下计算表达式的依赖关系
    ExprContext.prototype.calcDataDependencies = function (expr) {
        return this.calcDependencies(expr, [{
                current: "",
                cursor: 0,
                isEntityData: false,
            }]);
    };
    // 向栈顶添加新的计算环境
    ExprContext.prototype.pushEntityCurrent = function (entityName, cursor) {
        this.exprCurrent.push([{
                current: entityName,
                cursor: (cursor),
                isEntityData: true,
            }]);
    };
    // 删除栈顶的计算环境
    ExprContext.prototype.popEntityCurrent = function () {
        this.exprCurrent.pop();
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
                type: "update",
                updateMode: item.updateMode,
                updateTarget: item.updateTarget,
            });
        }
    };
    ExprList.prototype._doGetMode = function (updateList, l) {
        var modeList = [];
       
        for (var _i = 0, updateList_1 = updateList; _i < updateList_1.length; _i++) {
            var updateItem = updateList_1[_i];
            for (var _a = 0, _b = l.dependencies; _a < _b.length; _a++) {
                var dependency = _b[_a];
                if (updateItem.fullName === dependency) {
                    var commonAncestry = true;
                    var isSubChange = false;
                   
                    if (updateItem.type === "update") {
                       
                        var isDependEntity = false;
                        for (var _c = 0, _d = l.dependencies; _c < _d.length; _c++) {
                            var depend = _d[_c];
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
                    else if (updateItem.type === "remove") {
                       
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
       
        var a = "Single";
        var at = "";
        for (var _e = 0, modeList_1 = modeList; _e < modeList_1.length; _e++) {
            var item = modeList_1[_e];
            var b = item.updateMode;
            var bt = item.updateTarget || "";
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
            if (item.expr === (expr || "") && item.entityName === (entityName || "") &&
                item.propertyName === (propertyName || "") &&
                (item.types === types || compare(item.types.sort(), types.sort())) &&
                item.callback === callback && item.scope === scope) {
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
            if (item.expr === (expr || "") && item.entityName === (entityName || "") &&
                item.propertyName === (propertyName || "") &&
                (item.types === types || compare(item.types.sort(), types.sort())) &&
                item.callback === callback && item.scope === scope) {
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
                for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
                    var listItem = list_1[_i];
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
                        for (var _a = 0, _b = item.dependencies; _a < _b.length; _a++) {
                            var dependency = _b[_a];
                            f = fillItem.fullName === dependency;
                            if (f) {
                                break;
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
    // 根据计算类型获取表达式列表
    ExprList.prototype.getExprs = function (type, entity, property) {
        var name = property ? entity + "." + property : entity;
        var isLoadOrAdd = type === "load" || type === "add";
        var key = name + "|" + type;
        var r = this.sorted ? this.cache[key] : [];
        if (!r) {
            r = [];
            var s_1 = {};
            var l_1 = {};
            var list_2 = [];
            for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
                var item = _a[_i];
                if (item.types && item.types.length > 0) {
                    if (item.types.indexOf(type) >= 0) {
                        list_2.push(item);
                    }
                }
                else {
                    list_2.push(item);
                }
            }
            var fn_1 = function (fullName, entityName) {
                for (var i = 0; i < list_2.length; i++) {
                    if (l_1[i] !== true) {
                        l_1[i] = true;
                        var x = list_2[i];
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
            for (var k = 0; k < list_2.length; k++) {
                if (s_1[k]) {
                    r.push(merger({}, list_2[k]));
                }
            }
            this._doUpdateMode(r, type, name, entity, property);
            this.cache[key] = r;
        }
        return r;
    };
    return ExprList;
}());

// 表达式管理器
// ----------
var ExprManager = (function () {
    // 构造函数
    function ExprManager() {
        this.exprContext = new ExprContext();
        this.exprList = new ExprList();
        this.regFunction(func);
    }
    // 初始化
    ExprManager.prototype.init = function (data, dataContext, context) {
        this.exprContext.setData(data);
        this.exprContext.setDataContext(dataContext);
        this.exprContext.setPageContext(context || {});
        return this;
    };
    // 注册函数
    ExprManager.prototype.regFunction = function (funcs) {
        this.exprContext.regFunction(funcs);
        return this;
    };
    // 获取函数列表对象
    ExprManager.prototype.getFunction = function () {
        return this.exprContext.getFunction();
    };
    // 重置表达式列表对象
    ExprManager.prototype.resetExpression = function () {
        this.exprList.reset();
        return this;
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
    // 获取表达式列表对象
    ExprManager.prototype.getExpressionList = function (type, entityName, propertyName) {
        return this.exprList.getExprs(type, entityName, propertyName);
    };
    // 检查和排序表达式列表
    ExprManager.prototype.checkAndSort = function () {
        return this.exprList.checkAndSort((function (context) { return function (expr, entityName) {
            return context.calcEntityDependencies(expr, entityName);
        }; })(this.exprContext));
    };
    // 高级依赖计算
    ExprManager.prototype.calcExpression = function (type, info) {
        var list = this.getExpressionList(type, info.entityName, info.propertyName);
        for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
            var item = list_1[_i];
            info.exprInfo = item;
            item.callback.call(item.scope, type, info);
        }
        return this;
    };
    // 依赖关系计算
    ExprManager.prototype.calcDependencies = function (expr, entityName) {
        return this.exprContext.calcEntityDependencies(expr, entityName);
    };
    // 高级计算
    ExprManager.prototype.calcExpr = function (expr, entityName, dataCursor, field) {
       
        dataCursor = dataCursor || {};
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
    // 简单计算
    ExprManager.prototype.calc = function (expr, data) {
        return this.exprContext.calcDataExpr(expr, data);
    };
    // 本地化属性
    ExprManager.locale = locale;
    return ExprManager;
}());

return ExprManager;

})));
