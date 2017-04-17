import gridColumns from "../../configs/columns";
import { formatValue, parserValue } from "../../scripts/common";
import Expression from "../../scripts/expression";
import hotkey from "../../scripts/hotkey";
import View from "../../scripts/view";
import "./data.scss";
import data_tpl from "./data.tpl";
import $ from "jquery";
import _ from "underscore";

class Data extends View {
    private expression: Expression;
    private grids: Array<number>;
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
            "click .data-grid0": this.doClickGrid,
            "click .data-grid1": this.doClickGrid,
            "click .data-grid2": this.doClickGrid,
            "blur .data-grid-edit": this.doBlurEdit,
        };
    }
    protected initialize(): void {
        this.renderBasic();
    }
    protected doClickGrid(e): Data {
        hotkey.setCurrentView(this);
        let id = Number(this.$(e.target).parents(".easygrid").data("id"));
        return this.selectGrid(id);
    }
    protected doBlurEdit(e): Data {
        let id = Number(this.$(e.target).parents(".easygrid").data("id"));
        let grid = this.getGrid(id);
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

        this.grids = _.times(3, (me => i => {
            me[me.gridName + i] = me.$(".data-grid" + i).easygrid($.extend({}, defaultOptions, {
                columns: gridColumns[i],
                onEdit: (cell, id, dataField) => {
                    let grid = me.getGrid(i);
                    let value = grid.getValue(id, dataField);
                    let input = $("<input class='data-grid-edit'/>");
                    input.appendTo(cell).val(value).focus().select();
                    hotkey.bindElement(input.get(0), ["enter", "esc"],
                        ((eMe, eGrid, eInput, eId, eDataField, eN) => (e, combo) => {
                        if (combo === "enter") {
                            let v = eInput.val();
                            let type = eMe.expression.getFields_T(eN)[eDataField].type;
                            let rawValue = parserValue(v, type);
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
                onSelectedColChange: dataField => {
                    me.expression.setCurrentTableAndField(i, dataField);
                },
                onSelectedRowChange: id => {
                    let index = _.findIndex(me.getGrid(i).options.data, { _id: id });
                    let reloads = me.expression.setCursor_T(i, index);
                    me.refreshData(reloads);
                },
            }));
            return i;
        })(this));

        return this;
    }
    private getGrid(id: number): JQueryEasyGrid {
        return this[this.gridName + id];
    }
    private selectGrid(id: number): Data {
        let grid = this.getGrid(id);
        if (grid) {
            if (!grid.$el.hasClass("selected")) {
                this.$(".easygrid").removeClass("selected");
                grid.$el.addClass("selected");
            }
            this.expression.setCurrentTableAndField(id, grid.getSelectedField());
        }
        return this;
    }
    private refreshData(rds: Array<number>) {
        rds.forEach(((me) => (n) => {
            let grid = me.getGrid(n);
            grid.loadData(me.getDisplayData(
                me.expression.getFields_T(n),
                me.expression.getData_T(n)
            ));
            // 同步显示焦点
            let index = me.expression.getCursor_T(n);
            if (index >= 0) {
                let row = grid.options.data[index];
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
        raw: Array<JQueryEasyGridData>): Array<JQueryEasyGridData> {
        let r = [];
        if (raw) {
            raw.forEach(value => {
                let v: JQueryEasyGridData = {};
                for (let n in fields) {
                    if (fields.hasOwnProperty(n)) {
                        let field = fields[n];
                        let val = value[n];
                        if (_.isNaN(val) || _.isNull(val) || _.isUndefined(val)) {
                            v[n] = "";
                        } else {
                            v[n] = formatValue(val, field.type);
                        }
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
