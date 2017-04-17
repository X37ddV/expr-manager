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
    plugins: [json(), typescript()/*, uglify()*/]
};