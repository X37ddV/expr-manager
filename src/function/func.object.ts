import ExprContext from "../lib/context";

// 对象函数
// ----------

// 获取父实体对象，如果当前为根则获取自己
const funcObjectParent = {
    e: "parent",
    fn: (context: ExprContext, source) => {
        return context.getParentValue(source);
    },
    p: [],
    r: "object",
};
// 获取当前实体的索引号，没有实体返回-1
const funcObjectRecNo = {
    e: "value",
    fn: (context: ExprContext, source) => {
        return context.getRecNo(source);
    },
    p: [],
    r: "number",
};
// 对象函数列表
export default {
    Parent: funcObjectParent,
    RecNo: funcObjectRecNo,
};
