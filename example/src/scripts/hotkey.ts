import View from "./view";
import $ from "jquery";
import Mousetrap from "mousetrap";
import _ from "underscore";

const hotkeyName: string = "hotkeys";
let hotkeyBodyMousetrap: MousetrapInstance = null;
let hotkeyCurrentView: View = null;

let hotkeyIsEditable = (element: HTMLElement): boolean => {
    return element.tagName === "INPUT" || element.tagName === "SELECT" || element.tagName === "TEXTAREA" ||
        element.contentEditable && element.contentEditable === "true";
};

let hotkeyGetCallback = (element: HTMLElement, combo: string, type: string):
    ((e: ExtendedKeyboardEvent, combo: string) => any) => {
    let hotkeys = $(element).data(hotkeyName);
    let callback = null;
    if (hotkeys) {
        let name = combo + "|" + (type || "");
        callback = hotkeys[name];
        if (!callback) {
            name = combo + "|";
            callback = hotkeys[name];
        }
    }
    return callback;
};

let hotkeyBodyCallback = (e: ExtendedKeyboardEvent, combo: string): any => {
    let callback = null;
    if (hotkeyCurrentView) {
        let elements = hotkeyCurrentView.$el.parents("." + hotkeyName).add(hotkeyCurrentView.$el);
        for (let i = elements.length - 1; i >= 0; i--) {
            callback = hotkeyGetCallback(elements[i], combo, e.type);
            if (callback) {
                break;
            }
        }
    } else {
        callback = hotkeyGetCallback(window.document.body, combo, e.type);
    }
    if (callback) {
        return callback.call(window, e, combo);
    }
};

let hotkeyBodyStopCallback = (e: ExtendedKeyboardEvent, element: HTMLElement, combo: string): boolean => {
    return "esc" === combo ? false : hotkeyIsEditable(element);
};

let hotkeyInputStopCallback = (e: ExtendedKeyboardEvent, element: HTMLElement, combo: string): boolean => {
    return !hotkeyIsEditable(element);
};

let hotkeyBindElement = (element: HTMLElement,
    keys: string | string[],
    callback: (e: ExtendedKeyboardEvent, combo: string) => any,
    action?: string): void => {
    let el = $(element);
    if (hotkeyIsEditable(element)) {
        let trap = el.data(hotkeyName);
        if (!trap) {
            trap = new Mousetrap(element);
            trap.stopCallback = hotkeyInputStopCallback;
            el.data(hotkeyName, trap);
        }
        trap.bind(keys, callback, action);
    } else {
        if (!hotkeyBodyMousetrap) {
            hotkeyBodyMousetrap = new Mousetrap(window.document.body);
            hotkeyBodyMousetrap.stopCallback = hotkeyBodyStopCallback;
        }
        let hotkeys = el.addClass(hotkeyName).data(hotkeyName) || {};
        if (keys instanceof Array) {
            for (let i = 0; i < keys.length; i++) {
                hotkeys[keys[i] + "|" + (action || "")] = callback;
            }
        } else {
            hotkeys[keys + "|" + (action || "")] = callback;
        }
        el.data(hotkeyName, hotkeys);
        hotkeyBodyMousetrap.bind(keys, hotkeyBodyCallback, action);
    }
};

let hotkeyBindGlobal = (keys: string | string[],
    callback: (e: ExtendedKeyboardEvent, combo: string) => any,
    action?: string): void => {
    hotkeyBindElement(window.document.body, keys, callback, action);
};

let hotkeyBindView = (view: View,
    keys: string | string[],
    callback: (e: ExtendedKeyboardEvent, combo: string) => any,
    action?: string): void => {
    hotkeyBindElement(view.$el.get(0), keys, callback, action);
};

export default {
    bindElement: hotkeyBindElement,
    bindGlobal: hotkeyBindGlobal,
    bindView: hotkeyBindView,
    getCurrentView: (): View => {
        return hotkeyCurrentView;
    },
    setCurrentView: (view: View, disableFocus?: boolean): void => {
        if (hotkeyCurrentView !== view) {
            const blurName = "hotkeyBlur";
            if (hotkeyCurrentView && _.isFunction(hotkeyCurrentView[blurName])) {
                hotkeyCurrentView[blurName]();
            }
            hotkeyCurrentView = view;
            const focusName = "hotkeyFocus";
            if (!disableFocus && hotkeyCurrentView && _.isFunction(hotkeyCurrentView[focusName])) {
                hotkeyCurrentView[focusName]();
            }
        }
    },
};
