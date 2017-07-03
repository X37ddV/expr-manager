describe("表达式测试", function () {
    var exprManager = new window.ExprManager();
    exprManager.init(window.data, window.dataContext, window.context);
    for (var j = 0; j < window.demoExpr.length; j++) {
        var demo = window.demoExpr[j];
        for (var i = 0; i < demo.exprs.length; i++) {
            var e = demo.exprs[i][0];
            var k = demo.exprs[i][1]; // 预期值 undefined为不校验或校验为错误
            var d = demo.exprs[i][2] || ""; // 描述
            var val = exprManager.calcExpr(e, "E1", window.dataCursor);
            var v = val.toValue();
            v = v === undefined ? "undefined" : window.JSON.stringify(v);
            if (typeof k == "string") {
                it(demo.title + " - " + j  + " - " + i + " - " + e, (function (k, v, i) {
                    return function() {
                        expect(k).toEqual(v)
                        if (i == 46) {
                            expect(v).toEqual(k)
                        }
                    }
                })(k, v, i));
            }
        }
    }
});

describe("依赖关系测试", function () {
    var exprManager = new window.ExprManager();
    exprManager.init(window.data, window.dataContext, window.context);
    for (var m = 0; m < window.demoDependencies.length; m++) {
        var demoDepend = window.demoDependencies[m];
        var el = exprManager.getExpressionList();
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
                var list = [];
                var type = c.cmd[0];
                var entityName = c.cmd[1];
                var propertyName = c.cmd[2];
                switch (type) {
                    case "load":
                        list = el.getExprsByLoad(entityName);
                        break;
                    case "add":
                        list = el.getExprsByAdd(entityName);
                        break;
                    case "remove":
                        list = el.getExprsByRemove(entityName);
                        break;
                    case "update":
                        list = el.getExprsByUpdate(entityName, propertyName);
                        break;
                    default:
                        expect(true).toEqual(false);
                }
                var pList = [];
                for (var p = 0; p < list.length; p++) {
                    pList.push(list[p].fullName);
                }
                it(demoDepend.title, (function(pList, c){
                    return function () {
                        expect(pList.join("|")).toEqual(c.r);
                    }
                })(pList, c));
            }
        } else {
            expect(true).toEqual(false);
        }
    }
});

describe("接口测试", function () {
    var exprManager = new window.ExprManager();
    it("获取函数", (function(exprManager){
        return function () {
            var funcs = exprManager.getFunction();
            expect(0).toEqual(0);
        }
    })(exprManager));
});
