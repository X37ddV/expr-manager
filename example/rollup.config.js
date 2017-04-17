import string from "rollup-plugin-string";
import sass from "rollup-plugin-sass";
import json from "rollup-plugin-json";
import typescript from "rollup-plugin-typescript";

export default {
    entry: "example/src/app.ts",
    format: "umd",
    dest: "example/example.js",
    external: ["jquery", "underscore", "underscore.string", "mousetrap", "decimal", "moment", "expr"],
    globals: {
        underscore: "_",
        "underscore.string": "s",
        mousetrap: "Mousetrap",
        jquery: "jQuery",
        decimal: "Decimal",
        moment: "moment",
        expr: "expr"
    },
    plugins: [string({
        include: "**/*.tpl"
    }), sass({
        output: "example/example.css"
    }), json(), typescript()]
};

