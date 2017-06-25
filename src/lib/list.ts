import { format } from "./base/common";
import locale from "./base/locale";

export default class ExprList {
    private list = [];
    private cache = {};
    private sorted = false;
    public _getExprs(entity, property, type) {
        const name = property ? entity + "." + property : entity;
        const isLoadOrAdd = type === "L" || type === "A";
        const key = name + "|" + type;
        let r = this.sorted ? this.cache[key] : [];
        if (!r) {
            r = [];
            const s = {};
            const l = {};
            const list = [];
            for (const item of this.list) {
                if (item.types) {
                    if (item.types.indexOf(type) >= 0) {
                        list.push(item);
                    }
                } else {
                    list.push(item);
                }
            }
            const fn = (fullName, entityName) => {
                for (let i = 0; i < list.length; i++) {
                    if (l[i] !== true) {
                        l[i] = true;
                        const x = list[i];
                        let f = isLoadOrAdd && (x.entityName === entityName && x.entityName !== "");
                        if (!f && x.dependencies) {
                            for (const dependency of x.dependencies) {
                                f = dependency === fullName;
                                if (f) {
                                    break;
                                }
                            }
                        }
                        if (f && !s[i]) {
                            s[i] = true;
                            fn(x.fullName, entityName);
                        }
                        l[i] = false;
                    }
                }
            };
            fn(name, name);
            for (let k = 0; k < list.length; k++) {
                if (s[k]) {
                    const o = {};
                    for (const p in list[k]) {
                        if (list[k].hasOwnProperty(p)) {
                            o[p] = list[k][p];
                        }
                    }
                    r.push(o);
                }
            }
            this._doUpdateMode(r, type, name, entity, property);
            this.cache[key] = r;
        }
        return r;
    }
    public _doUpdateMode(r, t, name, entity, property) {
        const updateList = [{
            entityName: entity,     // 实体名
            fullName: name,         // 全名
            propertyName: property, // 属性名
            type: t,             // 新增、删除、修改
            updateMode: "Single",   // 更新模式 Single: 单挑记录修改
            updateTarget: "",       // 更新目标
        }];
        for (const item of r) {
            this._doGetMode(updateList, item);
            updateList.push({
                entityName: item.entityName,     // 实体名
                fullName: item.fullName,         // 全名
                propertyName: item.propertyName, // 属性名
                type: "U",
                updateMode: item.updateMode,
                updateTarget: item.updateTarget,
            });
        }
    }
    public _doGetMode(updateList, l) {
        const modeList = [];
        // 计算字段表达式的依赖更新模式
        if (updateList && l && l.dependencies) {
            for (let i = 0; i < updateList.length; i++) {
                let u = updateList[i];
                for (let j = 0; j < l.dependencies.length; j++) {
                    if (u.fullName === l.dependencies[j]) {
                        let commonAncestry = true;
                        let isSubChange = false;
                        // 找到依赖的变化字段
                        if (u.type === "U") {
                            // 如果该字段是更新

                            let isDependEntity = false; // 表达式是否依赖了实体
                            for (let k = 0; k < l.dependencies.length; k++) {
                                isDependEntity = (u.fullName.indexOf(l.dependencies[k] + ".") === 0);
                                if (isDependEntity) {
                                    break;
                                }
                            }

                            if (u.entityName === l.entityName) {
                                // 同级更新
                                if (isDependEntity) {
                                    modeList.push({ updateMode: "All" });
                                } else {
                                    modeList.push({ updateMode: "Single" });
                                }
                            } else if (l.entityName.indexOf(u.entityName + ".") === 0) {
                                // 上级更新
                                if (isDependEntity) {
                                    modeList.push({ updateMode: "All" });
                                } else {
                                    modeList.push({ updateMode: "BranchUpdate",
                                        updateTarget: this._doGetUpdateTarget(u.entityName, l.entityName) });
                                }
                            } else if (u.entityName.indexOf(l.entityName + ".") === 0) {
                                // 下级更新
                                modeList.push({ updateMode: "Single" });
                                isSubChange = true;
                            } else {
                                // 外部更新
                                modeList.push({ updateMode: "All" });
                                commonAncestry = false;
                            }
                        } else if (u.type === "R") {
                            // 如果该记录是删除
                            if (u.entityName === l.entityName) {
                                // 同级删除
                                modeList.push({ updateMode: "All" });
                            } else if (l.entityName.indexOf(u.entityName + ".") === 0) {
                                // 上级删除
                                modeList.push({ updateMode: "BranchDelete",
                                    updateTarget: this._doGetUpdateTarget(u.entityName, l.entityName) });
                            } else if (u.entityName.indexOf(l.entityName + ".") === 0) {
                                // 下级删除
                                modeList.push({ updateMode: "Single" });
                                isSubChange = true;
                            } else {
                                // 外部删除
                                modeList.push({ updateMode: "All" });
                                commonAncestry = false;
                            }
                        } else {
                            // 如果该记录是添加或加载
                            if (u.entityName === l.entityName) {
                                // 同级添加
                                modeList.push({ updateMode: "All" });
                            } else if (l.entityName.indexOf(u.entityName + ".") === 0) {
                                // 上级添加
                                modeList.push({ updateMode: "All" });
                            } else if (u.entityName.indexOf(l.entityName + ".") === 0) {
                                // 下级添加
                                modeList.push({ updateMode: "Single" });
                                isSubChange = true;
                            } else {
                                // 外部添加
                                modeList.push({ updateMode: "All" });
                                commonAncestry = false;
                            }
                        }
                        if (commonAncestry && !isSubChange) {
                            modeList.push({ updateMode: u.updateMode, updateTarget: u.updateTarget });
                        }
                    }
                }
            }
        }
        // 合并字段表达式的依赖更新模式
        let a = "Single";
        let at = "";
        let b;
        let bt;
        for (const item of modeList) {
            b = item.updateMode;
            bt = item.updateTarget || "";
            if (a === b && (a === "BranchDelete" || a === "BranchUpdate")) {
                if (at.length > bt.length) {
                    at = bt;
                }
            } else if (b === "BranchDelete" || a === "Single") {
                a = b;
                at = bt;
            } else if (a === "BranchDelete" || b === "Single") {
                // nothing
            } else if (b === "All") {
                a = b;
                at = bt;
            }
        }
        l.updateMode = a;
        l.updateTarget = at;
    }
    public _doGetUpdateTarget(parent, me) {
        const p = parent.split(".");
        const m = me.split(".");
        p.push(m[p.length]);
        return p.join(".");
    }
    public reset() {
        /// <summary>重置表达式列表对象</summary>
        this.list = [];
        this.cache = {};
        this.sorted = false;
    }
    public add(expr, entityName, propertyName, types, callback, scope) {
        /// <summary>添加表达式</summary>
        this.cache = {};
        this.sorted = false;
        let index = -1;
        for (let i = 0; i < this.list.length; i++) {
            const item = this.list[i];
            if (item.expr === expr && item.entityName === entityName && item.propertyName === propertyName &&
                item.types === types && item.callback === callback && item.scope === scope) {
                index = i;
                break;
            }
        }
        if (index === -1) { // 如果缓存里没有，则添加
            this.list.push({
                callback: callback,
                entityName: entityName || "",
                expr: expr || "",
                fullName: propertyName ? entityName + "." + propertyName : entityName || "",
                propertyName: propertyName || "",
                scope: scope,
                types: types,
            });
        }
    }
    public remove(expr, entityName, propertyName, types, callback, scope) {
        /// <summary>删除表达式</summary>
        this.cache = {};
        this.sorted = false;
        for (let i = 0; i < this.list.length; i++) {
            let item = this.list[i];
            if (item.expr === expr && item.entityName === entityName && item.propertyName === propertyName &&
                item.types === types && item.callback === callback && item.scope === scope) {
                this.list.splice(i, 1); // 删除匹配的项
                break;
            }
        }
    }
    public checkAndSort(dependCallback: Function) {
        this.cache = {};
        this.sorted = true;
        let msg = "";
        for (const item of this.list) {
            if (!item.dependencies && dependCallback) { // 计算该组测试用例中每个表达式的依赖关系
                const d = dependCallback(item.expr, item.entityName);
                msg = d.errorMsg;
                if (msg === "") {
                    item.dependencies = d.dependencies;
                } else {
                    msg = format(locale.getLocale().MSG_ES_PARSER, item.entityName, item.expr, msg);
                    break;
                }
            }
        }

        if (msg === "") {
            // 按依赖关系排序
            const fillList = [];
            const newList = [];
            const findItem = (list, item) => {
                let r = false;
                for (const listItem of list) {
                    if (listItem === item) {
                        r = true;
                    }
                }
                return r;
            };
            const depends = (item, stack) => {
                if (!findItem(stack, item)) {
                    for (let a = 0; a < fillList.length; a++) {
                        const e = fillList[a];
                        let f = false;
                        if (item && item.dependencies) {
                            for (let b = 0; b < item.dependencies.length; b++) {
                                f = e.fullName === item.dependencies[b];
                                if (f) {
                                    break;
                                }
                            }
                        }
                        if (f) {
                            stack.push(item);
                            depends(e, stack);
                        }
                    }
                    if (!findItem(newList, item)) {
                        newList.push(item);
                    }
                }
            };
            for (let x = 0; x < this.list.length; x++) {
                const xx = this.list[x];
                if (xx.fullName !== "") {
                    fillList.push(xx);
                }
            }
            for (let y = 0; y < fillList.length; y++) {
                const stack = [];
                depends(fillList[y], stack);
            }
            for (let z = 0; z < this.list.length; z++) {
                const zz = this.list[z];
                if (zz.fullName === "") {
                    newList.push(zz);
                }
            }
            this.list = newList;
        }
        return msg;
    }
    public getExprsByUpdate(entityName, propertyName) {
        return this._getExprs(entityName, propertyName, "U");
    }
    public getExprsByLoad(entityName) {
        return this._getExprs(entityName, "", "L");
    }
    public getExprsByAdd(entityName) {
        return this._getExprs(entityName, "", "A");
    }
    public getExprsByRemove(entityName) {
        return this._getExprs(entityName, "", "R");
    }
}
