import $ from "jquery";
import Mousetrap from "mousetrap";
import _ from "underscore";
import View from "./view";

const hotkeyName: string = "hotkeys";
let hotkeyBodyMousetrap: MousetrapInstance = null;
let hotkeyCurrentView: View = null;

const hotkeyIsEditable = (element: HTMLElement): boolean => {
    return element.tagName === "INPUT" || element.tagName === "SELECT" || element.tagName === "TEXTAREA" ||
        element.contentEditable && element.contentEditable === "true";
};

const hotkeyGetCallback = (element: HTMLElement, combo: string, type: string):
    ((e: ExtendedKeyboardEvent, combo: string) => any) => {
    const hotkeys = $(element).data(hotkeyName);
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

const hotkeyBodyCallback = (e: ExtendedKeyboardEvent, combo: string): any => {
    let callback = null;
    if (hotkeyCurrentView) {
        const elements = hotkeyCurrentView.$el.parents("." + hotkeyName).add(hotkeyCurrentView.$el);
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

const hotkeyBodyStopCallback = (e: ExtendedKeyboardEvent, element: HTMLElement, combo: string): boolean => {
    return "esc" === combo ? false : hotkeyIsEditable(element);
};

const hotkeyInputStopCallback = (e: ExtendedKeyboardEvent, element: HTMLElement, combo: string): boolean => {
    return !hotkeyIsEditable(element);
};

const hotkeyBindElement = (
    element: HTMLElement,
    keys: string | string[],
    callback: (e: ExtendedKeyboardEvent, combo: string) => any,
    action?: string): void => {
    const el = $(element);
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
        const hotkeys = el.addClass(hotkeyName).data(hotkeyName) || {};
        if (keys instanceof Array) {
            for (const key of keys) {
                hotkeys[key + "|" + (action || "")] = callback;
            }
        } else {
            hotkeys[keys + "|" + (action || "")] = callback;
        }
        el.data(hotkeyName, hotkeys);
        hotkeyBodyMousetrap.bind(keys, hotkeyBodyCallback, action);
    }
};

const hotkeyBindGlobal = (
    keys: string | string[],
    callback: (e: ExtendedKeyboardEvent, combo: string) => any,
    action?: string): void => {
    hotkeyBindElement(window.document.body, keys, callback, action);
};

const hotkeyBindView = (
    view: View,
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
