import func from "./function/func";
import Type from "./lib/base/type";
import Value from "./lib/base/value";
import ExprContext, { IFunction } from "./lib/context";
import ExprList, { CalcType } from "./lib/list";
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
    public regFunction(funcs: IFunction): ExprManager {
        this.exprContext.regFunction(funcs);
        return this;
    }
    // 获取函数列表对象
    public getFunction(): IFunction {
        return this.exprContext.getFunction();
    }
    // 获取表达式列表对象
    public getExpressionList(): ExprList {
        return this.exprList;
    }
    // 检查和排序表达式列表
    public checkAndSort(): string {
        return this.exprList.checkAndSort(((context) => (expr, entityName) =>
            context.calcEntityDependencies(expr, entityName))(this.exprContext));
    }
    // 添加表达式
    public addExpression(expr: string, entityName: string, propertyName: string,
                         types: CalcType[], callback, scope) {
        this.exprList.add(expr, entityName, propertyName, types, callback, scope);
        return this;
    }
    // 删除表达式
    public removeExpression(expr: string, entityName: string, propertyName: string,
                            types: CalcType[], callback, scope) {
        this.exprList.remove(expr, entityName, propertyName, types, callback, scope);
        return this;
    }
    // 重置表达式列表对象
    public resetExpression(): ExprManager {
        this.exprList.reset();
        return this;
    }
    // 计算表达式
    public calcExpression(type: CalcType, info): ExprManager {
        const list = this.exprList.getExprs(type, info.entityName, info.propertyName);
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
    public calcDependencies(expr: string, entityName: string): Type {
        return this.exprContext.calcEntityDependencies(expr, entityName);
    }
    // 计算表达式的值
    public calcExpr(expr: string, entityName: string, dataCursor, field): Value {
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
