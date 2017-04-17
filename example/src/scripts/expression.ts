import context from "../configs/context";
import tables from "../configs/tables";
import { IExprSuggestResult, exprSuggest } from "./expression.suggest";
import expr from "expr";
import _ from "underscore";

export default class Expression {
    private data;
    private nameList: Array<string>;
    private primaryKeyMap;
    private cursorMap;
    private childsMap;
    private fieldsMap;
    private currentNewId: number = -1;
    private currentTable: string = "";
    private currentField: string = "";
    private expr: expr = new expr();
    constructor() {
        this.data = this.genData();
        this.nameList = [];
        this.primaryKeyMap = {};
        this.cursorMap = {};
        this.childsMap = {};
        this.fieldsMap = {};
        this.eachTables(tables, ((me) => (name, fields, childs) => {
            let pk = "";
            for (let key in fields) {
                if (fields.hasOwnProperty(key)) {
                    if (fields[key].primaryKey) {
                        pk = key;
                        break;
                    }
                }
            }
            if (me.nameList.length === 0) {
                me.currentTable = name;
                me.currentField = pk;
            }
            me.nameList.push(name);
            me.primaryKeyMap[name] = pk;
            me.cursorMap[name] = 0;
            me.fieldsMap[name] = fields || {};
            me.childsMap[name] = childs || {};
        })(this));
        this.expr.init(this.data, tables, context);
        this.dataLoad();
    }
    public length(): Number {
        return this.nameList.length;
    }
    public calcExpr(line: string): Value {
        return this.expr.calcExpr(line, this.currentTable, this.cursorMap, {
            FieldDisplayName: this.currentField,  // TODO:
            FieldName: this.currentField,
            FieldValue: this.currentField,  // TODO:
        });
    }
    public getTableName_T(n: number) {
        return this.nameList[n];
    }
    public getFields_T(n: number) {
        let name = this.nameList[n];
        return this.fieldsMap[name];
    }
    public getData_T(n: number) {
        let name = this.nameList[n];
        return this.getData(name, this.data, this.cursorMap);
    }
    public getCursor_T(n: number): number {
        let name = this.nameList[n];
        return this.cursorMap[name];
    }
    public setCursor_T(n: number, index: number): Array<number> {
        let name = this.nameList[n];
        let r = []; // 返回需要更新的表索引号
        if (this.cursorMap[name] !== index) {
            this.cursorMap[name] = index;
            this.nameList.forEach(((me) => (v, i) => {
                if (v.length > name.length && v.indexOf(name) === 0) {
                    let d = me.getData_T(i);
                    if (d && d.length > 0) {
                        me.cursorMap[v] = 0;
                    } else {
                        me.cursorMap[v] = -1;
                    }
                    r.push(i);
                }
            })(this));
        }
        return r;
    }
    public getCurrentTableIndex(): number {
        return this.nameList.indexOf(this.currentTable);
    }
    public setCurrentTableAndField(n: number, field: string): void {
        this.currentTable = this.nameList[n];
        this.currentField = field;
    }
    public getSuggest(line: string, pos: number): IExprSuggestResult {
        return exprSuggest(line, pos, {
            calcExpr: ((me) => (l) => me.calcExpr(l))(this),
            childs: this.childsMap[this.currentTable],
            constants: context,
            fields: this.fieldsMap[this.currentTable],
            funcs: this.expr.getFunction(),
        });
    }
    public checkExpression(): string {
        this.expr.resetExpression();
        this.eachTables(tables, ((me) => (name, fields, childs) => {
            for (let fieldName in fields) {
                if (fields.hasOwnProperty(fieldName)) {
                    let field = fields[fieldName];
                    if (field.expr) {
                        me.expr.addExpression(field.expr, name, fieldName, "L|A|U|R", me.doCalcExpr, me);
                    } else if (field.defaultExpr) {
                        me.expr.addExpression(field.defaultExpr, name, fieldName, "A", me.doCalcExpr, me);
                    }
                }
            }
        })(this));
        return this.expr.checkAndSort();
    }
    public dataLoad(): Expression {
        let msg = this.checkExpression();
        if (!msg) {
            this.nameList.forEach(((me) => (name, index) => {
                let info = {
                    entityName: name,
                    propertyName: null,
                };
                me.expr.calcExpression("load", info);
            })(this));
        } else {
            window.console.error(msg);
        }
        return this;
    }
    public dataAdd(n: number): Expression {
        let data = this.getData_T(n);
        let name = this.nameList[n];
        data.push(this.newData(n));
        this.setCursor_T(n, data.length - 1);
        let info = {
            entityName: name,
            propertyName: null,
        };
        this.expr.calcExpression("add", info);
        return this;
    }
    public dataUpdate(n: number, fieldName: string, value: any): Expression {
        let data = this.getData_T(n);
        let name = this.nameList[n];
        let index = this.cursorMap[name];
        if (index >= 0) {
            data[index][fieldName] = value;
            let info = {
                entityName: name,
                propertyName: fieldName,
            };
            this.expr.calcExpression("update", info);
        }
        return this;
    }
    public dataRemove(n: number): Expression {
        let data = this.getData_T(n);
        let name = this.nameList[n];
        let index = this.cursorMap[name];
        if (index >= 0) {
            data.splice(index, 1);
            if (index >= data.length) {
                this.setCursor_T(n, data.length - 1);
            }
            let info = {
                entityName: name,
                propertyName: null,
            };
            this.expr.calcExpression("remove", info);
        }
        return this;
    }
    private eachTables(ts, callback: (name: string, fields, childs) => void, pName?: string) {
        if (ts) {
            for (let t in ts) {
                if (ts.hasOwnProperty(t)) {
                    let name = pName ? pName + "." + t : t;
                    callback.call(this, name, ts[t].fields, ts[t].childs);
                    this.eachTables(ts[t].childs, callback, name);
                }
            }
        }
    }
    private getData(name: string, d, cursor) {
        let n = "";
        let names = name.split(".");
        for (let i = 0; i < names.length; i++) {
            let v = names[i];
            n += (n ? "." : "") + v;
            if (d) {
                d = d[v];
                if (i < names.length - 1 && d) {
                    d = d[cursor[n]];
                }
            }
            if (!d) {
                break;
            }
        }
        return d;
    }
    private genData() {
        let idGroups = 0;
        let idFuncs = 0;
        let idParams = 0;
        function genParams(func) {
            let r = [];
            let ps = func.p;
            let pl = func.getLocale().p;
            let p = String(func.fn).match(/\(.*\)/)[0].replace(/[\(\)\s]/g, "").split(",");
            for (let i = 0; i < ps.length; i++) {
                let type = ps[i];
                let desc = pl[i];
                let isOptional = false;
                if (type.indexOf("?") === type.length - 1) {
                    type = type.replace("?", "");
                    desc = desc.replace("?", "");
                    isOptional = true;
                }
                let paramItem = {
                    FDescription: desc,
                    FIndex: i + 1,
                    FIsOptional: isOptional,
                    FName: p[i + p.length - ps.length],
                    FType: type,
                    ID: idParams++,
                };
                r.push(paramItem);
            }
            return r;
        }
        function genFuncs(funcs) {
            let r = [];
            for (let name in funcs) {
                if (funcs.hasOwnProperty(name)) {
                    let f = funcs[name];
                    let params = genParams(f);
                    let l = f.getLocale();
                    let funcItem = {
                        FDescription: l.fn,
                        FLastTime: new Date(),
                        FName: name,
                        FParams: f.p,
                        FReturnDescription: l.r,
                        FReturnType: f.r,
                        ID: idFuncs++,
                        TParams: params,
                    };
                    r.push(funcItem);
                }
            }
            return r;
        }
        function genGroups(groups) {
            let r = [];
            for (let name in groups) {
                if (groups.hasOwnProperty(name)) {
                    let g = groups[name];
                    let o = {};
                    let funcs = genFuncs(g);
                    for (let i = 0; i < funcs.length; i++) {
                        let f = funcs[i];
                        o[f.FName] = f.FReturnType;
                    }
                    let groupItem = {
                        FFuncs: o,
                        FName: name,
                        ID: idGroups++,
                        TFuncs: funcs,
                    };
                    r.push(groupItem);
                }
            }
            return r;
        }
        let r = {
            TGroups: genGroups(this.expr.getFunction()),
        };
        return r;
    }
    private newId(): number {
        return this.currentNewId--;
    }
    private newData(n: number) {
        let name = this.nameList[n];
        let r = {};
        let pk = this.primaryKeyMap[name];
        if (pk) {
            r[pk] = this.newId();
        }
        let childs = this.childsMap[name];
        if (childs) {
            for (let subName in childs) {
                if (childs.hasOwnProperty(subName)) {
                    r[subName] = [];
                }
            }
        }
        return r;
    }
    private doCalcExpr(type, info): void {
        let exprStr = info.exprInfo.expr;
        let cursor = _.clone(this.cursorMap);
        switch (type) {
            case "remove":
            case "update":
            case "add":
                this.doCalcExprValue(exprStr, cursor, info.exprInfo);
                break;
            case "load":
            default:
                let name = info.entityName;
                this.doCalcExprLoad(exprStr, cursor, info.exprInfo, name, 0);
                break;
        }
    }
    private doCalcExprLoad(exprStr, dataCursor, exprInfo, name, level): void {
        let cursor = _.clone(dataCursor);
        let names = name.split(".");
        let nameList = [];
        for (let i = 0; i <= level; i++) {
            nameList.push(names[i]);
        }
        let n = nameList.join(".");
        let data = this.getData(n, this.data, cursor);
        for (let i = 0; i < data.length; i++) {
            cursor[n] = i;
            if (names.length === nameList.length) {
                this.doCalcExprValue(exprStr, cursor, exprInfo);
            } else {
                this.doCalcExprLoad(exprStr, cursor, exprInfo, name, level + 1);
            }
        }
    }
    private doCalcExprValue(exprStr: string, dataCursor, exprInfo): void {
        let cursor = _.clone(dataCursor);
        let entityName = exprInfo.entityName;
        let calcExprAndSetValue = (record) => {
            let value = this.expr.calcExpr(exprStr, entityName, cursor, {
                FieldDisplayName: "",  // TODO:
                FieldName: exprInfo.propertyName,
                FieldValue: "",  // TODO:
            });
            record[exprInfo.propertyName] = value.toValue();
        };
        let eachBranch = (name, data) => {
            for (let i = 0; i < data.length; i++) {
                cursor[name] = i;
                if (name === entityName) {
                    calcExprAndSetValue.call(this, data[i]);
                } else {
                    let nextName = name + "." + entityName.replace(name + ".", "").split(".")[0];
                    eachBranch.call(this, nextName, this.getData(nextName, this.data, cursor));
                }
            }
        };
        switch (exprInfo.updateMode) {
            case "Single": // updateTarget: undefined
                let data = this.getData(entityName, this.data, cursor);
                let index = cursor[entityName];
                if (index < data.length) {
                    calcExprAndSetValue.call(this, data[index]);
                }
                break;
            default: // updateTarget: 类型为String，表示DataSource的Name
                let rootName;
                switch (exprInfo.updateMode) {
                    case "BranchUpdate":
                        rootName = exprInfo.updateTarget;
                        break;
                    case "BranchDelete":
                    case "All":
                    default:
                        rootName = entityName.split(".")[0];
                        break;
                }
                eachBranch.call(this, rootName, this.getData(rootName, this.data, cursor));
        }
        return;
    }
}
