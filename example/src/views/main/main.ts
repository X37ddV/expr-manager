import _ from "underscore";
import image_add_svg_tpl from "../../images/add.svg.tpl";
import image_remove_svg_tpl from "../../images/remove.svg.tpl";
import image_setting_svg_tpl from "../../images/setting.svg.tpl";
import Expression from "../../scripts/expression";
import View from "../../scripts/view";
import Console from "../console/console";
import Data from "../data/data";
import Setting from "../setting/setting";
import Shape from "../shape/shape";
import { ShapeColor, ShapeName } from "../shape/shape";
import "./main.scss";
import main_tpl from "./main.tpl";

class Main extends View {
    private expression: Expression;
    private shapeLeft: Shape;
    private shapeCenter: Shape;
    private shapeRight: Shape;
    private dataView: Data;
    private consoleView: Console;
    private settingView: Setting;
    private $data: JQuery;
    private $console: JQuery;
    private $split: JQuery;
    private dragging: boolean;
    private dragStart: number;
    private startSize: number;
    private defaultSize: number;
    private currentSize: number;
    public refresh(isInit?: boolean): Main {
        if (_.isUndefined(this.defaultSize)) {
            // 记录默认值
            this.defaultSize = this.isHorizontal() ? this.$console.width() : this.$console.height();
            this.currentSize = this.defaultSize;
        }

        if (this.$el.hasClass("layout-horizontal")) {
            this.shapeCenter.setName(ShapeName.SHAPE_NAME_LAYOUT_VERTICAL);
            this.shapeLeft.setName(ShapeName.SHAPE_NAME_AREA_LEFT);
            this.shapeRight.setName(ShapeName.SHAPE_NAME_AREA_RIGHT);
        } else {
            this.shapeCenter.setName(ShapeName.SHAPE_NAME_LAYOUT_HORIZONTAL);
            this.shapeLeft.setName(ShapeName.SHAPE_NAME_AREA_TOP);
            this.shapeRight.setName(ShapeName.SHAPE_NAME_AREA_BOTTOM);
        }
        if (this.$el.hasClass("hide-data")) {
            this.shapeLeft.setColor(ShapeColor.SHAPE_COLOR_DISABLED);
            this.shapeRight.setColor(ShapeColor.SHAPE_COLOR_ENABLED);
        } else if (this.$el.hasClass("hide-console")) {
            this.shapeLeft.setColor(ShapeColor.SHAPE_COLOR_ENABLED);
            this.shapeRight.setColor(ShapeColor.SHAPE_COLOR_DISABLED);
        } else {
            this.shapeLeft.setColor(ShapeColor.SHAPE_COLOR_ENABLED);
            this.shapeRight.setColor(ShapeColor.SHAPE_COLOR_ENABLED);
        }
        this.consoleView.refresh(isInit);
        return this;
    }
    protected preinitialize(): void {
        this.className = "main-view";
        this.events = {
            "click .act-add": this.doClickAdd,
            "click .act-center": this.doClickCenter,
            "click .act-left": this.doClickLeft,
            "click .act-remove": this.doClickRemove,
            "click .act-right": this.doClickRight,
            "click .act-setting": this.doClickSetting,
            "dblclick .main-split": this.doDblClickSplit,
            "mousedown .main-split": this.doMousedown,
            "mousemove ": this.doMousemove,
            "mouseup ": this.doMouseup,
        };
    }
    protected initialize(): void {
        this.expression = new Expression();
        this.renderBasic();
    }
    protected doDblClickSplit(): Main {
        this.setCurrentSize(this.defaultSize);
        return this;
    }
    protected doMousedown(e: JQueryMouseEventObject): Main {
        this.dragging = true;
        if (this.isHorizontal()) {
            this.dragStart = e.pageX;
            this.startSize = this.$console.width();
        } else {
            this.dragStart = e.pageY;
            this.startSize = this.$console.height();
        }
        this.$el.addClass("none-select");
        return this;
    }
    protected doMousemove(e: JQueryMouseEventObject): Main {
        if (this.dragging) {
            this.setCurrentSize(this.startSize + this.dragStart - (this.isHorizontal() ? e.pageX : e.pageY));
            this.consoleView.refresh();
        }
        return this;
    }
    protected doMouseup(e: JQueryMouseEventObject): Main {
        if (this.dragging) {
            this.dragging = false;
            this.$el.removeClass("none-select");
            this.consoleView.refresh();
        }
        return this;
    }
    protected doClickLeft(): Main {
        if (this.$el.hasClass("hide-data")) {
            this.$el.removeClass("hide-data").addClass("show-all");
            this.setCurrentSize(this.currentSize);
        } else {
            this.$el.removeClass("hide-console").removeClass("show-all").addClass("hide-data");
            this.setCurrentSize("auto");
        }
        return this.refresh();
    }
    protected doClickCenter(): Main {
        this.$el.toggleClass("layout-vertical").toggleClass("layout-horizontal");
        if (this.$el.hasClass("show-all")) {
            this.setCurrentSize(this.currentSize);
        } else {
            this.setCurrentSize("auto");
        }
        this.consoleView.toggleLayout();
        return this.refresh();
    }
    protected doClickRight(): Main {
        if (this.$el.hasClass("hide-console")) {
            this.$el.removeClass("hide-console").addClass("show-all");
            this.setCurrentSize(this.currentSize);
        } else {
            this.$el.removeClass("hide-data").removeClass("show-all").addClass("hide-console");
            this.setCurrentSize("auto");
        }
        return this.refresh();
    }
    protected doClickSetting(): Main {
        this.settingView.show();
        return this;
    }
    protected doClickAdd(): Main {
        this.dataView.addRow();
        return this;
    }
    protected doClickRemove(): Main {
        this.dataView.removeRow();
        return this;
    }
    private renderBasic(): Main {
        this.$el.addClass("layout-horizontal show-all");
        this.$el.html(main_tpl);
        this.$data = this.$(".main-data");
        this.$console = this.$(".main-console");
        this.$split = this.$(".main-split");

        this.shapeLeft = new Shape();
        this.shapeCenter = new Shape();
        this.shapeRight = new Shape();

        this.shapeLeft.$el.appendTo(this.$(".act-left"));
        this.shapeCenter.$el.appendTo(this.$(".act-center"));
        this.shapeRight.$el.appendTo(this.$(".act-right"));

        this.dataView = new Data();
        this.dataView.setExpression(this.expression);
        this.consoleView = new Console();
        this.consoleView.setExpression(this.expression);
        this.settingView = new Setting();
        this.settingView.setExpression(this.expression);
        this.settingView.on("onapply", ((me) => () => {
            me.dataView.refreshAll();
        })(this));

        this.dataView.$el.appendTo(this.$data);
        this.consoleView.$el.appendTo(this.$console);
        this.settingView.$el.appendTo(this.$el);

        this.$(".act-add").html(image_add_svg_tpl);
        this.$(".act-setting").html(image_setting_svg_tpl);
        this.$(".act-remove").html(image_remove_svg_tpl);

        return this;
    }
    private isHorizontal(): boolean {
        return this.$el.hasClass("layout-horizontal");
    }
    private setCurrentSize(size: number | "auto"): Main {
        if (size === "auto") {
            this.$data.css("right", 0);
            this.$split.css("right", 0);
            this.$console.width("auto");
            this.$data.css("bottom", 0);
            this.$split.css("bottom", 0);
            this.$console.height("auto");
        } else {
            this.currentSize = size;
            if (this.isHorizontal()) {
                const endWidth = Math.max(size, this.defaultSize);
                this.$data.css("right", endWidth);
                this.$split.css("right", endWidth - 2);
                this.$console.width(endWidth);
                this.$data.css("bottom", 0);
                this.$split.css("bottom", 0);
                this.$console.height("auto");
            } else {
                const endHeight = Math.max(size, this.defaultSize);
                this.$data.css("bottom", endHeight);
                this.$split.css("bottom", endHeight - 28);
                this.$console.height(endHeight);
                this.$data.css("right", 0);
                this.$split.css("right", 0);
                this.$console.width("auto");
            }
        }
        return this;
    }
}

export default Main;
