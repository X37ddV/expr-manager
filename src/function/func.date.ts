import moment from "moment";

// 日期函数
// ----------

// 转换日期时间类型为字符串
const funcDateToString = {
    fn: (context, source, format) => {
        return context.genValue(moment(source.toValue()).format(format || ""));
    },
    p: ["string?"],
    r: "string",
};
// 获取 Date 对象的日期部分
const funcDateDateOf = {
    fn: (context, source) => {
        return context.genValue(moment(source.toValue()).startOf("day").toDate());
    },
    p: [],
    r: "date",
};
// 从 Date 对象获取一个月中的某一天（1 ~ 31）
const funcDateDayOf = {
    fn: (context, source) => {
        return context.genValue(moment(source.toValue()).date());
    },
    p: [],
    r: "number",
};
// 得到一周中的星期几（0 ~ 6）
const funcDateDayOfWeek = {
    fn: (context, source) => {
        return context.genValue(moment(source.toValue()).day());
    },
    p: [],
    r: "number",
};
// 获取日期差
const funcDateDaysBetween = {
    fn: (context, source, endDate) => {
        return context.genValue(-moment(source.toValue()).diff(endDate, "days"));
    },
    p: ["date"],
    r: "number",
};
// 从 Date 对象获取一天中的第几个小时
const funcDateHourOf = {
    fn: (context, source) => {
        return context.genValue(moment(source.toValue()).hour());
    },
    p: [],
    r: "number",
};
// 获取小时差
const funcDateHoursBetween = {
    fn: (context, source, endDate) => {
        return context.genValue(-moment(source.toValue()).diff(endDate, "hours"));
    },
    p: ["date"],
    r: "number",
};
// 增加指定的天数
const funcDateIncDay = {
    fn: (context, source, days) => {
        return context.genValue(moment(source.toValue()).add(days, "days").toDate());
    },
    p: ["number"],
    r: "date",
};
// 增加指定的小时数
const funcDateIncHour = {
    fn: (context, source, hours) => {
        return context.genValue(moment(source.toValue()).add(hours, "hours").toDate());
    },
    p: ["number"],
    r: "date",
};
// 增加指定的分钟数
const funcDateIncMinute = {
    fn: (context, source, minutes) => {
        return context.genValue(moment(source.toValue()).add(minutes, "minutes").toDate());
    },
    p: ["number"],
    r: "date",
};
// 增加指定的月数
const funcDateIncMonth = {
    fn: (context, source, months) => {
        return context.genValue(moment(source.toValue()).add(months, "months").toDate());
    },
    p: ["number"],
    r: "date",
};
// 增加指定的秒数
const funcDateIncSecond = {
    fn: (context, source, seconds) => {
        return context.genValue(moment(source.toValue()).add(seconds, "seconds").toDate());
    },
    p: ["number"],
    r: "date",
};
// 增加指定的周数
const funcDateIncWeek = {
    fn: (context, source, weeks) => {
        return context.genValue(moment(source.toValue()).add(weeks, "weeks").toDate());
    },
    p: ["number"],
    r: "date",
};
// 增加指定的年数
const funcDateIncYear = {
    fn: (context, source, years) => {
        return context.genValue(moment(source.toValue()).add(years, "years").toDate());
    },
    p: ["number"],
    r: "date",
};
// 从 Date 对象获取毫秒
const funcDateMilliSecondOf = {
    fn: (context, source) => {
        return context.genValue(moment(source.toValue()).millisecond());
    },
    p: [],
    r: "number",
};
// 获取毫秒差
const funcDateMilliSecondsBetween = {
    fn: (context, source, endDate) => {
        return context.genValue(-moment(source.toValue()).diff(endDate, "milliseconds"));
    },
    p: ["date"],
    r: "number",
};
// 从 Date 对象获取分钟（0 ~ 59）
const funcDateMinuteOf = {
    fn: (context, source) => {
        return context.genValue(moment(source.toValue()).minute());
    },
    p: [],
    r: "number",
};
// 获取分钟差
const funcDateMinutesBetween = {
    fn: (context, source, endDate) => {
        return context.genValue(-moment(source.toValue()).diff(endDate, "minutes"));
    },
    p: ["date"],
    r: "number",
};
// 从 Date 对象获取月份（1 ~ 12）
const funcDateMonthOf = {
    fn: (context, source) => {
        return context.genValue(moment(source.toValue()).month() + 1);
    },
    p: [],
    r: "number",
};
// 获取月份差
const funcDateMonthsBetween = {
    fn: (context, source, endDate) => {
        return context.genValue(-moment(source.toValue()).diff(endDate, "months"));
    },
    p: ["date"],
    r: "number",
};
// 从 Date 对象获取秒数（0 ~ 59）
const funcDateSecondOf = {
    fn: (context, source) => {
        return context.genValue(moment(source.toValue()).second());
    },
    p: [],
    r: "number",
};
// 获取秒差
const funcDateSecondsBetween = {
    fn: (context, source, endDate) => {
        return context.genValue(-moment(source.toValue()).diff(endDate, "seconds"));
    },
    p: ["date"],
    r: "number",
};
// 从 Date 对象获取一年中的第几周（1 ~ 53）
const funcDateWeekOf = {
    fn: (context, source) => {
        return context.genValue(moment(source.toValue()).week());
    },
    p: [],
    r: "number",
};
// 获取周差
const funcDateWeeksBetween = {
    fn: (context, source, endDate) => {
        return context.genValue(-moment(source.toValue()).diff(endDate, "weeks"));
    },
    p: ["date"],
    r: "number",
};
// 从 Date 对象获取年份
const funcDateYearOf = {
    fn: (context, source) => {
        return context.genValue(moment(source.toValue()).year());
    },
    p: [],
    r: "number",
};
// 获取年差
const funcDateYearsBetween = {
    fn: (context, source, endDate) => {
        return context.genValue(-moment(source.toValue()).diff(endDate, "years"));
    },
    p: ["date"],
    r: "number",
};
// 日期函数列表
export default {
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
