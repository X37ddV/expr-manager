import $ from "jquery";
import image_prompt_svg_tpl from "../../images/prompt.svg.tpl";
import image_result_svg_tpl from "../../images/result.svg.tpl";
import image_warning_svg_tpl from "../../images/warning.svg.tpl";
import { formatValue, getValueType, showFocus, ShowFocusType } from "../../scripts/common";
import hotkey from "../../scripts/hotkey";
import View from "../../scripts/view";
import "./result.scss";
import result_tpl from "./result.tpl";

enum ObjectPrefixType {
    None,
    Array,
    Object,
}

interface IResultItems {
    [id: number]: {
        itemLine: string,
        itemValue: Value,
    };
}

class Result extends View {
    private items: IResultItems;
    private itemId: number;
    private $rows: JQuery;
    public add(line: string, value: Value): Result {
        this.items[this.itemId] = {
            itemLine: line,
            itemValue: value,
        };

        const lineRow = "<div class='result-row' data-id='" + this.itemId +
            "'><div class='result-line-prompt'>" +
            image_prompt_svg_tpl + "</div><div class='result-line-content'>" + line + "</div></div>";
        this.$rows.append(lineRow);

        const v = this.genValue(value);
        let vCls = "";
        let vSvg = "";
        if (value.errorMsg) {
            vCls = " warning";
            vSvg = image_warning_svg_tpl;
        } else {
            vSvg = image_result_svg_tpl;
        }
        const valueRow = "<div class='result-row" + vCls + "' data-id='" + this.itemId +
            "'><div class='result-value-prompt'>" +
            vSvg + "</div><div class='result-value-content'>" + v + "</div></div>";
        this.$rows.append(valueRow);

        this.itemId++;

        this.$el.scrollTop(this.$rows.height());
        return this.refresh();
    }
    public refresh(): Result {
        let emptyHeight = this.$el.height() - this.$rows.height();
        emptyHeight = emptyHeight > 0 ? emptyHeight : 0;
        this.$(".result-empty").height(emptyHeight);
        this.$(".result-line-content").width(this.$el.outerWidth() -
            this.$(".result-line-prompt").outerWidth());
        this.$(".result-value-content").width(this.$el.outerWidth() -
            this.$(".result-value-prompt").outerWidth());

        if (emptyHeight === 0) {
            // 焦点显示
            const focusCell = this.$(".result-row.selected");
            showFocus(this.$el, focusCell, ShowFocusType.Height);
        }

        return this;
    }
    public clear(): Result {
        this.items = [];
        this.itemId = 0;
        this.$rows.html("");
        return this.refresh();
    }
    public hotkeyFocus(): Result {
        this.doClickEmpty();
        return this;
    }
    public hotkeyBlur(): Result {
        this.$(".result-row").removeClass("selected");
        return this;
    }
    protected preinitialize(): void {
        this.items = [];
        this.itemId = 0;
        this.className = "result-view";
        this.events = {
            "click .result-empty": this.doClickEmpty,
            "click .result-row": this.doClickRow,
            "click .result-row-warning": this.doClickRow,
            "click .result-value": this.doClickValue,
        };
    }
    protected initialize(): void {
        $(window).resize(((me) => () => {
            me.refresh();
        })(this));
        this.renderBasic();
        this.initHotkey();
    }
    protected doClickRow(e: JQueryEventObject): Result {
        let t = this.$(e.target);
        if (!t.hasClass("result-row")) {
            t = t.parents(".result-row");
        }
        t.addClass("selected").siblings().removeClass("selected");
        hotkey.setCurrentView(this, true);
        this.triggerClickItem(t.data("id"));
        return this;
    }
    protected doClickValue(e: JQueryEventObject): Result {
        let t = this.$(e.target);
        if (!t.hasClass("result-value")) {
            t = t.parents(".result-value");
        }
        if (t.hasClass("collapsed")) {
            this.expandedValue(t);
        } else if (t.hasClass("expanded")) {
            this.collapsedValue(t);
        }
        hotkey.setCurrentView(this, true);
        return this;
    }
    protected doClickEmpty(): Result {
        this.$(".result-row").removeClass("selected");
        this.trigger("clickempty");
        return this;
    }
    private renderBasic(): Result {
        this.$el.html(result_tpl);
        this.$rows = this.$(".result-rows");
        return this;
    }
    private initHotkey(): Result {
        hotkey.bindView(this, ["up", "down", "left", "right"], ((me) => (e, combo) => {
            const item = me.$rows.children(".selected");
            if (combo === "up") {
                const newItem = item.prev();
                if (newItem.length > 0) {
                    item.removeClass("selected");
                    newItem.addClass("selected");
                    me.triggerClickItem(newItem.data("id"));
                    me.refresh();
                }
            } else if (combo === "down") {
                const newItem = item.next();
                if (newItem.length > 0) {
                    item.removeClass("selected");
                    newItem.addClass("selected");
                    me.triggerClickItem(newItem.data("id"));
                    me.refresh();
                }
            } else if (combo === "left") {
                const rootVlaue = item.find(".result-value:first");
                this.collapsedValue(rootVlaue);
            } else if (combo === "right") {
                const rootVlaue = item.find(".result-value:first");
                this.expandedValue(rootVlaue);
            }
            e.stopPropagation();
            e.preventDefault();
        })(this));
        hotkey.bindView(this, ["esc"], ((me) => (e, combo) => {
            me.doClickEmpty();
        })(this));
        return this;
    }
    private triggerClickItem(id: number): Result {
        this.trigger("clickitem", this.items[id].itemLine, this.items[id].itemValue);
        return this;
    }
    private genValue(value: Value): string {
        let v;
        if (value.errorMsg) {
            v = "<div class='result-value'>" + value.errorMsg + "</div>";
        } else {
            v = value.toValue();
            v = (value.type === "array") ? "<ul>" + this.genArrayValue(v, ObjectPrefixType.None) + "</ul>" :
                (value.type === "object") ? "<ul>" + this.genObjectValue(v, ObjectPrefixType.None) + "</ul>" :
                "<div class='result-value'>" + this.genJSONValue(v) + "</div>";
        }
        return v;
    }
    private getValuePrefixClass(op: ObjectPrefixType): string {
        return (op === ObjectPrefixType.Array) ? "array" :
            (op === ObjectPrefixType.Object) ? "object" :
            "none";
    }
    private getValuePrefix(
        v: any,
        typeName: string,
        op: ObjectPrefixType,
        prefix?: string|number,
        hasChild?: boolean): string {
        const collapsed = hasChild ? " collapsed" : " nochild";
        let r = "<li class='result-prefix-" + this.getValuePrefixClass(op) +
            "'><div class='result-value" + collapsed + "'>";
        if (op === ObjectPrefixType.Array) {
            r += "<span class='result-style-index'>" + prefix + "</span>";
        }
        r += "<span class='result-value-expand'><div class='result-value-expand-icon'></div></span>";
        if (op === ObjectPrefixType.Object) {
            const vType = getValueType(v);
            const vTypeIcon = vType[0].toUpperCase();
            r += "<span class='result-style-icon result-style-icon-" + vType + "'>" + vTypeIcon + "</span>";
            r += "<span class='result-style-prop'>" + prefix + "</span>: ";
        }
        r += "<span class='result-value-json'>" + this.genJSONValue(v) + "</span>" +
            "<span class='result-value-type'>" + typeName + "</span>";
        if (typeName === "Array") {
            r += " <span class='result-style-length'>(" + v.length + ")</span>";
        }
        r += "</div><ul style='display: none;'>";
        return r;
    }
    private genArrayValue(v: any, op: ObjectPrefixType, prefix?: string|number): string {
        let r = "";
        const hasChild = v.length > 0;
        for (let i = 0; i < v.length; i++) {
            const value = v[i];
            const t = getValueType(value);
            if (t === "array") {
                r += this.genArrayValue(value, ObjectPrefixType.Array, i);
            } else if (t === "object") {
                r += this.genObjectValue(value, ObjectPrefixType.Array, i);
            } else {
                r += "<li class='result-prefix-" + this.getValuePrefixClass(ObjectPrefixType.Array) +
                    "'><div class='result-value nochild'><span class='result-style-index'>" + i +
                    "</span><span class='result-value-expand'></span>" +
                    this.genJSONValue(value) + "</div></li>";
            }
        }
        r = this.getValuePrefix(v, "Array", op, prefix, hasChild) + r + "</ul></li>";
        return r;
    }
    private genObjectValue(v: any, op: ObjectPrefixType, prefix?: string|number): string {
        let r = "";
        let hasChild = false;
        for (const key in v) {
            if (v.hasOwnProperty(key)) {
                hasChild = true;
                const value = v[key];
                const t = getValueType(value);
                if (t === "array") {
                    r += this.genArrayValue(value, ObjectPrefixType.Object, key);
                } else if (t === "object") {
                    r += this.genObjectValue(value, ObjectPrefixType.Object, key);
                } else {
                    const vType = getValueType(value);
                    const vTypeIcon = vType[0].toUpperCase();
                    r += "<li class='result-prefix-" + this.getValuePrefixClass(ObjectPrefixType.Object) +
                        "'><div class='result-value nochild'><span class='result-value-expand'></span>" +
                        "<span class='result-style-icon result-style-icon-" + vType + "'>" + vTypeIcon + "</span>" +
                        "<span class='result-style-prop'>" + key + "</span>: " +
                        this.genJSONValue(value) + "</div></li>";
                }
            }
        }
        r = this.getValuePrefix(v, "Object", op, prefix, hasChild) + r + "</ul></li>";
        return r;
    }
    private genJSONValue(v: any): string {
        let r;
        const t = getValueType(v);
        switch (t) {
            case "array":
                r = "[";
                for (const item of v) {
                    if (r !== "[") {
                        r += ", ";
                    }
                    r += this.genJSONValue(item);
                }
                r += "]";
                break;
            case "object":
                r = "{";
                for (const key in v) {
                    if (v.hasOwnProperty(key)) {
                        if (r !== "{") {
                            r += ", ";
                        }
                        r += "<span class='result-style-prop'>" + key + "</span>: " + this.genJSONValue(v[key]);
                    }
                }
                r += "}";
                break;
            case "string":
            case "number":
            case "date":
            case "boolean":
                r = "<span class='result-style-" + t + "'>" + formatValue(v) + "</span>";
                break;
            default:
                r = "<span class='result-style-default'>" + formatValue(v) + "</span>";
                break;
        }
        return r;
    }
    private collapsedValue(el: JQuery): Result {
        if (el.hasClass("expanded")) {
            el.removeClass("expanded").addClass("collapsed");
            el.siblings("ul").hide();
            this.refresh();
        }
        return this;
    }
    private expandedValue(el: JQuery): Result {
        if (el.hasClass("collapsed")) {
            el.removeClass("collapsed").addClass("expanded");
            el.siblings("ul").show();
            this.refresh();
        }
        return this;
    }
}

export default Result;
