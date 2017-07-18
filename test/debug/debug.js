var ExprManager = require("../../expr-manager.js");
var exprManager = new ExprManager();
var v = exprManager.calc('NullValue.Abs()', {
    EmptyString: "",
    EmptyNumber: 0,
    EmptyArray: [],
    EmptyObject: {},
    NullValue: null,
});
console.log(v.toValue());
