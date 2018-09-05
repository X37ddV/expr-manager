(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('jquery'), require('underscore'), require('underscore.string'), require('expr-manager'), require('moment'), require('mousetrap')) :
  typeof define === 'function' && define.amd ? define(['jquery', 'underscore', 'underscore.string', 'expr-manager', 'moment', 'mousetrap'], factory) :
  (factory(global.jQuery,global._,global.s,global.ExprManager,global.moment,global.Mousetrap));
}(this, (function ($,_,s,ExprManager,moment,Mousetrap) { 'use strict';

  $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
  _ = _ && _.hasOwnProperty('default') ? _['default'] : _;
  s = s && s.hasOwnProperty('default') ? s['default'] : s;
  ExprManager = ExprManager && ExprManager.hasOwnProperty('default') ? ExprManager['default'] : ExprManager;
  moment = moment && moment.hasOwnProperty('default') ? moment['default'] : moment;
  Mousetrap = Mousetrap && Mousetrap.hasOwnProperty('default') ? Mousetrap['default'] : Mousetrap;

  function __extends(d, b) {
      for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

  var View = (function () {
      function View(options) {
          this.tagName = "div";
          this.cid = _.uniqueId("view");
          this.preinitialize.apply(this, arguments);
          _.extend(this, _.pick(options, viewOptions));
          this._ensureElement();
          this.initialize.apply(this, arguments);
      }
      View.prototype.render = function () {
          return this;
      };
      View.prototype.$ = function (selector) {
          return this.$el.find(selector);
      };
      View.prototype.remove = function () {
          this._removeElement();
          this.stopListening();
          return this;
      };
      View.prototype.setElement = function (element) {
          this.undelegateEvents();
          this._setElement(element);
          this.delegateEvents();
          return this;
      };
      View.prototype.delegateEvents = function (events) {
          if (!events) {
              events = _.result(this, "events");
              if (!events) {
                  return this;
              }
          }
          this.undelegateEvents();
          for (var key in events) {
              if (events.hasOwnProperty(key)) {
                  var method = events[key];
                  if (!_.isFunction(method)) {
                      method = this[method];
                  }
                  if (!method) {
                      continue;
                  }
                  var match = key.match(delegateEventSplitter);
                  this.delegate(match[1], match[2], _.bind(method, this));
              }
          }
          return this;
      };
      View.prototype.delegate = function (eventName, selector, handler) {
          this.$el.on(eventName + ".delegateEvents" + this.cid, selector, handler);
          return this;
      };
      View.prototype.undelegateEvents = function () {
          if (this.$el) {
              this.$el.off(".delegateEvents" + this.cid);
          }
          return this;
      };
      View.prototype.undelegate = function (eventName, selector, handler) {
          this.$el.off(eventName + ".delegateEvents" + this.cid, selector, handler);
          return this;
      };
      View.prototype.on = function (eventName, callback, context) {
          return internalOn(this, eventName, callback, context, undefined);
      };
      View.prototype.listenTo = function (object, name, callback) {
          if (!object) {
              return this;
          }
          var id = object.privListenId || (object.privListenId = _.uniqueId("l"));
          var tmpListeningTo = this.privListeningTo || (this.privListeningTo = {});
          var tmpListening = tmpListeningTo[id];
          if (!tmpListening) {
              var thisId = this.privListenId || (this.privListenId = _.uniqueId("l"));
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
      };
      View.prototype.off = function (name, callback, context) {
          if (!this.privEvents) {
              return this;
          }
          var opts;
          opts = {};
          opts.context = context;
          opts.listeners = this.privListeners;
          this.privEvents = eventsApi(offApi, this.privEvents, name, callback, opts);
          return this;
      };
      View.prototype.stopListening = function (object, name, callback) {
          var listeningTo = this.privListeningTo;
          if (!listeningTo) {
              return this;
          }
          var ids = object ? [object.privListenId] : _.keys(listeningTo);
          for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
              var id = ids_1[_i];
              var listening = listeningTo[id];
              if (!listening) {
                  break;
              }
              listening.obj.off(name, callback, this);
          }
          return this;
      };
      View.prototype.once = function (name, callback, context) {
          var events = eventsApi(onceMap, {}, name, callback, _.bind(this.off, this));
          if (typeof name === "string" && context == null) {
              callback = void 0;
          }
          return this.on(events, callback, context);
      };
      View.prototype.listenToOnce = function (object, name, callback) {
          var events = eventsApi(onceMap, {}, name, callback, _.bind(this.stopListening, this, object));
          return this.listenTo(object, events, undefined);
      };
      View.prototype.trigger = function (eventName) {
          var args = [];
          for (var _i = 1; _i < arguments.length; _i++) {
              args[_i - 1] = arguments[_i];
          }
          if (!this.privEvents) {
              return this;
          }
          var length = Math.max(0, arguments.length - 1);
          var opts = Array(length);
          for (var i = 0; i < length; i++) {
              opts[i] = arguments[i + 1];
          }
          eventsApi(triggerApi, this.privEvents, eventName, void 0, opts);
          return this;
      };
      View.prototype.preinitialize = function (options) { return; };
      View.prototype.initialize = function (options) { return; };
      View.prototype._removeElement = function () {
          this.$el.remove();
      };
      View.prototype._setElement = function (el) {
          this.$el = el instanceof $ ? el : $(el);
          this.el = this.$el[0];
      };
      View.prototype._createElement = function (tagName) {
          return document.createElement(tagName);
      };
      View.prototype._ensureElement = function () {
          if (!this.el) {
              var attrs = _.extend({}, _.result(this, "attributes"));
              if (this.id) {
                  attrs.id = _.result(this, "id");
              }
              if (this.className) {
                  attrs.class = _.result(this, "className");
              }
              this.setElement(this._createElement(_.result(this, "tagName")));
              this._setAttributes(attrs);
          }
          else {
              this.setElement(_.result(this, "el"));
          }
      };
      View.prototype._setAttributes = function (attributes) {
          this.$el.attr(attributes);
      };
      return View;
  }());
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;
  var viewOptions = ["el", "id", "attributes", "className", "tagName", "events"];
  var eventSplitter = /\s+/;
  var eventsApi = function (iteratee, events, name, callback, opts) {
      var i = 0;
      var names;
      if (name && typeof name === "object") {
          if (callback !== void 0 && "context" in opts && opts.context === void 0) {
              opts.context = callback;
          }
          for (names = _.keys(name); i < names.length; i++) {
              events = eventsApi(iteratee, events, names[i], name[names[i]], opts);
          }
      }
      else if (name && eventSplitter.test(name)) {
          for (names = name.split(eventSplitter); i < names.length; i++) {
              events = iteratee(events, names[i], callback, opts);
          }
      }
      else {
          events = iteratee(events, name, callback, opts);
      }
      return events;
  };
  var onApi = function (events, name, callback, options) {
      if (callback) {
          var handlers = events[name] || (events[name] = []);
          var context = options.context;
          var ctx = options.ctx;
          var listening = options.listening;
          if (listening) {
              listening.count++;
          }
          var handler = void 0;
          handler = {};
          handler.callback = callback;
          handler.context = context;
          handler.ctx = context || ctx;
          handler.listening = listening;
          handlers.push(handler);
      }
      return events;
  };
  var offApi = function (events, name, callback, options) {
      if (!events) {
          return;
      }
      var i = 0;
      var listening;
      var context = options.context;
      var listeners = options.listeners;
      if (!name && !callback && !context) {
          var ids = _.keys(listeners);
          for (; i < ids.length; i++) {
              listening = listeners[ids[i]];
              delete listeners[listening.id];
              delete listening.listeningTo[listening.objId];
          }
          return;
      }
      var names = name ? [name] : _.keys(events);
      for (; i < names.length; i++) {
          name = names[i];
          var handlers = events[name];
          if (!handlers) {
              break;
          }
          var remaining = [];
          for (var _i = 0, handlers_1 = handlers; _i < handlers_1.length; _i++) {
              var handler = handlers_1[_i];
              if (callback && callback !== handler.callback &&
                  callback !== handler.callback._callback ||
                  context && context !== handler.context) {
                  remaining.push(handler);
              }
              else {
                  listening = handler.listening;
                  if (listening && --listening.count === 0) {
                      delete listeners[listening.id];
                      delete listening.listeningTo[listening.objId];
                  }
              }
          }
          if (remaining.length) {
              events[name] = remaining;
          }
          else {
              delete events[name];
          }
      }
      return events;
  };
  var triggerEvents = function (events, args) {
      var ev;
      var i = -1;
      var l = events.length;
      var a1 = args[0];
      var a2 = args[1];
      var a3 = args[2];
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
  var triggerApi = function (objEvents, name, callback, args) {
      if (objEvents) {
          var events = objEvents[name];
          var allEvents = objEvents.all;
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
  var internalOn = function (obj, name, callback, context, listening) {
      var opts;
      opts = {};
      opts.context = context;
      opts.ctx = obj;
      opts.listening = listening;
      obj.privEvents = eventsApi(onApi, obj.privEvents || {}, name, callback, opts);
      if (listening) {
          var listeners = obj.privListeners || (obj.privListeners = {});
          listeners[listening.id] = listening;
      }
      return obj;
  };
  var onceMap = function (map, name, callback, offer) {
      if (callback) {
          var once_1;
          once_1 = map[name] = _.once(function () {
              offer(name, once_1);
              callback.apply(window, [map, name, callback, offer]);
          });
          once_1._callback = callback;
      }
      return map;
  };

  var image_add_svg_tpl = "<svg width=\"14\" height=\"14\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n    <path d=\"M801.171 483.589H544V226.418c0-17.673-14.327-32-32-32s-32 14.327-32 32v257.171H222.83c-17.673 0-32 14.327-32 32s14.327 32 32 32H480v257.17c0 17.673 14.327 32 32 32s32-14.327 32-32v-257.17h257.171c17.673 0 32-14.327 32-32s-14.327-32-32-32z\" fill=\"#2196f3\"></path>\n</svg>";

  var image_remove_svg_tpl = "<svg width=\"14\" height=\"14\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n    <path d=\"M801.171 547.589H222.83c-17.673 0-32-14.327-32-32s14.327-32 32-32h578.341c17.673 0 32 14.327 32 32s-14.327 32-32 32z\" fill=\"#2196f3\"></path>\n</svg>";

  var image_setting_svg_tpl = "<svg width=\"14\" height=\"14\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n    <path d=\"M1013.546667 610.944C1004.373333 659.072 970.325333 689.109333 929.92 689.621333 882.901333 689.621333 847.274667 725.034667 847.274667 768.554667 847.274667 778.325333 852.096 792.618667 854.357333 797.994667 872.789333 839.296 858.453333 890.154667 820.992 916.096L816.085333 919.253333 691.84 987.178667C679.68 992.426667 666.496 995.072 652.672 995.072 623.274667 995.072 595.584 983.125333 576.682667 962.346667 558.293333 942.378667 524.885333 918.954667 509.525333 918.954667 494.848 918.954667 460.544 942.378667 442.794667 961.493333 414.976 991.744 365.482667 1002.154667 327.594667 985.514667L322.688 983.168 203.306667 916.437333C165.418667 890.069333 151.210667 839.210667 169.728 797.738667 172.245333 791.808 176.682667 777.941333 176.682667 768.554667 176.682667 725.034667 141.056 689.621333 97.28 689.621333L92.458667 689.621333C52.394667 689.621333 19.456 658.346667 10.538667 611.712 7.978667 597.589333 0 550.997333 0 512.298667 0 473.6 7.978667 427.050667 10.410667 413.696 19.456 366.08 52.224 335.018667 92.330667 335.018667 93.013333 335.018667 93.610667 335.018667 94.250667 335.061333 141.056 335.018667 176.682667 299.605333 176.682667 256.085333 176.682667 246.314667 171.904 232.064 169.6 226.645333 151.125333 185.301333 165.461333 134.442667 203.050667 108.458667L208.042667 105.301333 334.378667 36.650667C373.034667 20.352 420.821333 30.805333 448.768 60.074667 466.730667 78.848 499.456 100.778667 514.432 100.778667 529.237333 100.778667 561.706667 79.274667 579.754667 60.8 607.829333 31.829333 656.384 22.058667 693.930667 38.186667L698.837333 40.576 819.882667 107.648C858.538667 134.528 872.789333 185.429333 854.229333 226.944 852.096 231.936 847.274667 246.314667 847.274667 256.085333 847.274667 299.605333 882.901333 335.018667 926.677333 335.018667 927.274667 335.018667 927.914667 335.018667 928.512 335.018667 971.733333 335.018667 1004.501333 366.08 1013.418667 412.928 1016.021333 427.050667 1024 473.642667 1024 512.298667 1024 550.954667 1016.021333 597.589333 1013.546667 610.944ZM929.621333 428.928C928.810667 424.576 927.616 421.674667 926.72 419.882667L926.677333 419.882667C835.84 419.882667 761.941333 346.410667 761.941333 256.085333 761.941333 224.810667 775.68 193.749333 776.234667 192.426667 778.368 187.733333 776.490667 181.034667 772.266667 178.090667L657.408 114.730667C658.261333 115.328 656.64 115.029333 654.208 115.029333 648.362667 115.029333 643.285333 117.504 641.066667 119.765333 634.453333 126.592 575.146667 185.642667 514.432 185.642667 453.12 185.642667 393.557333 125.44 386.944 118.613333 383.744 115.242667 373.888 112.213333 368 114.645333L251.648 178.261333C247.210667 182.058667 245.76 188.117333 247.68 192.426667 248.746667 194.090667 262.016 224.853333 262.016 256.085333 262.016 346.410667 188.117333 419.882667 97.28 419.882667L97.237333 419.882667C96.341333 421.674667 95.189333 424.533333 94.378667 428.714667 89.984 452.736 85.333333 487.168 85.333333 512.298667 85.333333 537.429333 89.984 571.904 94.378667 595.754667 95.189333 600.064 96.341333 602.965333 97.28 604.757333 188.117333 604.757333 262.016 678.229333 262.016 768.554667 262.016 796.544 251.306667 823.808 247.978667 831.488 245.589333 836.864 247.466667 843.605333 251.690667 846.549333L364.373333 909.098667C363.392 908.501333 365.184 908.8 367.317333 908.8 373.034667 908.8 377.898667 906.368 379.946667 904.106667 382.677333 901.205333 445.525333 834.090667 509.525333 834.090667 572.586667 834.090667 633.088 897.962667 639.786667 905.216 642.858667 908.586667 652.714667 911.573333 657.92 909.312L772.053333 846.464C776.789333 842.410667 778.154667 836.437333 776.277333 832.170667L776.277333 832.213333C776.277333 832.213333 761.941333 800.981333 761.941333 768.554667 761.941333 678.229333 835.84 604.757333 926.677333 604.757333 927.616 603.008 928.810667 600.106667 929.578667 595.882667 934.016 571.818667 938.666667 537.386667 938.666667 512.298667 938.666667 487.253333 934.016 452.778667 929.621333 428.928ZM509.909333 709.717333C400.128 709.717333 310.826667 620.885333 310.826667 511.701333 310.826667 402.517333 400.128 313.685333 509.909333 313.685333 619.690667 313.685333 709.034667 402.517333 709.034667 511.701333 709.034667 620.885333 619.690667 709.717333 509.909333 709.717333ZM509.909333 398.549333C447.232 398.549333 396.16 449.322667 396.16 511.701333 396.16 574.08 447.232 624.853333 509.909333 624.853333 572.672 624.853333 623.701333 574.08 623.701333 511.701333 623.701333 449.322667 572.672 398.549333 509.909333 398.549333Z\" fill=\"#2196f3\"></path>\n</svg>";

  var context = {};

  var tables = {
      TGroups: {
          childs: {
              TFuncs: {
                  childs: {
                      TParams: {
                          fields: {
                              E1: { expr: "Parent().Parent().FName", type: "string" },
                              E2: { expr: "'TParams.E2'", type: "string" },
                              E3: { expr: "Parent().E3", type: "number" },
                              FDescription: { defaultExpr: "''", type: "string" },
                              FIndex: { defaultExpr: "0", type: "number" },
                              FIsOptional: { defaultExpr: "false", type: "boolean" },
                              FName: { defaultExpr: "''", type: "string" },
                              FType: { defaultExpr: "''", type: "string" },
                              ID: { primaryKey: true, type: "number" },
                          },
                      },
                  },
                  fields: {
                      E1: { expr: "Parent().E1", type: "string" },
                      E2: { expr: "FName", type: "string" },
                      E3: { expr: "TParams.Count()", type: "number" },
                      FDescription: { defaultExpr: "''", type: "string" },
                      FLastTime: { defaultExpr: "Now()", type: "date" },
                      FName: { defaultExpr: "'NewName'", type: "string" },
                      FParams: { defaultExpr: "[]", type: "array" },
                      FReturnDescription: { defaultExpr: "''", type: "string" },
                      FReturnType: { defaultExpr: "'string'", type: "string" },
                      ID: { primaryKey: true, type: "number" },
                  },
              },
          },
          fields: {
              E1: { expr: "'count: ' + TFuncs.Count().ToString()", type: "string" },
              E2: { expr: "FName + ' - function ' + E1", type: "string" },
              E3: { expr: "TFuncs.Where('FReturnType==\"string\"').Count()", type: "number" },
              FFuncs: { defaultExpr: "{}", type: "object" },
              FName: { defaultExpr: "'newName'", type: "string" },
              ID: { primaryKey: true, type: "number" },
          },
      },
  };

  function exprSuggestGetExprContinuously(line, pos) {
      // 获取连续的表达式
      var p = pos;
      var t = exprSuggestGetExprBrackets(line, p);
      if (t) {
          var prev = line[p];
          if (prev !== "}") {
              p = p - t.length;
              var iden = exprSuggestGetExprIden(line, p);
              if (iden) {
                  t = iden + t;
                  p = p - iden.length;
                  var part = exprSuggestGetExpr(line, p);
                  if (part) {
                      part += ".";
                  }
                  t = part + t;
              }
              else {
                  if (prev === "]") {
                      prev = line[p];
                      if (prev === "]" || prev === ")") {
                          t = exprSuggestGetExprContinuously(line, p) + t;
                      }
                  }
              }
          }
      }
      else {
          t = null;
      }
      return t;
  }
  function exprSuggestGetExprBrackets(line, pos) {
      // 获取括号匹配
      var str = "";
      var n = 0;
      var r = line[pos];
      var l = r === "]" ? "[" : r === "}" ? "{" : r === ")" ? "(" : "";
      if (l) {
          var c = void 0;
          while (pos >= 0) {
              c = line[pos];
              if (c === r) {
                  n++;
              }
              else if (c === l) {
                  n--;
              }
              str = c + str;
              if (n === 0) {
                  break;
              }
              pos--;
          }
          if (n > 0) {
              str = "";
          }
      }
      return str;
  }
  function exprSuggestGetExprIden(line, pos) {
      // 获取标识符
      var str = "";
      while (pos >= 0) {
          if (line[pos] !== undefined && /[\w,_,$]/.test(line[pos])) {
              str = line[pos] + str;
          }
          else {
              break;
          }
          pos--;
      }
      return str;
  }
  function exprSuggestGetExpr(line, pos) {
      // 获取部分表达式
      var t = null;
      var p = pos;
      if (p > 0) {
          var prev = line[p];
          if (prev === ".") {
              if (p > 0) {
                  p--;
                  prev = line[p];
                  switch (prev) {
                      case "}":
                      case "]":
                      case ")":
                          t = exprSuggestGetExprContinuously(line, p);
                          break;
                      case "\"":
                      case "'":
                          t = "''";
                          break;
                      default:
                          t = exprSuggestGetExprIden(line, p);
                          if (!t) {
                              t = null;
                          }
                          break;
                  }
              }
          }
          else {
              if (" ([{+-!*/%=><&|:,".indexOf(prev) >= 0) {
                  t = "";
              }
          }
      }
      else {
          t = "";
      }
      if (t) {
          var prevIndex = pos - t.length - 1;
          if (line[prevIndex] === ".") {
              t = exprSuggestGetExpr(line, prevIndex) + "." + t;
          }
      }
      return t;
  }
  function exprSuggestInString(line, pos) {
      // 是否在字符串中
      var c = "";
      var backslash = false;
      for (var i = 0; i < pos; i++) {
          if (c !== "" && line[i] === "\\") {
              backslash = !backslash;
          }
          else {
              if (c === line[i] && !backslash) {
                  c = "";
              }
              else if (c === "" && "'\"".indexOf(line[i]) >= 0) {
                  c = line[i];
              }
              backslash = false;
          }
      }
      return !!c;
  }
  function exprSuggestGetInput(line, pos) {
      // 获取输入文本
      var str = "";
      var reg = /[\w,_,$]/;
      if (line[pos] === undefined || !reg.test(line[pos])) {
          pos--;
          str = exprSuggestGetExprIden(line, pos);
      }
      return str;
  }
  function exprSuggestGetPropertyName(object) {
      var r = [];
      for (var name in object) {
          if (object.hasOwnProperty(name)) {
              r.push(name);
          }
      }
      return r;
  }
  function exprSuggest(line, pos, info) {
      var r = null; // null表示无需提示，""表示无限制提示
      var input = "";
      // 解析: 不在字符串中
      if (!exprSuggestInString(line, pos)) {
          // 解析: 获取输入文本
          input = exprSuggestGetInput(line, pos);
          // 解析: 获取部分表达式
          r = exprSuggestGetExpr(line, pos - input.length - 1);
      }
      // 准备: 建议列表
      var suggest = [];
      if (r === "" && input) {
          // 准备: 根函数、字段、环境变量、预留字
          suggest = suggest.concat(exprSuggestGetPropertyName(info.funcs[r]));
          suggest = suggest.concat(exprSuggestGetPropertyName(info.fields));
          suggest = suggest.concat(exprSuggestGetPropertyName(info.childs));
          suggest = suggest.concat(exprSuggestGetPropertyName(info.constants));
          suggest = suggest.concat(exprSuggestGetPropertyName({
              false: false,
              null: null,
              true: true,
          }));
      }
      else if (r) {
          // 准备: 根据计算结果类型
          var v = info.calcExpr(r);
          if (v && !v.errorMsg) {
              if (v.type !== "undefined" && v.type !== "null") {
                  suggest = suggest.concat(exprSuggestGetPropertyName(info.funcs[v.type]));
                  if (v.type === "object") {
                      // 准备: 返回对象时, 添加对象属性
                      suggest = suggest.concat(exprSuggestGetPropertyName(v.toValue()));
                  }
              }
          }
      }
      // 根据输入内容过滤、去重、排序
      suggest = _.sortBy(_.uniq(_.filter(suggest, (function (i) { return function (n) { return s.startsWith(n, i); }; })(input))));
      if (suggest.length === 1 && suggest[0] === input) {
          suggest = [];
      }
      return {
          inputValue: input,
          suggestList: suggest,
      };
  }

  var Expression = (function () {
      function Expression() {
          this.currentNewId = -1;
          this.currentTable = "";
          this.currentField = "";
          this.exprManager = new ExprManager();
          this.data = this.genData();
          this.nameList = [];
          this.primaryKeyMap = {};
          this.cursorMap = {};
          this.childsMap = {};
          this.fieldsMap = {};
          this.eachTables(tables, (function (me) { return function (name, fields, childs) {
              var pk = "";
              for (var key in fields) {
                  if (fields.hasOwnProperty(key)) {
                      if (fields[key].primaryKey) {
                          pk = key;
                          break;
                      }
                  }
              }
              if (me.nameList.length === 0) {
                  me.currentTable = name;
                  me.currentField = pk;
              }
              me.nameList.push(name);
              me.primaryKeyMap[name] = pk;
              me.cursorMap[name] = 0;
              me.fieldsMap[name] = fields || {};
              me.childsMap[name] = childs || {};
          }; })(this));
          this.exprManager.init(this.data, tables, context);
          this.dataLoad();
      }
      Expression.prototype.length = function () {
          return this.nameList.length;
      };
      Expression.prototype.calcExpr = function (line) {
          return this.exprManager.calcExpr(line, this.currentTable, this.cursorMap, {
              FieldDisplayName: this.currentField,
              FieldName: this.currentField,
              FieldValue: this.currentField,
          });
      };
      Expression.prototype.getTableName_T = function (n) {
          return this.nameList[n];
      };
      Expression.prototype.getFields_T = function (n) {
          var name = this.nameList[n];
          return this.fieldsMap[name];
      };
      Expression.prototype.getData_T = function (n) {
          var name = this.nameList[n];
          return this.getData(name, this.data, this.cursorMap);
      };
      Expression.prototype.getCursor_T = function (n) {
          var name = this.nameList[n];
          return this.cursorMap[name];
      };
      Expression.prototype.setCursor_T = function (n, index) {
          var name = this.nameList[n];
          var r = []; // 返回需要更新的表索引号
          if (this.cursorMap[name] !== index) {
              this.cursorMap[name] = index;
              this.nameList.forEach((function (me) { return function (v, i) {
                  if (v.length > name.length && v.indexOf(name) === 0) {
                      var d = me.getData_T(i);
                      me.cursorMap[v] = (d && d.length > 0) ? 0 : -1;
                      r.push(i);
                  }
              }; })(this));
          }
          return r;
      };
      Expression.prototype.getCurrentTableIndex = function () {
          return this.nameList.indexOf(this.currentTable);
      };
      Expression.prototype.setCurrentTableAndField = function (n, field) {
          this.currentTable = this.nameList[n];
          this.currentField = field;
      };
      Expression.prototype.getSuggest = function (line, pos) {
          return exprSuggest(line, pos, {
              calcExpr: (function (me) { return function (l) { return me.calcExpr(l); }; })(this),
              childs: this.childsMap[this.currentTable],
              constants: context,
              fields: this.fieldsMap[this.currentTable],
              funcs: this.exprManager.getFunction(),
          });
      };
      Expression.prototype.checkExpression = function () {
          this.exprManager.resetExpression();
          this.eachTables(tables, (function (me) { return function (name, fields, childs) {
              for (var fieldName in fields) {
                  if (fields.hasOwnProperty(fieldName)) {
                      var field = fields[fieldName];
                      if (field.expr) {
                          me.exprManager.addExpression(field.expr, name, fieldName, ["load", "add", "update", "remove"], me.doCalcExpr, me);
                      }
                      else if (field.defaultExpr) {
                          me.exprManager.addExpression(field.defaultExpr, name, fieldName, ["add"], me.doCalcExpr, me);
                      }
                  }
              }
          }; })(this));
          return this.exprManager.checkAndSort();
      };
      Expression.prototype.dataLoad = function () {
          var msg = this.checkExpression();
          if (!msg) {
              this.nameList.forEach((function (me) { return function (name, index) {
                  var info = {
                      entityName: name,
                      propertyName: null,
                  };
                  me.exprManager.calcExpression("load", info);
              }; })(this));
          }
          else {
              window.console.error(msg);
          }
          return this;
      };
      Expression.prototype.dataAdd = function (n) {
          var data = this.getData_T(n);
          var name = this.nameList[n];
          data.push(this.newData(n));
          this.setCursor_T(n, data.length - 1);
          var info = {
              entityName: name,
              propertyName: null,
          };
          this.exprManager.calcExpression("add", info);
          return this;
      };
      Expression.prototype.dataUpdate = function (n, fieldName, value) {
          var data = this.getData_T(n);
          var name = this.nameList[n];
          var index = this.cursorMap[name];
          if (index >= 0) {
              data[index][fieldName] = value;
              var info = {
                  entityName: name,
                  propertyName: fieldName,
              };
              this.exprManager.calcExpression("update", info);
          }
          return this;
      };
      Expression.prototype.dataRemove = function (n) {
          var data = this.getData_T(n);
          var name = this.nameList[n];
          var index = this.cursorMap[name];
          if (index >= 0) {
              data.splice(index, 1);
              if (index >= data.length) {
                  this.setCursor_T(n, data.length - 1);
              }
              var info = {
                  entityName: name,
                  propertyName: null,
              };
              this.exprManager.calcExpression("remove", info);
          }
          return this;
      };
      Expression.prototype.eachTables = function (ts, callback, pName) {
          if (ts) {
              for (var t in ts) {
                  if (ts.hasOwnProperty(t)) {
                      var name = pName ? pName + "." + t : t;
                      callback.call(this, name, ts[t].fields, ts[t].childs);
                      this.eachTables(ts[t].childs, callback, name);
                  }
              }
          }
      };
      Expression.prototype.getData = function (name, d, cursor) {
          var n = "";
          var names = name.split(".");
          for (var i = 0; i < names.length; i++) {
              var v = names[i];
              n += (n ? "." : "") + v;
              if (d) {
                  d = d[v];
                  if (i < names.length - 1 && d) {
                      d = d[cursor[n]];
                  }
              }
              if (!d) {
                  break;
              }
          }
          return d;
      };
      Expression.prototype.genData = function () {
          var idGroups = 0;
          var idFuncs = 0;
          var idParams = 0;
          function genParams(func) {
              var rps = [];
              var ps = func.p;
              var pl = func.getLocale().p;
              var p = String(func.fn).match(/\(.*\)/)[0].replace(/[\(\)\s]/g, "").split(",");
              for (var i = 0; i < ps.length; i++) {
                  var type = ps[i];
                  var desc = pl[i];
                  var isOptional = false;
                  if (type.indexOf("?") === type.length - 1) {
                      type = type.replace("?", "");
                      desc = desc.replace("?", "");
                      isOptional = true;
                  }
                  var paramItem = {
                      FDescription: desc,
                      FIndex: i + 1,
                      FIsOptional: isOptional,
                      FName: p[i + p.length - ps.length],
                      FType: type,
                      ID: idParams++,
                  };
                  rps.push(paramItem);
              }
              return rps;
          }
          function genFuncs(funcs) {
              var rfs = [];
              for (var name in funcs) {
                  if (funcs.hasOwnProperty(name)) {
                      var f = funcs[name];
                      var params = genParams(f);
                      var l = f.getLocale();
                      var funcItem = {
                          FDescription: l.fn,
                          FLastTime: new Date(),
                          FName: name,
                          FParams: f.p,
                          FReturnDescription: l.r,
                          FReturnType: f.r,
                          ID: idFuncs++,
                          TParams: params,
                      };
                      rfs.push(funcItem);
                  }
              }
              return rfs;
          }
          function genGroups(groups) {
              var rgs = [];
              for (var name in groups) {
                  if (groups.hasOwnProperty(name)) {
                      var g = groups[name];
                      var o = {};
                      var funcs = genFuncs(g);
                      for (var _i = 0, funcs_1 = funcs; _i < funcs_1.length; _i++) {
                          var func = funcs_1[_i];
                          o[func.FName] = func.FReturnType;
                      }
                      var groupItem = {
                          FFuncs: o,
                          FName: name,
                          ID: idGroups++,
                          TFuncs: funcs,
                      };
                      rgs.push(groupItem);
                  }
              }
              return rgs;
          }
          return {
              TGroups: genGroups(this.exprManager.getFunction()),
          };
      };
      Expression.prototype.newId = function () {
          return this.currentNewId--;
      };
      Expression.prototype.newData = function (n) {
          var name = this.nameList[n];
          var r = {};
          var pk = this.primaryKeyMap[name];
          if (pk) {
              r[pk] = this.newId();
          }
          var childs = this.childsMap[name];
          if (childs) {
              for (var subName in childs) {
                  if (childs.hasOwnProperty(subName)) {
                      r[subName] = [];
                  }
              }
          }
          return r;
      };
      Expression.prototype.doCalcExpr = function (type, info) {
          var exprStr = info.exprInfo.expr;
          var cursor = _.clone(this.cursorMap);
          switch (type) {
              case "remove":
              case "update":
              case "add":
                  this.doCalcExprValue(exprStr, cursor, info.exprInfo);
                  break;
              case "load":
              default:
                  var name = info.entityName;
                  this.doCalcExprLoad(exprStr, cursor, info.exprInfo, name, 0);
                  break;
          }
      };
      Expression.prototype.doCalcExprLoad = function (exprStr, dataCursor, exprInfo, name, level) {
          var cursor = _.clone(dataCursor);
          var names = name.split(".");
          var nameList = [];
          for (var i = 0; i <= level; i++) {
              nameList.push(names[i]);
          }
          var n = nameList.join(".");
          var data = this.getData(n, this.data, cursor);
          for (var i = 0; i < data.length; i++) {
              cursor[n] = i;
              if (names.length === nameList.length) {
                  this.doCalcExprValue(exprStr, cursor, exprInfo);
              }
              else {
                  this.doCalcExprLoad(exprStr, cursor, exprInfo, name, level + 1);
              }
          }
      };
      Expression.prototype.doCalcExprValue = function (exprStr, dataCursor, exprInfo) {
          var _this = this;
          var cursor = _.clone(dataCursor);
          var entityName = exprInfo.entityName;
          var calcExprAndSetValue = function (record) {
              var value = _this.exprManager.calcExpr(exprStr, entityName, cursor, {
                  FieldDisplayName: "",
                  FieldName: exprInfo.propertyName,
                  FieldValue: "",
              });
              record[exprInfo.propertyName] = value.toValue();
          };
          var eachBranch = function (name, data) {
              for (var i = 0; i < data.length; i++) {
                  cursor[name] = i;
                  if (name === entityName) {
                      calcExprAndSetValue.call(_this, data[i]);
                  }
                  else {
                      var nextName = name + "." + entityName.replace(name + ".", "").split(".")[0];
                      eachBranch.call(_this, nextName, _this.getData(nextName, _this.data, cursor));
                  }
              }
          };
          switch (exprInfo.updateMode) {
              case "Single":
                  var data = this.getData(entityName, this.data, cursor);
                  var index = cursor[entityName];
                  if (index < data.length) {
                      calcExprAndSetValue.call(this, data[index]);
                  }
                  break;
              default:
                  var rootName = void 0;
                  switch (exprInfo.updateMode) {
                      case "BranchUpdate":
                          rootName = exprInfo.updateTarget;
                          break;
                      case "BranchDelete":
                      case "All":
                      default:
                          rootName = entityName.split(".")[0];
                          break;
                  }
                  eachBranch.call(this, rootName, this.getData(rootName, this.data, cursor));
          }
          return;
      };
      return Expression;
  }());

  var image_prompt_svg_tpl = "<svg width=\"11\" height=\"11\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n    <path fill=\"#272636\" d=\"M348.93824 961.816576c-31.985664 0-63.977472-12.214272-88.409088-36.624384-48.8448-48.83456-48.8448-128.01536 0-176.83456l236.833792-236.84096L260.529152 274.690048c-48.8448-48.835584-48.8448-128.014336 0-176.841728 48.84992-48.821248 127.997952-48.821248 176.84992 0l325.251072 325.24288c23.45472 23.463936 36.622336 55.258112 36.622336 88.425472 0 33.159168-13.166592 64.960512-36.622336 88.424448L437.379072 925.192192C412.951552 949.602304 380.96896 961.816576 348.93824 961.816576z\"></path>\n</svg>";

  var image_trash_svg_tpl = "<svg width=\"17\" height=\"17\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n    <path fill=\"#000\" d=\"M173.942611 173.061544l677.733649 0 0 35.670407L173.942611 208.731952 173.942611 173.061544zM691.160449 957.805392 334.458421 957.805392c-19.318998 0-35.670407-6.315846-49.043996-18.957771-13.383822-12.58462-20.812001-29.306466-22.295795-50.157353l-53.505611-695.568852 35.670407-4.461615 53.505611 695.568852c2.967588 25.311479 14.857383 37.905308 35.670407 37.905308l356.702028 0c20.802792 0 32.692586-12.593829 35.670407-37.905308l53.504588-695.568852 35.670407 4.461615-53.504588 695.568852c-1.483794 19.318998-9.293667 35.670407-23.409153 49.043996C724.975603 951.108876 708.995653 957.805392 691.160449 957.805392zM673.325245 190.896748l-35.670407 0 0-53.505611c0-23.741727-11.889795-35.670407-35.670407-35.670407L423.63444 101.720729c-23.780613 0-35.670407 11.927657-35.670407 35.670407l0 53.505611-35.670407 0 0-53.505611c0-20.812001 6.687306-37.905308 20.060895-51.27992 13.383822-13.373589 30.466895-20.060895 51.27992-20.060895l178.351014 0c20.802792 0 37.896098 6.687306 51.27992 20.060895 13.373589 13.373589 20.060895 30.466895 20.060895 51.27992L673.326269 190.896748zM405.799236 280.071743l17.835204 570.72345-35.670407 0L370.128829 280.071743 405.799236 280.071743zM494.974231 280.071743l35.670407 0 0 570.72345-35.670407 0L494.974231 280.071743zM619.820658 280.071743l35.670407 0-17.835204 570.72345-35.670407 0L619.820658 280.071743z\"></path>\n</svg>";

  var image_result_svg_tpl = "<svg width=\"11\" height=\"11\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n    <path fill=\"#272636\" d=\"M674.208768 61.232128c31.985664 0 63.978496 12.214272 88.410112 36.624384 48.845824 48.835584 48.845824 128.016384 0 176.835584L525.784064 511.532032l236.833792 236.827648c48.845824 48.83456 48.845824 128.014336 0 176.841728-48.84992 48.821248-127.997952 48.821248-176.84992 0l-325.251072-325.24288c-23.45472-23.463936-36.622336-55.258112-36.622336-88.425472 0-33.159168 13.166592-64.960512 36.622336-88.424448l325.251072-325.25312C610.195456 73.445376 642.178048 61.232128 674.208768 61.232128z\"></path>\n    <circle fill=\"#272636\" cx=\"899\" cy=\"511.532032\" r=\"125\" stroke=\"black\" stroke-width=\"0\"/>\n</svg>";

  var image_warning_svg_tpl = "<svg width=\"14\" height=\"14\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n    <path d=\"M511.481 55.871c-262.844 0-475.863 213.052-475.863 475.857 0 262.812 213.019 475.869 475.863 475.869 262.772 0 475.863-213.058 475.863-475.869 0.001-262.805-213.091-475.857-475.863-475.857zM510.053 870.974c-38.007 0-68.749-30.746-68.749-68.749 0-37.969 30.74-68.749 68.749-68.749 38.001 0 68.749 30.78 68.749 68.749-0.001 38.002-30.748 68.749-68.749 68.749zM600.086 359.913c0 0.124-0.034 0.246-0.067 0.498l-0.061 0.219-0.095 0.493-0.029 0.185-0.061 0.37-0.067 0.308c0 0-58.055 270.212-58.083 270.71 0 0 3.997-20.356 0 0.034-3.997 20.389-14.158 31.569-31.569 31.569-17.439 0-26.593-12.922-31.972-33.865s-56.538-262.464-56.572-262.683c0 0-0.029-0.095-0.061-0.219l-0.034-0.213c-0.034-0.157-0.090-0.314-0.090-0.47l-0.061-0.37-0.061-0.341c-0.029-0.090-0.061-0.341-0.061-0.341l-0.061-0.37-0.061-0.157-0.095-0.526c0 0-0.034-0.213-0.061-0.308l-0.061-0.341c0 0-0.034-0.246-0.095-0.493 0 0 0-0.095-0.029-0.19l-0.034-0.246c0 0-0.090-0.308-0.124-0.465l-0.061-0.37-0.061-0.347-0.061-0.308-0.061-0.37-0.034-0.185-0.095-0.493-0.061-0.347c0 0-0.055-0.246-0.055-0.37-1.236-6.013-1.92-12.267-1.92-18.649 0-50.811 41.104-91.953 91.948-91.953 50.839 0 91.953 41.142 91.953 91.953-0.005 6.386-0.689 12.64-1.926 18.652z\" fill=\"#272636\"></path>\n</svg>";

  function getValueType(value) {
      if (value === null) {
          return "null";
      }
      else {
          return Object.prototype.toString.call(value).replace("[object ", "").replace("]", "").toLowerCase();
      }
  }
  function formatValue(v, type) {
      var r = "";
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
  function parserValue(v, type) {
      var value;
      if (_.isEmpty(v)) {
          value = null;
      }
      else if (type === "date") {
          var m = moment(v);
          value = (m.isValid()) ? m.toDate() : NaN;
      }
      else {
          try {
              value = JSON.parse(v);
          }
          catch (error) {
              value = NaN;
          }
      }
      return value;
  }
  function htmlEncode(value) {
      return $("<div/>").text(value).html();
  }
  var ShowFocusType;
  (function (ShowFocusType) {
      ShowFocusType[ShowFocusType["Height"] = 0] = "Height";
      ShowFocusType[ShowFocusType["Width"] = 1] = "Width";
      ShowFocusType[ShowFocusType["HeightAndWidth"] = 2] = "HeightAndWidth";
  })(ShowFocusType || (ShowFocusType = {}));
  function doShowFocus(container, selected, outerFn, scrollFn, pos) {
      var containerHeight = container[outerFn]();
      var selectedHeight = selected[outerFn]();
      var positionBottom = pos + selectedHeight;
      if (pos >= 0 || (positionBottom <= containerHeight)) {
          var start = container[scrollFn]();
          if (selectedHeight > containerHeight) {
              if (pos > 0) {
                  container[scrollFn](start + pos);
              }
              else if (positionBottom < containerHeight) {
                  container[scrollFn](start + positionBottom - containerHeight);
              }
          }
          else {
              if (pos < 0) {
                  container[scrollFn](start + pos);
              }
              else if (positionBottom > containerHeight) {
                  container[scrollFn](start + positionBottom - containerHeight);
              }
          }
      }
  }
  function showFocus(container, selected, type) {
      if (container && selected && selected.length > 0) {
          var position = selected.position();
          if (type === ShowFocusType.Height || type === ShowFocusType.HeightAndWidth) {
              doShowFocus(container, selected, "outerHeight", "scrollTop", position.top);
          }
          if (type === ShowFocusType.Width || type === ShowFocusType.HeightAndWidth) {
              doShowFocus(container, selected, "outerWidth", "scrollLeft", position.left);
          }
      }
  }

  var hotkeyName = "hotkeys";
  var hotkeyBodyMousetrap = null;
  var hotkeyCurrentView = null;
  var hotkeyIsEditable = function (element) {
      return element.tagName === "INPUT" || element.tagName === "SELECT" || element.tagName === "TEXTAREA" ||
          element.contentEditable && element.contentEditable === "true";
  };
  var hotkeyGetCallback = function (element, combo, type) {
      var hotkeys = $(element).data(hotkeyName);
      var callback = null;
      if (hotkeys) {
          var name = combo + "|" + (type || "");
          callback = hotkeys[name];
          if (!callback) {
              name = combo + "|";
              callback = hotkeys[name];
          }
      }
      return callback;
  };
  var hotkeyBodyCallback = function (e, combo) {
      var callback = null;
      if (hotkeyCurrentView) {
          var elements = hotkeyCurrentView.$el.parents("." + hotkeyName).add(hotkeyCurrentView.$el);
          for (var i = elements.length - 1; i >= 0; i--) {
              callback = hotkeyGetCallback(elements[i], combo, e.type);
              if (callback) {
                  break;
              }
          }
      }
      else {
          callback = hotkeyGetCallback(window.document.body, combo, e.type);
      }
      if (callback) {
          return callback.call(window, e, combo);
      }
  };
  var hotkeyBodyStopCallback = function (e, element, combo) {
      return "esc" === combo ? false : hotkeyIsEditable(element);
  };
  var hotkeyInputStopCallback = function (e, element, combo) {
      return !hotkeyIsEditable(element);
  };
  var hotkeyBindElement = function (element, keys, callback, action) {
      var el = $(element);
      if (hotkeyIsEditable(element)) {
          var trap = el.data(hotkeyName);
          if (!trap) {
              trap = new Mousetrap(element);
              trap.stopCallback = hotkeyInputStopCallback;
              el.data(hotkeyName, trap);
          }
          trap.bind(keys, callback, action);
      }
      else {
          if (!hotkeyBodyMousetrap) {
              hotkeyBodyMousetrap = new Mousetrap(window.document.body);
              hotkeyBodyMousetrap.stopCallback = hotkeyBodyStopCallback;
          }
          var hotkeys = el.addClass(hotkeyName).data(hotkeyName) || {};
          if (keys instanceof Array) {
              for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                  var key = keys_1[_i];
                  hotkeys[key + "|" + (action || "")] = callback;
              }
          }
          else {
              hotkeys[keys + "|" + (action || "")] = callback;
          }
          el.data(hotkeyName, hotkeys);
          hotkeyBodyMousetrap.bind(keys, hotkeyBodyCallback, action);
      }
  };
  var hotkeyBindGlobal = function (keys, callback, action) {
      hotkeyBindElement(window.document.body, keys, callback, action);
  };
  var hotkeyBindView = function (view, keys, callback, action) {
      hotkeyBindElement(view.$el.get(0), keys, callback, action);
  };
  var hotkey = {
      bindElement: hotkeyBindElement,
      bindGlobal: hotkeyBindGlobal,
      bindView: hotkeyBindView,
      getCurrentView: function () {
          return hotkeyCurrentView;
      },
      setCurrentView: function (view, disableFocus) {
          if (hotkeyCurrentView !== view) {
              var blurName = "hotkeyBlur";
              if (hotkeyCurrentView && _.isFunction(hotkeyCurrentView[blurName])) {
                  hotkeyCurrentView[blurName]();
              }
              hotkeyCurrentView = view;
              var focusName = "hotkeyFocus";
              if (!disableFocus && hotkeyCurrentView && _.isFunction(hotkeyCurrentView[focusName])) {
                  hotkeyCurrentView[focusName]();
              }
          }
      },
  };

  var result_tpl = "<div class=\"result-empty\"></div>\n<div class=\"result-rows\"></div>";

  var ObjectPrefixType;
  (function (ObjectPrefixType) {
      ObjectPrefixType[ObjectPrefixType["None"] = 0] = "None";
      ObjectPrefixType[ObjectPrefixType["Array"] = 1] = "Array";
      ObjectPrefixType[ObjectPrefixType["Object"] = 2] = "Object";
  })(ObjectPrefixType || (ObjectPrefixType = {}));
  var Result = (function (_super) {
      __extends(Result, _super);
      function Result() {
          _super.apply(this, arguments);
      }
      Result.prototype.add = function (line, value) {
          this.items[this.itemId] = {
              itemLine: line,
              itemValue: value,
          };
          var lineRow = "<div class='result-row' data-id='" + this.itemId +
              "'><div class='result-line-prompt'>" +
              image_prompt_svg_tpl + "</div><div class='result-line-content'>" + line + "</div></div>";
          this.$rows.append(lineRow);
          var v = this.genValue(value);
          var vCls = "";
          var vSvg = "";
          if (value.errorMsg) {
              vCls = " warning";
              vSvg = image_warning_svg_tpl;
          }
          else {
              vSvg = image_result_svg_tpl;
          }
          var valueRow = "<div class='result-row" + vCls + "' data-id='" + this.itemId +
              "'><div class='result-value-prompt'>" +
              vSvg + "</div><div class='result-value-content'>" + v + "</div></div>";
          this.$rows.append(valueRow);
          this.itemId++;
          this.$el.scrollTop(this.$rows.height());
          return this.refresh();
      };
      Result.prototype.refresh = function () {
          var emptyHeight = this.$el.height() - this.$rows.height();
          emptyHeight = emptyHeight > 0 ? emptyHeight : 0;
          this.$(".result-empty").height(emptyHeight);
          this.$(".result-line-content").width(this.$el.outerWidth() -
              this.$(".result-line-prompt").outerWidth());
          this.$(".result-value-content").width(this.$el.outerWidth() -
              this.$(".result-value-prompt").outerWidth());
          if (emptyHeight === 0) {
              // 焦点显示
              var focusCell = this.$(".result-row.selected");
              showFocus(this.$el, focusCell, ShowFocusType.Height);
          }
          return this;
      };
      Result.prototype.clear = function () {
          this.items = [];
          this.itemId = 0;
          this.$rows.html("");
          return this.refresh();
      };
      Result.prototype.hotkeyFocus = function () {
          this.doClickEmpty();
          return this;
      };
      Result.prototype.hotkeyBlur = function () {
          this.$(".result-row").removeClass("selected");
          return this;
      };
      Result.prototype.preinitialize = function () {
          this.items = [];
          this.itemId = 0;
          this.className = "result-view";
          this.events = {
              "click .result-empty": this.doClickEmpty,
              "click .result-row": this.doClickRow,
              "click .result-row-warning": this.doClickRow,
              "click .result-value": this.doClickValue,
          };
      };
      Result.prototype.initialize = function () {
          $(window).resize((function (me) { return function () {
              me.refresh();
          }; })(this));
          this.renderBasic();
          this.initHotkey();
      };
      Result.prototype.doClickRow = function (e) {
          var t = this.$(e.target);
          if (!t.hasClass("result-row")) {
              t = t.parents(".result-row");
          }
          t.addClass("selected").siblings().removeClass("selected");
          hotkey.setCurrentView(this, true);
          this.triggerClickItem(t.data("id"));
          return this;
      };
      Result.prototype.doClickValue = function (e) {
          var t = this.$(e.target);
          if (!t.hasClass("result-value")) {
              t = t.parents(".result-value");
          }
          if (t.hasClass("collapsed")) {
              this.expandedValue(t);
          }
          else if (t.hasClass("expanded")) {
              this.collapsedValue(t);
          }
          hotkey.setCurrentView(this, true);
          return this;
      };
      Result.prototype.doClickEmpty = function () {
          this.$(".result-row").removeClass("selected");
          this.trigger("clickempty");
          return this;
      };
      Result.prototype.renderBasic = function () {
          this.$el.html(result_tpl);
          this.$rows = this.$(".result-rows");
          return this;
      };
      Result.prototype.initHotkey = function () {
          var _this = this;
          hotkey.bindView(this, ["up", "down", "left", "right"], (function (me) { return function (e, combo) {
              var item = me.$rows.children(".selected");
              if (combo === "up") {
                  var newItem = item.prev();
                  if (newItem.length > 0) {
                      item.removeClass("selected");
                      newItem.addClass("selected");
                      me.triggerClickItem(newItem.data("id"));
                      me.refresh();
                  }
              }
              else if (combo === "down") {
                  var newItem = item.next();
                  if (newItem.length > 0) {
                      item.removeClass("selected");
                      newItem.addClass("selected");
                      me.triggerClickItem(newItem.data("id"));
                      me.refresh();
                  }
              }
              else if (combo === "left") {
                  var rootVlaue = item.find(".result-value:first");
                  _this.collapsedValue(rootVlaue);
              }
              else if (combo === "right") {
                  var rootVlaue = item.find(".result-value:first");
                  _this.expandedValue(rootVlaue);
              }
              e.stopPropagation();
              e.preventDefault();
          }; })(this));
          hotkey.bindView(this, ["esc"], (function (me) { return function (e, combo) {
              me.doClickEmpty();
          }; })(this));
          return this;
      };
      Result.prototype.triggerClickItem = function (id) {
          this.trigger("clickitem", this.items[id].itemLine, this.items[id].itemValue);
          return this;
      };
      Result.prototype.genValue = function (value) {
          var v;
          if (value.errorMsg) {
              v = "<div class='result-value'>" + value.errorMsg + "</div>";
          }
          else {
              v = value.toValue();
              v = (value.type === "array") ? "<ul>" + this.genArrayValue(v, ObjectPrefixType.None) + "</ul>" :
                  (value.type === "object") ? "<ul>" + this.genObjectValue(v, ObjectPrefixType.None) + "</ul>" :
                      "<div class='result-value'>" + this.genJSONValue(v) + "</div>";
          }
          return v;
      };
      Result.prototype.getValuePrefixClass = function (op) {
          return (op === ObjectPrefixType.Array) ? "array" :
              (op === ObjectPrefixType.Object) ? "object" :
                  "none";
      };
      Result.prototype.getValuePrefix = function (v, typeName, op, prefix, hasChild) {
          var collapsed = hasChild ? " collapsed" : " nochild";
          var r = "<li class='result-prefix-" + this.getValuePrefixClass(op) +
              "'><div class='result-value" + collapsed + "'>";
          if (op === ObjectPrefixType.Array) {
              r += "<span class='result-style-index'>" + prefix + "</span>";
          }
          r += "<span class='result-value-expand'><div class='result-value-expand-icon'></div></span>";
          if (op === ObjectPrefixType.Object) {
              var vType = getValueType(v);
              var vTypeIcon = vType[0].toUpperCase();
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
      };
      Result.prototype.genArrayValue = function (v, op, prefix) {
          var r = "";
          var hasChild = v.length > 0;
          for (var i = 0; i < v.length; i++) {
              var value = v[i];
              var t = getValueType(value);
              if (t === "array") {
                  r += this.genArrayValue(value, ObjectPrefixType.Array, i);
              }
              else if (t === "object") {
                  r += this.genObjectValue(value, ObjectPrefixType.Array, i);
              }
              else {
                  r += "<li class='result-prefix-" + this.getValuePrefixClass(ObjectPrefixType.Array) +
                      "'><div class='result-value nochild'><span class='result-style-index'>" + i +
                      "</span><span class='result-value-expand'></span>" +
                      this.genJSONValue(value) + "</div></li>";
              }
          }
          r = this.getValuePrefix(v, "Array", op, prefix, hasChild) + r + "</ul></li>";
          return r;
      };
      Result.prototype.genObjectValue = function (v, op, prefix) {
          var r = "";
          var hasChild = false;
          for (var key in v) {
              if (v.hasOwnProperty(key)) {
                  hasChild = true;
                  var value = v[key];
                  var t = getValueType(value);
                  if (t === "array") {
                      r += this.genArrayValue(value, ObjectPrefixType.Object, key);
                  }
                  else if (t === "object") {
                      r += this.genObjectValue(value, ObjectPrefixType.Object, key);
                  }
                  else {
                      var vType = getValueType(value);
                      var vTypeIcon = vType[0].toUpperCase();
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
      };
      Result.prototype.genJSONValue = function (v) {
          var r;
          var t = getValueType(v);
          switch (t) {
              case "array":
                  r = "[";
                  for (var _i = 0, v_1 = v; _i < v_1.length; _i++) {
                      var item = v_1[_i];
                      if (r !== "[") {
                          r += ", ";
                      }
                      r += this.genJSONValue(item);
                  }
                  r += "]";
                  break;
              case "object":
                  r = "{";
                  for (var key in v) {
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
      };
      Result.prototype.collapsedValue = function (el) {
          if (el.hasClass("expanded")) {
              el.removeClass("expanded").addClass("collapsed");
              el.siblings("ul").hide();
              this.refresh();
          }
          return this;
      };
      Result.prototype.expandedValue = function (el) {
          if (el.hasClass("collapsed")) {
              el.removeClass("collapsed").addClass("expanded");
              el.siblings("ul").show();
              this.refresh();
          }
          return this;
      };
      return Result;
  }(View));

  var shape_tpl = "<div class=\"shape-item\"></div>";

  var Shape = (function (_super) {
      __extends(Shape, _super);
      function Shape() {
          _super.apply(this, arguments);
      }
      Shape.prototype.setName = function (name) {
          var css = { bottom: "", display: "", height: "", left: "", right: "", top: "", width: "" };
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
      };
      Shape.prototype.setColor = function (color) {
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
      };
      Shape.prototype.setWidth = function (width) {
          this.$el.width(width || 16);
          return this;
      };
      Shape.prototype.setHeight = function (height) {
          this.$el.height(height || 12);
          return this;
      };
      Shape.prototype.preinitialize = function () {
          this.className = "shape-view";
      };
      Shape.prototype.initialize = function (opts) {
          opts = opts || {};
          this.$el.html(shape_tpl);
          this.$item = this.$(".shape-item");
          opts.attributes = opts.attributes || {};
          this.setName(opts.attributes.name);
          this.setColor(opts.attributes.color);
          this.setWidth(opts.attributes.width);
          this.setHeight(opts.attributes.height);
      };
      return Shape;
  }(View));
  var ShapeColor;
  (function (ShapeColor) {
      ShapeColor[ShapeColor["SHAPE_COLOR_DISABLED"] = 0] = "SHAPE_COLOR_DISABLED";
      ShapeColor[ShapeColor["SHAPE_COLOR_ENABLED"] = 1] = "SHAPE_COLOR_ENABLED";
  })(ShapeColor || (ShapeColor = {}));
  var ShapeName;
  (function (ShapeName) {
      ShapeName[ShapeName["SHAPE_NAME_AREA_BOTTOM"] = 0] = "SHAPE_NAME_AREA_BOTTOM";
      ShapeName[ShapeName["SHAPE_NAME_AREA_LEFT"] = 1] = "SHAPE_NAME_AREA_LEFT";
      ShapeName[ShapeName["SHAPE_NAME_AREA_RIGHT"] = 2] = "SHAPE_NAME_AREA_RIGHT";
      ShapeName[ShapeName["SHAPE_NAME_AREA_TOP"] = 3] = "SHAPE_NAME_AREA_TOP";
      ShapeName[ShapeName["SHAPE_NAME_LAYOUT_HORIZONTAL"] = 4] = "SHAPE_NAME_LAYOUT_HORIZONTAL";
      ShapeName[ShapeName["SHAPE_NAME_LAYOUT_VERTICAL"] = 5] = "SHAPE_NAME_LAYOUT_VERTICAL";
  })(ShapeName || (ShapeName = {}));

  var syntax_tpl = "<div class=\"syntax-col\"></div>\n<div class=\"syntax-tree\"></div>";

  var Syntax = (function (_super) {
      __extends(Syntax, _super);
      function Syntax() {
          _super.apply(this, arguments);
      }
      Syntax.prototype.load = function (line, value) {
          if (this.oldLine !== line) {
              this.oldLine = line;
              this.treeListIndex = [];
              if (value.errorMsg === "") {
                  this.currentIndex = this.oldLine.length > 0 ? 1 : 0;
                  this.$col.html(this.genCol(line));
                  this.$tree.html(this.genTree(value.rootToken));
              }
              else {
                  this.currentIndex = 0;
                  this.$col.html("");
                  this.$tree.html("<span class='syntax-error'>" + value.errorMsg + "</span>");
              }
          }
          return this;
      };
      Syntax.prototype.clear = function () {
          this.$col.html("");
          this.$tree.html("");
          return this;
      };
      Syntax.prototype.hotkeyFocus = function () {
          if (this.currentIndex > 0) {
              this.selectItem(this.currentIndex);
          }
          return this;
      };
      Syntax.prototype.hotkeyBlur = function () {
          if (this.currentIndex > 0) {
              this.resetSelectItem();
          }
          return this;
      };
      Syntax.prototype.preinitialize = function () {
          this.className = "syntax-view";
          this.events = {
              "click ": this.doClick,
              "click .col-item": this.doClickColItem,
              "click .token-item": this.doClickTokenItem,
              "click .token-item-expand": this.doClickExpand,
              "click .token-item-type": this.doClickExpand,
          };
      };
      Syntax.prototype.initialize = function () {
          this.renderBasic();
          this.initHotkey();
      };
      Syntax.prototype.doClick = function () {
          hotkey.setCurrentView(this);
          return this;
      };
      Syntax.prototype.doClickExpand = function (e) {
          var item = this.$(e.target).parents(".token-item");
          if (item.hasClass("expanded")) {
              item.removeClass("expanded").addClass("collapsed");
              item.siblings("ul").hide();
          }
          else if (item.hasClass("collapsed")) {
              item.removeClass("collapsed").addClass("expanded");
              item.siblings("ul").show();
          }
          return this;
      };
      Syntax.prototype.doClickColItem = function (e) {
          var t = this.$(e.target);
          var item = t.hasClass("col-item") ? t : t.parents(".col-item");
          this.selectItem(item.data("id"));
          return this;
      };
      Syntax.prototype.doClickTokenItem = function (e) {
          var t = this.$(e.target);
          var item = t.hasClass("token-item") ? t : t.parents(".token-item");
          this.selectItem(item.data("id"));
          return this;
      };
      Syntax.prototype.renderBasic = function () {
          this.$el.html(syntax_tpl);
          this.$col = this.$(".syntax-col");
          this.$tree = this.$(".syntax-tree");
          return this;
      };
      Syntax.prototype.initHotkey = function () {
          hotkey.bindView(this, ["up", "down", "right", "left"], (function (me) { return function (e, combo) {
              if (me.currentIndex > 0) {
                  if (combo === "left") {
                      if (me.currentIndex === 1) {
                          me.currentIndex = me.oldLine.length;
                      }
                      else {
                          me.currentIndex--;
                      }
                      me.selectItem(me.currentIndex);
                  }
                  else if (combo === "right") {
                      if (me.currentIndex >= me.oldLine.length) {
                          me.currentIndex = 1;
                      }
                      else {
                          me.currentIndex++;
                      }
                      me.selectItem(me.currentIndex);
                  }
                  else if (me.treeListIndex.length > 0) {
                      var index = -1;
                      for (var i = 0; i < me.treeListIndex.length; i++) {
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
                          }
                          else {
                              index--;
                          }
                      }
                      else {
                          if (index === -1) {
                              index = me.treeListIndex.length - 1;
                          }
                          if (index === me.treeListIndex.length - 1) {
                              index = 0;
                          }
                          else {
                              index++;
                          }
                      }
                      me.selectItem(me.treeListIndex[index]);
                  }
                  e.stopPropagation();
                  e.preventDefault();
                  me.showFocusItem();
              }
          }; })(this));
          hotkey.bindView(this, ["meta+right", "meta+left", "meta+up", "meta+down"], (function (me) { return function (e, combo) {
              if (combo === "meta+up") {
                  var items = me.$(".syntax-tree .expanded");
                  items.removeClass("expanded").addClass("collapsed");
                  items.siblings("ul").hide();
              }
              else if (combo === "meta+down") {
                  var items = me.$(".syntax-tree .collapsed");
                  items.removeClass("collapsed").addClass("expanded");
                  items.siblings("ul").show();
              }
              else {
                  var item = me.$(".syntax-tree .selected").first();
                  if (combo === "meta+left" && item.hasClass("expanded")) {
                      item.removeClass("expanded").addClass("collapsed");
                      item.siblings("ul").hide();
                  }
                  else if (combo === "meta+right" && item.hasClass("collapsed")) {
                      item.removeClass("collapsed").addClass("expanded");
                      item.siblings("ul").show();
                  }
              }
          }; })(this));
          return this;
      };
      Syntax.prototype.showFocusItem = function () {
          // 字符串索引焦点
          var focusCell = this.$col.find(".selected");
          showFocus(this.$col, focusCell, ShowFocusType.Width);
          // 语法树节点焦点
          var focusItem = this.$tree.find(".selected").first();
          var parentItems = focusItem.parent("li").parents("li").children(".collapsed");
          parentItems.removeClass("collapsed").addClass("expanded");
          parentItems.siblings("ul").show();
          showFocus(this.$tree, focusItem, ShowFocusType.HeightAndWidth);
          return this;
      };
      Syntax.prototype.genTree = function (rootToken, level) {
          level = level === undefined ? 0 : level;
          var isRoot = level === 0;
          var hasChild = rootToken.childs && rootToken.childs.length > 0;
          var isVCls = rootToken.tokenType.indexOf("V") === 0 ? " virtual" : "";
          var r = (isRoot ? "<ul>" : "") + "<li>";
          var cls = hasChild ? "expanded" : "none";
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
              for (var _i = 0, _a = rootToken.childs; _i < _a.length; _i++) {
                  var item = _a[_i];
                  r += this.genTree(item, level + 1);
              }
              r += "</ul>";
          }
          r += "</li>" + (isRoot ? "<ul>" : "");
          return r;
      };
      Syntax.prototype.genCol = function (line) {
          var l = [];
          for (var i = 1; i <= line.length; i++) {
              l.push((i + "").split("").pop());
          }
          var cs = line.split("");
          var r = "";
          l.forEach(function (element, i) {
              var t = cs[i] === " " ? "&nbsp;" : cs[i];
              r += "<span data-id=" + (i + 1) + " class='col-item item-" + (i + 1) + "'>" +
                  "<div class='token-col-index'>" + element + "</div>" +
                  "<div class='token-col-text'>" + t + "</div>" +
                  "</span>";
          });
          return r;
      };
      Syntax.prototype.resetSelectItem = function () {
          this.$(".token-item").removeClass("selected");
          this.$(".col-item").removeClass("selected");
          return this;
      };
      Syntax.prototype.selectItem = function (index) {
          this.currentIndex = index;
          this.resetSelectItem();
          this.$(".item-" + index).addClass("selected");
          return this;
      };
      return Syntax;
  }(View));

  var terminal_tpl = "<div class=\"terminal-tpyer-hidden\"><input class=\"terminal-typer\"></input></div>\n<div class=\"terminal-text\"><span class=\"cursor\">&nbsp;</span></div>\n<ul class=\"terminal-suggest\"></ul>";

  var Terminal = (function (_super) {
      __extends(Terminal, _super);
      function Terminal() {
          _super.apply(this, arguments);
      }
      Terminal.prototype.focus = function () {
          this.$typer.focus();
          return this;
      };
      Terminal.prototype.setExpression = function (v) {
          this.expression = v;
          return this;
      };
      Terminal.prototype.clear = function () {
          this.$typer.val("");
          return this.focus();
      };
      Terminal.prototype.hotkeyFocus = function () {
          return this.focus();
      };
      Terminal.prototype.preinitialize = function () {
          this.className = "terminal-view";
          this.events = {
              "blur .terminal-typer": this.doBlur,
              "change .terminal-typer": this.internalRefresh,
              "dblclick .terminal-text": this.doDblClick,
              "focus .terminal-typer": this.doFocus,
              "input .terminal-typer": this.internalRefresh,
              "keydown .terminal-typer": this.internalRefresh,
              "keypress .terminal-typer": this.internalRefresh,
              "mousedown .terminal-text": this.doMousedown,
              "mousemove .terminal-text": this.doMousemove,
              "mouseup .terminal-text": this.doMouseup,
              "paste .terminal-typer": this.internalRefresh,
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
      };
      Terminal.prototype.initialize = function () {
          this.renderBasic();
          this.$typer = this.$(".terminal-typer");
          this.$text = this.$(".terminal-text");
          this.$suggest = this.$(".terminal-suggest");
          this.initHotkey();
      };
      Terminal.prototype.doMousedown = function (e) {
          var t = this.$(e.target);
          if (t.parent().hasClass("terminal-text")) {
              this.dragging = true;
              this.draggingStartX = t.position().left + e.offsetX;
              this.draggingEndX = this.draggingStartX;
              this.refreshSelection();
          }
          else if (t.hasClass("terminal-text")) {
              this.dragging = true;
              this.draggingStartX = e.offsetX;
              this.draggingEndX = this.draggingStartX;
              this.refreshSelection();
          }
          return this;
      };
      Terminal.prototype.doMousemove = function (e) {
          if (this.dragging) {
              var t = this.$(e.target);
              if (t.parent().hasClass("terminal-text")) {
                  this.draggingEndX = t.position().left + e.offsetX;
                  this.refreshSelection();
              }
              else if (t.hasClass("terminal-text")) {
                  this.draggingEndX = e.offsetX;
                  this.refreshSelection();
              }
          }
          return this;
      };
      Terminal.prototype.doMouseup = function (e) {
          if (this.dragging) {
              var t = this.$(e.target);
              if (t.parent().hasClass("terminal-text")) {
                  this.draggingEndX = t.position().left + e.offsetX;
                  this.refreshSelection();
                  this.focus();
              }
              else if (t.hasClass("terminal-text")) {
                  this.draggingEndX = e.offsetX;
                  this.refreshSelection();
                  this.focus();
              }
              this.dragging = false;
          }
          return this;
      };
      Terminal.prototype.doDblClick = function () {
          this.setTyperSelection(0, this.$typer.val().length);
          return this.focus();
      };
      Terminal.prototype.doBlur = function () {
          if (!this.changeSelection) {
              this.$text.removeClass("terminal-focus");
          }
          return this;
      };
      Terminal.prototype.doFocus = function () {
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
      };
      Terminal.prototype.renderBasic = function () {
          this.$el.html(terminal_tpl);
          return this;
      };
      Terminal.prototype.initHotkey = function () {
          var input = this.$typer.get(0);
          var keys = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$.".split("");
          keys.push("backspace");
          keys.push("del");
          hotkey.bindElement(input, keys, (function (me) { return function (e, combo) {
              me.tmpKeyCombo = combo;
              me.internalRefresh();
          }; })(this), "keydown");
          keys = ["meta", "esc", "capslock", "shift", "ctrl", "alt"];
          hotkey.bindElement(input, keys, (function (me) { return function (e, combo) {
              if (me.suggestCount > 0) {
                  me.tmpCtrlKeyCombo = combo;
              }
              me.internalRefresh();
          }; })(this), "keydown");
          keys = ["tab", "enter", "right"];
          hotkey.bindElement(input, keys, (function (me) { return function (e, combo) {
              if (me.suggestCount > 0) {
                  var selection = me.getTyperSelection();
                  if (selection.start === selection.end) {
                      me.$typer.val(s.insert(me.$typer.val(), selection.start, me.suggestValue));
                      var pos = selection.start + me.suggestValue.length;
                      me.setTyperSelection(pos, pos);
                      e.stopPropagation();
                      e.preventDefault();
                  }
              }
              else if (combo === "enter") {
                  var cmd = me.$typer.val();
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
          }; })(this), "keydown");
          keys = ["up"];
          hotkey.bindElement(input, keys, (function (me) { return function (e, combo) {
              if (me.suggestCount > 0) {
                  me.tmpCtrlKeyCombo = combo;
              }
              else {
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
          }; })(this), "keydown");
          keys = ["down"];
          hotkey.bindElement(input, keys, (function (me) { return function (e, combo) {
              if (me.suggestCount > 0) {
                  me.tmpCtrlKeyCombo = combo;
              }
              else {
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
          }; })(this), "keydown");
          return this;
      };
      Terminal.prototype.internalRefresh = function () {
          var _this = this;
          if (this.refreshId) {
              clearTimeout(this.refreshId);
          }
          this.refreshId = setTimeout((function (me) { return function () {
              var typer = me.$typer;
              var text = me.$text;
              var selection = me.getTyperSelection();
              // 判断按键
              var val = typer.val();
              if (me.tmpKeyCombo && selection.start === selection.end) {
                  var n = val.length - me.tmpOldValue.length;
                  if (n === 1 || n === -1) {
                      var suggest = me.expression.getSuggest(val, selection.start);
                      if (suggest.suggestList.length > 0) {
                          me.showSuggestBox(suggest.suggestList, suggest.inputValue);
                      }
                      else {
                          me.hideSuggestBox();
                      }
                  }
                  else {
                      me.hideSuggestBox();
                  }
              }
              else if (me.tmpCtrlKeyCombo) {
                  if (me.tmpCtrlKeyCombo === "up") {
                      if (me.suggestIndex === 0) {
                          me.suggestIndex = _this.suggestCount - 1;
                      }
                      else {
                          me.suggestIndex--;
                      }
                  }
                  else if (me.tmpCtrlKeyCombo === "down") {
                      if (me.suggestIndex === _this.suggestCount - 1) {
                          me.suggestIndex = 0;
                      }
                      else {
                          me.suggestIndex++;
                      }
                  }
                  if (me.tmpCtrlKeyCombo === "esc") {
                      me.hideSuggestBox();
                  }
                  else {
                      _this.refreshSuggestBox();
                  }
              }
              else {
                  me.hideSuggestBox();
              }
              me.tmpKeyCombo = "";
              me.tmpCtrlKeyCombo = "";
              me.tmpOldValue = val;
              // 补充span
              var items = text.children();
              var spanCount = val.length + 1 + me.suggestValue.length;
              if (spanCount > items.length) {
                  var l = spanCount - items.length;
                  for (var i = 0; i < l; i++) {
                      text.append("<span></span>");
                  }
              }
              // 填充字符
              var displayValue = s.insert(val, selection.start, me.suggestValue);
              items = text.children();
              for (var i = 0; i < items.length; i++) {
                  var item = $(items[i]);
                  if (i <= displayValue.length) {
                      if (i === displayValue.length) {
                          item.text(" ");
                      }
                      else {
                          item.text(displayValue[i]);
                      }
                  }
                  else {
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
                      for (var i = selection.start; i < selection.start + me.suggestValue.length; i++) {
                          $(items[i]).addClass("suggest");
                      }
                  }
              }
              else {
                  // 已选中
                  for (var i = selection.start; i < selection.end; i++) {
                      $(items[i]).addClass("selected");
                  }
              }
              // 同步滚动条
              var left = typer.scrollLeft();
              text.scrollLeft(left);
              // 刷新建议框位置
              if (me.suggestCount > 0) {
                  var suggestLeft = (selection.start - me.suggestInput.length) * me.getSingleWordWidth() - 9 - left;
                  if (me.$suggest.width() + suggestLeft > me.$text.width()) {
                      suggestLeft = me.$text.width() - me.$suggest.width();
                  }
                  me.$suggest.css("left", suggestLeft);
              }
              // 结束刷新
              me.refreshId = 0;
          }; })(this), 0);
          return this;
      };
      Terminal.prototype.showSuggestBox = function (list, val) {
          this.suggestInput = val;
          var hash = list.join("|");
          if (hash !== this.suggestHash) {
              var h_1 = "";
              var maxLength_1 = 0;
              this.suggestHash = hash;
              this.suggestIndex = 0;
              this.suggestCount = list.length;
              list.forEach((function (me) { return function (value, index) {
                  h_1 += "<li class='id" + index + "'>" + value + "</li>";
                  if (value.length > maxLength_1) {
                      maxLength_1 = value.length;
                  }
              }; })(this));
              // 刷新宽度
              var w = maxLength_1 * this.getSingleWordWidth() + 16;
              if (w > 100) {
                  this.$suggest.css("min-width", w + 20);
              }
              else {
                  this.$suggest.css("min-width", 100);
              }
              this.$suggest.html(h_1).show();
          }
          return this.refreshSuggestBox();
      };
      Terminal.prototype.refreshSuggestBox = function () {
          if (this.suggestIndex >= 0) {
              // 刷新焦点
              this.$suggest.children().removeClass("selected");
              var focusRow = this.$suggest.children(".id" + this.suggestIndex).addClass("selected");
              showFocus(this.$suggest, focusRow, ShowFocusType.Height);
              this.suggestValue = this.suggestHash.split("|")[this.suggestIndex].replace(this.suggestInput, "");
          }
          return this;
      };
      Terminal.prototype.hideSuggestBox = function () {
          this.suggestIndex = -1;
          this.suggestCount = 0;
          this.suggestInput = "";
          this.suggestValue = "";
          this.suggestHash = "";
          this.$suggest.hide();
          return this;
      };
      Terminal.prototype.setTyperSelection = function (start, end) {
          this.changeSelection = true;
          // 设置光标位置
          if (window.document.hasOwnProperty("selection")) {
              // TODO:
              window.console.warn("TODO: 获取光标位置未兼容ie <terminal.ts>");
          }
          else {
              var el = this.$typer.get(0);
              el.setSelectionRange(start, end);
          }
          this.changeSelection = false;
          return this;
      };
      Terminal.prototype.getTyperSelection = function () {
          // 获取光标位置
          var selectionStart;
          var selectionEnd;
          if (window.document.hasOwnProperty("selection")) {
              // TODO:
              window.console.warn("TODO: 获取光标位置未兼容ie <terminal.ts>");
              selectionStart = 0;
              selectionEnd = 0;
          }
          else {
              var el = this.$typer.get(0);
              selectionStart = el.selectionStart;
              selectionEnd = el.selectionEnd;
          }
          return {
              end: selectionEnd,
              start: selectionStart,
          };
      };
      Terminal.prototype.getSingleWordWidth = function () {
          return this.$text.children("span").outerWidth();
      };
      Terminal.prototype.refreshSelection = function () {
          if (this.dragging) {
              this.$text.addClass("terminal-focus");
              var start = Math.min(this.draggingStartX, this.draggingEndX);
              var end = Math.max(this.draggingStartX, this.draggingEndX);
              var items = this.$text.children().removeClass("cursor");
              var startIndex = items.length;
              var endIndex = items.length;
              var selIndex = [];
              for (var i = 0; i < items.length - 1; i++) {
                  var item = this.$(items.get(i));
                  var left = item.position().left;
                  var right = left + this.getSingleWordWidth();
                  if (start <= right && left <= end) {
                      item.addClass("selected");
                      selIndex.push(i);
                  }
                  else {
                      item.removeClass("selected");
                  }
              }
              if (selIndex.length > 0) {
                  startIndex = _.min(selIndex);
                  endIndex = (start === end) ? startIndex : _.max(selIndex) + 1;
              }
              this.setTyperSelection(startIndex, endIndex);
          }
          return this;
      };
      return Terminal;
  }(View));

  var console_tpl = "<div class=\"console-content\">\n    <div class=\"console-terminal\">\n        <div class=\"console-terminal-content\"></div>\n        <div class=\"console-terminal-footer\">\n            <div class=\"console-terminal-prompt\"></div>\n            <div class=\"console-terminal-view\"></div>\n            <div class=\"console-terminal-clear\"></div>\n            <div class=\"console-terminal-split\"></div>\n            <div class=\"console-terminal-left\"></div>\n            <div class=\"console-terminal-right\"></div>\n        </div>\n    </div>\n    <div class=\"console-watch\">\n        <div class=\"console-watch-content\"></div>\n        <div class=\"console-watch-footer\">\n            <div class=\"console-watch-clear\"></div>\n            <div class=\"console-watch-split\"></div>\n            <div class=\"console-watch-left\"></div>\n            <div class=\"console-watch-right\"></div>\n        </div>\n    </div>\n</div>\n<div class=\"console-header\">\n    <div class=\"console-header-title\">console</div>\n</div>";

  var Console = (function (_super) {
      __extends(Console, _super);
      function Console() {
          _super.apply(this, arguments);
      }
      Console.prototype.setExpression = function (v) {
          this.expression = v;
          this.terminalView.setExpression(v);
          return this;
      };
      Console.prototype.refresh = function (isInit) {
          if (this.$el.hasClass("layout-horizontal")) {
              this.iconTerminalLeft.setName(ShapeName.SHAPE_NAME_AREA_LEFT);
              this.iconTerminalRight.setName(ShapeName.SHAPE_NAME_AREA_RIGHT);
              this.iconWatchLeft.setName(ShapeName.SHAPE_NAME_AREA_LEFT);
              this.iconWatchRight.setName(ShapeName.SHAPE_NAME_AREA_RIGHT);
          }
          else {
              this.iconTerminalLeft.setName(ShapeName.SHAPE_NAME_AREA_TOP);
              this.iconTerminalRight.setName(ShapeName.SHAPE_NAME_AREA_BOTTOM);
              this.iconWatchLeft.setName(ShapeName.SHAPE_NAME_AREA_TOP);
              this.iconWatchRight.setName(ShapeName.SHAPE_NAME_AREA_BOTTOM);
          }
          if (this.$el.hasClass("hide-terminal")) {
              this.iconWatchLeft.setColor(ShapeColor.SHAPE_COLOR_DISABLED);
              this.iconWatchRight.setColor(ShapeColor.SHAPE_COLOR_ENABLED);
          }
          else if (this.$el.hasClass("hide-watch")) {
              this.iconTerminalLeft.setColor(ShapeColor.SHAPE_COLOR_ENABLED);
              this.iconTerminalRight.setColor(ShapeColor.SHAPE_COLOR_DISABLED);
          }
          else {
              this.iconWatchLeft.setColor(ShapeColor.SHAPE_COLOR_ENABLED);
              this.iconWatchRight.setColor(ShapeColor.SHAPE_COLOR_ENABLED);
          }
          this.resultView.refresh();
          if (isInit) {
              this.terminalView.focus();
          }
          return this;
      };
      Console.prototype.toggleLayout = function () {
          this.$el.toggleClass("layout-vertical").toggleClass("layout-horizontal");
          return this.refresh();
      };
      Console.prototype.preinitialize = function () {
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
      };
      Console.prototype.initialize = function () {
          this.$el.addClass("layout-vertical show-all");
          this.renderBasic().renderTerminal().renderResult().renderWatch();
      };
      Console.prototype.doClickLeft = function () {
          if (this.$el.hasClass("hide-terminal")) {
              this.$el.removeClass("hide-terminal").addClass("show-all");
          }
          else {
              this.$el.removeClass("hide-watch").removeClass("show-all").addClass("hide-terminal");
          }
          return this.refresh();
      };
      Console.prototype.doClickRight = function () {
          if (this.$el.hasClass("hide-watch")) {
              this.$el.removeClass("hide-watch").addClass("show-all");
          }
          else {
              this.$el.removeClass("hide-terminal").removeClass("show-all").addClass("hide-watch");
          }
          return this.refresh();
      };
      Console.prototype.doClickPrompt = function () {
          this.terminalView.focus();
          return this;
      };
      Console.prototype.doClearResult = function () {
          this.terminalView.clear();
          this.resultView.clear();
          return this;
      };
      Console.prototype.doClearSyntax = function () {
          this.syntaxView.clear();
          return this;
      };
      Console.prototype.renderBasic = function () {
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
      };
      Console.prototype.renderTerminal = function () {
          this.$(".console-terminal-prompt").html(image_prompt_svg_tpl);
          this.terminalView = new Terminal();
          this.terminalView.on("command", (function (me) { return function (line) {
              switch (line) {
                  case "clear":
                  case "clean":
                  case "cls":
                      me.doClearResult();
                      break;
                  default:
                      var v = me.expression.calcExpr(line);
                      me.syntaxView.load(line, v);
                      me.resultView.add(line, v);
                      break;
              }
          }; })(this));
          this.terminalView.$el.appendTo(this.$(".console-terminal-view"));
          return this;
      };
      Console.prototype.renderResult = function () {
          this.resultView = new Result();
          this.resultView.on("clickempty", (function (me) { return function () {
              me.terminalView.focus();
          }; })(this));
          this.resultView.on("clickitem", (function (me) { return function (line, value) {
              me.syntaxView.load(line, value);
          }; })(this));
          this.resultView.$el.appendTo(this.$(".console-terminal-content"));
          return this;
      };
      Console.prototype.renderWatch = function () {
          this.syntaxView = new Syntax();
          this.syntaxView.$el.appendTo(this.$(".console-watch-content"));
          return this;
      };
      return Console;
  }(View));

  var grid0Columns = [{
          dataField: "ID",
          readOnly: true,
          text: "TGroups: ID",
          width: 110,
      }, {
          dataField: "FName",
          text: "FName(s)",
          width: 90,
      }, {
          dataField: "FFuncs",
          text: "FFuncs(o)",
          width: 100,
      }, {
          dataField: "E1",
          readOnly: true,
          text: "E1(s)",
          width: 90,
      }, {
          dataField: "E2",
          readOnly: true,
          text: "E2(s)",
          width: 90,
      }, {
          dataField: "E3",
          readOnly: true,
          text: "E3(n)",
          width: 90,
      }];
  var grid1Columns = [{
          dataField: "ID",
          readOnly: true,
          text: "TFuncs: ID",
          width: 110,
      }, {
          dataField: "FName",
          text: "FName(s)",
          width: 90,
      }, {
          dataField: "FDescription",
          text: "FDescription(s)",
          width: 120,
      }, {
          dataField: "FParams",
          text: "FParams(a)",
          width: 100,
      }, {
          dataField: "FReturnType",
          text: "FReturnType(s)",
          width: 120,
      }, {
          dataField: "FReturnDescription",
          text: "FReturnDescription(s)",
          width: 160,
      }, {
          dataField: "FLastTime",
          text: "FLastTime(d)",
          width: 110,
      }, {
          dataField: "E1",
          readOnly: true,
          text: "E1(s)",
          width: 90,
      }, {
          dataField: "E2",
          readOnly: true,
          text: "E2(s)",
          width: 90,
      }, {
          dataField: "E3",
          readOnly: true,
          text: "E3(n)",
          width: 90,
      }];
  var grid2Columns = [{
          dataField: "ID",
          readOnly: true,
          text: "TParams: ID",
          width: 110,
      }, {
          dataField: "FIndex",
          text: "FIndex(n)",
          width: 90,
      }, {
          dataField: "FName",
          text: "FName(s)",
          width: 90,
      }, {
          dataField: "FType",
          text: "FType(s)",
          width: 90,
      }, {
          dataField: "FDescription",
          text: "FDescription(s)",
          width: 120,
      }, {
          dataField: "FIsOptional",
          text: "FIsOptional(b)",
          width: 110,
      }, {
          dataField: "E1",
          readOnly: true,
          text: "E1(s)",
          width: 90,
      }, {
          dataField: "E2",
          readOnly: true,
          text: "E2(s)",
          width: 90,
      }, {
          dataField: "E3",
          readOnly: true,
          text: "E3(n)",
          width: 90,
      }];
  var gridColumns = [grid0Columns, grid1Columns, grid2Columns];

  var data_tpl = "<div class=\"data-grid0\" data-id=\"0\"></div>\n<div class=\"data-grid-sub\">\n    <div class=\"data-grid1\" data-id=\"1\"></div>\n    <div class=\"data-grid2\" data-id=\"2\"></div>\n</div>";

  var Data = (function (_super) {
      __extends(Data, _super);
      function Data() {
          _super.apply(this, arguments);
      }
      Data.prototype.refreshAll = function () {
          this.refreshData(this.grids);
          return this;
      };
      Data.prototype.setExpression = function (v) {
          this.expression = v;
          this.refreshAll();
          if (this.grids.length > 0) {
              this.selectGrid(this.grids[0]);
          }
          return this;
      };
      Data.prototype.addRow = function () {
          this.expression.dataAdd(this.expression.getCurrentTableIndex());
          this.refreshAll();
          return this;
      };
      Data.prototype.removeRow = function () {
          this.expression.dataRemove(this.expression.getCurrentTableIndex());
          this.refreshAll();
          return this;
      };
      Data.prototype.hotkeyFocus = function () {
          this.grids.forEach((function (me) { return function (n) {
              me.getGrid(n).options.isAllowKeyboard = true;
          }; })(this));
          return this;
      };
      Data.prototype.hotkeyBlur = function () {
          this.grids.forEach((function (me) { return function (n) {
              me.getGrid(n).options.isAllowKeyboard = false;
          }; })(this));
          return this;
      };
      Data.prototype.preinitialize = function () {
          this.className = "data-view";
          this.gridName = "grid";
          this.events = {
              "blur .data-grid-edit": this.doBlurEdit,
              "click .data-grid0": this.doClickGrid,
              "click .data-grid1": this.doClickGrid,
              "click .data-grid2": this.doClickGrid,
          };
      };
      Data.prototype.initialize = function () {
          this.renderBasic();
      };
      Data.prototype.doClickGrid = function (e) {
          hotkey.setCurrentView(this);
          var id = Number(this.$(e.target).parents(".easygrid").data("id"));
          return this.selectGrid(id);
      };
      Data.prototype.doBlurEdit = function (e) {
          var id = Number(this.$(e.target).parents(".easygrid").data("id"));
          var grid = this.getGrid(id);
          grid.endEdit();
          return this;
      };
      Data.prototype.renderBasic = function () {
          this.$el.html(data_tpl);
          var defaultOptions = {
              isAllowEdit: true,
              isAllowKeyboard: false,
              isAllowMoveCol: false,
              isAllowRemoveCol: false,
              isAllowSort: false,
          };
          this.grids = _.times(3, (function (me) { return function (i) {
              me[me.gridName + i] = me.$(".data-grid" + i).easygrid($.extend({}, defaultOptions, {
                  columns: gridColumns[i],
                  onEdit: function (cell, id, dataField) {
                      var grid = me.getGrid(i);
                      var value = grid.getValue(id, dataField);
                      var input = $("<input class='data-grid-edit'/>");
                      input.appendTo(cell).val(value).focus().select();
                      hotkey.bindElement(input.get(0), ["enter", "esc"], (function (eMe, eGrid, eInput, eId, eDataField, eN) { return function (e, combo) {
                          if (combo === "enter") {
                              var v = eInput.val();
                              var type = eMe.expression.getFields_T(eN)[eDataField].type;
                              var rawValue = parserValue(v, type);
                              if (!_.isNaN(rawValue)) {
                                  eMe.expression.dataUpdate(i, eDataField, rawValue);
                                  eMe.refreshAll();
                              }
                          }
                          eGrid.endEdit();
                          e.stopPropagation();
                          e.preventDefault();
                      }; })(me, grid, input, id, dataField, i), "keydown");
                  },
                  onSelectedColChange: function (dataField) {
                      me.expression.setCurrentTableAndField(i, dataField);
                  },
                  onSelectedRowChange: function (id) {
                      var index = _.findIndex(me.getGrid(i).options.data, { _id: id });
                      var reloads = me.expression.setCursor_T(i, index);
                      me.refreshData(reloads);
                  },
              }));
              return i;
          }; })(this));
          return this;
      };
      Data.prototype.getGrid = function (id) {
          return this[this.gridName + id];
      };
      Data.prototype.selectGrid = function (id) {
          var grid = this.getGrid(id);
          if (grid) {
              if (!grid.$el.hasClass("selected")) {
                  this.$(".easygrid").removeClass("selected");
                  grid.$el.addClass("selected");
              }
              this.expression.setCurrentTableAndField(id, grid.getSelectedField());
          }
          return this;
      };
      Data.prototype.refreshData = function (rds) {
          rds.forEach((function (me) { return function (n) {
              var grid = me.getGrid(n);
              grid.loadData(me.getDisplayData(me.expression.getFields_T(n), me.expression.getData_T(n)));
              // 同步显示焦点
              var index = me.expression.getCursor_T(n);
              if (index >= 0) {
                  var row = grid.options.data[index];
                  if (row) {
                      grid.selectRow(row._id, true);
                  }
                  var col = grid.getSelectedField();
                  if (col) {
                      grid.selectCol(col, true);
                  }
                  else if (grid.options.columns.length > 0) {
                      col = grid.options.columns[0].dataField;
                      grid.selectCol(col, true);
                  }
              }
          }; })(this));
      };
      Data.prototype.getDisplayData = function (fields, raw) {
          var r = [];
          if (raw) {
              raw.forEach(function (value) {
                  var v = {};
                  for (var n in fields) {
                      if (fields.hasOwnProperty(n)) {
                          var field = fields[n];
                          var val = value[n];
                          v[n] = (_.isNaN(val) || _.isNull(val) || _.isUndefined(val)) ? "" :
                              formatValue(val, field.type);
                          if (field.primaryKey) {
                              v._id = val;
                          }
                      }
                  }
                  r.push(v);
              });
          }
          return r;
      };
      return Data;
  }(View));

  var image_close_svg_tpl = "<svg width=\"11\" height=\"11\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n    <path d=\"M968.101033 323.543935c-26.57737-61.004307-62.509579-114.156026-107.794614-159.441061C815.015343 118.811798 761.683394 82.879588 700.301511 56.30826c-61.384904-26.573342-126.882877-39.862027-196.502979-39.862027-69.615068 0-134.925763 13.288685-195.935104 39.862027-61.005314 26.571329-114.156026 62.503538-159.441061 107.794614-45.291076 45.285035-81.223285 98.437761-107.795621 159.441061-26.573342 61.011355-39.862027 126.322049-39.862027 195.937118 0 69.620103 13.288685 135.117068 39.862027 196.502979 26.573342 61.37987 62.505552 114.712825 107.795621 160.002895 45.285035 45.285035 98.435747 81.217244 159.441061 107.795621 61.010348 26.573342 126.321042 39.862027 195.935104 39.862027 69.620103 0 135.117068-13.288685 196.502979-39.862027 61.380877-26.578377 114.713832-62.510586 160.004908-107.795621 45.285035-45.291076 81.217244-98.624032 107.794614-160.002895 26.573342-61.384904 39.862027-126.882877 39.862027-196.502979C1007.96306 449.865984 994.674376 384.555289 968.101033 323.543935zM729.22489 648.272956c15.877351 15.877351 26.330686 34.008079 31.363028 54.389164 5.02328 20.379071-0.397714 38.506779-16.280099 54.389164-16.408978 16.408978-35.0663 22.359587-55.971965 17.8629-20.914727-4.497693-39.306234-14.690249-55.183585-30.5676L504.80943 616.002737 377.035473 743.797839c-15.89346 15.896481-34.042312 26.360892-54.443535 31.399276-20.400216 5.029321-38.54504-0.397714-54.443535-16.29923-16.425088-16.428109-22.381738-35.106575-17.880017-56.037412 4.502728-20.938892 14.705353-39.35255 30.598813-55.248025l127.765902-127.787047L282.2154 393.408707c-15.882385-15.882385-26.336728-34.535679-31.363028-55.979013-5.027307-21.436286 0.662521-40.354387 17.070493-56.763366 15.882385-15.882385 34.270872-21.041592 55.180564-15.487691 20.909692 5.560949 39.302207 16.276071 55.184592 32.158456l126.40864 126.40864 127.4578-127.478944c15.898495-15.900509 34.569913-26.366934 56.035398-31.400282 21.45743-5.033349 40.395669 0.662521 56.820757 17.09063 15.898495 15.900509 21.062737 34.311147 15.503801 55.245004-5.56699 20.933857-16.292181 39.348523-32.190676 55.249031l-127.449745 127.470889L729.22489 648.272956z\" fill=\"#fff\"></path>\n</svg>";

  var setting_tpl = "<div class=\"setting-content\">\n    <div class=\"setting-p1\">\n        <div class=\"setting-p1-scroll\">\n            <div class=\"setting-p1-title\">editable fields - default expr</div>\n            <div class=\"setting-p1-content default-expr\"></div>\n            <div class=\"setting-p1-title\">computed fields - expr</div>\n            <div class=\"setting-p1-content expr\"></div>\n        </div>\n        <div class=\"setting-p1-actions\">\n            <div class=\"setting-p1-error-msg\">错误</div>\n            <button class=\"btn btn-default setting-p1-action-cancel\">Cancel</button>\n            <button class=\"btn btn-default setting-p1-action-apply\">Apply</button>\n        </div>\n    </div>\n    <div class=\"setting-close\"></div>\n</div>";

  var Setting = (function (_super) {
      __extends(Setting, _super);
      function Setting() {
          _super.apply(this, arguments);
      }
      Setting.prototype.setExpression = function (v) {
          this.expression = v;
          return this;
      };
      Setting.prototype.show = function () {
          if (!this.showing) {
              this.showing = true;
              this.loadFields().loadExprs();
              this.$el.show();
              this.oldCurrentView = hotkey.getCurrentView();
              hotkey.setCurrentView(this);
          }
          return this;
      };
      Setting.prototype.hide = function () {
          if (this.showing) {
              this.showing = false;
              this.$el.hide();
              hotkey.setCurrentView(this.oldCurrentView);
              this.oldCurrentView = null;
          }
          return this;
      };
      Setting.prototype.preinitialize = function () {
          this.className = "setting-view";
          this.events = {
              "click .setting-close": this.doClickClose,
              "click .setting-p1-action-apply": this.doClickP1Apply,
              "click .setting-p1-action-cancel": this.doClickP1Cancel,
          };
      };
      Setting.prototype.initialize = function () {
          this.renderBasic().initHotkey();
      };
      Setting.prototype.doClickClose = function () {
          return this.hide();
      };
      Setting.prototype.doClickP1Cancel = function () {
          return this.doClickClose();
      };
      Setting.prototype.doClickP1Apply = function () {
          var errMsg = this.applyExprs();
          if (errMsg) {
              this.$errorMsg.text(errMsg);
          }
          else {
              this.doClickClose();
          }
          return this;
      };
      Setting.prototype.renderBasic = function () {
          this.$el.html(setting_tpl);
          this.$(".setting-close").html(image_close_svg_tpl);
          this.$exprWrap = this.$(".expr");
          this.$defaultExprWrap = this.$(".default-expr");
          this.$errorMsg = this.$(".setting-p1-error-msg");
          return this;
      };
      Setting.prototype.initHotkey = function () {
          hotkey.bindView(this, "esc", (function (me) { return function (e, combo) {
              me.doClickClose();
          }; })(this));
          return this;
      };
      Setting.prototype.eachFields = function (callback) {
          for (var i = 0; i < this.expression.length(); i++) {
              var fields = this.expression.getFields_T(i);
              for (var fieldName in fields) {
                  if (fields.hasOwnProperty(fieldName)) {
                      var field = fields[fieldName];
                      var f = fieldName[0];
                      if (f === "F" || f === "E") {
                          var tName = this.expression.getTableName_T(i).split(".");
                          var tableName = tName[tName.length - 1];
                          var inputId = "setting" + tableName + fieldName;
                          callback.call(this, f, tableName, fieldName, field, inputId);
                      }
                  }
              }
          }
      };
      Setting.prototype.loadFields = function () {
          this.exprMap = {};
          this.$exprWrap.html("");
          this.$defaultExprWrap.html("");
          this.eachFields((function (me) { return function (type, tableName, fieldName, field, id) {
              var value;
              var propName;
              var property;
              var wrap = "<div class='setting-p1-item'><label for='" + id + "'>" +
                  tableName + "." + fieldName + "(" + field.type[0].toUpperCase() +
                  "):</label><input id='" + id + "' type='text'/></div>";
              if (type === "F") {
                  value = field.defaultExpr;
                  propName = "defaultExpr";
                  property = field;
                  me.$defaultExprWrap.append(wrap);
              }
              else if (type === "E") {
                  value = field.expr;
                  propName = "expr";
                  property = field;
                  me.$exprWrap.append(wrap);
              }
              else {
                  value = "";
                  propName = "";
                  property = null;
              }
              me.exprMap[id] = {
                  expr: value,
                  field: property,
                  prop: propName,
              };
          }; })(this));
          return this;
      };
      Setting.prototype.loadExprs = function () {
          this.$errorMsg.text("");
          for (var id in this.exprMap) {
              if (this.exprMap.hasOwnProperty(id)) {
                  var item = this.exprMap[id];
                  this.$("#" + id).val(item.expr);
              }
          }
          return this;
      };
      Setting.prototype.applyExprs = function () {
          for (var id in this.exprMap) {
              if (this.exprMap.hasOwnProperty(id)) {
                  var item = this.exprMap[id];
                  item.field[item.prop] = this.$("#" + id).val();
              }
          }
          var errMsg = this.expression.checkExpression();
          if (errMsg) {
              for (var id in this.exprMap) {
                  if (this.exprMap.hasOwnProperty(id)) {
                      var item = this.exprMap[id];
                      item.field[item.prop] = item.expr;
                  }
              }
          }
          else {
              this.expression.dataLoad();
              this.trigger("onapply");
          }
          return errMsg;
      };
      return Setting;
  }(View));

  var main_tpl = "<div class=\"main-header\">\n    <div class=\"main-header-title\">ExprManager</div>\n    <div class=\"main-header-actions btn-group\">\n        <button type=\"button\" class=\"act-add btn btn-default\"></button>\n        <button type=\"button\" class=\"act-setting btn btn-default\"></button>\n        <button type=\"button\" class=\"act-remove btn btn-default\"></button>\n    </div>\n    <div class=\"main-header-layouts btn-group\">\n        <button type=\"button\" class=\"act-left btn btn-default\"></button>\n        <button type=\"button\" class=\"act-center btn btn-default\"></button>\n        <button type=\"button\" class=\"act-right btn btn-default\"></button>\n    </div>\n</div>\n<div class=\"main-data\"></div>\n<div class=\"main-console\"></div>\n<div class=\"main-split\"></div>\n";

  var Main = (function (_super) {
      __extends(Main, _super);
      function Main() {
          _super.apply(this, arguments);
      }
      Main.prototype.refresh = function (isInit) {
          if (_.isUndefined(this.defaultSize)) {
              // 记录默认值
              this.defaultSize = this.isHorizontal() ? this.$console.width() : this.$console.height();
              this.currentSize = this.defaultSize;
          }
          if (this.$el.hasClass("layout-horizontal")) {
              this.shapeCenter.setName(ShapeName.SHAPE_NAME_LAYOUT_VERTICAL);
              this.shapeLeft.setName(ShapeName.SHAPE_NAME_AREA_LEFT);
              this.shapeRight.setName(ShapeName.SHAPE_NAME_AREA_RIGHT);
          }
          else {
              this.shapeCenter.setName(ShapeName.SHAPE_NAME_LAYOUT_HORIZONTAL);
              this.shapeLeft.setName(ShapeName.SHAPE_NAME_AREA_TOP);
              this.shapeRight.setName(ShapeName.SHAPE_NAME_AREA_BOTTOM);
          }
          if (this.$el.hasClass("hide-data")) {
              this.shapeLeft.setColor(ShapeColor.SHAPE_COLOR_DISABLED);
              this.shapeRight.setColor(ShapeColor.SHAPE_COLOR_ENABLED);
          }
          else if (this.$el.hasClass("hide-console")) {
              this.shapeLeft.setColor(ShapeColor.SHAPE_COLOR_ENABLED);
              this.shapeRight.setColor(ShapeColor.SHAPE_COLOR_DISABLED);
          }
          else {
              this.shapeLeft.setColor(ShapeColor.SHAPE_COLOR_ENABLED);
              this.shapeRight.setColor(ShapeColor.SHAPE_COLOR_ENABLED);
          }
          this.consoleView.refresh(isInit);
          return this;
      };
      Main.prototype.preinitialize = function () {
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
      };
      Main.prototype.initialize = function () {
          this.expression = new Expression();
          this.renderBasic();
      };
      Main.prototype.doDblClickSplit = function () {
          this.setCurrentSize(this.defaultSize);
          return this;
      };
      Main.prototype.doMousedown = function (e) {
          this.dragging = true;
          if (this.isHorizontal()) {
              this.dragStart = e.pageX;
              this.startSize = this.$console.width();
          }
          else {
              this.dragStart = e.pageY;
              this.startSize = this.$console.height();
          }
          this.$el.addClass("none-select");
          return this;
      };
      Main.prototype.doMousemove = function (e) {
          if (this.dragging) {
              this.setCurrentSize(this.startSize + this.dragStart - (this.isHorizontal() ? e.pageX : e.pageY));
              this.consoleView.refresh();
          }
          return this;
      };
      Main.prototype.doMouseup = function (e) {
          if (this.dragging) {
              this.dragging = false;
              this.$el.removeClass("none-select");
              this.consoleView.refresh();
          }
          return this;
      };
      Main.prototype.doClickLeft = function () {
          if (this.$el.hasClass("hide-data")) {
              this.$el.removeClass("hide-data").addClass("show-all");
              this.setCurrentSize(this.currentSize);
          }
          else {
              this.$el.removeClass("hide-console").removeClass("show-all").addClass("hide-data");
              this.setCurrentSize("auto");
          }
          return this.refresh();
      };
      Main.prototype.doClickCenter = function () {
          this.$el.toggleClass("layout-vertical").toggleClass("layout-horizontal");
          if (this.$el.hasClass("show-all")) {
              this.setCurrentSize(this.currentSize);
          }
          else {
              this.setCurrentSize("auto");
          }
          this.consoleView.toggleLayout();
          return this.refresh();
      };
      Main.prototype.doClickRight = function () {
          if (this.$el.hasClass("hide-console")) {
              this.$el.removeClass("hide-console").addClass("show-all");
              this.setCurrentSize(this.currentSize);
          }
          else {
              this.$el.removeClass("hide-data").removeClass("show-all").addClass("hide-console");
              this.setCurrentSize("auto");
          }
          return this.refresh();
      };
      Main.prototype.doClickSetting = function () {
          this.settingView.show();
          return this;
      };
      Main.prototype.doClickAdd = function () {
          this.dataView.addRow();
          return this;
      };
      Main.prototype.doClickRemove = function () {
          this.dataView.removeRow();
          return this;
      };
      Main.prototype.renderBasic = function () {
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
          this.settingView.on("onapply", (function (me) { return function () {
              me.dataView.refreshAll();
          }; })(this));
          this.dataView.$el.appendTo(this.$data);
          this.consoleView.$el.appendTo(this.$console);
          this.settingView.$el.appendTo(this.$el);
          this.$(".act-add").html(image_add_svg_tpl);
          this.$(".act-setting").html(image_setting_svg_tpl);
          this.$(".act-remove").html(image_remove_svg_tpl);
          return this;
      };
      Main.prototype.isHorizontal = function () {
          return this.$el.hasClass("layout-horizontal");
      };
      Main.prototype.setCurrentSize = function (size) {
          if (size === "auto") {
              this.$data.css("right", 0);
              this.$split.css("right", 0);
              this.$console.width("auto");
              this.$data.css("bottom", 0);
              this.$split.css("bottom", 0);
              this.$console.height("auto");
          }
          else {
              this.currentSize = size;
              if (this.isHorizontal()) {
                  var endWidth = Math.max(size, this.defaultSize);
                  this.$data.css("right", endWidth);
                  this.$split.css("right", endWidth - 2);
                  this.$console.width(endWidth);
                  this.$data.css("bottom", 0);
                  this.$split.css("bottom", 0);
                  this.$console.height("auto");
              }
              else {
                  var endHeight = Math.max(size, this.defaultSize);
                  this.$data.css("bottom", endHeight);
                  this.$split.css("bottom", endHeight - 28);
                  this.$console.height(endHeight);
                  this.$data.css("right", 0);
                  this.$split.css("right", 0);
                  this.$console.width("auto");
              }
          }
          return this;
      };
      return Main;
  }(View));

  var App = (function (_super) {
      __extends(App, _super);
      function App() {
          _super.apply(this, arguments);
      }
      App.prototype.preinitialize = function () {
          this.className = "app-view";
          this.el = $("#app");
      };
      App.prototype.initialize = function () {
          this.main = new Main();
          this.main.$el.appendTo(this.$el);
          this.main.refresh(true);
      };
      return App;
  }(View));
  $(document).ready(function () {
      window.App = new App();
  });

})));
