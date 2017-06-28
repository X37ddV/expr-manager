import View from "../../scripts/view";
import "./shape.scss";
import shape_tpl from "./shape.tpl";

class Shape extends View {
    private $item: JQuery;
    public setName(name: ShapeName): Shape {
        const css = { bottom: "", display: "", height: "", left: "", right: "", top: "", width: "" };
        switch (name) {
            case ShapeName.SHAPE_NAME_AREA_LEFT:
                css.top = "1px";
                css.bottom = "1px";
                css.left = "1px";
                css.width = "2px";
                break;
            case ShapeName.SHAPE_NAME_AREA_RIGHT:
                css.top = "1px";
                css.right = "1px";
                css.bottom = "1px";
                css.width = "2px";
                break;
            case ShapeName.SHAPE_NAME_AREA_TOP:
                css.top = "1px";
                css.right = "1px";
                css.left = "1px";
                css.height = "2px";
                break;
            case ShapeName.SHAPE_NAME_AREA_BOTTOM:
                css.right = "1px";
                css.bottom = "1px";
                css.left = "1px";
                css.height = "2px";
                break;
            case ShapeName.SHAPE_NAME_LAYOUT_HORIZONTAL:
                css.top = "0px";
                css.right = "33%";
                css.bottom = "0px";
                css.width = "1px";
                break;
            case ShapeName.SHAPE_NAME_LAYOUT_VERTICAL:
                css.right = "0px";
                css.bottom = "33%";
                css.left = "0px";
                css.height = "1px";
                break;
            default:
                css.display = "none";
                break;
        }
        this.$item.css(css);
        return this;
    }
    public setColor(color: ShapeColor | string): Shape {
        color = color === undefined ? ShapeColor.SHAPE_COLOR_ENABLED : color;
        switch (color) {
            case ShapeColor.SHAPE_COLOR_DISABLED:
                this.$el.css({ borderColor: "" });
                this.$item.css({ backgroundColor: "" });
                this.$el.removeClass("shape-color-enabled").addClass("shape-color-disabled");
                break;
            case ShapeColor.SHAPE_COLOR_ENABLED:
                this.$el.css({ borderColor: "" });
                this.$item.css({ backgroundColor: "" });
                this.$el.removeClass("shape-color-disabled").addClass("shape-color-enabled");
                break;
            default:
                if (color) {
                    this.$el.css({ borderColor: color });
                    this.$item.css({ backgroundColor: color });
                    this.$el.removeClass("shape-color-disabled").removeClass("shape-color-enabled");
                }
                break;
        }
        return this;
    }
    public setWidth(width): Shape {
        this.$el.width(width || 16);
        return this;
    }
    public setHeight(height): Shape {
        this.$el.height(height || 12);
        return this;
    }
    protected preinitialize(): void {
        this.className = "shape-view";
    }
    protected initialize(opts): void {
        opts = opts || {};
        this.$el.html(shape_tpl);
        this.$item = this.$(".shape-item");
        opts.attributes = opts.attributes || {};
        this.setName(opts.attributes.name);
        this.setColor(opts.attributes.color);
        this.setWidth(opts.attributes.width);
        this.setHeight(opts.attributes.height);
    }
}

export const enum ShapeColor {
    SHAPE_COLOR_DISABLED,
    SHAPE_COLOR_ENABLED,
}

export const enum ShapeName {
    SHAPE_NAME_AREA_BOTTOM,
    SHAPE_NAME_AREA_LEFT,
    SHAPE_NAME_AREA_RIGHT,
    SHAPE_NAME_AREA_TOP,
    SHAPE_NAME_LAYOUT_HORIZONTAL,
    SHAPE_NAME_LAYOUT_VERTICAL,
}

export default Shape;
