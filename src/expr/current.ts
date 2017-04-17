export default class ExprCurrent {
    private curr = [];
    private dataCursor;
    public setDataCursor(cursor) {
        this.dataCursor = cursor;
    }
    public push(c) {
        /// <summary>向栈顶添加新的计算环境</summary>
        this.curr.unshift({ pIndex: 0, params: c });
    }
    public pop() {
        /// <summary>删除栈顶的计算环境</summary>
        this.curr.shift();
    }
    public isValid(index) {
        /// <summary>栈顶计算环境的params属性是否存在第index条记录</summary>
        let r = index >= 0 && this.curr.length > 0 && index < this.curr[0].params.length;
        return r;
    }
    public isEntityData(index?) {
        /// <summary>栈顶计算环境的params属性的第index条记录是否为实体数据</summary>
        if (this.curr.length > 0) {
            let c = this.curr[0];
            c.pIndex = index || 0;
            return c.params[c.pIndex].isEntityData;
        } else {
            return false;
        }
    }
    public getEntityName(index?) {
        /// <summary>得到栈顶计算环境的params属性的第index条记录存储的实体名</summary>
        return this.getData(index) || "";
    }
    public getEntityDataCursor(entityName, index?) {
        /// <summary>得到实体全名称entityName的访问游标</summary>
        let r = entityName ? this.dataCursor[entityName] : 0;
        // 从计算环境中得到已经存好的访问游标，如：Root().E1[1].Entity1.Sum("ID")中的1
        for (let i = 0; i < this.curr.length; i++) {
            let c = this.curr[i];
            if (i === 0) {
                c.pIndex = index || 0;
            }
            let cc = c.params[c.pIndex];
            if (cc.isEntityData && cc.current === entityName) {
                r = cc.cursor;
                break;
            }
        }
        return r;
    }
    public getData(index) {
        /// <summary>得到栈顶计算环境的params属性的第index条记录存储的数据</summary>
        let r;
        if (this.curr.length > 0) {
            let c = this.curr[0];
            c.pIndex = index || 0;
            r = c.params[c.pIndex].current;
        }
        return r;
    }
}
