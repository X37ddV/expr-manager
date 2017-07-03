if (!window.dateTime) {
    window.dateTime = new Date();
}
var context = {
    userId: "admin",
    userName: "管理员",
    userCode: "00000"
};
var data = {
    E1: [{
        ID: 11,
        P1: "E1的第1条数据",
        P2: 12345.678,
        P3: { name: "item1", alias: { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"} },
        P4: [1, 2, { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"}],
        P5: dateTime,
        P6: true,
        PN1: null,
        PN2: null,
        PN3: null,
        PN4: null,
        PN5: null,
        PN6: null,
        PU1: undefined,
        PU2: undefined,
        PU3: undefined,
        PU4: undefined,
        PU5: undefined,
        PU6: undefined,
        Entity1: [{
            ID: 101,
            P1: "E1[0].Entity1第1条数据",
            P2: 1.95,
            P3: { name: "item1", alias: { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"} },
            P4: [1, 2, { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"}],
            P5: dateTime,
            P6: true,
            PN1: null,
            PN2: null,
            PN3: null,
            PN4: null,
            PN5: null,
            PN6: null,
            PU1: undefined,
            PU2: undefined,
            PU3: undefined,
            PU4: undefined,
            PU5: undefined,
            PU6: undefined
        }, {
            ID: 102,
            P1: "E1[0].Entity1第2条数据",
            P2: 2.95,
            P3: { name: "item1", alias: { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"} },
            P4: [1, 2, { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"}],
            P5: dateTime,
            P6: true,
            PN1: null,
            PN2: null,
            PN3: null,
            PN4: null,
            PN5: null,
            PN6: null,
            PU1: undefined,
            PU2: undefined,
            PU3: undefined,
            PU4: undefined,
            PU5: undefined,
            PU6: undefined,
            NewEntity1: [
            {
                ID: 101,
                P1: "E1[0].Entity1[1].NewEntity1第1条数据",
                P2: 1.95,
                P3: { name: "item1", alias: { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"} },
                P4: [1, 2, { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"}],
                P5: dateTime,
                P6: true,
                PN1: null,
                PN2: null,
                PN3: null,
                PN4: null,
                PN5: null,
                PN6: null,
                PU1: undefined,
                PU2: undefined,
                PU3: undefined,
                PU4: undefined,
                PU5: undefined,
                PU6: undefined
            }, {
                ID: 102,
                P1: "E1[0].Entity1[1].NewEntity1第2条数据",
                P2: 2.95,
                P3: { name: "item1", alias: { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"} },
                P4: [1, 2, { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"}],
                P5: dateTime,
                P6: true,
                PN1: null,
                PN2: null,
                PN3: null,
                PN4: null,
                PN5: null,
                PN6: null,
                PU1: undefined,
                PU2: undefined,
                PU3: undefined,
                PU4: undefined,
                PU5: undefined,
                PU6: undefined
            }, {
                ID: 103,
                P1: "E1[0].Entity1[1].NewEntity1第3条数据",
                P2: 3.95,
                P3: { name: "item1", alias: { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"} },
                P4: [1, 2, { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"}],
                P5: dateTime,
                P6: true,
                PN1: null,
                PN2: null,
                PN3: null,
                PN4: null,
                PN5: null,
                PN6: null,
                PU1: undefined,
                PU2: undefined,
                PU3: undefined,
                PU4: undefined,
                PU5: undefined,
                PU6: undefined
            }

            ]
        }, {
            ID: 103,
            P1: "E1[0].Entity1第3条数据",
            P2: 1.95,
            P3: { name: "item1", alias: { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"} },
            P4: [1, 2, { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"}],
            P5: dateTime,
            P6: true,
            PN1: null,
            PN2: null,
            PN3: null,
            PN4: null,
            PN5: null,
            PN6: null,
            PU1: undefined,
            PU2: undefined,
            PU3: undefined,
            PU4: undefined,
            PU5: undefined,
            PU6: undefined
        }],
        Entity2: [{
            ID: 201, P1: "E1[0].Entity2第1条数据", P2: 12.23
        }, {
            ID: 202, P1: "E1[0].Entity2第2条数据", P2: 8.01
        }]
    }, {
        ID: 12,
        P1: "E1的第2条数据",
        P2: 12345.678,
        P3: { name: "item1", alias: { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"} },
        P4: [3, 'vxcvxc', { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"}],
        P5: dateTime,
        P6: true,
        PN1: null,
        PN2: null,
        PN3: null,
        PN4: null,
        PN5: null,
        PN6: null,
        PU1: undefined,
        PU2: undefined,
        PU3: undefined,
        PU4: undefined,
        PU5: undefined,
        PU6: undefined,
        Entity1: [{
            ID: 101,
            P1: "E1[1].Entity1第1条数据",
            P2: 1.95,
            P3: { name: "item1", alias: { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"} },
            P4: [1, 2, { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"}],
            P5: dateTime,
            P6: true,
            PN1: null,
            PN2: null,
            PN3: null,
            PN4: null,
            PN5: null,
            PN6: null,
            PU1: undefined,
            PU2: undefined,
            PU3: undefined,
            PU4: undefined,
            PU5: undefined,
            PU6: undefined
        }, {
            ID: 102,
            P1: "E1[1].Entity1第2条数据",
            P2: 2.95,
            P3: { name: "item1", alias: { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"} },
            P4: [1, 2, { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"}],
            P5: dateTime,
            P6: true,
            PN1: null,
            PN2: null,
            PN3: null,
            PN4: null,
            PN5: null,
            PN6: null,
            PU1: undefined,
            PU2: undefined,
            PU3: undefined,
            PU4: undefined,
            PU5: undefined,
            PU6: undefined
        }]
    }],
    E2: [{
        ID: 21,
        P1: "E2的第1条数据",
        P2: 12345.678,
        P3: { name: "item1", alias: { en: "Item1", zh_CN: "项目1", zh_TW: "項目1"} },
        P4: [{ en: "Item1", zh_CN: "项目1", zh_TW: "項目1" }],
        //P5: new Date("Fri Dec 31 23:59:59 UTC+0800 1999"),
        P5: moment("1999-12-31T23:59:59").toDate(),
        P6: true,
        PN1: null,
        PN2: null,
        PN3: null,
        PN4: null,
        PN5: null,
        PN6: null,
        PU1: undefined,
        PU2: undefined,
        PU3: undefined,
        PU4: undefined,
        PU5: undefined,
        PU6: undefined,
        Entity1: [{
            ID: 201, P1: "E2[0].Entity1的第1条数据", P2: 12.23
        }, {
            ID: 202, P1: "E2[0].Entity1的第2条数据", P2: 8.01
        }, {
            ID: 203, P1: "E2[0].Entity1的第3条数据", P2: 12.23
        }, {
            ID: 204, P1: "E2[0].Entity1的第4条数据", P2: 12.23
        }, {
            ID: 205, P1: "E2[0].Entity1的第5条数据", P2: 12.23
        }, {
            ID: 206, P1: "E2[0].Entity1的第6条数据", P2: 12.23
        }, {
            ID: 207, P1: "E2[0].Entity1的第7条数据", P2: 12.23
        }, {
            ID: 208, P1: "E2[0].Entity1的第8条数据", P2: 12.23
        }]
    }]
};
var dataContext = {
    E1: {
        fields: {
            "ID": { type: "number", primaryKey: true },
            "P1": { type: "string" },
            "P2": { type: "number" },
            "P3": { type: "object" },
            "P4": { type: "array" },
            "P5": { type: "date" },
            "P6": { type: "boolean" },
            "PN1": { type: "string" },
            "PN2": { type: "number" },
            "PN3": { type: "object" },
            "PN4": { type: "object" },
            "PN5": { type: "date" },
            "PN6": { type: "boolean" },
            "PU1": { type: "string" },
            "PU2": { type: "number" },
            "PU3": { type: "object" },
            "PU4": { type: "object" },
            "PU5": { type: "date" },
            "PU6": { type: "boolean" }
        },
        childs: {
            Entity1: {
                fields: {
                    "ID": { type: "number", primaryKey: true },
                    "P1": { type: "string" },
                    "P2": { type: "number" },
                    "P3": { type: "object" },
                    "P4": { type: "array" },
                    "P5": { type: "date" },
                    "P6": { type: "boolean" },
                    "PN1": { type: "string" },
                    "PN2": { type: "number" },
                    "PN3": { type: "object" },
                    "PN4": { type: "array" },
                    "PN5": { type: "date" },
                    "PN6": { type: "boolean" },
                    "PU1": { type: "string" },
                    "PU2": { type: "number" },
                    "PU3": { type: "object" },
                    "PU4": { type: "array" },
                    "PU5": { type: "date" },
                    "PU6": { type: "boolean" }
                },
                childs: {
                    NewEntity1: {
                        fields: {
                            "ID": { type: "number", primaryKey: true },
                            "P1": { type: "string" },
                            "P2": { type: "number" },
                            "P3": { type: "object" },
                            "P4": { type: "array" },
                            "P5": { type: "date" },
                            "P6": { type: "boolean" },
                            "PN1": { type: "string" },
                            "PN2": { type: "number" },
                            "PN3": { type: "object" },
                            "PN4": { type: "array" },
                            "PN5": { type: "date" },
                            "PN6": { type: "boolean" },
                            "PU1": { type: "string" },
                            "PU2": { type: "number" },
                            "PU3": { type: "object" },
                            "PU4": { type: "array" },
                            "PU5": { type: "date" },
                            "PU6": { type: "boolean" }
                        }
                    }
                }
            },
            Entity2: {
                fields: {
                    "ID": { type: "number", primaryKey: true },
                    "P1": { type: "string" },
                    "P2": { type: "number" }
                }
            }
        }
    },
    E2: {
        fields: {
            "ID": { type: "number", primaryKey: true },
            "P1": { type: "string" },
            "P2": { type: "number" },
            "P3": { type: "object" },
            "P4": { type: "array" },
            "P5": { type: "date" },
            "P6": { type: "boolean" },
            "PN1": { type: "string" },
            "PN2": { type: "number" },
            "PN3": { type: "object" },
            "PN4": { type: "array" },
            "PN5": { type: "date" },
            "PN6": { type: "boolean" },
            "PU1": { type: "string" },
            "PU2": { type: "number" },
            "PU3": { type: "object" },
            "PU4": { type: "array" },
            "PU5": { type: "date" },
            "PU6": { type: "boolean" }
        },
        childs: {
            Entity1: {
                fields: {
                    "ID": { type: "number", primaryKey: true },
                    "P1": { type: "string" },
                    "P2": { type: "number" }
                }
            }
        }
    }
};
var dataCursor = {
    "E1": 0,
    "E1.Entity1": 0,
    "E1.Entity1.NewEntity1": 0,
    "E1.Entity2": 0,
    "E2": 0,
    "E2.Entity2": 0
};
