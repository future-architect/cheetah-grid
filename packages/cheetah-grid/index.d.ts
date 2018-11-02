declare module cheetahGrid {
    namespace columns {
        namespace action {
            export class BaseAction {
                disabled: boolean;
                clone(): BaseAction;
                bindGridEvent(grid, col, util);
                onChangeDisabledInternal();
            }
            export class Editor extends BaseAction {
                constructor(option?: {
                    readOnly?: boolean;
                });
                readOnly: boolean;
                clone(): Editor;
                onChangeReadOnlyInternal();
            }
            export class Action extends BaseAction {
                constructor(option?: {
                    action?: (record: any) => void;
                });
                action: (record: any) => void;
                clone(): Action;
                getState(grid);
                bindGridEvent(grid, col, util): any[];
            }
            export class CheckEditor extends Editor {
                clone(): CheckEditor;
                bindGridEvent(grid, col, util): any[];
            }
            export class ButtonAction extends Action {
                getState(grid): any;
            }
            class BaseInputEditor extends Editor {
                constructor(option?: any);
                clone(): BaseInputEditor;
                onInputCellInternal(grid, cell, inputValue);
                onOpenCellInternal(grid, cell);
                onChangeSelectCellInternal(grid, cell, selected);
                onSetInputAttrsInternal(grid, cell, input);
                onGridScrollInternal(grid);
                bindGridEvent(grid, col, util);
            }
            export class SmallDialogInputEditor extends BaseInputEditor {
                constructor(option: {
                    helperText?: (value: string) => string;
                    inputValidator?: (value: string) => string | null;
                    validator?: (value: string) => string | null;
                    classList?: string[];
                    type?: string;
                });

                helperText: (value: string) => string;
                inputValidator: (value: string) => string | null;
                validator: (value: string) => string | null;
                classList: string[];
                type: string;

                clone(): SmallDialogInputEditor;
                onInputCellInternal(grid, cell, inputValue);
                onOpenCellInternal(grid, cell);
                onChangeSelectCellInternal(grid, cell, selected);
                onGridScrollInternal(grid);
                onChangeDisabledInternal();
                onChangeReadOnlyInternal();
                onSetInputAttrsInternal(grid, cell, input);
            }
            export class InlineInputEditor extends BaseInputEditor {
                constructor(option?: {
                    classList?: string[];
                    type?: string;
                });

                classList: string[];
                type: string;
                clone(): InlineInputEditor;
                onInputCellInternal(grid, cell, inputValue);
                onOpenCellInternal(grid, cell);
                onChangeSelectCellInternal(grid, cell, selected);
                onGridScrollInternal(grid);
                onChangeDisabledInternal();
                onChangeReadOnlyInternal();
                onSetInputAttrsInternal(grid, cell, input);
            }
            export class InlineMenuEditor extends Editor {
                constructor(option?: {
                    classList?: string[];
                });
                classList: string[];
                options: { classList: string[]; };
                dispose();
                clone(): InlineMenuEditor;
                onChangeDisabledInternal();
                onChangeReadOnlyInternal();
                bindGridEvent(grid, col, util);
            }
            function of(columnActions?: string | BaseAction): BaseAction;
        }

        namespace style {
            export const EVENT_TYPE: { CHANGE_STYLE: "change_style" };

            export class BaseStyle<T> extends EventTarget {
                constructor(option?: {
                    bgColor?: string
                });
                bgColor: string;
                doChangeStyle();
                clone(): BaseStyle<T>;
            }

            class BranchGraphStyle<T> extends BaseStyle<T> {
                DEFAULT(): BranchGraphStyle<T>;
                constructor(style?: {
                    branchColors?: string[];
                    margin?: number;
                    circleSize?: number;
                    branchLineWidth?: number;
                    mergeStyle?: string;
                });

                branchColors?: string[];
                margin?: number;
                circleSize?: number;
                branchLineWidth?: number;
                mergeStyle?: string;
            }

            class StdBaseStyle<T> extends BaseStyle<T> {
                textAlign: string;
                textBaseline: string;
                clone(): StdBaseStyle<T>;
            }

            export class Style<T> extends StdBaseStyle<T> {
                constructor(style?: {
                    color?: string;
                    font?: string;
                    padding?: number;
                    textOverflow?: string;
                });
                static DEFAULT<T>(): Style<T>;
                color: string;
                font: string;
                padding: number;
                textOverflow: string;
                clone(): Style<T>;
            }

            export class NumberStyle<T> extends Style<T> {
                static DEFAULT<T>(): NumberStyle<T>;
                clone(): NumberStyle<T>;
            }

            export class CheckStyle<T> extends StdBaseStyle<T> {
                constructor(style?: {
                    uncheckBgColor?: string;
                    checkBgColor?: string;
                    borderColor?: string;
                });
                static DEFAULT<T>(): CheckStyle<T>;
                clone(): CheckStyle<T>;
            }

            export class ButtonStyle<T> extends Style<T> {
                constructor(style?: {
                    buttonBgColor?: string;
                });
                static DEFAULT<T>(): ButtonStyle<T>;
                buttonBgColor: string;
                clone(): ButtonStyle<T>;
            }

            export class ImageStyle<T> extends StdBaseStyle<T> {
                constructor(style?: {
                    imageSizing?: string;
                    margin?: number;
                });
                static DEFAULT<T>(): ImageStyle<T>;
                imageSizing: string;
                margin: number;
                clone(): ImageStyle<T>;
            }

            export class IconStyle<T> extends Style<T> {
                static DEFAULT<T>(): IconStyle<T>;
                clone(): IconStyle<T>;
            }

            export class PercentCompleteBarStyle<T> extends Style<T> {
                static DEFAULT<T>(): PercentCompleteBarStyle<T>;
                constructor(style?: {
                    barColor?: string;
                    barBgColor?: string;
                    barheight?: number;
                });
                barColor: string;
                barBgColor: string;
                barheight: number;
                clone(): PercentCompleteBarStyle<T>;
            }

            export class MultilineTextStyle<T> extends Style<T> {
                static DEFAULT<T>(): MultilineTextStyle<T>;
                constructor(style?: {
                    lineHeight?: string;
                    lineClamp?: string;
                    autoWrapText?: boolean;
                });
                lineHeight: string;
                lineClamp: string;
                autoWrapText: boolean;
                clone(): MultilineTextStyle<T>;
            }

            export class MenuStyle<T> extends Style<T> {
                static DEFAULT<T>(): MenuStyle<T>;
                constructor(option?: {
                    appearance?: string;
                });
                appearance: string;
                clone(): MenuStyle<T>;
            }

            export function of(columnStyle, record, StyleClass): any;
        }

        namespace type {
            class BaseColumn<T> {
                constructor(option?: {
                    fadeinWhenCallbackInPromise?: boolean;
                });

                StyleClass: style.BaseStyle<T>;
                onDrawCell(cellValue, info, context, grid);
                clone(): BaseColumn<T>;
                convertInternal(value);
                drawInternal(value, context, style, helper, grid, info);
                drawMessageInternal(message, context, style, helper, grid, info);
                bindGridEvent(grid, col, util);
            }
            export class Column<T> extends BaseColumn<T> {
                StyleClass: style.Style<T>;
                clone(): Column<T>;
                drawInternal(value, context, style, helper, grid, { drawCellBase, getIcon });
            }
            export class NumberColumn<T> extends Column<T> {
                static defaultFotmat: any;

                constructor(option?: {
                    format?: any;
                });

                StyleClass: style.NumberStyle<T>;
                clone(): NumberColumn<T>;
                format: any;
                withFormat(format): NumberColumn<T>;
                convertInternal(value);
            }
            export class CheckColumn<T> extends BaseColumn<T> {
                StyleClass: style.Style<T>;
                clone(): ImageColumn<T>;
                convertInternal(value);
                drawInternal(value, context, style, helper, grid, { drawCellBase });
                bindGridEvent(grid, col, util);
            }
            export class ButtonColumn<T> extends Column<T> {
                constructor(option?: {
                    caption?: string;
                });
                withCaption(caption: string): ButtonColumn<T>;
                clone(): ButtonColumn<T>;
                convertInternal(value: string): string;
                drawInternal(value, context, style, helper, grid, { drawCellBase, getIcon });
            }
            export class ImageColumn<T> extends BaseColumn<T> {
                StyleClass: style.Style<T>;
                clone(): ImageColumn<T>;
                onDrawCell(cellValue, info, context, grid);
                drawInternal(value, context, style, helper, grid, { drawCellBase });
            }
            export class PercentCompleteBarColumn<T> extends Column<T> {
                constructor(option: {
                    min?: number;
                    max?: number;
                    formatter?: (value) => any;
                });

                StyleClass: style.PercentCompleteBarStyle<T>;
                clone(): PercentCompleteBarColumn<T>;
                drawInternal(value, context, style, helper, grid, info);
            }
            export class IconColumn<T> extends Column<T> {
                constructor(option?: {
                    tagName?: string;
                    className?: string;
                    content?: any;
                    name?: string;
                    iconWidth?: number;
                });

                StyleClass: style.IconStyle<T>;
                clone(): IconColumn<T>;
                drawInternal(value, context, style, helper, grid, info);
            }
            export class BranchGraphColumn<T> extends BaseColumn<T> {
                constructor(option?: {
                    start?: string;
                    cache?: boolean;
                });
                StyleClass: style.BranchGraphStyle<T>;
                clearCache(grid);
                onDrawCell(cellValue, info, context, grid);
                clone();
                drawInternal(value, context, style, helper, grid, { drawCellBase });
            }
            export class MenuColumn<T> extends BaseColumn<T> {
                constructor(option?: {
                    options?: any;
                });
                StyleClass: style.MenuStyle<T>;
                clone(): MenuColumn<T>;
                options: any;
                withOptions(options): MenuColumn<T>;
                drawInternal(value, context, style, helper, grid, { drawCellBase, getIcon });
                convertInternal(value);
            }
            export class MultilineTextColumn<T> extends BaseColumn<T> {
                constructor(option?: any);
                StyleClass: style.MultilineTextStyle<T>;
                clone(): MultilineTextColumn<T>;
                drawInternal(value, context, style, helper, grid, { drawCellBase, getIcon });
            }

            function of<T>(columnType: string | Column<T>): Column<T>;
        }
    }

    namespace core {
        export interface DrawGridEvents {
            CLICK_CELL: 'click_cell',
            DBLCLICK_CELL: 'dblclick_cell',
            DBLTAP_CELL: 'dbltap_cell',
            MOUSEDOWN_CELL: 'mousedown_cell',
            MOUSEUP_CELL: 'mouseup_cell',
            SELECTED_CELL: 'selected_cell',
            KEYDOWN: 'keydown',
            MOUSEMOVE_CELL: 'mousemove_cell',
            MOUSEENTER_CELL: 'mouseenter_cell',
            MOUSELEAVE_CELL: 'mouseleave_cell',
            MOUSEOVER_CELL: 'mouseover_cell',
            MOUSEOUT_CELL: 'mouseout_cell',
            INPUT_CELL: 'input_cell',
            EDITABLEINPUT_CELL: 'editableinput_cell',
            MODIFY_STATUS_EDITABLEINPUT_CELL: 'modify_status_editableinput_cell',
            RESIZE_COLUMN: 'resize_column',
            SCROLL: 'scroll',
        }

        export class DrawGrid extends EventTarget {
            static EVENT_TYPE: DrawGridEvents;

            constructor(options: {
                rowCount?: number;
                colCount?: number;
                frozenColCount?: number;
                frozenRowCount?: number;
                defaultRowHeight?: number;
                defaultColWidth?: number;
                parentElement?: Element;
                font?: string;
                underlayBackgroundColor?: string;
            });
            /**
             * Get root element.
             * @returns root element
             */
            getElement(): HTMLElement;
            /**
             * Get canvas element.
             */
            canvas: HTMLCanvasElement;
            /**
             * Focus the grid.
             */
            focus(): void;

            selection: Selection;
            rowCount: number;
            colCount: number;
            frozenColCount: number;
            frozenRowCount: number;
            defaultRowHeight: number;
            defaultColWidth: number;
            font: string;

            /**
             * The background color of the underlay.
             * @param underlayBackgroundColor the background color of the underlay to set
             */
            underlayBackgroundColor: any;
            /**
             * Apply the changed size.
             */
            updateSize(): void;
            /**
             * Apply the changed scroll size.
             */
            updateScroll(): boolean;
            /**
             * Get the row height of the given the row index.
             * @param row The row index
             */
            getRowHeight(row: number): number;
            /**
             * Set the row height of the given the row index.
             * @param row The row index
             * @param height The row height
             */
            setRowHeight(row: number, height: number): void;
            /**
             * Get the column width of the given the column index.
             * @param col The column index
             */
            getColWidth(col: number): number;
            /**
             * Set the column widtht of the given the column index.
             * @param col The column index
             * @param width The column width
             */
            setColWidth(col: number, width: number): void;
            /**
             * Get the column max width of the given the column index.
             * @param col The column index
             */
            getMaxColWidth(col: number): number;
            /**
             * Set the column max widtht of the given the column index.
             * @param col The column index
             * @param maxwidth The column max width
             */
            setMaxColWidth(col: number, maxwidth: number): void;
            /**
             * Get the column min width of the given the column index.
             * @param col The column index
             */
            getMinColWidth(col: number): number;
            /**
             * Set the column min widtht of the given the column index.
             * @param col The column index
             * @param minwidth The column min width
             */
            setMinColWidth(col: number, minwidth: number): void;
            /**
             * Get the rect of the cell.
             * @param col index of column, of the cell
             * @param row index of row, of the cell
             * @returns the rect of the cell.
             */
            getCellRect(col: number, row: number): Rect;
            /**
             * Get the relative rectangle of the cell.
             * @param col index of column, of the cell
             * @param row index of row, of the cell
             * @returns the rect of the cell.
             */
            getCellRelativeRect(col: number, row: number): Rect;
            /**
             * Get the rectangle of the cells area.
             * @param startCol index of the starting column, of the cell
             * @param startRow index of the starting row, of the cell
             * @param endCol index of the ending column, of the cell
             * @param endRow index of the ending row, of the cell
             * @returns the rect of the cells.
             */
            getCellsRect(startCol: number, startRow: number, endCol: number, endRow: number): Rect;
            /**
             * Scroll to where cell is visible.
             * @param col The column index.
             * @param row The row index
             */
            makeVisibleCell(col: number, row: number): void;
            /**
             * Focus the cell.
             * @param col The column index.
             * @param row The row index
             */
            focusCell(col: number, row: number): void;
            /**
             * Redraws the range of the given cell.
             * @param col The column index of cell.
             * @param row The row index of cell.
             */
            invalidateCell(col: number, row: number): void;
            /**
             * Redraws the range of the given cells.
             * @param startCol index of the starting column, of the cell
             * @param startRow index of the starting row, of the cell
             * @param endCol index of the ending column, of the cell
             * @param endRow index of the ending row, of the cell
             */
            invalidateGridRect(startCol: number, startRow: number, endCol: number, endRow: number): void;
            /**
             * Redraws the whole grid.
             */
            invalidate(): void;
            /**
             * Get the value of cell with the copy action.
             * <p>
             * Please implement
             * </p>
             * @param col Column index of cell.
             * @param row Row index of cell.
             */
            protected getCopyCellValue(col: number, row: number): string;
            /**
             * Draw a cell
             * <p>
             * Please implement cell drawing.
             * </p>
             * @param col Column index of cell.
             * @param row Row index of cell.
             * @param context context of cell drawing.
             */
            protected onDrawCell(col: number, row: number, context: DrawCellContext): void;
            /**
             * Get the overflowed text in the cell rectangle, from the given cell.
             * @param col The column index.
             * @param row The row index
             */
            getCellOverflowText(col: number, row: number): string | null;
            /**
             * Set the overflowed text in the cell rectangle, to the given cell.
             * @param col The column index.
             * @param row The row index
             * @param overflowText The overflowed text in the cell rectangle.
             */
            setCellOverflowText(col: number, row: number, overflowText: boolean): void;
            /**
             * Dispose the grid instance.
             * @returns
             */
            dispose(): void;
        }
    }

    namespace data {
        interface IDataSourceParam<T> {
            get: (index: number) => T;
            length: number;
        }
        export class DataSource<T> extends EventTarget {
            constructor(param: IDataSourceParam<T>);
        }

        export class FilterDataSource<T> extends DataSource<T> {
            constructor(dataSource: DataSource<T>, filter?: (record: T) => boolean | null);
            filter?: (record: T) => boolean | null;
        }

        interface ICachedDataSourceParam<T> {
            get: (index: number) => Promise<T>;
            length: number;
        }
        export class CachedDataSource<T> extends DataSource<T> {
            constructor(param: ICachedDataSourceParam<T>);
        }
    }

    interface FontIcon<T> {
        font: string;
        content: keyof T;
        className: string;
        width?: number;
        color?: string;
    }

    interface ImageIcon<T> {
        src: keyof T;
        className: string;
        width?: number;
        color?: string;
    }

    export interface Columnoptions<T> {
        caption?: string;
        field?: keyof T;
        width?: number;
        minWidth?: number;
        maxWidth?: number;
        icon?: FontIcon<T> | ImageIcon<T>;
        message?: string;
        columnType?: columns.type.Column<T> | "default" | "number" | "check" | "button" | "image" | "multilinetext";
        action?: columns.action.Action | "check" | "input";
        style?: columns.style.Style<T>;
        sort?: boolean | ((order, col, grid) => void);
        columns?: Columnoptions<T>[];
    }

    export class ListGrid<T> extends cheetahGrid.core.DrawGrid {
        static EVENT_TYPE: cheetahGrid.core.DrawGridEvents & { CHANGED_VALUE: 'changed_value' };

        constructor(options: {
            header?: Columnoptions<T>[],
            records?: T[];
            dataSource?: data.DataSource<T>;
            frozenColCount?: number;
            defaultRowHeight?: number;
            defaultColWidth?: number;
            borderColor?: string;
            parentElement?: Element;
            theme?: object;
        });
        dispose(): void;
        header: Columnoptions<T>[];
        /**
         * Get the records.
         */
        records: T[];
        /**
         * The data source.
         */
        dataSource: data.DataSource<T>;
        /**
         * The theme.
         */
        theme: object;
        /**
         * Sort state.
         * If `null` to set, the sort state is initialized.
         */
        sortState: object;
        /**
         * Get the field of the given column index.
         * @param col The column index.
         */
        getField(col: number): any;
        /**
         * Get the record of the given row index.
         * @param row The row index.
         */
        getRowRecord(row: number): T;
        /**
         * Get the column index of the given field.
         * @param field The field.
         */
        getColumnIndexByField(field: any): number;
        /**
         * Focus the cell.
         * @param field The field.
         * @param index The record index
         */
        focusGridCell(field: any, index: number): void;
        /**
         * Scroll to where cell is visible.
         * @param field The field.
         * @param index The record index
         */
        makeVisibleGridCell(field: any, index: number): void;
    }
    namespace themes {
        namespace choices {
            /**
             * basic theme
             */
            var BASIC: Object;
            /**
             * material design theme
             */
            var MATERIAL_DESIGN: Object;
        }

        namespace theme {
        }
    }
    namespace tools {
        namespace canvashelper {
            function strokeColorsRect(ctx: CanvasRenderingContext2D, borderColors: any[], left: number, top: number, width: number, height: number);
            function roundRect(ctx: CanvasRenderingContext2D, left: number, top: number, width: number, height: number, radius: number): void;
            function fillRoundRect(ctx: CanvasRenderingContext2D, left: number, top: number, width: number, height: number, radius: number): void;
            function strokeRoundRect(ctx: CanvasRenderingContext2D, left: number, top: number, width: number, height: number, radius: number): void;
            /**
             * draw Checkbox
             * @param ctx canvas context
             * @param x The x coordinate where to start drawing the checkbox (relative to the canvas)
             * @param y The y coordinate where to start drawing the checkbox (relative to the canvas)
             * @param check checkbox check status
             * @param option option
             */
            function drawCheckbox(ctx: CanvasRenderingContext2D, x: number, y: number, check: boolean | number, option: object): void;
            /**
             * Returns an object containing the width of the checkbox.
             * @param ctx canvas context
             */
            function measureCheckbox(ctx: CanvasRenderingContext2D): { width: number };
            function drawButton(ctx: CanvasRenderingContext2D, left: number, top: number, width: number, height: number, option?: any): void;

            function fillTextRect(ctx: CanvasRenderingContext2D, text, left: number, top: number, width: number, height: number, { offset, padding, }): void;

            function drawInlineImageRect(ctx: CanvasRenderingContext2D, image,
                srcLeft, srcTop, srcWidth, srcHeight,
                destWidth, destHeight,
                left, top, width, height, { offset, padding, }): void;
        }
    }
    /**
     * Selected area management
     */
    class Selection extends EventTarget {
        /**
         * Selected area management
         */
        constructor();
    }
    /**
     * This class manages the drawing process for each layer
     */
    class DrawLayers {
        /**
         * This class manages the drawing process for each layer
         */
        constructor();
    }
    /**
     * Context of cell drawing
     */
    class DrawCellContext {
        /**
         * Context of cell drawing
         */
        constructor(col: number, row: number, ctx: CanvasRenderingContext2D, rect: Rect, drawRect: Rect, drawing: boolean, selection: object, drawLayers: DrawLayers[]);
        /**
         * select status.
         */
        getSelectState(): object;
        /**
         * Canvas context.
         */
        getContext(): CanvasRenderingContext2D;
        /**
         * Rectangle of cell.
         */
        getRect(): Rect;
        /**
         * Rectangle of Drawing range.
         */
        getDrawRect(): Rect;
        /**
         * get Context of current state
         */
        toCurrentContext(): DrawCellContext;
        /**
         * terminate
         */
        terminate(): void;
    }
    class Rect {
        top: number;
        left: number;
        bottom: number;
        right: number;

        offsetLeft(offset: number);
        offsetTop(offset: number);
        copy(): Rect;
        intersection(rect: Rect);
        contains(another: Rect);
        inPoint(x: number, y: number);
    }
    class EventTarget {
        /**
         * Adds an event listener.
         * @param type The event type id.
         * @param listener Callback method.
         */
        listen(type: string, listener: Function): number;
        /**
         * Removes an event listener which was added with listen() by the id returned by listen().
         * @param id the id returned by listen().
         */
        unlisten(id: number): void;
        /**
         * Fires all registered listeners
         * @param type The type of the listeners to fire.
         * @param args fire arguments
         */
        fireListeners(type: string, ...args: any): any;
    }
}

export = cheetahGrid;
