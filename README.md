# ExprManager

[![NPM version][npm-version-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-url] [![MIT License][license-image]][license-url] [![Travis Status][travis-image]][travis-url] [![Appveyor status][appveyor-image]][appveyor-url] [![Circleci status][circleci-image]][circleci-url] [![Coverage Status][coverage-image]][coverage-url]

## Installation
	npm install expr-manager

## Usage
### Simple calculation
```javascript
var exprManager = new window.ExprManager();

var expr = "0.1 + 0.2";
var v = exprManager.calc(expr);
if (!v.errorMsg) {
    console.log(v.toValue());
    // => 0.3
} else {
    console.log(v.errorMsg);
}

var calcData = {v1: "hello", v2: "world"};
expr = "v1 + ' ' + v2 + '!'";
v = exprManager.calc(expr, calcData);
console.log(v.toValue());
// => "hello world!"

expr = "IIf(1 > 2, 'a', 'b')";
v = exprManager.calc(expr);
console.log(v.toValue());
// => "b"

expr = "123.ToString()"
v = exprManager.calc(expr);
console.log(v.toValue());
// => "123"
```
### Advanced calculation
```javascript
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

exprManager.init(data, dataContext, context);

var tableName = "Table";
var dataCursor = {
    "Table": 0,
    "Table.SubTable": 0
};
expr = "Field1 + ' ' + SubTable[0].Field1 + $C.Field0";
v = exprManager.calcExpr(expr, tableName, dataCursor);
console.log(v.toValue());
// => "Hello World!"

var t = exprManager.calcDependencies(expr, tableName);
console.log(t.dependencies);
// => ["Table.Field1", "Table.SubTable", "Table.SubTable.Field1"]
```
### Advanced dependent calculation
```javascript
exprManager.resetExpression();

var doCalc = function(type, info) {
    console.log(type);
};

exprManager.addExpression("Field1 + ' ' + SubTable[0].Field1",
    "Table", "CalcField0", ["load", "add", "update", "remove"],
    doCalc, null);
exprManager.addExpression("CalcField0 + SubTable.Count().ToString()",
    "Table", "CalcField1", ["load", "add", "update", "remove"],
    doCalc, null);

var errorMsg = exprManager.checkAndSort();
if (!errorMsg) {
    exprManager.calcExpression("load", {
        entityName: "Table"
    });
    // => "load"

    exprManager.calcExpression("add", {
        entityName: "Table"
    });
    // => "add"
    
    exprManager.calcExpression("update", {
        entityName: "Table",
        propertyName: "Field1"
    });
    // => "update"

    exprManager.calcExpression("remove", {
        entityName: "Table.SubTable"
    });
    // => "remove"
} else {
    console.log(errorMsg)
}
```

## Value type
| Type        | Value                                     |
| ----------- | ----------------------------------------- |
| string      | "value1" 'value2'                         |
| number      | 1 -1 1.23 -1.23                           |
| boolean     | true false                                |
| date        | Now() "2017-10-24T10:10:10.037Z".ToDate() |
| object      | {a: 1, b: 2} {a: "1", b: "2"}             |
| array       | [1,2] ["1","2"]                           |
| null        | null                                      |

## Operator precedence
| Operator        | Description                                                        |
| --------------- | ------------------------------------------------------------------ |
| . \[\] \(\) {}  | Member access, array, grouping, object                             |
| + - !           | Unary operators, logical NOT                                       |
| * / %           | Multiplication, division, modulo division                          |
| + -             | Addition, subtraction                                              |
| < <= > >=       | Less than, less than or equal, greater than, greater than or equal |
| == !=           | Equality, inequality                                               |
| &&              | Logical AND                                                        |
| \|\|            | Logical OR                                                         |
| :               | Colon operator                                                     |
| ,               | Multiple evaluation                                                |

## System functions
| Owner   | Functions                                                                   |
| ------- | --------------------------------------------------------------------------- |
|         | FieldDisplayName FieldName FieldValue IIf IfNull Now Parent PropValue Random RecNo Root |
| array   | Average Count Distinct Max Min Sum Where                                    |
| boolean | ToString                                                                    |
| date    | DateOf DayOf DayOfWeek DaysBetween HourOf HoursBetween IncDay IncHour IncMinute IncMonth IncSecond IncWeek IncYear MilliSecondOf MilliSecondsBetween MinuteOf MinutesBetween MonthOf MonthsBetween SecondOf SecondsBetween ToString WeekOf WeeksBetween YearOf YearsBetween |
| number  | Abs Ceil Cos Exp Floor Ln Log Power Round Sin Sqrt Tan ToRMB ToString Trunc |
| object  | Parent RecNo                                                                |
| string  | LeftString Length Lower Pos Replace ReplaceReg RightString SubString ToDate ToNumber ToString Trim TrimLeft TrimRight Upper |

## Example
    npm install
    npm start
    open example/index.html
![](docs/preview.gif)

## License

expr-manager.js is freely distributable under the terms of the [MIT license](https://github.com/X37ddV/expr-manager/blob/master/LICENSE).

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE

[npm-url]: https://npmjs.org/package/expr-manager
[npm-version-image]: http://img.shields.io/npm/v/expr-manager.svg?style=flat
[npm-downloads-image]: http://img.shields.io/npm/dm/expr-manager.svg?style=flat

[travis-url]: https://travis-ci.org/X37ddV/expr-manager
[travis-image]: https://api.travis-ci.org/shinnn/gulp-gh-pages.svg?branch=master

[appveyor-url]: https://ci.appveyor.com/project/X37ddV/expr-manager/branch/master
[appveyor-image]: https://ci.appveyor.com/api/projects/status/cvtwkjnatev9rluq/branch/master?svg=true

[circleci-image]: https://img.shields.io/circleci/project/X37ddV/expr-manager/master.svg
[circleci-url]: https://circleci.com/gh/X37ddV/expr-manager/tree/master

[coverage-url]: https://coveralls.io/github/X37ddV/expr-manager?branch=master
[coverage-image]: https://coveralls.io/repos/github/X37ddV/expr-manager/badge.svg?branch=master
