var test11 = {
    title: "依赖关系测试11",
    dataSource: {
        "E1.P1": { expr: "Root().E1.Count().ToString()" },
        "E1.P2": { expr: "P1.ToNumber()" },
        "E1.P6": { expr: "P2.ToString()+PN1==''" },
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "(PN1+P2.ToString()).Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.P1|E1.P2|E1.PN1|E1.P6|E1.PN2" },
        { cmd: ["add", "E1"], r: "E1.P1|E1.P2|E1.PN1|E1.P6|E1.PN2" },
        { cmd: ["remove", "E1"], r: "E1.P1|E1.P2|E1.P6|E1.PN2" },
        { cmd: ["update", "E1", "P1"], r: "E1.P2|E1.P6|E1.PN2" }
    ]
};

var test12 = {
    title: "依赖关系测试12",
    dataSource: {
        "E1.P1": { expr: "Root().E1.Count().ToString()+PN1" },
        "E1.P2": { expr: "P1.Length()" },
        "E1.P6": { expr: "P2==6" },
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "(PN1+P6.ToString()).Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.P1|E1.P2|E1.P6|E1.PN2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.P1|E1.P2|E1.P6|E1.PN2" },
        { cmd: ["remove", "E1"], r: "E1.P1|E1.P2|E1.P6|E1.PN2" },
        { cmd: ["update", "E1", "P1"], r: "E1.P2|E1.P6|E1.PN2" }
    ]
};

var test13 = {
    title: "依赖关系测试13",
    dataSource: {
        "E1.P1": { expr: "Root().E1.Count().ToString()" },
        "E1.P2": { expr: "P1.Length()" },
        "E1.P6": { expr: "P2.ToString()+PN1==''" },
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "PN1.Length()+P2" },
        "E1.PN6": { expr: "PN1==''==P6" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.P1|E1.P2|E1.PN1|E1.P6|E1.PN2|E1.PN6" },
        { cmd: ["add", "E1"], r: "E1.P1|E1.P2|E1.PN1|E1.P6|E1.PN2|E1.PN6" },
        { cmd: ["remove", "E1"], r: "E1.P1|E1.P2|E1.P6|E1.PN2|E1.PN6" },
        { cmd: ["update", "E1", "P1"], r: "E1.P2|E1.P6|E1.PN2|E1.PN6" }
    ]
};

var test14 = {
    title: "依赖关系测试14",
    dataSource: {
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "PN1.Length()" },
        "E1.Entity1.P1": { expr: "Root().E1.Count()" },
        "E1.Entity1.P2": { expr: "P1" },
        "E1.Entity2.P1": { expr: "Parent().Entity1.Count()" },
        "E1.Entity2.P2": { expr: "P1" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["remove", "E1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.PN2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.Entity2.P1|E1.Entity2.P2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.Entity2.P1|E1.Entity2.P2" },
        { cmd: ["remove", "E1.Entity1"], r: "E1.Entity2.P1|E1.Entity2.P2" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2" },
        { cmd: ["load", "E1.Entity2"], r: "E1.Entity2.P1|E1.Entity2.P2" },
        { cmd: ["add", "E1.Entity2"], r: "E1.Entity2.P1|E1.Entity2.P2" },
        { cmd: ["remove", "E1.Entity2"], r: "" },
        { cmd: ["update", "E1.Entity2", "P1"], r: "E1.Entity2.P2" }
    ]
};

//
var test141 = {
    title: "依赖关系测试141",
    dataSource: {
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "Root().E1[0].PN1.Length()" },
        "E1.Entity1.P1": { expr: "Root().E1.Count()" },
        "E1.Entity1.P2": { expr: "Root().E1[0].Entity1[0].P1" },
        "E1.Entity2.P1": { expr: "Root().E1[0].Entity1.Count()" },
        "E1.Entity2.P2": { expr: "Root().E1[0].Entity2[0].P1" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["remove", "E1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.PN2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.Entity2.P1|E1.Entity2.P2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.Entity2.P1|E1.Entity2.P2" },
        { cmd: ["remove", "E1.Entity1"], r: "E1.Entity2.P1|E1.Entity2.P2" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2" },
        { cmd: ["load", "E1.Entity2"], r: "E1.Entity2.P1|E1.Entity2.P2" },
        { cmd: ["add", "E1.Entity2"], r: "E1.Entity2.P1|E1.Entity2.P2" },
        { cmd: ["remove", "E1.Entity2"], r: "" },
        { cmd: ["update", "E1.Entity2", "P1"], r: "E1.Entity2.P2" }
    ]
};

var test15 = {
    title: "依赖关系测试15Count",
    dataSource: {
        "E1.PN1": { expr: "'起点2'+Entity2.Count().ToString()" },
        "E1.PN2": { expr: "PN1.Length()" },
        "E1.Entity1.P1": { expr: "Root().E1.Count()" },
        "E1.Entity1.P2": { expr: "P1" },
        "E1.Entity2.P1": { expr: "Parent().Entity1.Count()" },
        "E1.Entity2.P2": { expr: "P1" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["remove", "E1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.PN2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.Entity2.P1|E1.Entity2.P2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.Entity2.P1|E1.Entity2.P2" },
        { cmd: ["remove", "E1.Entity1"], r: "E1.Entity2.P1|E1.Entity2.P2" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2" },
        { cmd: ["load", "E1.Entity2"], r: "E1.PN1|E1.PN2|E1.Entity2.P1|E1.Entity2.P2" },
        { cmd: ["add", "E1.Entity2"], r: "E1.PN1|E1.PN2|E1.Entity2.P1|E1.Entity2.P2" },
        { cmd: ["remove", "E1.Entity2"], r: "E1.PN1|E1.PN2" },
        { cmd: ["update", "E1.Entity2", "P1"], r: "E1.Entity2.P2" }
    ]
};

//
var test151 = {
    title: "依赖关系测试151Count",
    dataSource: {
        "E1.PN1": { expr: "'起点2'+Root().E1[0].Entity2.Count()" },
        "E1.PN2": { expr: "Root().E1[0].PN1.Length()" },
        "E1.Entity1.P1": { expr: "Root().E1.Count()" },
        "E1.Entity1.P2": { expr: "Root().E1[0].Entity1[0].P1" },
        "E1.Entity2.P1": { expr: "Root().E1[0].Entity1.Count()" },
        "E1.Entity2.P2": { expr: "Root().E1[0].Entity2[0].P1" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["remove", "E1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.PN2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.Entity2.P1|E1.Entity2.P2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.Entity2.P1|E1.Entity2.P2" },
        { cmd: ["remove", "E1.Entity1"], r: "E1.Entity2.P1|E1.Entity2.P2" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2" },
        { cmd: ["load", "E1.Entity2"], r: "E1.PN1|E1.PN2|E1.Entity2.P1|E1.Entity2.P2" },
        { cmd: ["add", "E1.Entity2"], r: "E1.PN1|E1.PN2|E1.Entity2.P1|E1.Entity2.P2" },
        { cmd: ["remove", "E1.Entity2"], r: "E1.PN1|E1.PN2" },
        { cmd: ["update", "E1.Entity2", "P1"], r: "E1.Entity2.P2" }
    ]
};

var test21 = {
    title: "依赖关系测试21",
    dataSource: {
        "E1.P1": { expr: "Root().E1.Count().ToString()+PN1" },
        "E1.P2": { expr: "(P1+PN2.ToString()).Length()" },
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "PN1.Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.P1|E1.PN2|E1.P2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.P1|E1.PN2|E1.P2" },
        { cmd: ["remove", "E1"], r: "E1.P1|E1.P2" },
        { cmd: ["update", "E1", "P1"], r: "E1.P2" }
    ]
};

var test22 = {
    title: "依赖关系测试22",
    dataSource: {
        "E1.P1": { expr: "Root().E1.Count().ToString()+PN1" },
        "E1.P2": { expr: "(P1+PN2.ToString()).Length()" },
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "(PN1+P1).Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.P1|E1.PN2|E1.P2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.P1|E1.PN2|E1.P2" },
        { cmd: ["remove", "E1"], r: "E1.P1|E1.PN2|E1.P2" },
        { cmd: ["update", "E1", "P1"], r: "E1.PN2|E1.P2" }
    ]
};

var test23 = {
    title: "依赖关系测试23",
    dataSource: {
        "E1.P1": { expr: "Root().E1.Count().ToString()+PN1" },
        "E1.P2": { expr: "(P1+PN2.ToString()+PN1).Length()" },
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "PN1.Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.P1|E1.PN2|E1.P2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.P1|E1.PN2|E1.P2" },
        { cmd: ["remove", "E1"], r: "E1.P1|E1.P2" },
        { cmd: ["update", "E1", "P1"], r: "E1.P2" }
    ]
};

var test24 = {
    title: "依赖关系测试24",
    dataSource: {
        "E1.P1": { expr: "Root().E1.Count().ToString()+PN1+PN2.ToString()" },
        "E1.P2": { expr: "(P1+PN2.ToString()+PN1).Length()" },
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "PN1.Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.PN2|E1.P1|E1.P2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.PN2|E1.P1|E1.P2" },
        { cmd: ["remove", "E1"], r: "E1.P1|E1.P2" },
        { cmd: ["update", "E1", "P1"], r: "E1.P2" },
        { cmd: ["update", "E1", "P2"], r: "" },
        { cmd: ["update", "E1", "PN1"], r: "E1.PN2|E1.P1|E1.P2" },
        { cmd: ["update", "E1", "PN2"], r: "E1.P1|E1.P2" }
    ]
};

var test221 = {
    title: "依赖关系测试221",
    dataSource: {
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "PN1.Length()" },
        "E1.Entity1.P1": { expr: "Root().E1.Count()+Parent().PN1.Length()" },
        "E1.Entity1.P2": { expr: "P1.Length()+Parent().PN2" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["remove", "E1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.PN2|E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["remove", "E1.Entity1"], r: "" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2" }
    ]
};

var test222 = {
    title: "依赖关系测试222",
    dataSource: {
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "(PN1+Entity1[0].P1).Length()" },
        "E1.Entity1.P1": { expr: "Root().E1.Count()+Parent().PN1.Length()" },
        "E1.Entity1.P2": { expr: "P1.Length()+Parent().PN2" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.Entity1.P1|E1.PN2|E1.Entity1.P2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.Entity1.P1|E1.PN2|E1.Entity1.P2" },
        { cmd: ["remove", "E1"], r: "E1.Entity1.P1|E1.PN2|E1.Entity1.P2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.Entity1.P1|E1.PN2|E1.Entity1.P2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.PN2|E1.Entity1.P2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.PN2|E1.Entity1.P2" },
        { cmd: ["remove", "E1.Entity1"], r: "E1.PN2|E1.Entity1.P2" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.PN2|E1.Entity1.P2" }
    ]
};

var test223 = {
    title: "依赖关系测试223",
    dataSource: {
        "E1.Entity1.P1": { expr: "Root().E1.Count().ToString()+Parent().PN1" },
        "E1.Entity1.P2": { expr: "(P1+Parent().PN2.ToString()+Parent().PN1).Length()" },
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "PN1.Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.Entity1.P1|E1.PN2|E1.Entity1.P2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.Entity1.P1|E1.PN2|E1.Entity1.P2" },
        { cmd: ["remove", "E1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.Entity1.P1|E1.PN2|E1.Entity1.P2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["remove", "E1.Entity1"], r: "" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2" }
    ]
};

var test224 = {
    title: "依赖关系测试224",
    dataSource: {
        "E1.Entity1.P1": { expr: "Root().E1.Count().ToString()+Parent().PN1+Parent().PN2.ToString()" },
        "E1.Entity1.P2": { expr: "(P1+Parent().PN2.ToString()+Parent().PN1).Length()" },
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "PN1.Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["remove", "E1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.PN2|E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["remove", "E1.Entity1"], r: "" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2" }
    ]
};

//var test241 = {
//    title: "依赖关系测试241RecNo",
//    dataSource: {
//        "E1.Entity1.P1": { expr: "Root().E1.Count().ToString()+Root().E1[Root().RecNo()].PN1+Root().E1[Root().RecNo()].PN2" },
//        "E1.Entity1.P2": { expr: "(Root().E1[Root().RecNo()].Entity1[0].P1+Root().E1[Root().RecNo()].PN2+Root().E1[Root().RecNo()].PN1).Length()" },
//        "E1.PN1": { expr: "'起点2'" },
//        "E1.PN2": { expr: "Root().E1[RecNo()].PN1.Length()" }
//    },
//    testCase: [
//        { cmd: ["load", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2" },
//        { cmd: ["add", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2" },
//        { cmd: ["remove", "E1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
//        { cmd: ["update", "E1", "PN1"], r: "E1.PN2|E1.Entity1.P1|E1.Entity1.P2" },
//        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
//        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
//        { cmd: ["remove", "E1.Entity1"], r: "" },
//        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2" }
//    ]
//};

//var test242 = {
//    title: "依赖关系测试242Sum",
//    dataSource: {
//        "E1.Entity1.P1": { expr: "Root().E1.Sum('PN1').ToString()+Root().E1[0].PN2" },
//        "E1.Entity1.P2": { expr: "(Root().E1[0].Entity1[0].P1+Root().E1[0].PN2+Root().E1[0].PN1).Length()" },
//        "E1.PN1": { expr: "'起点2'" },
//        "E1.PN2": { expr: "Root().E1[0].PN1.Length()" }
//    },
//    testCase: [
//        { cmd: ["load", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2" },
//        { cmd: ["add", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2" },
//        { cmd: ["remove", "E1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
//        { cmd: ["update", "E1", "PN1"], r: "E1.PN2|E1.Entity1.P1|E1.Entity1.P2" },
//        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
//        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
//        { cmd: ["remove", "E1.Entity1"], r: "" },
//        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2" }
//    ]
//};


var test231 = {
    title: "依赖关系测试231",
    dataSource: {
        "E2.P1": { expr: "Root().E1.Count().ToString()+Root().E1[0].P1+Root().E1[0].P2.ToString()" },
        "E2.P2": { expr: "(P1+Root().E1[0].P2.ToString()+Root().E1[0].P1).Length()" },
        "E1.P1": { expr: "'起点2'" },
        "E1.P2": { expr: "P1.Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.P1|E1.P2|E2.P1|E2.P2" },
        { cmd: ["add", "E1"], r: "E1.P1|E1.P2|E2.P1|E2.P2" },
        { cmd: ["remove", "E1"], r: "E2.P1|E2.P2" },
        { cmd: ["update", "E1", "P1"], r: "E1.P2|E2.P1|E2.P2" },
        { cmd: ["load", "E2"], r: "E2.P1|E2.P2" },
        { cmd: ["add", "E2"], r: "E2.P1|E2.P2" },
        { cmd: ["remove", "E2"], r: "" },
        { cmd: ["update", "E2", "P1"], r: "E2.P2" }
    ]
};

var test232 = {
    title: "依赖关系测试232",
    dataSource: {
        "E2.Entity1.P1": { expr: "Root().E1[0].Entity1.Count().ToString()+Root().E1[0].Entity1[0].P1+Root().E1[0].Entity1[0].P2.ToString()" },
        "E2.Entity1.P2": { expr: "P1+Root().E1[0].Entity1[0].P2.ToString()+Root().E1[0].Entity1[0].P1" },
        "E1.Entity1.P1": { expr: "'起点2'" },
        "E1.Entity1.P2": { expr: "P1" }
    },
    testCase: [
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.Entity1.P1|E2.Entity1.P2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.Entity1.P1|E2.Entity1.P2" },
        { cmd: ["remove", "E1.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2|E2.Entity1.P1|E2.Entity1.P2" },
        { cmd: ["load", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2" },
        { cmd: ["add", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2" },
        { cmd: ["remove", "E2.Entity1"], r: "" },
        { cmd: ["update", "E2.Entity1", "P1"], r: "E2.Entity1.P2" }
    ]
};


var test31 = {
    title: "依赖关系测试31",
    dataSource: {
        "E1.P1": { expr: "Root().E1.Count().ToString()+PN1" },
        "E1.P2": { expr: "P1.Length()" },
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "(P2.ToString()+PN1).Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.P1|E1.P2|E1.PN2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.P1|E1.P2|E1.PN2" },
        { cmd: ["remove", "E1"], r: "E1.P1|E1.P2|E1.PN2" },
        { cmd: ["update", "E1", "P1"], r: "E1.P2|E1.PN2" }
    ]
};

var test32 = {
    title: "依赖关系测试32",
    dataSource: {
        "E1.P1": { expr: "Root().E1.Count().ToString()+PN1" },
        "E1.P2": { expr: "P1.Length()" },
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "(P2.ToString()+PN1+P1).Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.P1|E1.P2|E1.PN2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.P1|E1.P2|E1.PN2" },
        { cmd: ["remove", "E1"], r: "E1.P1|E1.P2|E1.PN2" },
        { cmd: ["update", "E1", "P1"], r: "E1.P2|E1.PN2" }
    ]
};

var test33 = {
    title: "依赖关系测试33",
    dataSource: {
        "E1.P1": { expr: "Root().E1.Count().ToString()+PN1" },
        "E1.P2": { expr: "(P1+PN1).Length()" },
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "(P2.ToString()+PN1).Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.P1|E1.P2|E1.PN2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.P1|E1.P2|E1.PN2" },
        { cmd: ["remove", "E1"], r: "E1.P1|E1.P2|E1.PN2" },
        { cmd: ["update", "E1", "P1"], r: "E1.P2|E1.PN2" }
    ]
};

var test34 = {
    title: "依赖关系测试34",
    dataSource: {
        "E1.P1": { expr: "Root().E1.Count().ToString()+PN1" },
        "E1.P2": { expr: "(P1+PN1).Length()" },
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "(P2.ToString()+PN1+P1).Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.P1|E1.P2|E1.PN2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.P1|E1.P2|E1.PN2" },
        { cmd: ["remove", "E1"], r: "E1.P1|E1.P2|E1.PN2" },
        { cmd: ["update", "E1", "P1"], r: "E1.P2|E1.PN2" }
    ]
};

var test321 = {
    title: "依赖关系测试321",
    dataSource: {
        "E1.Entity1.P1": { expr: "Root().E1.Count().ToString()+Root().E1[0].PN1" },
        "E1.Entity1.P2": { expr: "Root().E1[0].Entity1[0].P1" },
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "(Root().E1[0].Entity1[0].P2.ToString()+Root().E1[0].PN1).Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["remove", "E1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["remove", "E1.Entity1"], r: "E1.Entity1.P2|E1.PN2" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2|E1.PN2" }
    ]
};

var test322 = {
    title: "依赖关系测试322",
    dataSource: {
        "E1.Entity1.P1": { expr: "Root().E1.Count().ToString()+Root().E1[0].PN1" },
        "E1.Entity1.P2": { expr: "Root().E1[0].Entity1[0].P1" },
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "(Root().E1[0].Entity1[0].P2.ToString()+Root().E1[0].PN1+Root().E1[0].Entity1[0].P1).Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["remove", "E1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["remove", "E1.Entity1"], r: "E1.Entity1.P2|E1.PN2" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2|E1.PN2" }
    ]
};

var test323 = {
    title: "依赖关系测试323",
    dataSource: {
        "E1.Entity1.P1": { expr: "Root().E1.Count().ToString()+Root().E1[0].PN1" },
        "E1.Entity1.P2": { expr: "(Root().E1[0].Entity1[0].P1+Root().E1[0].PN1).Length()" },
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "(Root().E1[0].Entity1[0].P2.ToString()+Root().E1[0].PN1).Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["remove", "E1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["remove", "E1.Entity1"], r: "E1.Entity1.P2|E1.PN2" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2|E1.PN2" }
    ]
};

var test324 = {
    title: "依赖关系测试324",
    dataSource: {
        "E1.Entity1.P1": { expr: "Root().E1.Count().ToString()+Root().E1[0].PN1" },
        "E1.Entity1.P2": { expr: "(Root().E1[0].Entity1[0].P1+Root().E1[0].PN1).Length()" },
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "(Root().E1[0].Entity1[0].P2.ToString()+Root().E1[0].PN1+Root().E1[0].Entity1[0].P1).Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["remove", "E1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E1.PN2" },
        { cmd: ["remove", "E1.Entity1"], r: "E1.Entity1.P2|E1.PN2" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2|E1.PN2" }
    ]
};


var test41 = {
    title: "依赖关系测试41",
    dataSource: {
        "E1.PU1": { expr: "'起点'+Root().E1.Count().ToString()" },
        "E1.PU2": { expr: "(PU1).Length()" },
        "E1.PU6": { expr: "PU2.ToString()+PN1" },
        "E1.PN1": { expr: "PU1" },
        "E1.PN2": { expr: "PN1.Length()+PU2" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PU1|E1.PU2|E1.PN1|E1.PU6|E1.PN2" },
        { cmd: ["add", "E1"], r: "E1.PU1|E1.PU2|E1.PN1|E1.PU6|E1.PN2" },
        { cmd: ["remove", "E1"], r: "E1.PU1|E1.PU2|E1.PN1|E1.PU6|E1.PN2" },
        { cmd: ["update", "E1", "PU1"], r: "E1.PU2|E1.PN1|E1.PU6|E1.PN2" }
    ]
};

var test42 = {
    title: "依赖关系测试42",
    dataSource: {
        "E1.PU1": { expr: "'起点'+Root().E1.Count().ToString()" },
        "E1.PU2": { expr: "(PU1).Length()" },
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "PN1.Length()+PU2" },
        "E1.P1": { expr: "PN1+PU1" },
        "E1.P2": { expr: "P1.Length()+PN2" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PU1|E1.PU2|E1.PN1|E1.PN2|E1.P1|E1.P2" },
        { cmd: ["add", "E1"], r: "E1.PU1|E1.PU2|E1.PN1|E1.PN2|E1.P1|E1.P2" },
        { cmd: ["remove", "E1"], r: "E1.PU1|E1.PU2|E1.PN2|E1.P1|E1.P2" },
        { cmd: ["update", "E1", "PU1"], r: "E1.PU2|E1.PN2|E1.P1|E1.P2" }
    ]
};

var test43 = {
    title: "依赖关系测试43",
    dataSource: {
        "E1.PU1": { expr: "'起点'+Root().E1.Count().ToString()" },
        "E1.PU2": { expr: "(PU1).Length()+PN2" },
        "E1.PN1": { expr: "'起点2'" },
        "E1.PN2": { expr: "PN1.Length()+P2" },
        "E1.P1": { expr: "PN1+PU1" },
        "E1.P2": { expr: "P1.Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PU1|E1.PN1|E1.P1|E1.P2|E1.PN2|E1.PU2" },
        { cmd: ["add", "E1"], r: "E1.PU1|E1.PN1|E1.P1|E1.P2|E1.PN2|E1.PU2" },
        { cmd: ["remove", "E1"], r: "E1.PU1|E1.P1|E1.P2|E1.PN2|E1.PU2" },
        { cmd: ["update", "E1", "PU1"], r: "E1.P1|E1.P2|E1.PN2|E1.PU2" }
    ]
};

//var test51 = {
//    title: "依赖关系测试51",
//    dataSource: {
//        "E1.PU1": { expr: "'起点'+Root().E1.Count().ToString()" },
//        "E1.PU2": { expr: "(PU1+PN2).Length()" },
//        "E1.PU6": { expr: "PU2==6==PN6" },
//        "E1.PN1": { expr: "PU1" },
//        "E1.PN2": { expr: "PN1.Length()+P2" },
//        "E1.PN6": { expr: "PN2==6==P6" },
//        "E1.P1": { expr: "PN1+Root().E1.Count().ToString()" },
//        "E1.P2": { expr: "P1.Length()" },
//        "E1.P6": { expr: "P2==6" }
//    },
//    testCase: [
//        { cmd: ["load", "E1"], r: "E1.PU1|E1.PN1|E1.P1|E1.P2|E1.PN2|E1.PU2|E1.P6|E1.PN6|E1.PU6" },
//        { cmd: ["add", "E1"], r: "E1.PU1|E1.PN1|E1.P1|E1.P2|E1.PN2|E1.PU2|E1.P6|E1.PN6|E1.PU6" },
//        { cmd: ["remove", "E1"], r: "E1.PU1|E1.PN1|E1.P1|E1.P2|E1.PN2|E1.PU2|E1.P6|E1.PN6|E1.PU6" },
//        { cmd: ["update", "E1", "P1"], r: "E1.P2|E1.PN2|E1.PU2|E1.P6|E1.PN6|E1.PU6" }
//    ]
//};

var test50 = {
    title: "依赖关系测试50二对一",
    dataSource: {
        "E1.Entity1.P1": { expr: "Parent().PN1+Parent().PN2.ToString()" },
        "E1.Entity1.P2": { expr: "(P1+Parent().PN2.ToString()+Parent().PN1).Length()" },
        "E1.PN1": { expr: "'起点1'" },
        "E1.PN2": { expr: "PN1.Length()" },
        "E2.Entity1.P1": { expr: "Parent().PN1" },
        "E2.Entity1.P2": { expr: "(P1+Parent().PN1).Length()" },
        "E2.PN1": { expr: "'起点2'" },
        "E2.PN2": { expr: "(Entity1[0].P2.ToString()+PN1+Entity1[0].P1+Root().E1[0].Entity1[0].P2.ToString()).ToNumber()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E1"], r: "E2.PN2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E1.Entity1"], r: "E2.PN2" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E2"], r: "" },
        { cmd: ["update", "E2", "PN1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E2.Entity1"], r: "E2.PN2" },
        { cmd: ["update", "E2.Entity1", "P1"], r: "E2.Entity1.P2|E2.PN2" }
    ]
};

var test51 = {
    title: "依赖关系测试51二对一RecNo",
    dataSource: {
        "E1.Entity1.P1": { expr: "Parent().PN1+Parent().PN2.ToString()" },
        "E1.Entity1.P2": { expr: "(RecNo().ToString()+P1+Parent().PN2.ToString()+Parent().PN1).Length()" },
        "E1.PN1": { expr: "'起点1'" },
        "E1.PN2": { expr: "RecNo()+PN1.Length()" },
        "E2.Entity1.P1": { expr: "Parent().PN1" },
        "E2.Entity1.P2": { expr: "(RecNo().ToString()+P1+Parent().PN1).Length()" },
        "E2.PN1": { expr: "'起点2'" },
        "E2.PN2": { expr: "(RecNo().ToString()+Entity1[0].P2.ToString()+PN1+Entity1[0].P1+Root().E1[0].Entity1[0].P2.ToString()).Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E1"], r: "E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E1.Entity1"], r: "E1.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E2"], r: "E2.PN2" },
        { cmd: ["update", "E2", "PN1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E2.Entity1"], r: "E2.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E2.Entity1", "P1"], r: "E2.Entity1.P2|E2.PN2" }
    ]
};

var test52 = {
    title: "依赖关系测试52二对一RecNo",
    dataSource: {
        "E1.Entity1.P1": { expr: "Root().E1[Parent().RecNo()].PN1+Root().E1[Parent().RecNo()].PN2.ToString()" },
        "E1.Entity1.P2": { expr: "(Root().E1[Parent().RecNo()].Entity1[0].P1+Root().E1[Parent().RecNo()].PN2.ToString()+Root().E1[Parent().RecNo()].PN1).Length()" },
        "E1.PN1": { expr: "'起点1'" },
        "E1.PN2": { expr: "PN1.Length()" },
        "E2.Entity1.P1": { expr: "Root().E2[Parent().RecNo()].PN1" },
        "E2.Entity1.P2": { expr: "(Root().E2[Parent().RecNo()].Entity1[RecNo()].P1+Root().E2[Parent().RecNo()].PN1).Length()" },
        "E2.PN1": { expr: "'起点2'" },
        "E2.PN2": { expr: "(Entity1[0].P2.ToString()+PN1+Entity1[0].P1+Root().E1[0].Entity1[0].P2.ToString()).Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E1.Entity1"], r: "E1.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E2"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E2", "PN1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E2.Entity1"], r: "E2.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E2.Entity1", "P1"], r: "E2.Entity1.P2|E2.PN2" }
    ]
};

var test53 = {
    title: "依赖关系测试53二对一Count",
    dataSource: {
        "E1.Entity1.P1": { expr: "Root().E1.Count().ToString()+Parent().PN1+Parent().PN2.ToString()" },
        "E1.Entity1.P2": { expr: "(P1+Parent().PN2.ToString()+Parent().PN1).Length()" },
        "E1.PN1": { expr: "'起点1'" },
        "E1.PN2": { expr: "PN1.Length()" },
        "E2.Entity1.P1": { expr: "Parent().Entity1.Count().ToString()+Parent().PN1" },
        "E2.Entity1.P2": { expr: "(P1+Parent().PN1).Length()" },
        "E2.PN1": { expr: "'起点2'" },
        "E2.PN2": { expr: "(Entity1[0].P2.ToString()+PN1+Entity1[0].P1+Root().E1[0].Entity1[0].P2.ToString()).Length()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E1.Entity1"], r: "E2.PN2" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E2"], r: "" },
        { cmd: ["update", "E2", "PN1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E2.Entity1", "P1"], r: "E2.Entity1.P2|E2.PN2" }
    ]
};

var test54 = {
    title: "依赖关系测试54二对一Sum",
    dataSource: {
        "E1.Entity1.P1": { expr: "Root().E1.Sum('PN1').ToString()+Parent().PN2.ToString()" },
        "E1.Entity1.P2": { expr: "(P1+Parent().PN2.ToString()+Parent().PN1).Length()" },
        "E1.PN1": { expr: "'起点1'" },
        "E1.PN2": { expr: "PN1.Length()" },
        "E2.Entity1.P1": { expr: "Parent().PN1" },
        "E2.Entity1.P2": { expr: "(P1+Parent().PN1).Length()" },
        "E2.PN1": { expr: "'起点2'" },
        "E2.PN2": { expr: "Entity1[0].P2.ToString()+Root().E2.Sum('PN1')+Entity1[0].P1+Root().E1[0].Entity1[0].P2.ToString()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E1.Entity1"], r: "E2.PN2" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E2"], r: "E2.PN2" },
        { cmd: ["update", "E2", "PN1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E2.Entity1"], r: "E2.PN2" },
        { cmd: ["update", "E2.Entity1", "P1"], r: "E2.Entity1.P2|E2.PN2" }
    ]
};

var test55 = {
    title: "依赖关系测试55二对一Max",
    dataSource: {
        "E1.Entity1.P1": { expr: "Root().E1.Max('PN1')+Parent().PN2" },
        "E1.Entity1.P2": { expr: "(P1+Parent().PN2.ToString()+Parent().PN1).Length()" },
        "E1.PN1": { expr: "'起点1'" },
        "E1.PN2": { expr: "PN1.Length()" },
        "E2.Entity1.P1": { expr: "Parent().PN1" },
        "E2.Entity1.P2": { expr: "(P1+Parent().PN1).Length()" },
        "E2.PN1": { expr: "'起点2'" },
        "E2.PN2": { expr: "Entity1[0].P2.ToString()+Root().E2.Max('PN1')+Entity1[0].P1+Root().E1[0].Entity1[0].P2.ToString()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E1.Entity1"], r: "E2.PN2" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E2"], r: "E2.PN2" },
        { cmd: ["update", "E2", "PN1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E2.Entity1"], r: "E2.PN2" },
        { cmd: ["update", "E2.Entity1", "P1"], r: "E2.Entity1.P2|E2.PN2" }
    ]
};

var test56 = {
    title: "依赖关系测试56二对一Min",
    dataSource: {
        "E1.Entity1.P1": { expr: "Root().E1.Min('PN1')+Root().E1.Min('PN2')" },
        "E1.Entity1.P2": { expr: "(Parent().Entity1.Min('P1')+Root().E1.Min('PN2')+Root().E1.Min('PN1')).ToString().Length()" }, //
        "E1.PN1": { expr: "'起点1'" },
        "E1.PN2": { expr: "Root().E1.Min('PN1').ToString().Length()" },
        "E2.Entity1.P1": { expr: "Root().E2.Min('PN1')" },
        "E2.Entity1.P2": { expr: "(Parent().Entity1.Min('P1')+Root().E2.Min('PN1')).ToString().Length()" },
        "E2.PN1": { expr: "'起点2'" },
        "E2.PN2": { expr: "Entity1.Min('P2')+Root().E2.Min('PN1')+Entity1.Min('P1')+Root().E1[0].Entity1.Min('P2')" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E1"], r: "E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E1.Entity1"], r: "E1.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E2"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E2", "PN1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E2.Entity1"], r: "E2.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E2.Entity1", "P1"], r: "E2.Entity1.P2|E2.PN2" }
    ]
};

var test57 = {
    title: "依赖关系测试57二对一Average",
    dataSource: {
        "E1.Entity1.P1": { expr: "Root().E1.Average('PN1')+Root().E1.Average('PN2')" },
        "E1.Entity1.P2": { expr: "(Parent().Entity1.Average('P1')+Root().E1.Average('PN2')+Root().E1.Average('PN1')).ToString().Length()" }, //
        "E1.PN1": { expr: "'起点1'" },
        "E1.PN2": { expr: "Root().E1.Average('PN1').ToString().Length()" },
        "E2.Entity1.P1": { expr: "Root().E2.Average('PN1')" },
        "E2.Entity1.P2": { expr: "(Parent().Entity1.Average('P1')+Root().E2.Average('PN1')).ToString().Length()" },
        "E2.PN1": { expr: "'起点2'" },
        "E2.PN2": { expr: "Entity1.Average('P2')+Root().E2.Average('PN1')+Entity1.Average('P1')+Root().E1[0].Entity1.Average('P2')" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E1"], r: "E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E1.Entity1"], r: "E1.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E2"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E2", "PN1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E2.Entity1"], r: "E2.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E2.Entity1", "P1"], r: "E2.Entity1.P2|E2.PN2" }
    ]
};

var test58 = {
    title: "依赖关系测试58二对一Distinct",
    dataSource: {
        "E1.Entity1.P1": { expr: "Root().E1.Distinct('PN1')[0].PN1+Root().E1.Distinct('PN2')[0].PN2.ToString()" },
        "E1.Entity1.P2": { expr: "(Parent().Entity1.Distinct('P1')[0].P1+Root().E1.Distinct('PN2')[0].PN2.ToString()+Root().E1.Distinct('PN1')[0].PN1).ToString().Length()" }, //
        "E1.PN1": { expr: "'起点1'" },
        "E1.PN2": { expr: "Root().E1.Distinct('PN1')[0].PN1.ToString().Length()" },
        "E2.Entity1.P1": { expr: "Root().E2.Distinct('PN1')[0].PN1" },
        "E2.Entity1.P2": { expr: "(Parent().Entity1.Distinct('P1')[0].P1+Root().E2.Distinct('PN1')[0].PN1).ToString().Length()" },
        "E2.PN1": { expr: "'起点2'" },
        "E2.PN2": { expr: "Entity1.Distinct('P2')[0].P2.ToString()+Root().E2.Distinct('PN1')[0].PN1+Entity1.Distinct('P1')[0].P1+Root().E1[0].Entity1.Distinct('P2')[0].P2.ToString()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E1"], r: "E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E1.Entity1"], r: "E1.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E2"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E2", "PN1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E2.Entity1"], r: "E2.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E2.Entity1", "P1"], r: "E2.Entity1.P2|E2.PN2" }
    ]
};

var test59 = {
    title: "依赖关系测试59二对一Where",
    dataSource: {
        "E1.Entity1.P1": { expr: "Root().E1.Where('PN1')[0].PN1+Root().E1.Where('PN2')[0].PN2.ToString()" },
        "E1.Entity1.P2": { expr: "(Parent().Entity1.Where('P1')[0].P1+Root().E1.Where('PN2')[0].PN2.ToString()+Root().E1.Where('PN1')[0].PN1).ToString().Length()" }, //
        "E1.PN1": { expr: "'起点1'" },
        "E1.PN2": { expr: "Root().E1.Where('PN1')[0].PN1.ToString().Length()" },
        "E2.Entity1.P1": { expr: "Root().E2.Where('PN1')[0].PN1" },
        "E2.Entity1.P2": { expr: "(Parent().Entity1.Where('P1')[0].P1+Root().E2.Where('PN1')[0].PN1).ToString().Length()" },
        "E2.PN1": { expr: "'起点2'" },
        "E2.PN2": { expr: "Entity1.Where('P2')[0].P2.ToString()+Root().E2.Where('PN1')[0].PN1+Entity1.Where('P1')[0].P1+Root().E1[0].Entity1.Where('P2')[0].P2.ToString()" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E1"], r: "E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.PN2|E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E1.Entity1"], r: "E1.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "E1.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E2"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E2", "PN1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["load", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["add", "E2.Entity1"], r: "E2.Entity1.P1|E2.Entity1.P2|E2.PN2" },
        { cmd: ["remove", "E2.Entity1"], r: "E2.Entity1.P2|E2.PN2" },
        { cmd: ["update", "E2.Entity1", "P1"], r: "E2.Entity1.P2|E2.PN2" }
    ]
};

var test501 = {
    title: "依赖关系测试501二对一",
    dataSource: {
        "E2.Entity1.P1": { expr: "Root().E2[0].PN2" },
        "E2.PN1": { expr: "Root().E2[0].PN2" }
    },
    testCase: [
        { cmd: ["remove", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["add", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["update", "E2", "PN2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["update", "E2", "PN1"], r: "" },
        { cmd: ["load", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["load", "E1.Entity1"], r: "" }
    ]
};

var test502 = {
    title: "依赖关系测试502二对一",
    dataSource: {
        "E2.Entity1.P1": { expr: "Root().E2[0].PN1" },
        "E2.PN1": { expr: "''" },
        "E2.PN2": { expr: "Root().E2[0].PN1" }
    },
    testCase: [
        { cmd: ["remove", "E2"], r: "E2.Entity1.P1|E2.PN2" },
        { cmd: ["add", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.PN2" },
        { cmd: ["update", "E2", "PN1"], r: "E2.Entity1.P1|E2.PN2" },
        { cmd: ["update", "E2", "PN2"], r: "" },
        { cmd: ["load", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.PN2" },
        { cmd: ["load", "E1.Entity1"], r: "" }
    ]
};

var test503 = {
    title: "依赖关系测试503二对一",
    dataSource: {
        "E2.Entity1.P1": { expr: "IIf(Root().E2.Count()>2,Root().E2[1].PN1,Root().E2[1].PN2)" },
        "E2.PN1": { expr: "''" },
        "E2.PN2": { expr: "IIf(Root().E2.Count()>2,Root().E2[1].PN1,'')" }
    },
    testCase: [
        { cmd: ["remove", "E2"], r: "E2.PN2|E2.Entity1.P1" },
        { cmd: ["add", "E2"], r: "E2.PN1|E2.PN2|E2.Entity1.P1" },
        { cmd: ["update", "E2", "PN1"], r: "E2.PN2|E2.Entity1.P1" },
        { cmd: ["update", "E2", "PN2"], r: "E2.Entity1.P1" },
        { cmd: ["load", "E2"], r: "E2.PN1|E2.PN2|E2.Entity1.P1" },
        { cmd: ["load", "E1.Entity1"], r: "" }
    ]
};

var test521 = {
    title: "依赖关系测试521二对一RecNo",
    dataSource: {
        "E2.Entity1.P1": { expr: "Root().E2[Parent().RecNo()].PN1" },
        "E2.PN1": { expr: "'起点2'" },
        "E2.PN2": { expr: "(Root().E2[RecNo()].PN1).Length()" }
    },
    testCase: [
        { cmd: ["remove", "E2"], r: "E2.Entity1.P1|E2.PN2" },
        { cmd: ["add", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.PN2" },
        { cmd: ["update", "E2", "PN1"], r: "E2.Entity1.P1|E2.PN2" },
        { cmd: ["update", "E2", "PN2"], r: "" },
        { cmd: ["load", "E2"], r: "E2.PN1|E2.Entity1.P1|E2.PN2" },
        { cmd: ["load", "E1.Entity1"], r: "" }
    ]
};

var test531 = {
    title: "依赖关系测试531二对一",
    dataSource: {
        "E2.Entity1.P1": { expr: "Root().E2.Count()" },
        "E2.PN1": { expr: "Root().E2.Count()" }
    },
    testCase: [
        { cmd: ["remove", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["add", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["update", "E2", "PN1"], r: "" },
        { cmd: ["load", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["load", "E1.Entity1"], r: "" }
    ]
};

var test541 = {
    title: "依赖关系测试541二对一",
    dataSource: {
        "E2.Entity1.P1": { expr: "Root().E2.Sum('PN2')" },
        "E2.PN1": { expr: "Root().E2.Sum('PN2')" }
    },
    testCase: [
        { cmd: ["remove", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["add", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["update", "E2", "PN1"], r: "" },
        { cmd: ["update", "E2", "PN2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["load", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["load", "E1.Entity1"], r: "" }
    ]
};

var test551 = {
    title: "依赖关系测试551二对一",
    dataSource: {
        "E2.Entity1.P1": { expr: "Root().E2.Max('PN2')" },
        "E2.PN1": { expr: "Root().E2.Max('PN2')" }
    },
    testCase: [
        { cmd: ["remove", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["add", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["update", "E2", "PN1"], r: "" },
        { cmd: ["update", "E2", "PN2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["load", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["load", "E1.Entity1"], r: "" }
    ]
};

var test561 = {
    title: "依赖关系测试561二对一",
    dataSource: {
        "E2.Entity1.P1": { expr: "Root().E2.Min('PN2')" },
        "E2.PN1": { expr: "Root().E2.Min('PN2')" }
    },
    testCase: [
        { cmd: ["remove", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["add", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["update", "E2", "PN1"], r: "" },
        { cmd: ["update", "E2", "PN2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["load", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["load", "E1.Entity1"], r: "" }
    ]
};

var test571 = {
    title: "依赖关系测试571二对一",
    dataSource: {
        "E2.Entity1.P1": { expr: "Root().E2.Average('PN2')" },
        "E2.PN1": { expr: "Root().E2.Average('PN2')" }
    },
    testCase: [
        { cmd: ["remove", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["add", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["update", "E2", "PN1"], r: "" },
        { cmd: ["update", "E2", "PN2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["load", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["load", "E1.Entity1"], r: "" }
    ]
};

var test581 = {
    title: "依赖关系测试581二对一",
    dataSource: {
        "E2.Entity1.P1": { expr: "Root().E2.Distinct('PN2')[0].PN3" },
        "E2.PN1": { expr: "Root().E2.Distinct('PN2')[0].PN3" }
    },
    testCase: [
        { cmd: ["remove", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["add", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["update", "E2", "PN2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["update", "E2", "PN3"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["load", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["load", "E1.Entity1"], r: "" }
    ]
};

var test582 = {
    title: "依赖关系测试582二对一",
    dataSource: {
        "E2.Entity1.P1": { expr: "Root().E2.Distinct('PN2')[0].PN3" },
        "E2.PN1": { expr: "Root().E2.Distinct('PN2')[0].PN3" },
        "E2.PN2": { expr: "''" },
        "E2.PN3": { expr: "''" }
    },
    testCase: [
        { cmd: ["remove", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["add", "E2"], r: "E2.PN2|E2.PN3|E2.Entity1.P1|E2.PN1" },
        { cmd: ["update", "E2", "PN2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["update", "E2", "PN3"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["load", "E2"], r: "E2.PN2|E2.PN3|E2.Entity1.P1|E2.PN1" },
        { cmd: ["load", "E1.Entity1"], r: "" }
    ]
};

var test583 = {
    title: "依赖关系测试583二对一",
    dataSource: {
        "E2.Entity1.P1": { expr: "Root().E2.Distinct('PN2').Count()" },
        "E2.PN1": { expr: "Root().E2.Distinct('PN2').Count()" }
    },
    testCase: [
        { cmd: ["remove", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["add", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["update", "E2", "PN2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["update", "E2", "PN1"], r: "" },
        { cmd: ["load", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["load", "E1.Entity1"], r: "" }
    ]
};

var test591 = {
    title: "依赖关系测试591二对一Where",
    dataSource: {
        "E1.Entity1.P1": { expr: "Root().E1.Where('PN1==\"1\"')[0].PN1" },
        "E1.Entity1.P2": { expr: "Root().E1.Where('PN1==\"1\"')[0].PN2" },
        "E1.PN1": { expr: "'起点1'" },
        "E1.PN2": { expr: "'起点2'" }
    },
    testCase: [
        { cmd: ["load", "E1"], r: "E1.PN1|E1.Entity1.P1|E1.PN2|E1.Entity1.P2" },
        { cmd: ["add", "E1"], r: "E1.PN1|E1.Entity1.P1|E1.PN2|E1.Entity1.P2" },
        { cmd: ["remove", "E1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["update", "E1", "PN1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["update", "E1", "PN2"], r: "E1.Entity1.P2" },
        { cmd: ["load", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["add", "E1.Entity1"], r: "E1.Entity1.P1|E1.Entity1.P2" },
        { cmd: ["remove", "E1.Entity1"], r: "" },
        { cmd: ["update", "E1.Entity1", "P1"], r: "" }
    ]
};

var test592 = {
    title: "依赖关系测试592二对一",
    dataSource: {
        "E2.Entity1.P1": { expr: "Root().E2.Where('PN2!=null')[0].PN3" },
        "E2.PN1": { expr: "Root().E2.Where('PN2!=null')[0].PN3" }
    },
    testCase: [
        { cmd: ["remove", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["add", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["update", "E2", "PN2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["update", "E2", "PN3"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["load", "E2"], r: "E2.Entity1.P1|E2.PN1" },
        { cmd: ["load", "E1.Entity1"], r: "" }
    ]
};

var test593 = {
    title: "依赖关系测试592二对一",
    dataSource: {
        "E2.Entity1.P1": { expr: "Root().E2.Where('PN2!=null')[0].PN1" },
        "E2.PN1": { expr: "Root().E2.Where('PN2!=null')[0].PN1" }
    },
    testCase: [
        { cmd: ["remove", "E2"], r: "E2.PN1|E2.Entity1.P1" },
        { cmd: ["add", "E2"], r: "E2.PN1|E2.Entity1.P1" }
    ]
};


var test601 = {
    title: "依赖关系测试601",
    dataSource: {
        "E1.P2": { expr: "Entity1.Sum('P2')" },
        "E1.Entity1.P2": { expr: "Parent().PN2" }
    },
    testCase: [
        { cmd: ["update", "E1", "PN2"], r: "E1.Entity1.P2|E1.P2" }
    ]
};

window.demoDependencies = [test11, test12, test13, test14, test15,
test21, test22, test23, test24, test221, test222, test223, test224, test231, test232,
test31, test32, test33, test34, test321, test322, test323, test324,
test41, test42, test43,
test50, test51, test52, test53, test54, test55, test56, test57, test58, test59, test591,
test501, test502, test503, test521, test531, test541, test551, test561, test571, test581, test582, test583, test591, test592, test593,
test601];
