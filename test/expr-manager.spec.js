describe("表达式测试", function () {
    var exprManager = new window.ExprManager();
    exprManager.init(window.data, window.dataContext, window.context);
    for (var i = 0; i < window.demoExpr.length; i++) {
        var demo = window.demoExpr[i];
        for (var j = 0; j < demo.exprs.length; j++) {
            var expr = demo.exprs[j][0] || ""; // 表达式
            var exprExpectedValue = demo.exprs[j][1] || ""; // 预期值
            var exprExpectedValueError = demo.exprs[j][2] || ""; // 预期值错误
            var exprExpectedDepen = demo.exprs[j][3] || ""; // 预期依赖
            var exprExpectedDepenError = demo.exprs[j][4] || exprExpectedValueError; // 预期依赖错误
            var itTitle = "[" + i  + "-" + j + "]:" + demo.title + ":" + expr;
            it("Value" + itTitle, (function (expr, exprExpectedValue, exprExpectedValueError) {
                return function() {
                    var val = exprManager.calcExpr(expr, "E1", window.dataCursor, {
                        FieldDisplayName: "",
                        FieldName: "",
                        FieldValue: "",
                    });
                    var exprActualValue = window.JSON.stringify(val.toValue());
                    var exprActualValueError = val.errorMsg;
                    if (exprActualValueError) {
                        expect(exprActualValueError).toEqual(exprExpectedValueError);
                    } else {
                        expect(exprActualValue).toEqual(exprExpectedValue);
                    }
                }
            })(expr, exprExpectedValue, exprExpectedValueError));
            it("Depen" + itTitle, (function (expr, exprExpectedDepen, exprExpectedDepenError) {
                return function() {
                    var valType = exprManager.calcDependencies(expr, "E1");
                    var exprActualDepen = (valType.dependencies && valType.dependencies.join("|")) || "";
                    var exprActualDepenError = valType.errorMsg;
                    if (exprActualDepenError) {
                        expect(exprActualDepenError).toEqual(exprExpectedDepenError);
                    } else {
                        expect(exprActualDepen).toEqual(exprExpectedDepen);
                    }
                }
            })(expr, exprExpectedDepen, exprExpectedDepenError));
        }
    }
});

describe("依赖关系测试", function () {
    var exprManager = new window.ExprManager();
    exprManager.init(window.data, window.dataContext, window.context);
    for (var m = 0; m < window.demoDependencies.length; m++) {
        var demoDepend = window.demoDependencies[m];
        exprManager.resetExpression(); // 重置表达式列表对象
        for (var i in demoDepend.dataSource) {
            var entity = demoDepend.dataSource[i];
            var e = entity.expr;
            var s = i.split(".");
            var p = s.pop();
            exprManager.addExpression(e, s.join("."), p);
        }
        var msg = exprManager.checkAndSort();
        if (msg == "") {
            for (var k = 0; k < demoDepend.testCase.length; k++) {
                var c = demoDepend.testCase[k];
                var type = c.cmd[0];
                var entityName = c.cmd[1];
                var propertyName = c.cmd[2];
                var list = exprManager.getExpressionList(type, entityName, propertyName);
                var pList = [];
                for (var p = 0; p < list.length; p++) {
                    pList.push(list[p].fullName);
                }
                it(demoDepend.title, (function(pList, c) {
                    return function () {
                        expect(pList.join("|")).toEqual(c.r);
                    }
                })(pList, c));
            }
        } else {
            it(demoDepend.title, (function(msg){
                return function () {
                    expect(msg).toEqual("");
                }
            })(msg));
        }
    }
});

describe("接口测试", function () {
    // 准备测试数据
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
    var dataContext = {
        "Table": {
            fields: {
                "Field0": { type: "number", primaryKey: true },
                "Field1": { type: "string" },
                "Field2": { type: "object" },
                "Field3": { type: "array" },
                "Field4": { type: "date" },
                "Field5": { type: "boolean" },
                "CalcField0": { type: "stirng" },
                "CalcField1": { type: "stirng" }
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

    // 初始化ExprManager
    var exprManager = new window.ExprManager();
    exprManager.init(data, dataContext);

    it("表达式列表", (function(exprManager){
        return function () {
            var doCalc = function(type, info) {

            };

            // 添加表达式
            var expr = exprManager.resetExpression();
            expect(expr).toEqual(exprManager);
            expr = exprManager.addExpression(
                "Field1 + ' ' + SubTable[0].Field1",
                "Table", "CalcField0", ["load", "add", "update", "remove"],
                doCalc, null);
            expect(expr).toEqual(exprManager);
            expr = exprManager.addExpression(
                "CalcField0",
                "Table", "CalcField1", ["load", "add", "update", "remove"],
                doCalc, null);
            expect(expr).toEqual(exprManager);
            var err = exprManager.checkAndSort();
            expect(err).toEqual("");

            // 依赖关系
            var dep = exprManager.calcDependencies("CalcField0", "Table");
            expect(dep.errorMsg).toEqual("");

            // 计算表达式
            expr = exprManager.calcExpression("load", {
                entityName: "Table"
            });
            expect(expr).toEqual(exprManager);
            expr = exprManager.calcExpression("add", {
                entityName: "Table"
            });
            expect(expr).toEqual(exprManager);
            expr = exprManager.calcExpression("update", {
                entityName: "Table",
                propertyName: "Field0"
            });
            expect(expr).toEqual(exprManager);
            expr = exprManager.calcExpression("remove", {
                entityName: "Table"
            });
            expect(expr).toEqual(exprManager);

            // 移除表达式
            expr = exprManager.removeExpression(
                "Field1 + ' ' + SubTable[0].Field1",
                "Table", "CalcField0", ["load", "add", "update", "remove"],
                doCalc, null);
            expect(expr).toEqual(exprManager);
            var err = exprManager.checkAndSort();
            expect(err).toEqual("");

            // 添加错误表达式
            expr = exprManager.addExpression(
                "''+0",
                "Table", "CalcField1", ["add"],
                doCalc, null);
            expect(expr).toEqual(exprManager);
            expr = exprManager.removeExpression(
                "''+1",
                "Table", "CalcField1", ["add"],
                doCalc, null);
            expect(expr).toEqual(exprManager);
            var err = exprManager.checkAndSort();
            expect(err).toEqual("作用于实体\“Table\”上的表达式\“''+0\”解析出错：string 和 number 无法做加法运算");
        }
    })(exprManager));

    it("自定义函数", (function(exprManager){
        return function () {
            var funcs = exprManager.getFunction();
            expect(funcs).toBeDefined();
            // TODO:
        }
    })(exprManager));

    it("多语言定义", (function(){
        return function () {
            ExprManager.locale.defineLocale('zh-TW', null);
            ExprManager.locale.defineFunction('zh-TW', null);
            expect(ExprManager.locale.getLocale('zh-TW')).toBeUndefined();
            expect(ExprManager.locale.getFunction('zh-TW')).toBeUndefined();
            expect(ExprManager.locale.getFunction()).toBeDefined();
        }
    })());

    it("简单计算", (function(){
        return function () {
            var v = exprManager.calc("1+1", {});
            expect(v.toValue()).toEqual(2);
            var val = exprManager.calcExpr("1+1", "E1", window.dataCursor);
            expect(val.toValue()).toEqual(2);
        }
    })());
});
