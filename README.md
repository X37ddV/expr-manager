# ExprManager

[![NPM version][npm-version-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-url] [![MIT License][license-image]][license-url] [![Travis Status][travis-image]][travis-url] [![Appveyor status][appveyor-image]][appveyor-url] [![Circleci status][circleci-image]][circleci-url] [![Coverage Status][coverage-image]][coverage-url]

## Installation
	npm install expr-manager

## Usage
    var exprManager = new ExprManager();
    var data = {
        Table0: [{
            Field0: 0,
            Field1: "Hello",
            Field2: {key: "i", value: 0},
            Field3: [0, 1],
            Field4: new Date(),
            Field5: false,
            SubTable00: [{
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
        "Table0": {
            fields: {
                "Field0": { type: "number", primaryKey: true },
                "Field1": { type: "string" },
                "Field2": { type: "object" },
                "Field3": { type: "array" },
                "Field4": { type: "date" },
                "Field5": { type: "boolean" }
            },
            childs: {
                "SubTable00": {
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
    var dataCursor = {
        "Table0": 0,
        "Table0.SubTable00": 0
    };
    exprManager.init(data, dataContext, context);
    var v = exprManager.calcExpr("Field1 + ' ' + SubTable00[0].Field1 + $C.Field0", "Table0", dataCursor);
    console.log(v.toValue()); // Hello Wrold!

## Example
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
