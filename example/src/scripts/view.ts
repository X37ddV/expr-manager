import $ from "jquery";
import _ from "underscore";

interface IListener {
    (eventObject: JQueryEventObject, ...args: any[]): any;
}

interface IEventsHash {
    [selector: string]: string | { (eventObject: JQueryEventObject): void };
}

interface IViewOptions {
    el?: any;
    events?: IEventsHash;
    id?: string;
    className?: string;
    tagName?: string;
    attributes?: { [id: string]: any };
}

class View {
    public id: string;
    public cid: string;
    public tagName: string = "div";
    public el: any;
    public $el: JQuery;
    public className: string;
    public events: IEventsHash;

    private privListeningTo: any;
    private privListenId: string;
    private privEvents: any;
    private privListeners: any;

    constructor(options?: IViewOptions) {
        this.cid = _.uniqueId("view");
        this.preinitialize.apply(this, arguments);
        _.extend(this, _.pick(options, viewOptions));
        this._ensureElement();
        this.initialize.apply(this, arguments);
    }

    public render(): View {
        return this;
    }
    public $(selector: any): JQuery {
        return this.$el.find(selector);
    }
    public remove(): View {
        this._removeElement();
        this.stopListening();
        return this;
    }
    public setElement(element: any): View {
        this.undelegateEvents();
        this._setElement(element);
        this.delegateEvents();
        return this;
    }
    public delegateEvents(events?: IEventsHash): View {
        if (!events) {
            events = _.result(this, "events");
            if (!events) {
                return this;
            }
        }
        this.undelegateEvents();
        for (let key in events) {
            if (events.hasOwnProperty(key)) {
                let method = events[key];
                if (!_.isFunction(method)) {
                    method = this[method];
                }
                if (!method) {
                    continue;
                }
                let match = key.match(delegateEventSplitter);
                this.delegate(match[1], match[2], _.bind(<Function> method, this));
            }
        }
        return this;
    }
    public delegate(eventName: string, selector: string, listener: IListener): View {
        this.$el.on(eventName + ".delegateEvents" + this.cid, selector, listener);
        return this;
    }
    public undelegateEvents(): View {
        if (this.$el) {
            this.$el.off(".delegateEvents" + this.cid);
        }
        return this;
    }
    public undelegate(eventName: string, selector: string, listener: IListener): View {
        this.$el.off(eventName + ".delegateEvents" + this.cid, selector, listener);
        return this;
    }
    public on(eventName: string | Object, callback: Function, context?: any): View {
        return internalOn(this, eventName, callback, context, undefined);
    }
    public listenTo(object: any, name: string | Object, callback: Function): View {
        if (!object) {
            return this;
        }
        let id = object.privListenId || (object.privListenId = _.uniqueId("l"));
        let tmpListeningTo = this.privListeningTo || (this.privListeningTo = {});
        let tmpListening = tmpListeningTo[id];

        if (!tmpListening) {
            let thisId = this.privListenId || (this.privListenId = _.uniqueId("l"));
            tmpListening = tmpListeningTo[id] = {
                count: 0,
                id: thisId,
                listeningTo: tmpListeningTo,
                obj: object,
                objId: id,
            };
        }

        internalOn(object, name, callback, this, tmpListening);
        return this;
    }
    public off(name?: string, callback?: Function, context?: any): View {
        if (!this.privEvents) {
            return this;
        }
        let opts;
        opts = {};
        opts.context = context;
        opts.listeners = this.privListeners;
        this.privEvents = eventsApi(offApi, this.privEvents, name, callback, opts);
        return this;
    }
    public stopListening(object?: any, name?: string, callback?: Function): View {
        let listeningTo = this.privListeningTo;
        if (!listeningTo) {
            return this;
        }
        let ids = object ? [object.privListenId] : _.keys(listeningTo);

        for (let i = 0; i < ids.length; i++) {
            let listening = listeningTo[ids[i]];

            if (!listening) {
                break;
            }
            listening.obj.off(name, callback, this);
        }

        return this;
    }
    public once(name: string, callback: Function, context?: any): View {
        let events = eventsApi(onceMap, {}, name, callback, _.bind(this.off, this));
        if (typeof name === "string" && context == null) {
            callback = void 0;
        }
        return this.on(events, callback, context);
    }
    public listenToOnce(object: any, name: string, callback: Function): View {
        let events = eventsApi(onceMap, {}, name, callback, _.bind(this.stopListening, this, object));
        return this.listenTo(object, events, undefined);
    }
    public trigger(eventName: string, ...args: any[]): View {
        if (!this.privEvents) {
            return this;
        }
        let length = Math.max(0, arguments.length - 1);
        let opts = Array(length);
        for (let i = 0; i < length; i++) {
            opts[i] = arguments[i + 1];
        }
        eventsApi(triggerApi, this.privEvents, eventName, void 0, opts);
        return this;
    }
    protected preinitialize(options?: IViewOptions): void { return; }
    protected initialize(options?: IViewOptions): void { return; }
    private _removeElement(): void {
        this.$el.remove();
    }
    private _setElement(el: any): void {
        this.$el = el instanceof $ ? el : $(el);
        this.el = this.$el[0];
    }
    private _createElement(tagName: any): any {
        return document.createElement(tagName);
    }
    private _ensureElement(): void {
        if (!this.el) {
            let attrs = _.extend({}, _.result(this, "attributes"));
            if (this.id) {
                attrs.id = _.result(this, "id");
            }
            if (this.className) {
                attrs["class"] = _.result(this, "className");
            }
            this.setElement(this._createElement(_.result(this, "tagName")));
            this._setAttributes(attrs);
        } else {
            this.setElement(_.result(this, "el"));
        }
    }
    private _setAttributes(attributes: any): void {
        this.$el.attr(attributes);
    }
}

let delegateEventSplitter: RegExp = /^(\S+)\s*(.*)$/;
let viewOptions: Array<string> = ["el", "id", "attributes", "className", "tagName", "events"];
let eventSplitter: RegExp = /\s+/;

let eventsApi = (iteratee: Function, events: Object, name: string | Object, callback: Function, opts: any): Object => {
    let i = 0;
    let names;
    if (name && typeof name === "object") {
        if (callback !== void 0 && "context" in opts && opts.context === void 0) {
            opts.context = callback;
        }
        for (names = _.keys(name); i < names.length; i++) {
            events = eventsApi(iteratee, events, names[i], name[names[i]], opts);
        }
    } else if (name && eventSplitter.test(<string> name)) {
        for (names = (<string> name).split(eventSplitter); i < names.length; i++) {
            events = iteratee(events, names[i], callback, opts);
        }
    } else {
        events = iteratee(events, name, callback, opts);
    }
    return events;
};

let onApi = (events: Object, name: string, callback: Function, options: any): Object => {
    if (callback) {
        let handlers = events[name] || (events[name] = []);
        let context = options.context;
        let ctx = options.ctx;
        let listening = options.listening;
        if (listening) {
            listening.count++;
        }
        let handler;
        handler = {};
        handler.callback = callback;
        handler.context = context;
        handler.ctx = context || ctx;
        handler.listening = listening;
        handlers.push(handler);
    }
    return events;
};

let offApi = (events: Object, name: string, callback: Function, options: any): Object => {
    if (!events) {
        return;
    }
    let i = 0;
    let listening;
    let context = options.context;
    let listeners = options.listeners;

    if (!name && !callback && !context) {
        let ids = _.keys(listeners);
        for (; i < ids.length; i++) {
            listening = listeners[ids[i]];
            delete listeners[listening.id];
            delete listening.listeningTo[listening.objId];
        }
        return;
    }

    let names = name ? [name] : _.keys(events);
    for (; i < names.length; i++) {
        name = names[i];
        let handlers = events[name];

        if (!handlers) {
            break;
        }
        let remaining = [];
        for (let j = 0; j < handlers.length; j++) {
            let handler = handlers[j];
            if (
                callback && callback !== handler.callback &&
                callback !== handler.callback._callback ||
                context && context !== handler.context
            ) {
                remaining.push(handler);
            } else {
                listening = handler.listening;
                if (listening && --listening.count === 0) {
                    delete listeners[listening.id];
                    delete listening.listeningTo[listening.objId];
                }
            }
        }

        if (remaining.length) {
            events[name] = remaining;
        } else {
            delete events[name];
        }
    }
    return events;
};

let triggerEvents = (events: Array<any>, args: Array<any>): void => {
    let ev;
    let i = -1;
    let l = events.length;
    let a1 = args[0];
    let a2 = args[1];
    let a3 = args[2];
    switch (args.length) {
        case 0:
            while (++i < l) {
                (ev = events[i]).callback.call(ev.ctx);
            }
            break;
        case 1:
            while (++i < l) {
                (ev = events[i]).callback.call(ev.ctx, a1);
            }
            break;
        case 2:
            while (++i < l) {
                (ev = events[i]).callback.call(ev.ctx, a1, a2);
            }
            break;
        case 3:
            while (++i < l) {
                (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
            }
            break;
        default:
            while (++i < l) {
                (ev = events[i]).callback.apply(ev.ctx, args);
            }
            break;
    }
    return;
};

let triggerApi = (objEvents: any, name: string, callback: Function, args: Array<any>): Object => {
    if (objEvents) {
        let events = objEvents[name];
        let allEvents = objEvents.all;
        if (events && allEvents) {
            allEvents = allEvents.slice();
        }
        if (events) {
            triggerEvents(events, args);
        }
        if (allEvents) {
            triggerEvents(allEvents, [name].concat(args));
        }
    }
    return objEvents;
};

let internalOn = (obj: any, name: string | Object, callback: Function, context: Object, listening: any): any => {
    let opts;
    opts = {};
    opts.context = context;
    opts.ctx = obj;
    opts.listening = listening;
    obj.privEvents = eventsApi(onApi, obj.privEvents || {}, name, callback, opts);

    if (listening) {
        let listeners = obj.privListeners || (obj.privListeners = {});
        listeners[listening.id] = listening;
    }

    return obj;
};

let onceMap = (map: Object, name: string, callback: Function, offer: Function) => {
    if (callback) {
        let once;
        once = map[name] = _.once(() => {
            offer(name, once);
            callback.apply(window, [map, name, callback, offer]);
        });
        once._callback = callback;
    }
    return map;
};

export default View;
