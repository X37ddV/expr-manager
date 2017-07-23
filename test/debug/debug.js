var ExprManager = require("../../expr-manager.js");
var locale = require("../../locale/zh-cn.js");
var exprManager = new ExprManager();

exprManager.regFunction({
    "": {
        Test: {
            fn: function(context, source, arr, obj) {
                return context.genValue(true);
            },
            p: ["array", "object"],
            r: "boolean",
        }
    }
});

//var v = exprManager.calc("Test([], {})", {
var v = exprManager.calc("EmptyNumber.Test1([], {})", {
    EmptyString: "",
    EmptyNumber: 0,
    EmptyArray: [],
    EmptyObject: {},
    NullValue: null,
    UndefinedValue: undefined,
});

var a = exprManager.getExpressionList("load", "")

console.log(v.errorMsg ? v.errorMsg : JSON.stringify(v.toValue()));