describe("表达式测试", function() {
    var exprManager = new window.ExprManager();
    // 简单计算
    for (var i = 0; i < window.demoExprCalc.length; i++) {
        var demo = window.demoExprCalc[i];
        for (var j = 0; j < demo.exprs.length; j++) {
            var expr = demo.exprs[j][0] || ""; // 表达式
            var exprExpectedValue = demo.exprs[j][1] || ""; // 预期值
            var exprExpectedValueError = demo.exprs[j][2] || ""; // 预期值错误
            var itTitle = "[" + i + "-" + j + "]:" + demo.title + ":" + expr;
            it("Value" + itTitle, (function(expr, exprData, exprExpectedValue, exprExpectedValueError) {
                return function() {
                    var val = exprManager.calc(expr, exprData || {});
                    var exprActualValue = window.JSON.stringify(val.toValue());
                    var exprActualValueError = val.errorMsg;
                    if (exprActualValueError) {
                        expect(exprActualValueError).toEqual(exprExpectedValueError);
                    } else {
                        expect(exprActualValue).toEqual(exprExpectedValue);
                    }
                }
            })(expr, demo.exprData, exprExpectedValue, exprExpectedValueError));
        }
    }
    // 高级计算
    exprManager.init(window.data, window.dataContext, window.context);
    for (var i = 0; i < window.demoExpr.length; i++) {
        var demo = window.demoExpr[i];
        for (var j = 0; j < demo.exprs.length; j++) {
            var expr = demo.exprs[j][0] || ""; // 表达式
            var exprExpectedValue = demo.exprs[j][1] || ""; // 预期值
            var exprExpectedValueError = demo.exprs[j][2] || ""; // 预期值错误
            var exprExpectedDepen = demo.exprs[j][3] || ""; // 预期依赖
            var exprExpectedDepenError = demo.exprs[j][4] || exprExpectedValueError; // 预期依赖错误
            var itTitle = "[" + i + "-" + j + "]:" + demo.title + ":" + expr;
            it("Value" + itTitle, (function(expr, entityName, exprExpectedValue, exprExpectedValueError) {
                return function() {
                    var val = exprManager.calcExpr(expr, entityName || "E1", window.dataCursor, {
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
            })(expr, demo.entityName, exprExpectedValue, exprExpectedValueError));
            it("Depen" + itTitle, (function(expr, entityName, exprExpectedDepen, exprExpectedDepenError) {
                return function() {
                    var valType = exprManager.calcDependencies(expr, entityName || "E1");
                    var exprActualDepen = (valType.dependencies && valType.dependencies.join("|")) || "";
                    var exprActualDepenError = valType.errorMsg;
                    if (exprActualDepenError) {
                        expect(exprActualDepenError).toEqual(exprExpectedDepenError);
                    } else {
                        expect(exprActualDepen).toEqual(exprExpectedDepen);
                    }
                }
            })(expr, demo.entityName, exprExpectedDepen, exprExpectedDepenError));
        }
    }
});

describe("依赖关系测试", function() {
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
                    return function() {
                        expect(pList.join("|")).toEqual(c.r);
                    }
                })(pList, c));
            }
        } else {
            it(demoDepend.title, (function(msg) {
                return function() {
                    expect(msg).toEqual("");
                }
            })(msg));
        }
    }
});

describe("接口测试", function() {
    // 准备测试数据
    var data = {
        Table: [{
            Field0: 0,
            Field1: "Hello",
            Field2: { key: "i", value: 0 },
            Field3: [0, 1],
            Field4: new Date(),
            Field5: false,
            SubTable: [{
                Field0: 0,
                Field1: "Wrold",
                Field2: { key: "j", value: 10 },
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
                        "Field5": { type: "boolean" },
                        "CalcField0": { type: "stirng" },
                        "CalcField1": { type: "stirng" }
                    }
                }
            }
        }
    };

    // 初始化ExprManager
    var exprManager = new window.ExprManager();
    exprManager.init(data, dataContext);

    it("表达式列表", (function(exprManager) {
        return function() {
            var doCalc = function(type, info) {

            };

            // 添加表达式
            var expr = exprManager.resetExpression();
            expect(expr).toEqual(exprManager);

            expr = exprManager.addExpression("", "", "", ["add"], doCalc, null);
            expect(expr).toEqual(exprManager);
            expr = exprManager.addExpression("", "", "", ["add"], doCalc, null);
            expect(expr).toEqual(exprManager);
            expr = exprManager.removeExpression("", "", "", ["add"], doCalc, null);
            expect(expr).toEqual(exprManager);
            expr = exprManager.addExpression("");
            expect(expr).toEqual(exprManager);
            expr = exprManager.removeExpression("");
            expect(expr).toEqual(exprManager);
            expr = exprManager.addExpression("1", "", "", ["add"], doCalc, null);
            expect(expr).toEqual(exprManager);
            expr = exprManager.removeExpression("1", "", "", ["add"], doCalc, null);
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
            expr = exprManager.addExpression(
                "Parent().Field1",
                "Table.SubTable", "CalcField0", ["load", "add", "update", "remove"],
                doCalc, null);
            expect(expr).toEqual(exprManager);
            expr = exprManager.addExpression(
                "CalcField0",
                "Table.SubTable", "CalcField1", ["load", "add", "update", "remove"],
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
            expr = exprManager.calcExpression("add", {
                entityName: "Table.SubTable"
            });
            expect(expr).toEqual(exprManager);
            expect(expr).toEqual(exprManager);
            expr = exprManager.calcExpression("remove", {
                entityName: "Table.SubTable"
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

    it("自定义函数", (function(exprManager) {
        return function() {
            exprManager.regFunction({
                "": {
                    Test: {
                        fn: function(context, source, arr, obj) {
                            return context.genValue(true);
                        },
                        p: ["array", "object"],
                        r: "boolean",
                    }
                },
                "number": {
                    Test: {
                        fn: function(context, source, arr, obj) {
                            return context.genValue(1);
                        },
                        p: ["array", "object"],
                        r: "number",
                    }
                }
            });
            ExprManager.locale.defineFunction(ExprManager.locale.localeName, {
                "Test": { fn: "测试函数", p: ["数值", "对象"], r: "返回真" },
                "number.Test": { fn: "测试函数", p: ["数值", "对象"], r: "返回1" }
            });
            var v = exprManager.calc("Test([], {})");
            expect(v.toValue()).toEqual(true);
            var v = exprManager.calc("1.Test([], {})");
            expect(v.toValue()).toEqual(1);
            var v = exprManager.calc("a.Test([], {})", { a: true });
            expect(v.errorMsg).toEqual("boolean 没有名称为 Test 的方法或参数不匹配");
            var v = exprManager.calc("a.Test(a, a)", { a: true });
            expect(v.errorMsg).toEqual("boolean 没有名称为 Test 的方法或参数不匹配");
            var groups = exprManager.getFunction();
            expect(groups).toBeDefined();
            for (var i in groups) {
                var funcs = groups[i];
                for (var j in funcs) {
                    expect(funcs[j].getLocale()).toBeDefined();
                }
            }
        }
    })(exprManager));

    it("多语言定义", (function() {
        return function() {
            ExprManager.locale.defineLocale('zh-TW', null);
            ExprManager.locale.defineFunction('zh-TW', null);
            expect(ExprManager.locale.getLocale('zh-TW')).toBeUndefined();
            expect(ExprManager.locale.getFunction('zh-TW')).toBeUndefined();
            expect(ExprManager.locale.getFunction()).toBeDefined();
        }
    })());

    it("简单计算", (function() {
        return function() {
            var v = exprManager.calc("1+1");
            expect(v.toValue()).toEqual(2);
            v = exprManager.calc("[null, 1].Distinct('a')");
            expect(v.errorMsg).toEqual("null 无法获取属性: a");
            v = exprManager.calcExpr("1+1", "E1", window.dataCursor);
            expect(v.toValue()).toEqual(2);
            v = exprManager.calcExpr("Field0", "Table", {
                "Table": -1,
                "Table.SubTable": -1
            });
            expect(v.toValue()).toEqual(null);
            v = exprManager.calcExpr("Field0", "SubTable", {
                "Table": -1,
                "Table.SubTable": -1
            });
            expect(v.errorMsg).toEqual("属性不存在: Field0");
        }
    })());

    it("表达式列表", (function() {
        return function() {
            var list = exprManager.getExpressionList("load", "");
            expect(list.length).toEqual(0);
            list = exprManager.resetExpression().getExpressionList("load", "");
            expect(list.length).toEqual(0);
        }
    })());

    it("空数据计算", (function() {
        return function() {
            exprManager.init({}, {
                E1: {}
            });
            var v = exprManager.calcExpr("E1", "", {});
            expect(v.toValue()).toEqual(null);
            v = exprManager.calcExpr("E1", "");
            expect(v.toValue()).toEqual(null);
            v = exprManager.calcExpr("E1");
            expect(v.toValue()).toEqual(null);
        }
    })());
});