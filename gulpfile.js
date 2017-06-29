var fs = require('fs'),
    path = require('path'),
    gulp = require("gulp"),
    gulpTSLint = require("gulp-tslint"),
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
    "//     expr-manager.js " + version + "\n" +
    "//     https://github.com/X37ddV/expr-manager\n" +
    "//     (c) 2016-2017 X37ddV\n" +
    "//     Released under the MIT License.\n",
    rollupIntro =
    "// 依赖第三方库\n" +
    "// ----------\n" +
    "// + **[decimal.js](https://github.com/MikeMcl/decimal.js" +
    " 'An arbitrary-precision Decimal type for JavaScript')** 用于高精度计算<br />\n" +
    "// + **[moment.js](http://momentjs.com" +
    " 'Parse, validate, manipulate, and display dates in javascript')** 用于日期计算",
    rollupWarn = function(warning) {
        if (warning.code !== "UNRESOLVED_IMPORT" && warning.code !== "MISSING_GLOBAL_NAME") {
            console.log(warning.message + " - [" + warning.code + "]");
        }
    };
var typescriptConfig = {
    target: "es5",
    noImplicitAny: false,
    sourceMap: false,
    isolatedModules: false,
    allowSyntheticDefaultImports: true
};
var rollupHideComments = function(options) {
    if ( options === void 0 ) options = {};
	return {
		name: "hidecomments",
		transformBundle: function transformBundle(code) {
			return code.replace(/\s\/\/\/\s.*/g, "");
		}
	}
};
var karmaStart = function(done, browsers) {
    return new karma.Server({
        basePath: "",
        frameworks: ["jasmine"],
        files: [
            path.join(rootPath, "node_modules", "moment", "moment.js"),
            path.join(rootPath, "node_modules", "decimal.js", "decimal.js"),
            path.join(rootPath, "expr-manager.js"),
            path.join(rootPath, "test", "data", "test_data.js"),
            path.join(rootPath, "test", "data", "test_dependencies.js"),
            path.join(rootPath, "test", "data", "test_expressions.js"),
            path.join(rootPath, "test", "expr-manager.spec.js"),
        ],
        exclude: [],
        preprocessors: {
            "expr-manager.js": ["coverage"]
        },
        coverageReporter: {
            dir: path.join(rootPath, "coverage"),
            reporters: [
                {type: "html"},
                {type: "lcov", subdir: "lcov"}
            ]
        },
        port: 9876,
        colors: true,
        logLevel: karma.config.LOG_INFO,
        reporters: ["progress", "coverage"],
        browsers: browsers,
        autoWatch: true,
        singleRun: true,
        concurrency: Infinity,
        plugins: ['karma-*']
    }, done).start();
}

gulp.task("lint:expr-manager", () =>
    gulp.src(path.join(rootPath, "src", "**", "*.ts"))
        .pipe(gulpTSLint({
            formatter: "prose"
        }))
        .pipe(gulpTSLint.report({
            emitError: false
        }))
);

gulp.task("lint:example", () =>
    gulp.src(path.join(rootPath, "example", "src", "**", "*.ts"))
        .pipe(gulpTSLint({
            formatter: "prose"
        }))
        .pipe(gulpTSLint.report({
            emitError: false
        }))
);

gulp.task("build:expr-manager", function() {
    return rollup.rollup({
        entry: path.join(rootPath, "src", "expr-manager.ts"),
        plugins: [
            rollupJson(),
            rollupTypescript(typescriptConfig),
            rollupHideComments(),
        ],
        external: ["decimal.js", "moment"],
    }).then(function (bundle) {
      bundle.write({
        format: "umd",
        moduleName: "ExprManager",
        dest: path.join(rootPath, "expr-manager.js"),
        globals: {
            "decimal.js": "Decimal",
            "moment": "moment",
        },
        sourceMap: false,
        banner: rollupBanner,
        intro: rollupIntro,
      });
    })
});

gulp.task("build:expr-manager:min", function() {
    return rollup.rollup({
        entry: path.join(rootPath, "src", "expr-manager.ts"),
        plugins: [
            rollupJson(),
            rollupTypescript(typescriptConfig),
            rollupUglify(),
        ],
        external: ["decimal.js", "moment"],
    }).then(function (bundle) {
      bundle.write({
        format: "umd",
        moduleName: "ExprManager",
        dest: path.join(rootPath, "expr-manager.min.js"),
        globals: {
            "decimal.js": "Decimal",
            "moment": "moment",
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
            rollupTypescript(typescriptConfig)
        ],
        external: ["jquery", "underscore", "underscore.string", "mousetrap", "decimal.js", "moment", "expr-manager"],
    }).then(function (bundle) {
        bundle.write({
            format: "umd",
            dest: path.join(rootPath, "example", "example.js"),
            globals: {
                "jquery": "jQuery",
                "underscore": "_",
                "underscore.string": "s",
                "mousetrap": "Mousetrap",
                "decimal.js": "Decimal",
                "moment": "moment",
                "expr-manager": "ExprManager",
            }
        });
    })
});

gulp.task("build:docs", function() {
    docco.document({
        args: ["expr-manager.js"],
        layout: "parallel",
        output: "docs",
        template: null,
        css: null,
        extension: null,
        languages: {},
        marked: null
    });
});

gulp.task("test:phantomjs", function(done) {
    karmaStart(done, ["PhantomJS"]);
});

gulp.task("test:all", function(done) {
    karmaStart(done, ["PhantomJS", "Chrome", "Safari"]);
});

gulp.task("default", ["lint:expr-manager", "lint:example", "build:expr-manager", "build:expr-manager:min", "build:example", "build:docs", "test:all"]);
gulp.task("travis", ["lint:expr-manager", "lint:example", "test:phantomjs"]);
