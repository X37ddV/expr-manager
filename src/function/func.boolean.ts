// Boolean
const funcBooleanToString = {
    fn: (context, source) => {
        /// <summary>转换布尔类型为字符串</summary>
        /// <param name="source" type="Boolean"></param>
        /// <returns type="Object">字符串</returns>
        return context.genValue(source.toValue() + "");
    },
    p: [],
    r: "string",
};
export default {
    ToString: funcBooleanToString,
};
