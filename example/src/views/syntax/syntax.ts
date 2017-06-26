import { htmlEncode, showFocus, ShowFocusType } from "../../scripts/common";
import hotkey from "../../scripts/hotkey";
import View from "../../scripts/view";
import "./syntax.scss";
import syntax_tpl from "./syntax.tpl";

class Syntax extends View {
    private oldLine: string;
    private currentIndex: number;
    private treeListIndex: number[];
    private $col: JQuery;
    private $tree: JQuery;
    public load(line: string, value: Value): Syntax {
        if (this.oldLine !== line) {
            this.oldLine = line;
            this.treeListIndex = [];
            if (value.errorMsg === "") {
                this.currentIndex = this.oldLine.length > 0 ? 1 : 0;
                this.$col.html(this.genCol(line));
                this.$tree.html(this.genTree(value.rootToken));
            } else {
                this.currentIndex = 0;
                this.$col.html("");
                this.$tree.html("<span class='syntax-error'>" + value.errorMsg + "</span>");
            }
        }
        return this;
    }
    public clear(): Syntax {
        this.$col.html("");
        this.$tree.html("");
        return this;
    }
    public hotkeyFocus(): Syntax {
        if (this.currentIndex > 0) {
            this.selectItem(this.currentIndex);
        }
        return this;
    }
    public hotkeyBlur(): Syntax {
        if (this.currentIndex > 0) {
            this.resetSelectItem();
        }
        return this;
    }
    protected preinitialize(): void {
        this.className = "syntax-view";
        this.events = {
            "click ": this.doClick,
            "click .col-item": this.doClickColItem,
            "click .token-item": this.doClickTokenItem,
            "click .token-item-expand": this.doClickExpand,
            "click .token-item-type": this.doClickExpand,
        };
    }
    protected initialize(): void {
        this.renderBasic();
        this.initHotkey();
    }
    protected doClick(): Syntax {
        hotkey.setCurrentView(this);
        return this;
    }
    protected doClickExpand(e): Syntax {
        const item = this.$(e.target).parents(".token-item");
        if (item.hasClass("expanded")) {
            item.removeClass("expanded").addClass("collapsed");
            item.siblings("ul").hide();
        } else if (item.hasClass("collapsed")) {
            item.removeClass("collapsed").addClass("expanded");
            item.siblings("ul").show();
        }
        return this;
    }
    protected doClickColItem(e): Syntax {
        const t = this.$(e.target);
        const item = t.hasClass("col-item") ? t : t.parents(".col-item");
        this.selectItem(item.data("id"));
        return this;
    }
    protected doClickTokenItem(e): Syntax {
        const t = this.$(e.target);
        const item = t.hasClass("token-item") ? t : t.parents(".token-item");
        this.selectItem(item.data("id"));
        return this;
    }
    private renderBasic(): Syntax {
        this.$el.html(syntax_tpl);
        this.$col = this.$(".syntax-col");
        this.$tree = this.$(".syntax-tree");
        return this;
    }
    private initHotkey(): Syntax {
        hotkey.bindView(this, ["up", "down", "right", "left"], ((me) => (e, combo) => {
            if (me.currentIndex > 0) {
                if (combo === "left") {
                    if (me.currentIndex === 1) {
                        me.currentIndex = me.oldLine.length;
                    } else {
                        me.currentIndex--;
                    }
                    me.selectItem(me.currentIndex);
                } else if (combo === "right") {
                    if (me.currentIndex >= me.oldLine.length) {
                        me.currentIndex = 1;
                    } else {
                        me.currentIndex++;
                    }
                    me.selectItem(me.currentIndex);
                } else if (me.treeListIndex.length > 0) {
                    let index = -1;
                    for (let i = 0; i < me.treeListIndex.length; i++) {
                        if (me.treeListIndex[i] === me.currentIndex) {
                            index = i;
                            break;
                        }
                    }
                    if (combo === "up") {
                        if (index === -1) {
                            index = 0;
                        }
                        if (index === 0) {
                            index = me.treeListIndex.length - 1;
                        } else {
                            index--;
                        }
                    } else {
                        if (index === -1) {
                            index = me.treeListIndex.length - 1;
                        }
                        if (index === me.treeListIndex.length - 1) {
                            index = 0;
                        } else {
                            index++;
                        }
                    }
                    me.selectItem(me.treeListIndex[index]);
                }
                e.stopPropagation();
                e.preventDefault();
                me.showFocusItem();
            }
        })(this));
        hotkey.bindView(this, ["meta+right", "meta+left", "meta+up", "meta+down"], ((me) => (e, combo) => {
            if (combo === "meta+up") {
                const items = me.$(".syntax-tree .expanded");
                items.removeClass("expanded").addClass("collapsed");
                items.siblings("ul").hide();
            } else if (combo === "meta+down") {
                const items = me.$(".syntax-tree .collapsed");
                items.removeClass("collapsed").addClass("expanded");
                items.siblings("ul").show();
            } else {
                const item = me.$(".syntax-tree .selected").first();
                if (combo === "meta+left" && item.hasClass("expanded")) {
                    item.removeClass("expanded").addClass("collapsed");
                    item.siblings("ul").hide();
                } else if (combo === "meta+right" && item.hasClass("collapsed")) {
                    item.removeClass("collapsed").addClass("expanded");
                    item.siblings("ul").show();
                }
            }
        })(this));
        return this;
    }
    private showFocusItem(): Syntax {
        // 字符串索引焦点
        const focusCell = this.$col.find(".selected");
        showFocus(this.$col, focusCell, ShowFocusType.Width);
        // 语法树节点焦点
        const focusItem = this.$tree.find(".selected").first();
        const parentItems = focusItem.parent("li").parents("li").children(".collapsed");
        parentItems.removeClass("collapsed").addClass("expanded");
        parentItems.siblings("ul").show();
        showFocus(this.$tree, focusItem, ShowFocusType.HeightAndWidth);
        return this;
    }
    private genTree(rootToken: IToken, level?: number): string {
        level = level === undefined ? 0 : level;
        const isRoot = level === 0;
        const hasChild = rootToken.childs && rootToken.childs.length > 0;
        const isVCls = rootToken.tokenType.indexOf("V") === 0 ? " virtual" : "";
        let r = (isRoot ? "<ul>" : "") + "<li>";
        const cls = hasChild ? "expanded" : "none";
        if (this.treeListIndex[this.treeListIndex.length - 1] !== rootToken.tokenIndex) {
            this.treeListIndex.push(rootToken.tokenIndex);
        }
        r += "<div data-id=" + rootToken.tokenIndex + " class='token-item item-" +
            rootToken.tokenIndex + " " + cls + "'>";
        r += "<span class='token-item-expand'><div class='token-item-expand-icon'></div></span>";
        r += "<span class='token-item-type" + isVCls + "'>" + rootToken.tokenType + "</span>";
        r += "<span class='token-item-text'>" + htmlEncode(rootToken.tokenText) + "</span>";
        r += "<span class='token-item-index'>" + rootToken.tokenIndex + "</span>";
        r += "</div>";
        if (hasChild) {
            r += "<ul>";
            for (const item of rootToken.childs) {
                r += this.genTree(item, level + 1);
            }
            r += "</ul>";
        }
        r += "</li>" + (isRoot ? "<ul>" : "");
        return r;
    }
    private genCol(line: string): string {
        const l = [];
        for (let i = 1; i <= line.length; i++) {
            l.push((i + "").split("").pop());
        }
        const cs = line.split("");
        let r = "";
        l.forEach((element, i) => {
            const t = cs[i] === " " ? "&nbsp;" : cs[i];
            r += "<span data-id=" + (i + 1) + " class='col-item item-" + (i + 1) + "'>" +
                "<div class='token-col-index'>" + element + "</div>" +
                "<div class='token-col-text'>" + t + "</div>" +
                "</span>";
        });
        return r;
    }
    private resetSelectItem(): Syntax {
        this.$(".token-item").removeClass("selected");
        this.$(".col-item").removeClass("selected");
        return this;
    }
    private selectItem(index: number): Syntax {
        this.currentIndex = index;
        this.resetSelectItem();
        this.$(".item-" + index).addClass("selected");
        return this;
    }
}

export default Syntax;
