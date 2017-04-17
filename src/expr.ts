import ExprContext from "./expr/context";
import func from "./expr/function/func";
import ExprList from "./expr/list";
import "./expr/locale/zh-cn";

export default class ExprManager {
    private exprContext: ExprContext = new ExprContext();
    private exprList: ExprList = new ExprList();
    constructor() {
        this.addFunction(func);
    }
    public addFunction(funcs) {
        /// <summary>注册函数</summary>
        /// <param name="_func" type="Object">该对象保存各数据类型下已注册的函数</param>
        /// <param name="func" type="Object">该对象的每个字段均代表一个要注册的函数</param>
        /// <returns type="Object">注册函数完成后的函数列表对象</returns>
        return this.exprContext.addFunction(funcs);
    }
    public getFunction() {
        /// <summary>获取函数列表对象</summary>
        /// <returns type="Object">函数列表对象</returns>
        return this.exprContext.getFunction();
    }
    public getExpressionList() {
        /// <summary>获取表达式列表对象</summary>
        return this.exprList;
    }
    public checkAndSort() {
        return this.exprList.checkAndSort(((context) => (expr, entityName) =>
            context.calcEntityDependencies(expr, entityName))(this.exprContext));
    }
    public addExpression(expr, entityName, propertyName, types, callback, scope) {
        /// <summary>添加表达式</summary>
        // types = "L|A|U|R"
        this.exprList.add(expr, entityName, propertyName, types, callback, scope);
        return this;
    }
    public removeExpression(expr, entityName, propertyName, types, callback, scope) {
        /// <summary>删除表达式</summary>
        // types = "L|A|U|R"
        this.exprList.remove(expr, entityName, propertyName, types, callback, scope);
        return this;
    }
    public resetExpression() {
        /// <summary>重置表达式列表对象</summary>
        this.exprList.reset();
        return this;
    }
    public calcExpression(type, info) {
        let list;
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
        for (let i = 0; i < list.length; i++) {
            let l = list[i];
            info.exprInfo = l;
            l.callback.call(l.scope, type, info);
        }
        return this;
    }
    public init(data, dataContext, context) {
        /// <summary>初始化</summary>
        this.exprContext.setData(data);
        this.exprContext.setDataContext(dataContext);
        this.exprContext.setPageContext(context || {});
        return this;
    }
    public calcDependencies(expr, entityName) {
        /// <summary>计算表达式expr的依赖关系</summary>
        return this.exprContext.calcEntityDependencies(expr, entityName);
    }
    public calcExpr(expr, entityName, dataCursor, field) {
        // 计算表达式expr的值
        // field = {FieldDisplayName: "", FieldName: "", FieldValue: ""}
        this.exprContext.setDataCursor(dataCursor);
        if (field) {
            this.exprContext.pushContextVariables(field);
        }
        let r = this.exprContext.calcEntityExpr(expr, entityName, dataCursor[entityName]);
        if (field) {
            this.exprContext.popContextVariables();
        }
        return r;
    }
    public calc(expr, data) {
        // 计算表达式expr的值
        let r = this.exprContext.calcDataExpr(expr, data);
        return r;
    }
}
