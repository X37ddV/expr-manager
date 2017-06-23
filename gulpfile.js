var fs = require('fs'),
    path = require('path'),
    gulp = require("gulp"),
    rollup = require("rollup"),
    rollupJson = require("rollup-plugin-json"),
    rollupSass = require("rollup-plugin-sass"),
    rollupString = require("rollup-plugin-string"),
    rollupUglify = require("rollup-plugin-uglify"),
    rollupTypescript = require("rollup-plugin-typescript"),
    jasmine = require('jasmine'),
    karma = require("karma"),
    docco = require("docco");
var rootPath = __dirname;
var version = JSON.parse(fs.readFileSync(path.join(rootPath, 'package.json'))).version || '';
var rollupBanner =
    "//     expr.js " + version + "\n" +
    "//     https://github.com/X37ddV/expr\n" +
    "//     (c) 2016-2017 X37ddV\n" +
    "//     Released under the MIT License.\n",
    rollupIntro =
    "// 依赖第三方库\n" +
    "// ----------\n" +
    "// + **[decimal.js](https://github.com/MikeMcl/decimal.js" +
    " 'An arbitrary-precision Decimal type for JavaScript')** 用于高精度计算<br />\n" +
    "// + **[moment.js](http://momentjs.com" +
    " 'Parse, validate, manipulate, and display dates in javascript')** 用于日期计算";

gulp.task("build:expr", function() {
    return rollup.rollup({
        entry: path.join(rootPath, "src", "expr.ts"),
        plugins: [
            rollupJson(),
            rollupTypescript()
        ]
    }).then(function (bundle) {
      bundle.write({
        format: "umd",
        moduleName: "expr",
        dest: path.join(rootPath, "expr.js"),
        external: ["decimal", "moment"],
        globals: {
            decimal: "Decimal",
            moment: "moment"
        },
        sourceMap: false,
        banner: rollupBanner,
        intro: rollupIntro
      });
    })
});

gulp.task("build:expr:min", function() {
    return rollup.rollup({
        entry: path.join(rootPath, "src", "expr.ts"),
        plugins: [
            rollupJson(),
            rollupTypescript(),
            rollupUglify()
        ]
    }).then(function (bundle) {
      bundle.write({
        format: "umd",
        moduleName: "expr",
        dest: path.join(rootPath, "expr.min.js"),
        external: ["decimal", "moment"],
        globals: {
            decimal: "Decimal",
            moment: "moment"
        }
      });
    })
});

gulp.task("build:example", function() {
    return rollup.rollup({
        entry: path.join(rootPath, "example", "src", "app.ts"),
        plugins: [
            rollupString({
                include: "**/*.tpl"
            }),
            rollupSass({
                output: path.join(rootPath, "example", "example.css")
            }),
            rollupJson(),
            rollupTypescript()
        ]
    }).then(function (bundle) {
        bundle.write({
            format: "umd",
            dest: path.join(rootPath, "example", "example.js"),
            external: ["jquery", "underscore", "underscore.string", "mousetrap", "decimal", "moment", "expr"],
            globals: {
                underscore: "_",
                "underscore.string": "s",
                mousetrap: "Mousetrap",
                jquery: "jQuery",
                decimal: "Decimal",
                moment: "moment",
                expr: "expr"
            }
        });
    })
});

gulp.task("build:docs", function() {
    docco.document({
        args: ["expr.js"],
        layout: "parallel",
        output: "docs",
        template: null,
        css: null,
        extension: null,
        languages: {},
        marked: null
    });
});

gulp.task("test:karma", function(done) {
    new karma.Server({
        basePath: '',
        frameworks: ["jasmine"],
        files: [
            path.join(rootPath, "node_modules", "moment", "moment.js"),
            path.join(rootPath, "node_modules", "decimal.js", "decimal.js"),
            path.join(rootPath, "dist", "expr.js"),
            path.join(rootPath, "test", "data", "test_data.js"),
            path.join(rootPath, "test", "data", "test_dependencies.js"),
            path.join(rootPath, "test", "data", "test_expressions.js"),
            path.join(rootPath, "test", "expr.spec.js")
        ],
        exclude: [],
        preprocessors: {},
        port: 9876,
        colors: true,
        logLevel: karma.config.LOG_INFO,
        reporters: ['progress'],
        browsers: ['Chrome', 'Safari'],
        autoWatch: true,
        singleRun: true,
        concurrency: Infinity
    }, done).start();
});

gulp.task("default", ["build:expr", "build:expr:min", "build:example", "build:docs", "test:karma"]);