// Object
const funcObjectParent = {
    e: "parent",
    fn: (context, source) => {
        /// <summary>获取父实体对象，如果当前为根则获取自己</summary>
        /// <returns type="Object">父实体对象</returns>
        return context.getParentValue(source);
    },
    p: [],
    r: "object",
};
const funcObjectRecNo = {
    e: "value",
    fn: (context, source) => {
        /// <summary>获取当前实体的索引号，没有实体返回-1</summary>
        /// <returns type="Object">索引号</returns>
        return context.getRecNo(source);
    },
    p: [],
    r: "number",
};
export default {
    Parent: funcObjectParent,
    RecNo: funcObjectRecNo,
};
