import moment from "moment";

// Date
const funcDateToString = {
    fn: (context, source, format) => {
        /// <summary>转换日期时间类型为字符串</summary>
        /// <param name="source" type="Date"></param>
        /// <param name="format" type="String">日期时间格式</param>
        /// <returns type="Object">字符串</returns>
        return context.genValue(moment(source.toValue()).format(format || ""));
    },
    p: ["string?"],
    r: "string",
};
const funcDateDateOf = {
    fn: (context, source) => {
        /// <summary>获取 Date 对象的日期部分</summary>
        /// <param name="source" type="Date"></param>
        /// <returns type="Object">日期</returns>
        return context.genValue(moment(source.toValue()).startOf("day").toDate());
    },
    p: [],
    r: "date",
};
const funcDateDayOf = {
    fn: (context, source) => {
        /// <summary>从 Date 对象获取一个月中的某一天（1 ~ 31）</summary>
        /// <param name="source" type="Date"></param>
        /// <returns type="Object">日</returns>
        return context.genValue(moment(source.toValue()).date());
    },
    p: [],
    r: "number",
};
const funcDateDayOfWeek = {
    fn: (context, source) => {
        /// <summary>得到一周中的星期几（0 ~ 6）</summary>
        /// <param name="source" type="Date"></param>
        /// <returns type="Object">周</returns>
        return context.genValue(moment(source.toValue()).day());
    },
    p: [],
    r: "number",
};
const funcDateDaysBetween = {
    fn: (context, source, endDate) => {
        /// <summary>获取日期差</summary>
        /// <param name="source" type="Date"></param>
        /// <param name="endDate" type="Date">结束日期时间</param>
        /// <returns type="Object">日差</returns>
        return context.genValue(-moment(source.toValue()).diff(endDate, "days"));
    },
    p: ["date"],
    r: "number",
};
const funcDateHourOf = {
    fn: (context, source) => {
        /// <summary>从 Date 对象获取一天中的第几个小时</summary>
        /// <param name="source" type="Date"></param>
        /// <returns type="Object">时</returns>
        return context.genValue(moment(source.toValue()).hour());
    },
    p: [],
    r: "number",
};
const funcDateHoursBetween = {
    fn: (context, source, endDate) => {
        /// <summary>获取小时差</summary>
        /// <param name="source" type="Date"></param>
        /// <param name="endDate" type="Date">结束日期时间</param>
        /// <returns type="Object">时差</returns>
        return context.genValue(-moment(source.toValue()).diff(endDate, "hours"));
    },
    p: ["date"],
    r: "number",
};
const funcDateIncDay = {
    fn: (context, source, days) => {
        /// <summary>增加指定的天数</summary>
        /// <param name="source" type="Date"></param>
        /// <param name="days" type="Number">天数</param>
        /// <returns type="Object">日期时间</returns>
        return context.genValue(moment(source.toValue()).add(days, "days").toDate());
    },
    p: ["number"],
    r: "date",
};
const funcDateIncHour = {
    fn: (context, source, hours) => {
        /// <summary>增加指定的小时数</summary>
        /// <param name="source" type="Date"></param>
        /// <param name="hours" type="Number">小时数</param>
        /// <returns type="Object">日期时间</returns>
        return context.genValue(moment(source.toValue()).add(hours, "hours").toDate());
    },
    p: ["number"],
    r: "date",
};
const funcDateIncMinute = {
    fn: (context, source, minutes) => {
        /// <summary>增加指定的分钟数</summary>
        /// <param name="source" type="Date"></param>
        /// <param name="minutes" type="Number">分钟数</param>
        /// <returns type="Object">日期时间</returns>
        return context.genValue(moment(source.toValue()).add(minutes, "minutes").toDate());
    },
    p: ["number"],
    r: "date",
};
const funcDateIncMonth = {
    fn: (context, source, months) => {
        /// <summary>增加指定的月数</summary>
        /// <param name="source" type="Date"></param>
        /// <param name="months" type="Number">月数</param>
        /// <returns type="Object">日期时间</returns>
        return context.genValue(moment(source.toValue()).add(months, "months").toDate());
    },
    p: ["number"],
    r: "date",
};
const funcDateIncSecond = {
    fn: (context, source, seconds) => {
        /// <summary>增加指定的秒数</summary>
        /// <param name="source" type="Date"></param>
        /// <param name="seconds" type="Number">秒数</param>
        /// <returns type="Object">日期时间</returns>
        return context.genValue(moment(source.toValue()).add(seconds, "seconds").toDate());
    },
    p: ["number"],
    r: "date",
};
const funcDateIncWeek = {
    fn: (context, source, weeks) => {
        /// <summary>增加指定的周数</summary>
        /// <param name="source" type="Date"></param>
        /// <param name="weeks" type="Number">周数</param>
        /// <returns type="Object">日期时间</returns>
        return context.genValue(moment(source.toValue()).add(weeks, "weeks").toDate());
    },
    p: ["number"],
    r: "date",
};
const funcDateIncYear = {
    fn: (context, source, years) => {
        /// <summary>增加指定的年数</summary>
        /// <param name="source" type="Date"></param>
        /// <param name="years" type="Number">年数</param>
        /// <returns type="Object">日期时间</returns>
        return context.genValue(moment(source.toValue()).add(years, "years").toDate());
    },
    p: ["number"],
    r: "date",
};
const funcDateMilliSecondOf = {
    fn: (context, source) => {
        /// <summary>从 Date 对象获取毫秒</summary>
        /// <param name="source" type="Date"></param>
        /// <returns type="Object">毫秒</returns>
        return context.genValue(moment(source.toValue()).millisecond());
    },
    p: [],
    r: "number",
};
const funcDateMilliSecondsBetween = {
    fn: (context, source, endDate) => {
        /// <summary>获取毫秒差</summary>
        /// <param name="source" type="Date"></param>
        /// <param name="endDate" type="Date">结束日期时间</param>
        /// <returns type="Object">毫秒差</returns>
        return context.genValue(-moment(source.toValue()).diff(endDate, "milliseconds"));
    },
    p: ["date"],
    r: "number",
};
const funcDateMinuteOf = {
    fn: (context, source) => {
        /// <summary>从 Date 对象获取分钟（0 ~ 59）</summary>
        /// <param name="source" type="Date"></param>
        /// <returns type="Object">分</returns>
        return context.genValue(moment(source.toValue()).minute());
    },
    p: [],
    r: "number",
};
const funcDateMinutesBetween = {
    fn: (context, source, endDate) => {
        /// <summary>获取分钟差</summary>
        /// <param name="source" type="Date"></param>
        /// <param name="endDate" type="Date">结束日期时间</param>
        /// <returns type="Object">分差</returns>
        return context.genValue(-moment(source.toValue()).diff(endDate, "minutes"));
    },
    p: ["date"],
    r: "number",
};
const funcDateMonthOf = {
    fn: (context, source) => {
        /// <summary>从 Date 对象获取月份（1 ~ 12）</summary>
        /// <param name="source" type="Date"></param>
        /// <returns type="Object">月</returns>
        return context.genValue(moment(source.toValue()).month() + 1);
    },
    p: [],
    r: "number",
};
const funcDateMonthsBetween = {
    fn: (context, source, endDate) => {
        /// <summary>获取月份差</summary>
        /// <param name="source" type="Date"></param>
        /// <param name="endDate" type="Date">结束日期时间</param>
        /// <returns type="Object">月差</returns>
        return context.genValue(-moment(source.toValue()).diff(endDate, "months"));
    },
    p: ["date"],
    r: "number",
};
const funcDateSecondOf = {
    fn: (context, source) => {
        /// <summary>从 Date 对象获取秒数（0 ~ 59）</summary>
        /// <param name="source" type="Date"></param>
        /// <returns type="Object">秒</returns>
        return context.genValue(moment(source.toValue()).second());
    },
    p: [],
    r: "number",
};
const funcDateSecondsBetween = {
    fn: (context, source, endDate) => {
        /// <summary>获取秒差</summary>
        /// <param name="source" type="Date"></param>
        /// <param name="endDate" type="Date">结束日期时间</param>
        /// <returns type="Object">秒差</returns>
        return context.genValue(-moment(source.toValue()).diff(endDate, "seconds"));
    },
    p: ["date"],
    r: "number",
};
const funcDateWeekOf = {
    fn: (context, source) => {
        /// <summary>从 Date 对象获取一年中的第几周（1 ~ 53）</summary>
        /// <param name="source" type="Date"></param>
        /// <returns type="Object">周</returns>
        return context.genValue(moment(source.toValue()).week());
    },
    p: [],
    r: "number",
};
const funcDateWeeksBetween = {
    fn: (context, source, endDate) => {
        /// <summary>获取周差</summary>
        /// <param name="source" type="Date"></param>
        /// <param name="endDate" type="Date">结束日期时间</param>
        /// <returns type="Object">周差</returns>
        return context.genValue(-moment(source.toValue()).diff(endDate, "weeks"));
    },
    p: ["date"],
    r: "number",
};
const funcDateYearOf = {
    fn: (context, source) => {
        /// <summary>从 Date 对象获取年份</summary>
        /// <param name="source" type="Date"></param>
        /// <returns type="Object">年</returns>
        return context.genValue(moment(source.toValue()).year());
    },
    p: [],
    r: "number",
};
const funcDateYearsBetween = {
    fn: (context, source, endDate) => {
        /// <summary>获取年差</summary>
        /// <param name="source" type="Date"></param>
        /// <param name="endDate" type="Date">结束日期时间</param>
        /// <returns type="Object">年差</returns>
        return context.genValue(-moment(source.toValue()).diff(endDate, "years"));
    },
    p: ["date"],
    r: "number",
};
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
