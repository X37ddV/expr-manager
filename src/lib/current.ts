interface IDataCurrent {
    [fullName: string]: number;
}
interface ICurrentParam {
    current: string;
    cursor: number;
    isEntityData: boolean;
}
interface ICurrentItem {
    pIndex: number;
    params: ICurrentParam[];
}

// 表达式游标
// ----------

export default class ExprCurrent {
    private curr: ICurrentItem[] = [];
    private dataCursor: IDataCurrent;
    // 设置数据游标
    public setDataCursor(cursor: IDataCurrent) {
        this.dataCursor = cursor;
    }
    // 向栈顶添加新的计算环境
    public push(c: ICurrentParam[]) {
        this.curr.unshift({ pIndex: 0, params: c });
    }
    // 删除栈顶的计算环境
    public pop() {
        this.curr.shift();
    }
    // 栈顶计算环境的params属性是否存在第index条记录
    public isValid(index: number): boolean {
        return index >= 0 && this.curr.length > 0 && index < this.curr[0].params.length;
    }
    // 栈顶计算环境的params属性的第index条记录是否为实体数据
    public isEntityData(index?: number): boolean {
        if (this.curr.length > 0) {
            const c = this.curr[0];
            c.pIndex = index || 0;
            return c.params[c.pIndex].isEntityData;
        } else {
            return false;
        }
    }
    // 得到栈顶计算环境的params属性的第index条记录存储的实体名
    public getEntityName(index?: number): string {
        return this.getData(index) || "";
    }
    // 得到实体全名称entityName的访问游标
    public getEntityDataCursor(entityName: string, index?: number) {
        let r = entityName ? this.dataCursor[entityName] : 0;
        /// 从计算环境中得到已经存好的访问游标，如：Root().E1[1].Entity1.Sum("ID")中的1
        for (let i = 0; i < this.curr.length; i++) {
            const c = this.curr[i];
            if (i === 0) {
                c.pIndex = index || 0;
            }
            const cc = c.params[c.pIndex];
            if (cc.isEntityData && cc.current === entityName) {
                r = cc.cursor;
                break;
            }
        }
        return r;
    }
    // 得到栈顶计算环境的params属性的第index条记录存储的数据
    public getData(index: number): string {
        let r;
        if (this.curr.length > 0) {
            const c = this.curr[0];
            c.pIndex = index || 0;
            r = c.params[c.pIndex].current;
        }
        return r;
    }
}
