import image_prompt_svg_tpl from "../../images/prompt.svg.tpl";
import image_trash_svg_tpl from "../../images/trash.svg.tpl";
import Expression from "../../scripts/expression";
import View from "../../scripts/view";
import Result from "../result/result";
import { ShapeColor, ShapeName } from "../shape/shape";
import Shape from "../shape/shape";
import Syntax from "../syntax/syntax";
import Terminal from "../terminal/terminal";
import "./console.scss";
import console_tpl from "./console.tpl";

class Console extends View {
    private expression: Expression;
    private iconTerminalLeft: Shape;
    private iconTerminalRight: Shape;
    private iconWatchLeft: Shape;
    private iconWatchRight: Shape;
    private resultView: Result;
    private syntaxView: Syntax;
    private terminalView: Terminal;
    public setExpression(v: Expression): Console {
        this.expression = v;
        this.terminalView.setExpression(v);
        return this;
    }
    public refresh(isInit?: boolean): Console {
        if (this.$el.hasClass("layout-horizontal")) {
            this.iconTerminalLeft.setName(ShapeName.SHAPE_NAME_AREA_LEFT);
            this.iconTerminalRight.setName(ShapeName.SHAPE_NAME_AREA_RIGHT);
            this.iconWatchLeft.setName(ShapeName.SHAPE_NAME_AREA_LEFT);
            this.iconWatchRight.setName(ShapeName.SHAPE_NAME_AREA_RIGHT);
        } else {
            this.iconTerminalLeft.setName(ShapeName.SHAPE_NAME_AREA_TOP);
            this.iconTerminalRight.setName(ShapeName.SHAPE_NAME_AREA_BOTTOM);
            this.iconWatchLeft.setName(ShapeName.SHAPE_NAME_AREA_TOP);
            this.iconWatchRight.setName(ShapeName.SHAPE_NAME_AREA_BOTTOM);
        }
        if (this.$el.hasClass("hide-terminal")) {
            this.iconWatchLeft.setColor(ShapeColor.SHAPE_COLOR_DISABLED);
            this.iconWatchRight.setColor(ShapeColor.SHAPE_COLOR_ENABLED);
        } else if (this.$el.hasClass("hide-watch")) {
            this.iconTerminalLeft.setColor(ShapeColor.SHAPE_COLOR_ENABLED);
            this.iconTerminalRight.setColor(ShapeColor.SHAPE_COLOR_DISABLED);
        } else {
            this.iconWatchLeft.setColor(ShapeColor.SHAPE_COLOR_ENABLED);
            this.iconWatchRight.setColor(ShapeColor.SHAPE_COLOR_ENABLED);
        }
        this.resultView.refresh();
        if (isInit) {
            this.terminalView.focus();
        }
        return this;
    }
    public toggleLayout(): Console {
        this.$el.toggleClass("layout-vertical").toggleClass("layout-horizontal");
        return this.refresh();
    }
    protected preinitialize(): void {
        this.className = "console-view";
        this.events = {
            "click .console-terminal-clear": this.doClearResult,
            "click .console-terminal-left": this.doClickLeft,
            "click .console-terminal-prompt": this.doClickPrompt,
            "click .console-terminal-right": this.doClickRight,
            "click .console-watch-clear": this.doClearSyntax,
            "click .console-watch-left": this.doClickLeft,
            "click .console-watch-right": this.doClickRight,
        };
    }
    protected initialize(): void {
        this.$el.addClass("layout-vertical show-all");
        this.renderBasic().renderTerminal().renderResult().renderWatch();
    }
    protected doClickLeft(): Console {
        if (this.$el.hasClass("hide-terminal")) {
            this.$el.removeClass("hide-terminal").addClass("show-all");
        } else {
            this.$el.removeClass("hide-watch").removeClass("show-all").addClass("hide-terminal");
        }
        return this.refresh();
    }
    protected doClickRight(): Console {
        if (this.$el.hasClass("hide-watch")) {
            this.$el.removeClass("hide-watch").addClass("show-all");
        } else {
            this.$el.removeClass("hide-terminal").removeClass("show-all").addClass("hide-watch");
        }
        return this.refresh();
    }
    protected doClickPrompt(): Console {
        this.terminalView.focus();
        return this;
    }
    protected doClearResult(): Console {
        this.terminalView.clear();
        this.resultView.clear();
        return this;
    }
    protected doClearSyntax(): Console {
        this.syntaxView.clear();
        return this;
    }
    private renderBasic(): Console {
        this.$el.html(console_tpl);

        this.$(".console-terminal-clear").html(image_trash_svg_tpl);
        this.$(".console-watch-clear").html(image_trash_svg_tpl);

        this.iconTerminalLeft = new Shape({ attributes: { height: 11, width: 11 } });
        this.iconTerminalRight = new Shape({ attributes: { height: 11, width: 11 } });
        this.iconTerminalLeft.$el.appendTo(this.$(".console-terminal-left"));
        this.iconTerminalRight.$el.appendTo(this.$(".console-terminal-right"));

        this.iconWatchLeft = new Shape({ attributes: { height: 11, width: 11 } });
        this.iconWatchRight = new Shape({ attributes: { height: 11, width: 11 } });
        this.iconWatchLeft.$el.appendTo(this.$(".console-watch-left"));
        this.iconWatchRight.$el.appendTo(this.$(".console-watch-right"));

        return this;
    }
    private renderTerminal(): Console {
        this.$(".console-terminal-prompt").html(image_prompt_svg_tpl);
        this.terminalView = new Terminal();
        this.terminalView.on("command", ((me) => (line) => {
            switch (line) {
                case "clear":
                case "clean":
                case "cls":
                    me.doClearResult();
                    break;
                default:
                    const v = me.expression.calcExpr(line);
                    me.syntaxView.load(line, v);
                    me.resultView.add(line, v);
                    break;
            }
        })(this));
        this.terminalView.$el.appendTo(this.$(".console-terminal-view"));
        return this;
    }
    private renderResult(): Console {
        this.resultView = new Result();
        this.resultView.on("clickempty", ((me) => () => {
            me.terminalView.focus();
        })(this));
        this.resultView.on("clickitem", ((me) => (line, value) => {
            me.syntaxView.load(line, value);
        })(this));
        this.resultView.$el.appendTo(this.$(".console-terminal-content"));
        return this;
    }
    private renderWatch(): Console {
        this.syntaxView = new Syntax();
        this.syntaxView.$el.appendTo(this.$(".console-watch-content"));
        return this;
    }
}

export default Console;
