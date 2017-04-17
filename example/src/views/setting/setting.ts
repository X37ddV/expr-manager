import image_close_svg_tpl from "../../images/close.svg.tpl";
import Expression from "../../scripts/expression";
import hotkey from "../../scripts/hotkey";
import View from "../../scripts/view";
import "./setting.scss";
import setting_tpl from "./setting.tpl";
import _ from "underscore";

class Setting extends View {
    private expression: Expression;
    private showing: boolean;
    private oldCurrentView: View;
    private $exprWrap: JQuery;
    private $defaultExprWrap: JQuery;
    private $errorMsg: JQuery;
    private exprMap;
    public setExpression(v: Expression): Setting {
        this.expression = v;
        return this;
    }
    public show(): Setting {
        if (!this.showing) {
            this.showing = true;
            this.loadFields().loadExprs();
            this.$el.show();
            this.oldCurrentView = hotkey.getCurrentView();
            hotkey.setCurrentView(this);
        }
        return this;
    }
    public hide(): Setting {
        if (this.showing) {
            this.showing = false;
            this.$el.hide();
            hotkey.setCurrentView(this.oldCurrentView);
            this.oldCurrentView = null;
        }
        return this;
    }
    protected preinitialize(): void {
        this.className = "setting-view";
        this.events = {
            "click .setting-close": this.doClickClose,
            "click .setting-p1-action-cancel": this.doClickP1Cancel,
            "click .setting-p1-action-apply": this.doClickP1Apply,
        };
    }
    protected initialize(): void {
        this.renderBasic().initHotkey();
    }
    protected doClickClose(): Setting {
        return this.hide();
    }
    protected doClickP1Cancel(): Setting {
        return this.doClickClose();
    }
    protected doClickP1Apply(): Setting {
        let errMsg = this.applyExprs();
        if (errMsg) {
            this.$errorMsg.text(errMsg);
        } else {
            this.doClickClose();
        }
        return this;
    }
    private renderBasic(): Setting {
        this.$el.html(setting_tpl);
        this.$(".setting-close").html(image_close_svg_tpl);
        this.$exprWrap = this.$(".expr");
        this.$defaultExprWrap = this.$(".default-expr");
        this.$errorMsg = this.$(".setting-p1-error-msg");
        return this;
    }
    private initHotkey(): Setting {
        hotkey.bindView(this, "esc", ((me) => (e, combo) => {
            me.doClickClose();
        })(this));
        return this;
    }
    private eachFields(callback: (type: "F" | "E", tableName, fieldName, field, id) => void): void {
        for (let i = 0; i < this.expression.length(); i++) {
            let fields = this.expression.getFields_T(i);
            for (let fieldName in fields) {
                if (fields.hasOwnProperty(fieldName)) {
                    let field = fields[fieldName];
                    let f = fieldName[0];
                    if (f === "F" || f === "E") {
                        let tName = this.expression.getTableName_T(i).split(".");
                        let tableName = tName[tName.length - 1];
                        let inputId = "setting" + tableName + fieldName;
                        callback.call(this, f, tableName, fieldName, field, inputId);
                    }
                }
            }
        }
    }
    private loadFields(): Setting {
        this.exprMap = {};
        this.$exprWrap.html("");
        this.$defaultExprWrap.html("");
        this.eachFields(((me) => (type, tableName, fieldName, field, id) => {
            let value;
            let propName;
            let property;
            let wrap = "<div class='setting-p1-item'><label for='" + id + "'>" +
                tableName + "." + fieldName + "(" + field.type[0].toUpperCase() +
                "):</label><input id='" + id + "' type='text'/></div>";
            if (type === "F") {
                value = field.defaultExpr;
                propName = "defaultExpr";
                property = field;
                me.$defaultExprWrap.append(wrap);
            } else if (type === "E") {
                value = field.expr;
                propName = "expr";
                property = field;
                me.$exprWrap.append(wrap);
            } else {
                value = "";
                propName = "";
                property = null;
            }
            me.exprMap[id] = {
                expr: value,
                field: property,
                prop: propName,
            };
        })(this));
        return this;
    }
    private loadExprs(): Setting {
        this.$errorMsg.text("");
        for (let id in this.exprMap) {
            if (this.exprMap.hasOwnProperty(id)) {
                let item = this.exprMap[id];
                this.$("#" + id).val(item.expr);
            }
        }
        return this;
    }
    private applyExprs(): string {
        for (let id in this.exprMap) {
            if (this.exprMap.hasOwnProperty(id)) {
                let item = this.exprMap[id];
                item.field[item.prop] = this.$("#" + id).val();
            }
        }
        let errMsg = this.expression.checkExpression();
        if (errMsg) {
            for (let id in this.exprMap) {
                if (this.exprMap.hasOwnProperty(id)) {
                    let item = this.exprMap[id];
                    item.field[item.prop] = item.expr;
                }
            }
        } else {
            this.expression.dataLoad();
            this.trigger("onapply");
        }
        return errMsg;
    }
}

export default Setting;
