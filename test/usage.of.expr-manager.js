// 简单计算
// ----------
// 创建ExprManager对象
var exprManager = new window.ExprManager();
// 高精度浮点运算
var expr = "0.1 + 0.2";
var v = exprManager.calc(expr);
console.log(v.toValue()); // => 0.3
// 处理计算错误
expr = "1 / 0";
v = exprManager.calc(expr);
if (!v.errorMsg) {
    console.log(v.toValue());
} else {
    console.log(v.errorMsg); // => 0 不能作为除数使用
}
// 简单数据计算
expr = "v1 + ' ' + v2 + '!'";
var calcData = {v1: "hello", v2: "world"};
v = exprManager.calc(expr, calcData);
console.log(v.toValue()); // => "hello world!"
// 表达式函数
expr = "IIf(1 > 2, 'a', 'b')";
v = exprManager.calc(expr);
console.log(v.toValue()); // => "b"
expr = "123.ToRMB()";
v = exprManager.calc(expr);
console.log(v.toValue()); // => "壹佰贰拾叁元整"

// 高级计算
// ----------
// 准备数据
// + 数据结构 - dataContext - 主细表结构定义
// + 数据内容 - data
// + 全局变量 - context
var dataContext = {
    "Table": {
        fields: {
            "Field0": { type: "number", primaryKey: true },
            "Field1": { type: "string" },
            "Field2": { type: "object" },
            "Field3": { type: "array" },
            "Field4": { type: "date" },
            "Field5": { type: "boolean" },
            "CalcField0": { type: "string" },
            "CalcField1": { type: "string" }
        },
        childs: {
            "SubTable": {
                fields: {
                    "Field0": { type: "number", primaryKey: true },
                    "Field1": { type: "string" },
                    "Field2": { type: "object" },
                    "Field3": { type: "array" },
                    "Field4": { type: "date" },
                    "Field5": { type: "boolean" }
                }
            }
        }
    }
};
var data = {
    Table: [{
        Field0: 0,
        Field1: "Hello",
        Field2: {key: "i", value: 0},
        Field3: [0, 1],
        Field4: new Date(),
        Field5: false,
        SubTable: [{
            Field0: 0,
            Field1: "Wrold",
            Field2: {key: "j", value: 10},
            Field3: [2, 3],
            Field4: new Date(),
            Field5: true
        }]
    }]
};
var context = {
    Field0: "!"
};
// 初始化计算环境
exprManager.init(data, dataContext, context);
// 主细表结构计算
// + tableName - 当前表名称
// + dataCursor - 各表当前游标
var tableName = "Table";
var dataCursor = {
    "Table": 0,
    "Table.SubTable": 0
};
expr = "Field1 + ' ' + SubTable[0].Field1 + $C.Field0";
v = exprManager.calcExpr(expr, tableName, dataCursor);
console.log(v.toValue()); // => "Hello World!"
// 表达式依赖关系
var t = exprManager.calcDependencies(expr, tableName);
console.log(t.dependencies); // => ["Table.Field1", "Table.SubTable", "Table.SubTable.Field1"]

// 高级依赖计算
// ----------
// 复位表达式列表
exprManager.resetExpression();
// 计算回调函数
var doCalc = function(type, info) {
    console.log(type);
};
// 添加具有依赖关系的表达式
exprManager.addExpression("Field1 + ' ' + SubTable[0].Field1",
    "Table", "CalcField0", ["load", "add", "update", "remove"],
    doCalc, null);
exprManager.addExpression("CalcField0 + SubTable.Count().ToString()",
    "Table", "CalcField1", ["load", "add", "update", "remove"],
    doCalc, null);
// 表达式列表校验
var errorMsg = exprManager.checkAndSort();
if (!errorMsg) {
    // 触发加载数据计算
    exprManager.calcExpression("load", {
        entityName: "Table"
    }); // => "load"
    // 触发添加记录计算
    exprManager.calcExpression("add", {
        entityName: "Table"
    }); // => "add"
    // 触发更新记录计算
    exprManager.calcExpression("update", {
        entityName: "Table",
        propertyName: "Field1"
    }); // => "update"
    // 触发删除记录计算
    exprManager.calcExpression("remove", {
        entityName: "Table.SubTable"
    }); // => "remove"
} else {
    console.log(errorMsg)
}
