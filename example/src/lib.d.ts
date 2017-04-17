declare module "*.tpl";

interface JQueryEasyGridColumn {
    dataField?: string;
    sort?: "" | "desc" | "asc";
    text?: string;
    type?: "" | "checkbox" | "radio" | "tree";
    valueClass?: string;
    width?: number;
}
interface JQueryEasyGridData {
    _children?: Array<JQueryEasyGridData>;
    _id?: number;
    [propName: string]: any;
}
interface JQueryEasyGridOptions {
    columns?: Array<JQueryEasyGridColumn>;
    childrenField?: string;
    data?: Array<JQueryEasyGridData>;
    idField?: string;
    isAllowKeyboard?: boolean;
    isAllowMoveCol?: boolean;
    isAllowRemoveCol?: boolean;
    isAllowSort?: boolean;
    onSelectedChange?: (id: number) => void;
}
interface JQueryEasyGrid {
    $el: JQuery;
    options: JQueryEasyGridOptions;
    getSelectedId(): number;
    getSelectedField(): string;
    selectRow(id: number, isSilent?: boolean): JQueryEasyGrid;
    selectCol(dataField: string, isSilent?: boolean): JQueryEasyGrid;
    showFocusCell(): JQueryEasyGrid;
    loadData(data: Array<JQueryEasyGridData>): JQueryEasyGrid;
    beginEdit(): JQueryEasyGrid;
    endEdit(): JQueryEasyGrid;
    getValue(id: number, dataField: string): any;
    setValue(id: number, dataField: string, value: any): JQueryEasyGrid;
}
interface JQuery {
    easygrid(options?: JQueryEasyGridOptions): JQueryEasyGrid;
}
