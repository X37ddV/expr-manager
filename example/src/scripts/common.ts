import $ from "jquery";
import moment from "moment";
import _ from "underscore";

export function getValueType(value: any): string {
    if (value === null) {
        return "null";
    } else {
        return Object.prototype.toString.call(value).replace("[object ", "").replace("]", "").toLowerCase();
    }
}

export function formatValue(v: any, type?: string): string {
    let r = "";
    if (type === undefined) {
        type = getValueType(v);
    }
    switch (type) {
        case "string":
        case "object":
        case "array":
            r += JSON.stringify(v);
            break;
        case "date":
            r += moment(v).format("YYYY-MM-DD HH:mm:ss");
            break;
        case "number":
        case "boolean":
        default:
            r += v;
            break;
    }
    return r;
}

export function parserValue(v: string, type: string): any {
    let value;
    if (_.isEmpty(v)) {
        value = null;
    } else if (type === "date") {
        const m = moment(v);
        value = (m.isValid()) ? m.toDate() : NaN;
    } else {
        try {
            value = JSON.parse(v);
        } catch (error) {
            value = NaN;
        }
    }
    return value;
}

export function htmlEncode(value: string): string {
    return $("<div/>").text(value).html();
}

export enum ShowFocusType {
    Height,
    Width,
    HeightAndWidth,
}

function doShowFocus(container: JQuery, selected: JQuery, outerFn: string, scrollFn: string, pos: number): void {
    const containerHeight = container[outerFn]();
    const selectedHeight = selected[outerFn]();
    const positionBottom = pos + selectedHeight;
    if (pos >= 0 || (positionBottom <= containerHeight)) {
        const start = container[scrollFn]();
        if (selectedHeight > containerHeight) {
            if (pos > 0) {
                container[scrollFn](start + pos);
            } else if (positionBottom < containerHeight) {
                container[scrollFn](start + positionBottom - containerHeight);
            }
        } else {
            if (pos < 0) {
                container[scrollFn](start + pos);
            } else if (positionBottom > containerHeight) {
                container[scrollFn](start + positionBottom - containerHeight);
            }
        }
    }
}

export function showFocus(container: JQuery, selected: JQuery, type: ShowFocusType): void {
    if (container && selected && selected.length > 0) {
        const position = selected.position();

        if (type === ShowFocusType.Height || type === ShowFocusType.HeightAndWidth) {
            doShowFocus(container, selected, "outerHeight", "scrollTop", position.top);
        }

        if (type === ShowFocusType.Width || type === ShowFocusType.HeightAndWidth) {
            doShowFocus(container, selected, "outerWidth", "scrollLeft", position.left);
        }
    }
}
