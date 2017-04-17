export default {
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
