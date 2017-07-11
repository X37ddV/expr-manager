import ExprManager from "expr-manager";
import _ from "underscore";
import context from "../configs/context";
import tables from "../configs/tables";
import { exprSuggest, IExprSuggestResult } from "./expression.suggest";

export default class Expression {
    private data;
    private nameList: string[];
    private primaryKeyMap;
    private cursorMap;
    private childsMap;
    private fieldsMap;
    private currentNewId: number = -1;
    private currentTable: string = "";
    private currentField: string = "";
    private exprManager: ExprManager = new ExprManager();
    constructor() {
        this.data = this.genData();
        this.nameList = [];
        this.primaryKeyMap = {};
        this.cursorMap = {};
        this.childsMap = {};
        this.fieldsMap = {};
        this.eachTables(tables, ((me) => (name, fields, childs) => {
            let pk = "";
            for (const key in fields) {
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
        this.exprManager.init(this.data, tables, context);
        this.dataLoad();
    }
    public length(): number {
        return this.nameList.length;
    }
    public calcExpr(line: string): Value {
        return this.exprManager.calcExpr(line, this.currentTable, this.cursorMap, {
            FieldDisplayName: this.currentField,  // TODO:
            FieldName: this.currentField,
            FieldValue: this.currentField,  // TODO:
        });
    }
    public getTableName_T(n: number) {
        return this.nameList[n];
    }
    public getFields_T(n: number) {
        const name = this.nameList[n];
        return this.fieldsMap[name];
    }
    public getData_T(n: number) {
        const name = this.nameList[n];
        return this.getData(name, this.data, this.cursorMap);
    }
    public getCursor_T(n: number): number {
        const name = this.nameList[n];
        return this.cursorMap[name];
    }
    public setCursor_T(n: number, index: number): number[] {
        const name = this.nameList[n];
        const r = []; // 返回需要更新的表索引号
        if (this.cursorMap[name] !== index) {
            this.cursorMap[name] = index;
            this.nameList.forEach(((me) => (v, i) => {
                if (v.length > name.length && v.indexOf(name) === 0) {
                    const d = me.getData_T(i);
                    me.cursorMap[v] = (d && d.length > 0) ? 0 : -1;
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
            funcs: this.exprManager.getFunction(),
        });
    }
    public checkExpression(): string {
        this.exprManager.resetExpression();
        this.eachTables(tables, ((me) => (name, fields, childs) => {
            for (const fieldName in fields) {
                if (fields.hasOwnProperty(fieldName)) {
                    const field = fields[fieldName];
                    if (field.expr) {
                        me.exprManager.addExpression(field.expr, name, fieldName,
                            ["load", "add", "update", "remove"], me.doCalcExpr, me);
                    } else if (field.defaultExpr) {
                        me.exprManager.addExpression(field.defaultExpr, name, fieldName, ["add"], me.doCalcExpr, me);
                    }
                }
            }
        })(this));
        return this.exprManager.checkAndSort();
    }
    public dataLoad(): Expression {
        const msg = this.checkExpression();
        if (!msg) {
            this.nameList.forEach(((me) => (name, index) => {
                const info = {
                    entityName: name,
                    propertyName: null,
                };
                me.exprManager.calcExpression("load", info);
            })(this));
        } else {
            window.console.error(msg);
        }
        return this;
    }
    public dataAdd(n: number): Expression {
        const data = this.getData_T(n);
        const name = this.nameList[n];
        data.push(this.newData(n));
        this.setCursor_T(n, data.length - 1);
        const info = {
            entityName: name,
            propertyName: null,
        };
        this.exprManager.calcExpression("add", info);
        return this;
    }
    public dataUpdate(n: number, fieldName: string, value: any): Expression {
        const data = this.getData_T(n);
        const name = this.nameList[n];
        const index = this.cursorMap[name];
        if (index >= 0) {
            data[index][fieldName] = value;
            const info = {
                entityName: name,
                propertyName: fieldName,
            };
            this.exprManager.calcExpression("update", info);
        }
        return this;
    }
    public dataRemove(n: number): Expression {
        const data = this.getData_T(n);
        const name = this.nameList[n];
        const index = this.cursorMap[name];
        if (index >= 0) {
            data.splice(index, 1);
            if (index >= data.length) {
                this.setCursor_T(n, data.length - 1);
            }
            const info = {
                entityName: name,
                propertyName: null,
            };
            this.exprManager.calcExpression("remove", info);
        }
        return this;
    }
    private eachTables(ts, callback: (name: string, fields, childs) => void, pName?: string) {
        if (ts) {
            for (const t in ts) {
                if (ts.hasOwnProperty(t)) {
                    const name = pName ? pName + "." + t : t;
                    callback.call(this, name, ts[t].fields, ts[t].childs);
                    this.eachTables(ts[t].childs, callback, name);
                }
            }
        }
    }
    private getData(name: string, d, cursor) {
        let n = "";
        const names = name.split(".");
        for (let i = 0; i < names.length; i++) {
            const v = names[i];
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
            const rps = [];
            const ps = func.p;
            const pl = func.getLocale().p;
            const p = String(func.fn).match(/\(.*\)/)[0].replace(/[\(\)\s]/g, "").split(",");
            for (let i = 0; i < ps.length; i++) {
                let type = ps[i];
                let desc = pl[i];
                let isOptional = false;
                if (type.indexOf("?") === type.length - 1) {
                    type = type.replace("?", "");
                    desc = desc.replace("?", "");
                    isOptional = true;
                }
                const paramItem = {
                    FDescription: desc,
                    FIndex: i + 1,
                    FIsOptional: isOptional,
                    FName: p[i + p.length - ps.length],
                    FType: type,
                    ID: idParams++,
                };
                rps.push(paramItem);
            }
            return rps;
        }
        function genFuncs(funcs) {
            const rfs = [];
            for (const name in funcs) {
                if (funcs.hasOwnProperty(name)) {
                    const f = funcs[name];
                    const params = genParams(f);
                    const l = f.getLocale();
                    const funcItem = {
                        FDescription: l.fn,
                        FLastTime: new Date(),
                        FName: name,
                        FParams: f.p,
                        FReturnDescription: l.r,
                        FReturnType: f.r,
                        ID: idFuncs++,
                        TParams: params,
                    };
                    rfs.push(funcItem);
                }
            }
            return rfs;
        }
        function genGroups(groups) {
            const rgs = [];
            for (const name in groups) {
                if (groups.hasOwnProperty(name)) {
                    const g = groups[name];
                    const o = {};
                    const funcs = genFuncs(g);
                    for (const func of funcs) {
                        o[func.FName] = func.FReturnType;
                    }
                    const groupItem = {
                        FFuncs: o,
                        FName: name,
                        ID: idGroups++,
                        TFuncs: funcs,
                    };
                    rgs.push(groupItem);
                }
            }
            return rgs;
        }
        return {
            TGroups: genGroups(this.exprManager.getFunction()),
        };
    }
    private newId(): number {
        return this.currentNewId--;
    }
    private newData(n: number) {
        const name = this.nameList[n];
        const r = {};
        const pk = this.primaryKeyMap[name];
        if (pk) {
            r[pk] = this.newId();
        }
        const childs = this.childsMap[name];
        if (childs) {
            for (const subName in childs) {
                if (childs.hasOwnProperty(subName)) {
                    r[subName] = [];
                }
            }
        }
        return r;
    }
    private doCalcExpr(type, info): void {
        const exprStr = info.exprInfo.expr;
        const cursor = _.clone(this.cursorMap);
        switch (type) {
            case "remove":
            case "update":
            case "add":
                this.doCalcExprValue(exprStr, cursor, info.exprInfo);
                break;
            case "load":
            default:
                const name = info.entityName;
                this.doCalcExprLoad(exprStr, cursor, info.exprInfo, name, 0);
                break;
        }
    }
    private doCalcExprLoad(exprStr, dataCursor, exprInfo, name, level): void {
        const cursor = _.clone(dataCursor);
        const names = name.split(".");
        const nameList = [];
        for (let i = 0; i <= level; i++) {
            nameList.push(names[i]);
        }
        const n = nameList.join(".");
        const data = this.getData(n, this.data, cursor);
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
        const cursor = _.clone(dataCursor);
        const entityName = exprInfo.entityName;
        const calcExprAndSetValue = (record) => {
            const value = this.exprManager.calcExpr(exprStr, entityName, cursor, {
                FieldDisplayName: "",  // TODO:
                FieldName: exprInfo.propertyName,
                FieldValue: "",  // TODO:
            });
            record[exprInfo.propertyName] = value.toValue();
        };
        const eachBranch = (name, data) => {
            for (let i = 0; i < data.length; i++) {
                cursor[name] = i;
                if (name === entityName) {
                    calcExprAndSetValue.call(this, data[i]);
                } else {
                    const nextName = name + "." + entityName.replace(name + ".", "").split(".")[0];
                    eachBranch.call(this, nextName, this.getData(nextName, this.data, cursor));
                }
            }
        };
        switch (exprInfo.updateMode) {
            case "Single": // updateTarget: undefined
                const data = this.getData(entityName, this.data, cursor);
                const index = cursor[entityName];
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
