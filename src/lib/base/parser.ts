import locale from "../base/locale";
import { eachToken, format, hasToken } from "./common";
import { IToken, TokenType } from "./interface";
import Lexer from "./lexer";
import { RULE_BTOKENS, RULE_ETOKENS, RULE_LEXICAL } from "./rule";

// 语法解析器
// ----------

export default class Parser {
    public errorMsg: string = ""; /// 错误信息，如果为空字符串则表示没有错误
    public tokens: IToken[] = []; /// 按照顺序存储Token对象
    public rootToken: IToken = null; /// 存储语法树的根Token对象
    private lexer: Lexer = new Lexer(); /// 词法分析器对象，将表达式拆成Token对象数组
    // 表达式解析
    public parser(expr: string): Parser {
        // - 初始化
        this.doInit(expr);
        // - 构建Token双向链表
        if (this.errorMsg === "") {
            this.errorMsg = this.doDoublyLinkedList();
        }
        // - 构建语法树，返回根节点
        if (this.errorMsg === "") {
            this.rootToken = this.doParser(this.tokens);
        }
        // - 检查语法错误
        if (this.errorMsg === "" && this.rootToken) {
            this.errorMsg = this.doCheckSyntax(this.rootToken);
        }
        // - 返回自己
        return this;
    }
    // 初始化语法分析器对象，清空rootToken，tokens和errorMsg
    private doInit(expr: string): void {
        if (!expr) {
            this.errorMsg = locale.getLocale().MSG_EP_EMPTY;
        } else {
            this.rootToken = null;
            this.tokens = [];
            this.errorMsg = "";
            this.lexer.setExpr(expr);
        }
    }
    // 创建虚节点
    private doCreateVirtualToken(type: TokenType): IToken {
        let v: string = "";
        switch (type) {
            case "VTK_COMMA": /// 逗号，用于函数多个参数、数组元素、对象属性之间
                v = ",";
                break;
            case "VTK_PAREN": /// 小括号，函数调用、提升优先级
                v = "()";
                break;
            case "VTK_ARRAY": /// 中括号，数组
                v = "[]";
                break;
            case "VTK_OBJECT": /// 大括号，对象
                v = "{}";
                break;
            case "VTK_SUBSCRIPT": /// 下标，数组/对象访问元素
                v = "[n]";
                break;
            case "VTK_FUNCTION": /// 函数
                v = "Fn()";
                break;
        }
        return {
            childs: [],
            parent: null,
            tokenText: v,
            tokenType: type,
            tokenValue: v,
        };
    }
    // 将表达式构建成Token双向链表
    private doDoublyLinkedList(): string {
        let t = this.lexer.nextToken();
        const ts = this.tokens;
        const stack = [];
        let r = "";
        while (!r && t) { /// 循环得到Token节点
            if (t.tokenType === "TK_UNKNOWN") { /// 未知的Token节点类型
                r = format(locale.getLocale().MSG_EP_UNKNOWN, t.tokenText);
                break;
            } else if (t.tokenType === "TK_STRING") { /// 检查string节点的tokenText格式是否为"..."或'...'
                if (t.tokenErrorMsg) {
                    r = t.tokenErrorMsg;
                    break;
                }
            }
            t.parent = null;
            t.childs = [];
            this.tokens.push(t); /// 将得到的Token对象依次放到tokens中

            // - 检查前后依赖关系正确性
            if (ts.length === 1 && !RULE_BTOKENS[t.tokenType]) { /// 作为起始节点不正确
                r = format(locale.getLocale().MSG_EP_LEXICAL_B, t.tokenText);
                break;
            } else if (ts.length !== 1 && !RULE_LEXICAL[ts[ts.length - 2].tokenType][t.tokenType]) {
                /// 与前继节点依赖关系不正确
                r = format(locale.getLocale().MSG_EP_LEXICAL_L, ts[ts.length - 2].tokenText, t.tokenText);
                break;
            }
            // - 检查括号匹配正确性
            switch (t.tokenType) {
                case "TK_LP": /// (
                case "TK_LA": /// [
                case "TK_LO": /// {
                    stack.push(t); /// 左括号直接入栈
                    break;
                case "TK_RP": /// )
                case "TK_RA": /// ]
                case "TK_RO": /// }
                    if (stack.length) { /// 堆栈不为空
                        if (t.tokenType.replace("R", "L") === stack[stack.length - 1].tokenType) { /// 左右括号对应上
                            stack.pop();
                        } else { /// 左右括号不对应
                            r = format(locale.getLocale().MSG_EP_MATCH, stack[stack.length - 1].tokenText);
                        }
                    } else { /// 堆栈为空，当前右括号不正确
                        r = format(locale.getLocale().MSG_EP_MATCH, t.tokenText);
                    }
                    break;
                default:
                    break;
            }
            t = this.lexer.nextToken();
        }
        if (!r && !RULE_ETOKENS[ts[ts.length - 1].tokenType]) { /// 作为结束节点不正确
            r = format(locale.getLocale().MSG_EP_LEXICAL_E, ts[ts.length - 1].tokenText);
        }
        if (!r && stack.length) { /// 堆栈中还有括号
            r = format(locale.getLocale().MSG_EP_MATCH, stack[stack.length - 1].tokenText);
        }
        return r;
    }
    // 构建语法树，返回根节点
    private doParser(ts: IToken[]): IToken {
        let p = null;
        if (ts && !ts.length) {
            return p; /// ts为空数组则直接返回null根节点
        }
        // - 处理 ()[]{} 括号节点
        p = this.doParser_0(ts);
        // - 处理能构成 function 的节点
        p = this.doParser_1(p);
        // - 处理 . [] 节点构成的子项调用
        p = this.doParser_2(p);
        // - 处理 + - ! 单目运算节点
        p = this.doParser_3(p);
        // - 处理 * / % 四则运算
        p = this.doParser_4(p, "TK_MULTI,TK_DIV,TK_MOD");
        // - 处理 + - 四则运算
        p = this.doParser_4(p, "TK_PLUS,TK_MINUS");
        // - 处理 < <= > >= 比较运算符
        p = this.doParser_4(p, "TK_CO");
        // - 处理 == != 等于运算符
        p = this.doParser_4(p, "TK_EO");
        // - 处理 && 与运算
        p = this.doParser_4(p, "TK_AND");
        // - 处理 || 或运算
        p = this.doParser_4(p, "TK_OR");
        // - 处理 : 冒号
        p = this.doParser_4(p, "TK_COLON");
        // - 处理 , 逗号
        p = this.doParser_5(p);
        if (p.length > 1) { /// Token数组未能收拢为一棵树，解析出错
            this.errorMsg = "语法解析错误";
        }
        return p[0];
    }
    // 检查语法错误
    private doCheckSyntax(rootToken: IToken): string {
        let msg = "";
        let s;
        let id = 0; /// 分配唯一标识
        eachToken(this.rootToken, (t) => {
            t.id = id++; /// 给树上的每个token节点都加上唯一标识的ID属性
            s = t.tokenText;
            switch (t.tokenType) {
                // - 点操作符检查
                case "TK_DOT": /// .
                    if (t.childs[1].tokenType === "TK_IDEN" &&
                        !hasToken("VTK_FUNCTION,TK_IDEN,TK_DOT,VTK_SUBSCRIPT,VTK_PAREN,VTK_OBJECT",
                        t.childs[0].tokenType)) { /// 无法做属性访问操作
                        msg = format(locale.getLocale().MSG_EP_SYNTAX_D, t.childs[0].tokenText);
                    }
                    break;
                // - 冒号操作符检查
                case "TK_COLON": /// :
                    if (!t.parent || !hasToken("VTK_OBJECT,VTK_COMMA",
                        t.parent.tokenType)) { /// ":"节点没有父节点，或父节点不是"{}"或","
                        msg = format(locale.getLocale().MSG_EP_SYNTAX_P, s);
                    } else if (t.childs && t.childs[0] && t.childs[0].childs &&
                        t.childs[0].childs.length > 0) { /// ":"节点的第一个子节点不是简单节点
                        msg = format(locale.getLocale().MSG_EP_SYNTAX_E, s);
                    }
                    break;
                // - 逗号操作符检查
                case "VTK_COMMA": /// ,
                    if (!t.parent || !hasToken("VTK_OBJECT,VTK_ARRAY,VTK_PAREN",
                        t.parent.tokenType)) { /// ","节点没有被包含在"()","[]","{}"中
                        msg = format(locale.getLocale().MSG_EP_SYNTAX_C, s);
                    }
                    break;
                // - 小括号检查
                case "VTK_PAREN": /// ()
                    if (t.parent && t.parent.tokenType !== "TK_IDEN" || !t.parent) {
                        if (t.childs.length === 0) { /// 如：2+()，().ToString()
                            msg = format(locale.getLocale().MSG_EP_SYNTAX_N, s);
                        } else if (t.childs[0].tokenType === "VTK_COMMA") { /// 如：(1,2,3)，2+(3,9)
                            msg = format(locale.getLocale().MSG_EP_SYNTAX_M, s);
                        }
                    }
                    break;
                // - 中括号检查
                case "VTK_ARRAY": /// []
                    if (t.childs && t.childs.length > 0) {
                        if (t.childs[0].tokenType === "VTK_COMMA") {
                            if (t.parent && t.parent.tokenType === "VTK_SUBSCRIPT" &&
                                t.parent.childs[0] !== t) { /// [23,45,6,32][2,4,5] 要报错
                                msg = format(locale.getLocale().MSG_EP_SYNTAX_SUB, ",");
                            }
                            for (const item of t.childs[0].childs) {
                                if (item.tokenType === "TK_COLON") { /// [2,"ds",a:"tt",564] 要报错
                                    msg = format(locale.getLocale().MSG_EP_SYNTAX_A, ":");
                                    break;
                                }
                            }
                        }
                    }
                    break;
                // - 大括号检查
                case "VTK_OBJECT": /// 检查"{}"中是否只包含0到多个x:a格式字符串，如"{}","{x:'2'}","{x:'2',y:423}"
                    let y;
                    if (t.childs && (t.childs.length === 0 || hasToken("TK_COLON,VTK_COMMA", t.childs[0].tokenType))) {
                        if (t.childs.length > 0 && t.childs[0].tokenType === "VTK_COMMA") { /// 第一个字节点为","
                            for (const item of t.childs[0].childs) {
                                y = item.tokenType === "TK_COLON"; /// ","的每个子节点均为"x:a"格式
                                if (!y) {
                                    break;
                                }
                            }
                        } else { /// 空括号"{}"或只有一个":"子节点如"{a:2}"
                            y = true;
                        }
                    } else {
                        y = false;
                    }
                    if (!y) {
                        msg = locale.getLocale().MSG_EP_SYNTAX_O;
                    }
                    break;
                default:
                    break;
            }
            if (msg !== "") {
                return false;
            }
        }, this);
        return msg;
    }
    // () [] {}，将括号中的多个token拿出来计算并生成虚Token插入到原来的Token数组中
    private doParser_0(ts: IToken[]): IToken[] {
        let t;
        const l = [];
        let counter = 0;
        let queue = [];
        let i = 0;
        while (i < ts.length) {
            t = ts[i];
            if (hasToken("TK_LP,TK_LA,TK_LO", t.tokenType)) { /// 左括号
                counter++;
            } else if (hasToken("TK_RP,TK_RA,TK_RO", t.tokenType)) { /// 右括号
                counter--;
            }
            if (counter > 0) { /// 该token位于括号内，暂时压入缓存队列中
                queue.push(t);
            } else if (queue.length > 0) { /// 该token位于顶层，且缓存队列中有数据
                const root = queue.shift();
                let rootType;
                switch (root.tokenType) {
                    case "TK_LP": rootType = "VTK_PAREN"; break; /// ()参数或者是普通括号
                    case "TK_LA": rootType = "VTK_ARRAY"; break; /// []数组或者是下标
                    case "TK_LO": rootType = "VTK_OBJECT"; break; /// {}对象
                }
                t = this.doCreateVirtualToken(rootType);
                t.tokenIndex = root.tokenIndex; /// 记录该括号节点的
                const tmp = this.doParser(queue);
                if (tmp) {
                    t.childs.push(tmp);
                    tmp.parent = t;
                }
                l.push(t);
                queue = [];
            } else { /// 该token位于顶层，且缓存队列中无数据
                l.push(t);
            }
            i++;
        }
        return l;
    }
    // 标识符与()相连构成函数
    private doParser_1(ts: IToken[]): IToken[] {
        let t;
        let n;
        const l = [];
        let i = 0;
        while (i < ts.length) {
            t = ts[i];
            n = ts[i + 1];
            /// 判断相连两个Token能否构成函数调用的格式
            if (t.tokenType === "TK_IDEN" && n && n.tokenType === "VTK_PAREN") {
                const tmp = this.doCreateVirtualToken("VTK_FUNCTION");
                tmp.tokenIndex = t.tokenIndex;
                tmp.childs.push(t);
                t.parent = tmp;
                tmp.childs.push(n);
                n.parent = t;
                i++;
                l.push(tmp); /// 用虚节点tmp代替相连的"TK_IDEN"和"VTK_PAREN"节点
            } else {
                l.push(t);
            }
            i++;
        }
        return l;
    }
    // 处理 . [] 与标识符、string、()、[]、{}一起构成下标访问属性访问
    private doParser_2(ts: IToken[]): IToken[] {
        let t;
        let n;
        const l = [];
        let i = 0;
        while (i < ts.length) {
            t = ts[i];
            n = ts[i + 1];
            if (n && (n.tokenType === "TK_DOT" || n.tokenType === "VTK_ARRAY" && hasToken(
                "TK_IDEN,TK_STRING,VTK_PAREN,VTK_FUNCTION,VTK_ARRAY,VTK_OBJECT", t.tokenType))) {
                do {
                    switch (n.tokenType) {
                        case "TK_DOT": /// .属性访问
                            n.childs.push(t);
                            t.parent = n;
                            i += 2;
                            t = ts[i];
                            n.childs.push(t);
                            t.parent = n;
                            t = n; /// 将a.b视为t节点
                            n = ts[i + 1];
                            break;
                        case "VTK_ARRAY": /// []下标访问
                            const tmp = this.doCreateVirtualToken("VTK_SUBSCRIPT");
                            tmp.childs.push(t);
                            t.parent = tmp;
                            tmp.childs.push(n);
                            n.parent = tmp;
                            t = tmp; /// 将a[b]视为t节点
                            i++;
                            n = ts[i + 1];
                            break;
                    }
                } while (n && (n.tokenType === "TK_DOT" || n.tokenType === "VTK_ARRAY"));
                l.push(t);
            } else {
                l.push(t);
            }
            i++;
        }
        return l;
    }
    // 处理 + - ! 单目运算
    private doParser_3(ts: IToken[]): IToken[] {
        let t;
        const l = [];
        let i = 0;
        while (i < ts.length) {
            t = ts[i];
            if (hasToken("TK_UNARY,TK_NOT", t.tokenType)) {
                l.push(t); /// t会被添加子节点，子节点被添加孙节点...
                do { /// 多个单目运算符相连，前一个是后一个的父节点
                    const tmp = ts[++i];
                    t.childs.push(tmp);
                    tmp.parent = t;
                    t = ts[i]; /// t指向原来的tmp，tmp指向tokens数组中的下一个节点
                } while (hasToken("TK_UNARY,TK_NOT", t.tokenType));
            } else {
                l.push(t);
            }
            i++;
        }
        return l;
    }
    // 处理 1.* / % 2.+ - 3.< <= > >= == != 4.&& 5.|| 6.: 优先级
    private doParser_4(ts: IToken[], tts: string): IToken[] {
        let t;
        let n;
        const l = [];
        let i = 0;
        while (i < ts.length) {
            t = ts[i];
            n = ts[i + 1];
            if (n && hasToken(tts, n.tokenType)) { /// n为参数tts中的某运算符
                let tmp;
                do {
                    n.childs.push(t); /// 左侧运算数添加为子节点
                    t.parent = n;
                    tmp = n;
                    i += 2;
                    t = ts[i];
                    n = ts[i + 1];
                    tmp.childs.push(t); /// 右侧运算数添加为子节点
                    t.parent = tmp;
                    if (n && hasToken(tts, n.tokenType)) {
                        t = tmp; /// t会被再次作为n的左运算数添加到n的子节点中
                    } else {
                        break;
                    }
                } while (true);
                l.push(tmp); /// 以tmp为根节点的树，树的左节点始终要先被计算
            } else {
                l.push(t);
            }
            i++;
        }
        return l;
    }
    // 处理 , 即对象字段分隔{a:1,b:'re'}或数组元素[1,2,3]，函数参数分隔符fun(a,b)
    private doParser_5(ts: IToken[]): IToken[] {
        let t;
        let n;
        const l = [];
        let i = 0;
        while (i < ts.length) {
            t = ts[i];
            n = ts[i + 1];
            if (n && n.tokenType === "TK_COMMA") {
                const tmp = this.doCreateVirtualToken("VTK_COMMA");
                tmp.tokenIndex = n.tokenIndex; /// 使用第一个,的位置
                while (n && n.tokenType === "TK_COMMA") {
                    tmp.childs.push(t); /// 添加逗号之前的节点为子节点
                    t.parent = tmp;
                    i += 2;
                    t = ts[i];
                    n = ts[i + 1];
                }
                tmp.childs.push(t); /// 添加最后一个逗号之后的节点为子节点
                t.parent = tmp;
                l.push(tmp); /// tmp包含了若干个相互对等的子节点
            } else {
                l.push(t);
            }
            i++;
        }
        return l;
    }
}
