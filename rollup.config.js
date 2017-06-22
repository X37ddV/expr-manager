import json from "rollup-plugin-json";
import typescript from "rollup-plugin-typescript";
// import uglify from "rollup-plugin-uglify";

export default {
    entry: "src/expr.ts",
    format: "umd",
    dest: "dist/expr.js",
    moduleName: "expr",
    external: ["decimal", "moment"],
    globals: {
        decimal: "Decimal",
        moment: "moment"
    },
    plugins: [json(), typescript()/*, uglify()*/],
    banner: "//     expr.js 0.0.1\n//     https://github.com/X37ddV/expr\n//     (c) 2016-2017 X37ddV\n//     Released under the MIT License.\n",
    intro: "// 依赖第三方库\n// ----------\n// + **[decimal.js](https://github.com/MikeMcl/decimal.js 'An arbitrary-precision Decimal type for JavaScript')** 用于高精度计算<br />\n// + **[moment.js](http://momentjs.com 'Parse, validate, manipulate, and display dates in javascript')** 用于日期计算"
};

