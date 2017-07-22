var ExprManager = require("../../expr-manager.js");
var locale = require("../../locale/zh-cn.js");
var exprManager = new ExprManager();

// var v = exprManager.calc("Parent()", {
//     EmptyString: "",
//     EmptyNumber: 0,
//     EmptyArray: [],
//     EmptyObject: {},
//     NullValue: null,
// });
exprManager.init({}, {
    E1: {}
});
var v = exprManager.calcExpr("E1", '');

console.log(v.errorMsg ? v.errorMsg : JSON.stringify(v.toValue()));