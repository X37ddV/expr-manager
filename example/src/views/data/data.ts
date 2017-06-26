import $ from "jquery";
import _ from "underscore";
import gridColumns from "../../configs/columns";
import { formatValue, parserValue } from "../../scripts/common";
import Expression from "../../scripts/expression";
import hotkey from "../../scripts/hotkey";
import View from "../../scripts/view";
import "./data.scss";
import data_tpl from "./data.tpl";

class Data extends View {
    private expression: Expression;
    private grids: number[];
    private gridName: string;
    public refreshAll() {
        this.refreshData(this.grids);
        return this;
    }
    public setExpression(v: Expression): Data {
        this.expression = v;
        this.refreshAll();
        if (this.grids.length > 0) {
            this.selectGrid(this.grids[0]);
        }
        return this;
    }
    public addRow(): Data {
        this.expression.dataAdd(this.expression.getCurrentTableIndex());
        this.refreshAll();
        return this;
    }
    public removeRow(): Data {
        this.expression.dataRemove(this.expression.getCurrentTableIndex());
        this.refreshAll();
        return this;
    }
    public hotkeyFocus(): Data {
        this.grids.forEach(((me) => (n) => {
            me.getGrid(n).options.isAllowKeyboard = true;
        })(this));
        return this;
    }
    public hotkeyBlur(): Data {
        this.grids.forEach(((me) => (n) => {
            me.getGrid(n).options.isAllowKeyboard = false;
        })(this));
        return this;
    }
    protected preinitialize(): void {
        this.className = "data-view";
        this.gridName = "grid";
        this.events = {
            "blur .data-grid-edit": this.doBlurEdit,
            "click .data-grid0": this.doClickGrid,
            "click .data-grid1": this.doClickGrid,
            "click .data-grid2": this.doClickGrid,
        };
    }
    protected initialize(): void {
        this.renderBasic();
    }
    protected doClickGrid(e): Data {
        hotkey.setCurrentView(this);
        const id = Number(this.$(e.target).parents(".easygrid").data("id"));
        return this.selectGrid(id);
    }
    protected doBlurEdit(e): Data {
        const id = Number(this.$(e.target).parents(".easygrid").data("id"));
        const grid = this.getGrid(id);
        grid.endEdit();
        return this;
    }
    private renderBasic(): Data {
        this.$el.html(data_tpl);
        const defaultOptions = {
            isAllowEdit: true,
            isAllowKeyboard: false,
            isAllowMoveCol: false,
            isAllowRemoveCol: false,
            isAllowSort: false,
        };

        this.grids = _.times(3, ((me) => (i) => {
            me[me.gridName + i] = me.$(".data-grid" + i).easygrid($.extend({}, defaultOptions, {
                columns: gridColumns[i],
                onEdit: (cell, id, dataField) => {
                    const grid = me.getGrid(i);
                    const value = grid.getValue(id, dataField);
                    const input = $("<input class='data-grid-edit'/>");
                    input.appendTo(cell).val(value).focus().select();
                    hotkey.bindElement(input.get(0), ["enter", "esc"],
                        ((eMe, eGrid, eInput, eId, eDataField, eN) => (e, combo) => {
                        if (combo === "enter") {
                            const v = eInput.val();
                            const type = eMe.expression.getFields_T(eN)[eDataField].type;
                            const rawValue = parserValue(v, type);
                            if (!_.isNaN(rawValue)) {
                                eMe.expression.dataUpdate(i, eDataField, rawValue);
                                eMe.refreshAll();
                            }
                        }
                        eGrid.endEdit();
                        e.stopPropagation();
                        e.preventDefault();
                    })(me, grid, input, id, dataField, i), "keydown");
                },
                onSelectedColChange: (dataField) => {
                    me.expression.setCurrentTableAndField(i, dataField);
                },
                onSelectedRowChange: (id) => {
                    const index = _.findIndex(me.getGrid(i).options.data, { _id: id });
                    const reloads = me.expression.setCursor_T(i, index);
                    me.refreshData(reloads);
                },
            }));
            return i;
        })(this));

        return this;
    }
    private getGrid(id: number): IJQueryEasyGrid {
        return this[this.gridName + id];
    }
    private selectGrid(id: number): Data {
        const grid = this.getGrid(id);
        if (grid) {
            if (!grid.$el.hasClass("selected")) {
                this.$(".easygrid").removeClass("selected");
                grid.$el.addClass("selected");
            }
            this.expression.setCurrentTableAndField(id, grid.getSelectedField());
        }
        return this;
    }
    private refreshData(rds: number[]) {
        rds.forEach(((me) => (n) => {
            const grid = me.getGrid(n);
            grid.loadData(me.getDisplayData(
                me.expression.getFields_T(n),
                me.expression.getData_T(n),
            ));
            // 同步显示焦点
            const index = me.expression.getCursor_T(n);
            if (index >= 0) {
                const row = grid.options.data[index];
                if (row) {
                    grid.selectRow(row._id, true);
                }
                let col = grid.getSelectedField();
                if (col) {
                    grid.selectCol(col, true);
                } else if (grid.options.columns.length > 0) {
                    col = grid.options.columns[0].dataField;
                    grid.selectCol(col, true);
                }
            }
        })(this));
    }
    private getDisplayData(
        fields: { [name: string]: { primaryKey?: boolean, type: string } },
        raw: IJQueryEasyGridData[]): IJQueryEasyGridData[] {
        const r = [];
        if (raw) {
            raw.forEach((value) => {
                const v: IJQueryEasyGridData = {};
                for (const n in fields) {
                    if (fields.hasOwnProperty(n)) {
                        const field = fields[n];
                        const val = value[n];
                        v[n] = (_.isNaN(val) || _.isNull(val) || _.isUndefined(val)) ? "" :
                            formatValue(val, field.type);
                        if (field.primaryKey) {
                            v._id = val;
                        }
                    }
                }
                r.push(v);
            });
        }
        return r;
    }
}

export default Data;
