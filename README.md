# ExprManager

[![NPM version][npm-version-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-url] [![MIT License][license-image]][license-url] [![Travis Status][travis-image]][travis-url] [![Appveyor status][appveyor-image]][appveyor-url] [![Circleci status][circleci-image]][circleci-url] [![Coverage Status][coverage-image]][coverage-url]

## Installation
	npm install expr-manager

## Usage
```javascript
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
            "Field5": { type: "boolean" }
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
var context = {
    Field0: "!"
};
var exprManager = new ExprManager();
exprManager.init(data, dataContext, context);
var tableName = "Table";
var dataCursor = {
    "Table": 0,
    "Table.SubTable": 0
};
var expr = "Field1 + ' ' + SubTable[0].Field1 + $C.Field0";
var v = exprManager.calcExpr(expr, tableName, dataCursor);
console.log(v.toValue());
// => Hello Wrold!
```

## Value Type
| Type        | Value                                     |
| ----------- | ----------------------------------------- |
| string      | "value1" 'value2'                         |
| number      | 1 -1 1.23 -1.23                           |
| boolean     | true false                                |
| date        | Now() "2017-10-24T10:10:10.037Z".ToDate() |
| object      | {a: 1, b: 2} {a: "1", b: "2"}             |
| array       | [1,2] ["1","2"]                           |
| null        | null                                      |

## Operator Precedence
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
| Owner        | Functions                                          |
| ------------ | -------------------------------------------------- |
|              | FieldDisplayName FieldName FieldValue IIf IfNull Now Parent PropValue Random RecNo Root |
| array        | Average Count Distinct Max Min Sum Where           |
| boolean      | ToString                                           |
| date         | DateOf DayOf DayOfWeek DaysBetween HourOf HoursBetween IncDay IncHour IncMinute IncMonth IncSecond IncWeek IncYear MilliSecondOf MilliSecondsBetween MinuteOf MinutesBetween MonthOf MonthsBetween SecondOf SecondsBetween ToString WeekOf WeeksBetween YearOf YearsBetween |
| number       | Abs Ceil Cos Exp Floor Ln Log Power Round Sin Sqrt Tan ToRMB ToString Trunc |
| object       | Parent RecNo                                       |
| string       | LeftString Length Lower Pos Replace ReplaceReg RightString SubString ToDate ToNumber ToString Trim TrimLeft TrimRight Upper |

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
