import ExprContext from "../lib/context";

// 布尔函数
// ----------

// 转换布尔类型为字符串
const funcBooleanToString = {
    fn: (context: ExprContext, source) => {
        return context.genValue(source.toValue() + "");
    },
    p: [],
    r: "string",
};
// 布尔函数列表
export default {
    ToString: funcBooleanToString,
};
