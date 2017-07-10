import func from "./function/func";
import ExprContext, { IFunction } from "./lib/context";
import ExprList from "./lib/list";
import "./locale/zh-cn";

// 表达式管理器
// ----------

export default class ExprManager {
    private exprContext: ExprContext = new ExprContext();
    private exprList: ExprList = new ExprList();
    // 构造函数
    constructor() {
        this.regFunction(func);
    }
    // 注册函数
    public regFunction(funcs: IFunction): IFunction {
        return this.exprContext.regFunction(funcs);
    }
    // 获取函数列表对象
    public getFunction(): IFunction {
        return this.exprContext.getFunction();
    }
    // 获取表达式列表对象
    public getExpressionList() {
        return this.exprList;
    }
    // 检查和排序表达式列表
    public checkAndSort() {
        return this.exprList.checkAndSort(((context) => (expr, entityName) =>
            context.calcEntityDependencies(expr, entityName))(this.exprContext));
    }
    // 添加表达式
    public addExpression(expr: string, entityName: string, propertyName: string, types, callback, scope) {
        /// types = "L|A|U|R"
        this.exprList.add(expr, entityName, propertyName, types, callback, scope);
        return this;
    }
    // 删除表达式
    public removeExpression(expr: string, entityName: string, propertyName: string, types, callback, scope) {
        /// types = "L|A|U|R"
        this.exprList.remove(expr, entityName, propertyName, types, callback, scope);
        return this;
    }
    // 重置表达式列表对象
    public resetExpression() {
        this.exprList.reset();
        return this;
    }
    // 计算表达式
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
        for (const item of list) {
            info.exprInfo = item;
            item.callback.call(item.scope, type, info);
        }
        return this;
    }
    // 初始化
    public init(data, dataContext, context) {
        this.exprContext.setData(data);
        this.exprContext.setDataContext(dataContext);
        this.exprContext.setPageContext(context || {});
        return this;
    }
    // 计算表达式的依赖关系
    public calcDependencies(expr: string, entityName: string) {
        return this.exprContext.calcEntityDependencies(expr, entityName);
    }
    // 计算表达式的值
    public calcExpr(expr: string, entityName: string, dataCursor, field) {
        /// field = {FieldDisplayName: "", FieldName: "", FieldValue: ""}
        this.exprContext.setDataCursor(dataCursor);
        if (field) {
            this.exprContext.pushContextVariables(field);
        }
        const r = this.exprContext.calcEntityExpr(expr, entityName, dataCursor[entityName]);
        if (field) {
            this.exprContext.popContextVariables();
        }
        return r;
    }
    // 计算表达式的值
    public calc(expr: string, data) {
        return this.exprContext.calcDataExpr(expr, data);
    }
}
