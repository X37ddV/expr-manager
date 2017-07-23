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

var v = exprManager.calc("Test([], {})", {
    EmptyString: "",
    EmptyNumber: 0,
    EmptyArray: [],
    EmptyObject: {},
    NullValue: null,
    UndefinedValue: undefined,
});

console.log(v.errorMsg ? v.errorMsg : JSON.stringify(v.toValue()));