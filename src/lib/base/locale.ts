import { merger } from "./common";

interface ILocaleConfig {
    MSG_EC_FUNC_E: string;
    MSG_EC_FUNC_P: string;
    MSG_EC_FUNC_T: string;
    MSG_EC_PROP_E: string;
    MSG_EC_PROP_N: string;
    MSG_EC_VARI_I: string;
    MSG_EC_VARI_N: string;

    MSG_EF_MODEL: string;

    MSG_EL_SYNTAX_ON: string;
    MSG_EL_SYNTAX_S: string;
    MSG_EL_SYNTAX_UC: string;
    MSG_EL_SYNTAX_XN: string;

    MSG_EP_EMPTY: string;
    MSG_EP_LEXICAL_B: string;
    MSG_EP_LEXICAL_E: string;
    MSG_EP_LEXICAL_L: string;
    MSG_EP_MATCH: string;
    MSG_EP_SYNTAX_A: string;
    MSG_EP_SYNTAX_C: string;
    MSG_EP_SYNTAX_D: string;
    MSG_EP_SYNTAX_E: string;
    MSG_EP_SYNTAX_M: string;
    MSG_EP_SYNTAX_N: string;
    MSG_EP_SYNTAX_O: string;
    MSG_EP_SYNTAX_P: string;
    MSG_EP_SYNTAX_SUB: string;
    MSG_EP_UNKNOWN: string;

    MSG_ES_PARSER: string;

    MSG_EX_ADD: string;
    MSG_EX_AND: string;
    MSG_EX_AND_L: string;
    MSG_EX_COMPARE_A: string;
    MSG_EX_COMPARE_B: string;
    MSG_EX_COMPARE_C: string;
    MSG_EX_COMPARE_D: string;
    MSG_EX_DIVIDE: string;
    MSG_EX_DIVIDE_N: string;
    MSG_EX_DOT: string;
    MSG_EX_EQUAL: string;
    MSG_EX_EQUAL_N: string;
    MSG_EX_FUNC_NULL: string;
    MSG_EX_LN: string;
    MSG_EX_LOG: string;
    MSG_EX_MULTIPLY: string;
    MSG_EX_NEGATIVE: string;
    MSG_EX_OR: string;
    MSG_EX_OR_L: string;
    MSG_EX_POSITIVE: string;
    MSG_EX_REMAINDER: string;
    MSG_EX_REMAINDER_N: string;
    MSG_EX_ROUND: string;
    MSG_EX_SUBSCRIPT: string;
    MSG_EX_SUBSCRIPT_T: string;
    MSG_EX_SUBSCRIPT_U: string;
    MSG_EX_SUBTRACT: string;
    MSG_EX_TRUNC: string;
}

interface IFunctionConfig {
    [propName: string]: {
        fn: string;
        p: string[];
        r: string;
    };
}

// 多语言处理
// ----------

class Locale {
    public localeName: string = "zh-cn";
    private locales: object = {};
    private functions: object = {};
    // 定义多语言
    public defineLocale(name: string, config: ILocaleConfig): void {
        if (config !== null) {
            this.locales[name] = merger(this.locales[name] || {}, config);
        } else {
            delete this.locales[name];
        }
        return;
    }
    // 获取多语言
    public getLocale(name?: string): ILocaleConfig {
        return this.locales[name || this.localeName];
    }
    // 定义函数描述
    public defineFunction(name: string, config: IFunctionConfig): void {
        if (config !== null) {
            this.functions[name] = merger(this.functions[name] || {}, config);
        } else {
            delete this.functions[name];
        }
        return;
    }
    // 获取函数描述
    public getFunction(name?: string): IFunctionConfig {
        return this.functions[name || this.localeName];
    }
}

export default new Locale();
