import { ShowFocusType, showFocus } from "../../scripts/common";
import Expression from "../../scripts/expression";
import hotkey from "../../scripts/hotkey";
import View from "../../scripts/view";
import "./terminal.scss";
import terminal_tpl from "./terminal.tpl";
import $ from "jquery";
import _ from "underscore";
import s from "underscore.string";

class Terminal extends View {
    private expression: Expression;
    private history: Array<string>;
    private historyIndex: number;
    private refreshId: number;
    private suggestIndex: number;
    private suggestCount: number;
    private suggestInput: string;
    private suggestValue: string;
    private suggestHash: string;
    private $typer: JQuery;
    private $text: JQuery;
    private $suggest: JQuery;
    private tmpOldValue: string;
    private tmpKeyCombo: string;
    private tmpCtrlKeyCombo: string;
    private changeSelection: boolean;
    private dragging: boolean;
    private draggingStartX: number;
    private draggingEndX: number;
    public focus(): Terminal {
        this.$typer.focus();
        return this;
    }
    public setExpression(v: Expression): Terminal {
        this.expression = v;
        return this;
    }
    public clear(): Terminal {
        this.$typer.val("");
        return this.focus();
    }
    public hotkeyFocus(): Terminal {
        return this.focus();
    }
    protected preinitialize(): void {
        this.className = "terminal-view";
        this.events = {
            "mousedown .terminal-text": this.doMousedown,
            "mousemove .terminal-text": this.doMousemove,
            "mouseup .terminal-text": this.doMouseup,
            "dblclick .terminal-text": this.doDblClick,
            "blur .terminal-typer": this.doBlur,
            "focus .terminal-typer": this.doFocus,
            "paste .terminal-typer": this.internalRefresh,
            "keydown .terminal-typer": this.internalRefresh,
            "keypress .terminal-typer": this.internalRefresh,
            "change .terminal-typer": this.internalRefresh,
            "input .terminal-typer": this.internalRefresh,
        };
        this.history = [];
        this.historyIndex = 1;
        this.tmpOldValue = "";
        this.tmpKeyCombo = "";
        this.tmpCtrlKeyCombo = "";
        this.suggestIndex = -1;
        this.suggestCount = 0;
        this.suggestInput = "";
        this.suggestValue = "";
        this.suggestHash = "";
    }
    protected initialize(): void {
        this.renderBasic();
        this.$typer = this.$(".terminal-typer");
        this.$text = this.$(".terminal-text");
        this.$suggest = this.$(".terminal-suggest");
        this.initHotkey();
    }
    protected doMousedown(e: JQueryMouseEventObject): Terminal {
        let t = this.$(e.target);
        if (t.parent().hasClass("terminal-text")) {
            this.dragging = true;
            this.draggingStartX = t.position().left + e.offsetX;
            this.draggingEndX = this.draggingStartX;
            this.refreshSelection();
        } else if (t.hasClass("terminal-text")) {
            this.dragging = true;
            this.draggingStartX = e.offsetX;
            this.draggingEndX = this.draggingStartX;
            this.refreshSelection();
        }
        return this;
    }
    protected doMousemove(e: JQueryMouseEventObject): Terminal {
        if (this.dragging) {
            let t = this.$(e.target);
            if (t.parent().hasClass("terminal-text")) {
                this.draggingEndX = t.position().left + e.offsetX;
                this.refreshSelection();
            } else if (t.hasClass("terminal-text")) {
                this.draggingEndX = e.offsetX;
                this.refreshSelection();
            }
        }
        return this;
    }
    protected doMouseup(e: JQueryMouseEventObject): Terminal {
        if (this.dragging) {
            let t = this.$(e.target);
            if (t.parent().hasClass("terminal-text")) {
                this.draggingEndX = t.position().left + e.offsetX;
                this.refreshSelection();
                this.focus();
            } else if (t.hasClass("terminal-text")) {
                this.draggingEndX = e.offsetX;
                this.refreshSelection();
                this.focus();
            }
            this.dragging = false;
        }
        return this;
    }
    protected doDblClick(): Terminal {
        this.setTyperSelection(0, this.$typer.val().length);
        return this.focus();
    }
    protected doBlur(): Terminal {
        if (!this.changeSelection) {
            this.$text.removeClass("terminal-focus");
        }
        return this;
    }
    protected doFocus(): Terminal {
        if (!this.changeSelection) {
            hotkey.setCurrentView(this);
            if (this.dragging) {
                this.refreshSelection();
                this.dragging = false;
            }
            this.$text.addClass("terminal-focus");
            this.internalRefresh();
        }
        return this;
    }
    private renderBasic(): Terminal {
        this.$el.html(terminal_tpl);
        return this;
    }
    private initHotkey(): Terminal {
        let input = this.$typer.get(0);
        let keys = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$.".split("");
        keys.push("backspace");
        keys.push("del");
        hotkey.bindElement(input, keys, ((me) => (e, combo) => {
            me.tmpKeyCombo = combo;
            me.internalRefresh();
        })(this), "keydown");

        keys = ["meta", "esc", "capslock", "shift", "ctrl", "alt"];
        hotkey.bindElement(input, keys, ((me) => (e, combo) => {
            if (me.suggestCount > 0) {
                me.tmpCtrlKeyCombo = combo;
            }
            me.internalRefresh();
        })(this), "keydown");

        keys = ["tab", "enter", "right"];
        hotkey.bindElement(input, keys, ((me) => (e, combo) => {
            if (me.suggestCount > 0) {
                let selection = me.getTyperSelection();
                if (selection.start === selection.end) {
                    me.$typer.val(s.insert(me.$typer.val(), selection.start, me.suggestValue));
                    let pos = selection.start + me.suggestValue.length;
                    me.setTyperSelection(pos, pos);
                    e.stopPropagation();
                    e.preventDefault();
                }
            } else if (combo === "enter") {
                let cmd = me.$typer.val();
                if (cmd !== "") {
                    if (me.history[me.history.length - 1] !== cmd) {
                        me.history.push(cmd);
                    }
                    me.historyIndex = me.history.length;
                    me.trigger("command", cmd);
                    me.$typer.val("");
                }
            }
            me.internalRefresh();
        })(this), "keydown");

        keys = ["up"];
        hotkey.bindElement(input, keys, ((me) => (e, combo) => {
            if (me.suggestCount > 0) {
                me.tmpCtrlKeyCombo = combo;
            } else {
                if (me.historyIndex > 0) {
                    me.historyIndex--;
                }
                if (me.history.length > 0) {
                    me.$typer.val(me.history[me.historyIndex] || "");
                }
            }
            e.stopPropagation();
            e.preventDefault();
            me.internalRefresh();
        })(this), "keydown");

        keys = ["down"];
        hotkey.bindElement(input, keys, ((me) => (e, combo) => {
            if (me.suggestCount > 0) {
                me.tmpCtrlKeyCombo = combo;
            } else {
                if (me.historyIndex < me.history.length) {
                    me.historyIndex++;
                }
                if (me.history.length > 0) {
                    me.$typer.val(me.history[me.historyIndex] || "");
                }
            }
            e.stopPropagation();
            e.preventDefault();
            me.internalRefresh();
        })(this), "keydown");
        return this;
    }
    private internalRefresh(): Terminal {
        if (this.refreshId) {
            clearTimeout(this.refreshId);
        }
        this.refreshId = setTimeout((me => () => {
            let typer = me.$typer;
            let text = me.$text;
            let selection = me.getTyperSelection();
            // 判断按键
            let val = typer.val();
            if (me.tmpKeyCombo && selection.start === selection.end) {
                let n = val.length - me.tmpOldValue.length;
                if (n === 1 || n === -1) {
                    let suggest = me.expression.getSuggest(val, selection.start);
                    if (suggest.suggestList.length > 0) {
                        me.showSuggestBox(suggest.suggestList, suggest.inputValue);
                    } else {
                        me.hideSuggestBox();
                    }
                } else {
                    me.hideSuggestBox();
                }
            } else if (me.tmpCtrlKeyCombo) {
                if (me.tmpCtrlKeyCombo === "up") {
                    if (me.suggestIndex === 0) {
                        me.suggestIndex = this.suggestCount - 1;
                    } else {
                        me.suggestIndex--;
                    }
                } else if (me.tmpCtrlKeyCombo === "down") {
                    if (me.suggestIndex === this.suggestCount - 1) {
                        me.suggestIndex = 0;
                    } else {
                        me.suggestIndex++;
                    }
                }
                if (me.tmpCtrlKeyCombo === "esc") {
                    me.hideSuggestBox();
                } else {
                    this.refreshSuggestBox();
                }
            } else {
                me.hideSuggestBox();
            }
            me.tmpKeyCombo = "";
            me.tmpCtrlKeyCombo = "";
            me.tmpOldValue = val;
            // 补充span
            let items = text.children();
            let spanCount = val.length + 1 + me.suggestValue.length;
            if (spanCount > items.length) {
                let l = spanCount - items.length;
                for (let i = 0; i < l; i++) {
                    text.append("<span></span>");
                }
            }
            // 填充字符
            let displayValue = s.insert(val, selection.start, me.suggestValue);
            items = text.children();
            for (let i = 0; i < items.length; i++) {
                let item = $(items[i]);
                if (i <= displayValue.length) {
                    if (i === displayValue.length) {
                        item.text(" ");
                    } else {
                        item.text(displayValue[i]);
                    }
                } else {
                    item.remove();
                }
            }
            // 绘制光标
            items.removeClass("cursor").removeClass("selected").removeClass("suggest");
            if (selection.start === selection.end) {
                // 未选中
                $(items[selection.start]).addClass("cursor");
                // 建议
                if (me.suggestValue) {
                    for (let i = selection.start; i < selection.start + me.suggestValue.length; i++) {
                        $(items[i]).addClass("suggest");
                    }
                }
            } else {
                // 已选中
                for (let i = selection.start; i < selection.end; i++) {
                    $(items[i]).addClass("selected");
                }
            }
            // 同步滚动条
            let left = typer.scrollLeft();
            text.scrollLeft(left);
            // 刷新建议框位置
            if (me.suggestCount > 0) {
                let suggestLeft = (selection.start - me.suggestInput.length) * me.getSingleWordWidth() - 9 - left;
                if (me.$suggest.width() + suggestLeft > me.$text.width()) {
                    suggestLeft = me.$text.width() - me.$suggest.width();
                }
                me.$suggest.css("left", suggestLeft);
            }
            // 结束刷新
            me.refreshId = 0;
        })(this), 0);
        return this;
    }
    private showSuggestBox(list: Array<string>, val: string): Terminal {
        this.suggestInput = val;
        let hash = list.join("|");
        if (hash !== this.suggestHash) {
            let h = "";
            let maxLength = 0;
            this.suggestHash = hash;
            this.suggestIndex = 0;
            this.suggestCount = list.length;
            list.forEach(((me) => (value, index) => {
                h += "<li class='id" + index + "'>" + value + "</li>";
                if (value.length > maxLength) {
                    maxLength = value.length;
                }
            })(this));
            // 刷新宽度
            let w = maxLength * this.getSingleWordWidth() + 16;
            if (w > 100) {
                this.$suggest.css("min-width", w + 20);
            } else {
                this.$suggest.css("min-width", 100);
            }
            this.$suggest.html(h).show();
        }
        return this.refreshSuggestBox();
    }
    private refreshSuggestBox(): Terminal {
        if (this.suggestIndex >= 0) {
            // 刷新焦点
            this.$suggest.children().removeClass("selected");
            let focusRow = this.$suggest.children(".id" + this.suggestIndex).addClass("selected");
            showFocus(this.$suggest, focusRow, ShowFocusType.Height);
            this.suggestValue = this.suggestHash.split("|")[this.suggestIndex].replace(this.suggestInput, "");
        }
        return this;
    }
    private hideSuggestBox(): Terminal {
        this.suggestIndex = -1;
        this.suggestCount = 0;
        this.suggestInput = "";
        this.suggestValue = "";
        this.suggestHash = "";
        this.$suggest.hide();
        return this;
    }
    private setTyperSelection(start: number, end: number): Terminal {
        this.changeSelection = true;
        // 设置光标位置
        if (window.document.hasOwnProperty("selection")) {
            // TODO:
            window.console.warn("TODO: 获取光标位置未兼容ie <terminal.ts>");
        } else {
            let el: any = this.$typer.get(0);
            el.setSelectionRange(start, end);
        }
        this.changeSelection = false;
        return this;
    }
    private getTyperSelection(): ITyperSelection {
        // 获取光标位置
        let selectionStart;
        let selectionEnd;
        if (window.document.hasOwnProperty("selection")) {
            // TODO:
            window.console.warn("TODO: 获取光标位置未兼容ie <terminal.ts>");
            selectionStart = 0;
            selectionEnd = 0;
        } else {
            let el: any = this.$typer.get(0);
            selectionStart = el.selectionStart;
            selectionEnd = el.selectionEnd;
        }
        return {
            end: selectionEnd,
            start: selectionStart,
        };
    }
    private getSingleWordWidth(): number {
        return this.$text.children("span").outerWidth();
    }
    private refreshSelection(): Terminal {
        if (this.dragging) {
            this.$text.addClass("terminal-focus");
            let start = Math.min(this.draggingStartX, this.draggingEndX);
            let end = Math.max(this.draggingStartX, this.draggingEndX);
            let items = this.$text.children().removeClass("cursor");
            let startIndex = items.length;
            let endIndex = items.length;
            let selIndex = [];
            for (let i = 0; i < items.length - 1; i++) {
                let item = this.$(items.get(i));
                let left = item.position().left;
                let right = left + this.getSingleWordWidth();
                if (start <= right && left <= end) {
                    item.addClass("selected");
                    selIndex.push(i);
                } else {
                    item.removeClass("selected");
                }
            }
            if (selIndex.length > 0) {
                startIndex = _.min(selIndex);
                if (start === end) {
                    endIndex = startIndex;
                } else {
                    endIndex = _.max(selIndex) + 1;
                }
            }
            this.setTyperSelection(startIndex, endIndex);
        }
        return this;
    }
}

interface ITyperSelection {
    start: number;
    end: number;
}

export default Terminal;
