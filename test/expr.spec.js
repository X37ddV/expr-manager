describe("表达式测试", function(){
    var expr = new window.expr();
    expr.init(window.data, window.dataContext, window.context);
    for (var j = 0; j < window.demoExpr.length; j++) {
        var demo = window.demoExpr[j];
        it(demo.title, function() {
            for (var i = 0; i < demo.exprs.length; i++) {
                var e = demo.exprs[i][0];
                var k = demo.exprs[i][1]; // 预期值 undefined为不校验或校验为错误
                var d = demo.exprs[i][2] || ""; // 描述
                var val = expr.calcExpr(e, "E1", window.dataCursor);
                var v = val.toValue();
                v = v === undefined ? "undefined" : window.JSON.stringify(v);
                expect(k).toEqual(v);
            }
        })
    }
});
describe("依赖关系测试", function() {
    var expr = new window.expr();
    expr.init(window.data, window.dataContext, window.context);
    for (var m = 0; m < window.demoDependencies.length; m++) {
        var demoDepend = window.demoDependencies[m];
        var el = expr.getExpressionList();
        expr.resetExpression(); // 重置表达式列表对象
        for (var i in demoDepend.dataSource) {
            var entity = demoDepend.dataSource[i];
            var e = entity.expr;
            var s = i.split(".");
            var p = s.pop();
            expr.addExpression(e, s.join("."), p);
        }
        var msg = expr.checkAndSort();
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
                it(demoDepend.title, function() {
                    expect(pList.join("|")).toEqual(c.r);
                });
            }
        } else {
            expect(true).toEqual(false);
        }
    }
});