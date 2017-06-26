declare module "*.tpl";

interface IJQueryEasyGridColumn {
    dataField?: string;
    sort?: "" | "desc" | "asc";
    text?: string;
    type?: "" | "checkbox" | "radio" | "tree";
    valueClass?: string;
    width?: number;
}
interface IJQueryEasyGridData {
    _children?: IJQueryEasyGridData[];
    _id?: number;
    [propName: string]: any;
}
interface IJQueryEasyGridOptions {
    columns?: IJQueryEasyGridColumn[];
    childrenField?: string;
    data?: IJQueryEasyGridData[];
    idField?: string;
    isAllowKeyboard?: boolean;
    isAllowMoveCol?: boolean;
    isAllowRemoveCol?: boolean;
    isAllowSort?: boolean;
    onSelectedChange?: (id: number) => void;
}
interface IJQueryEasyGrid {
    $el: JQuery;
    options: IJQueryEasyGridOptions;
    getSelectedId(): number;
    getSelectedField(): string;
    selectRow(id: number, isSilent?: boolean): IJQueryEasyGrid;
    selectCol(dataField: string, isSilent?: boolean): IJQueryEasyGrid;
    showFocusCell(): IJQueryEasyGrid;
    loadData(data: IJQueryEasyGridData[]): IJQueryEasyGrid;
    beginEdit(): IJQueryEasyGrid;
    endEdit(): IJQueryEasyGrid;
    getValue(id: number, dataField: string): any;
    setValue(id: number, dataField: string, value: any): IJQueryEasyGrid;
}
// tslint:disable-next-line:interface-name
interface JQuery {
    easygrid(options?: IJQueryEasyGridOptions): IJQueryEasyGrid;
}
