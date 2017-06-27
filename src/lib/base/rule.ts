// 语法规则
// ----------

// 节点类型
const tokens = ("TK_UNKNOWN,TK_STRING,TK_NUMBER,TK_BOOL,TK_NULL,TK_IDEN,TK_DOT,TK_LP,TK_LA," +
    "TK_LO,TK_RP,TK_RA,TK_RO,TK_UNARY,TK_NOT,TK_MULTI,TK_DIV,TK_MOD,TK_PLUS,TK_MINUS," +
    "TK_CO,TK_AND,TK_OR,TK_COLON,TK_COMMA").split(",");
const genTokenState = (tks: string[], opts: string[]): object => {
    const r = {};
    tks.forEach((v, i) => r[v] = opts[i] === "1");
    return r;
};
// 起始节点规则 /// BTOKENS[zz]==true表示tokens[z]可以作为起始节点
export const RULE_BTOKENS = genTokenState(tokens, "0111110111000110000000000".split(""));
// 结束节点规则 /// ETOKENS[zz]==true表示tokens[z]可以作为结束节点
export const RULE_ETOKENS = genTokenState(tokens, "0111110000111000000000000".split(""));
// 后序节点规则 /// LEXICAL[xx][yy]==true表示tokens[x]后可以紧接着出现tokens[y]
export const RULE_LEXICAL = ((tks: string[], opts: string[]): object => {
    const r = {};
    tks.forEach((v, i) => r[v] = genTokenState(tks, opts[i].split("")));
    return r;
})(tokens, (
    "0000000000000000000000000," + /// TK_UNKNOWN
    "0000001010111001111111111," + /// TK_STRING  'abc'
    "0000001000111001111111111," + /// TK_NUMBER  123
    "0000001000111001111111111," + /// TK_BOOL    true
    "0000000000111001111111111," + /// TK_NULL    null
    "0000001110111001111111111," + /// TK_IDEN    abc
    "0000010000000000000000000," + /// TK_DOT     .
    "0111110111100110000000000," + /// TK_LP      (
    "0111110111010110000000000," + /// TK_LA      [
    "0111110000001000000000000," + /// TK_LO      {
    "0000001010111001111111101," + /// TK_RP      )
    "0000001010111001111111101," + /// TK_RA      ]
    "0000001011111001111111101," + /// TK_RO      }
    "0111110111000110000000000," + /// TK_UNARY   +/-单目运算
    "0111110111000110000000000," + /// TK_NOT     !
    "0111110111000110000000000," + /// TK_MULTI   *
    "0111110111000110000000000," + /// TK_DIV     /
    "0111110111000110000000000," + /// TK_MOD     %
    "0111110111000110000000000," + /// TK_PLUS    +四则运算
    "0111110111000110000000000," + /// TK_MINUS   -四则运算
    "0111110111000110000000000," + /// TK_CO      ==,>,<,>=,<=,!=
    "0111110111000110000000000," + /// TK_AND     &&
    "0111110111000110000000000," + /// TK_OR      ||
    "0111110111000110000000000," + /// TK_COLON   :
    "0111110111000110000000000"    /// TK_COMMA   ,
).split(","));
