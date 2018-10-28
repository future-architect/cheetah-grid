declare namespace cheetahGrid {
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

            export class BaseStyle extends EventTarget {
                constructor(option?: {
                    bgColor?: string
                });
                bgColor: string;
                doChangeStyle();
                clone(): BaseStyle;
            }
            class BranchGraphStyle extends BaseStyle {
                DEFAULT(): BranchGraphStyle;
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
            class StdBaseStyle extends BaseStyle {
                textAlign: string;
                textBaseline: string;
                clone(): StdBaseStyle;
            }
            export class Style extends StdBaseStyle {
                constructor(style?: {
                    color?: string;
                    font?: string;
                    padding?: number;
                    textOverflow?: string;
                });
                static DEFAULT(): Style;
                color: string;
                font: string;
                padding: number;
                textOverflow: string;
                clone(): Style;
            }
            export class NumberStyle extends Style {
                static DEFAULT(): NumberStyle;
                clone(): NumberStyle;
            }
            export class CheckStyle extends StdBaseStyle {
                constructor(style?: {
                    uncheckBgColor?: string;
                    checkBgColor?: string;
                    borderColor?: string;
                });
                static DEFAULT(): CheckStyle;
                clone(): CheckStyle;
            }
            export class ButtonStyle extends Style {
                constructor(style?: {
                    buttonBgColor?: string;
                });
                static DEFAULT(): ButtonStyle;
                buttonBgColor: string;
                clone(): ButtonStyle;
            }
            export class ImageStyle extends StdBaseStyle {
                constructor(style?: {
                    imageSizing?: string;
                    margin?: number;
                });
                static DEFAULT(): ImageStyle;
                imageSizing: string;
                margin: number;
                clone(): ImageStyle;
            }
            export class IconStyle extends Style {
                static DEFAULT(): IconStyle;
                clone(): IconStyle;
            }
            export class PercentCompleteBarStyle extends Style {
                static DEFAULT(): PercentCompleteBarStyle;
                constructor(style?: {
                    barColor?: string;
                    barBgColor?: string;
                    barheight?: number;
                });
                barColor: string;
                barBgColor: string;
                barheight: number;
                clone(): PercentCompleteBarStyle;
            }
            export class MultilineTextStyle extends Style {
                static DEFAULT(): MultilineTextStyle;
                constructor(style?: {
                    lineHeight?: string;
                    lineClamp?: string;
                    autoWrapText?: boolean;
                });
                lineHeight: string;
                lineClamp: string;
                autoWrapText: boolean;
                clone(): MultilineTextStyle;
            }
            export class MenuStyle extends Style {
                static DEFAULT(): MenuStyle;
                constructor(option?: {
                    appearance?: string;
                });
                appearance: string;
                clone(): MenuStyle;
            }
            export function of(columnStyle, record, StyleClass): any;
        }

        namespace type {
            export const TYPES: {
                DEFAULT: Column,
                NUMBER: Number,
                CHECK: CheckColumn,
                BUTTON: ButtonColumn,
                IMAGE: ImageColumn,
                MULTILINETEXT: MultilineTextColumn,
            };
            class BaseColumn {
                constructor(option?: {
                    fadeinWhenCallbackInPromise?: boolean;
                });

                StyleClass: style.BaseStyle;
                onDrawCell(cellValue, info, context, grid);
                clone(): BaseColumn;
                convertInternal(value);
                drawInternal(value, context, style, helper, grid, info);
                drawMessageInternal(message, context, style, helper, grid, info);
                bindGridEvent(grid, col, util);
            }
            export class Column extends BaseColumn {
                StyleClass: style.Style;
                clone(): Column;
                drawInternal(value, context, style, helper, grid, { drawCellBase, getIcon });
            }
            export class NumberColumn extends Column {
                static defaultFotmat: any;

                constructor(option?: {
                    format?: any;
                });

                StyleClass: style.NumberStyle;
                clone(): NumberColumn;
                format: any;
                withFormat(format): NumberColumn;
                convertInternal(value);
            }
            export class CheckColumn extends BaseColumn {
                StyleClass: style.Style;
                clone(): ImageColumn;
                convertInternal(value);
                drawInternal(value, context, style, helper, grid, { drawCellBase });
                bindGridEvent(grid, col, util);
            }
            export class ButtonColumn extends Column {
                constructor(option?: {
                    caption?: string;
                });
                withCaption(caption: string): ButtonColumn;
                clone(): ButtonColumn;
                convertInternal(value: string): string;
                drawInternal(value, context, style, helper, grid, { drawCellBase, getIcon });
            }
            export class ImageColumn extends BaseColumn {
                StyleClass: style.Style;
                clone(): ImageColumn;
                onDrawCell(cellValue, info, context, grid);
                drawInternal(value, context, style, helper, grid, { drawCellBase });
            }
            export class PercentCompleteBarColumn extends Column {
                constructor(option: {
                    min?: number;
                    max?: number;
                    formatter?: (value) => any;
                });

                StyleClass: style.PercentCompleteBarStyle;
                clone(): PercentCompleteBarColumn;
                drawInternal(value, context, style, helper, grid, info);
            }
            export class IconColumn extends Column {
                constructor(option?: {
                    tagName?: string;
                    className?: string;
                    content?: any;
                    name?: string;
                    iconWidth?: number;
                });

                StyleClass: style.IconStyle;
                clone(): IconColumn;
                drawInternal(value, context, style, helper, grid, info);
            }
            export class BranchGraphColumn extends BaseColumn {
                constructor(option?: {
                    start?: string;
                    cache?: boolean;
                });
                StyleClass: style.BranchGraphStyle;
                clearCache(grid);
                onDrawCell(cellValue, info, context, grid);
                clone();
                drawInternal(value, context, style, helper, grid, { drawCellBase });
            }
            export class MenuColumn extends BaseColumn {
                constructor(option?: {
                    options?: any;
                });
                StyleClass: style.MenuStyle;
                clone(): MenuColumn;
                options: any;
                withOptions(options): MenuColumn;
                drawInternal(value, context, style, helper, grid, { drawCellBase, getIcon });
                convertInternal(value);
            }
            export class MultilineTextColumn extends BaseColumn {
                constructor(option?: any);
                StyleClass: style.MultilineTextStyle;
                clone(): MultilineTextColumn;
                drawInternal(value, context, style, helper, grid, { drawCellBase, getIcon });
            }

            function of(columnType: string | Column): Column;
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
        export class DataSource extends EventTarget {
            constructor();
        }
        export class FilterDataSource extends DataSource {
            constructor();
        }
        export class CachedDataSource extends DataSource {
            constructor();
        }
    }

    export class Columnoptions {
        caption?: string;
        field?: string;
        width?: number;
        minWidth?: number;
        maxWidth?: number;
        icon?: string;
        message?: string;
        columnType?: columns.type.Column;
        action?: columns.action.Action;
        style?: columns.style.Style;
        sort?: boolean | ((order, col, grid) => void);
        columns?: Columnoptions[];
    }

    export class ListGrid extends cheetahGrid.core.DrawGrid {
        static EVENT_TYPE: cheetahGrid.core.DrawGridEvents & { CHANGED_VALUE: 'changed_value' };

        constructor(options: {
            header?: Columnoptions[],
            records?: any[];
            dataSource?: data.DataSource;
            frozenColCount?: number;
            defaultRowHeight?: number;
            defaultColWidth?: number;
            borderColor?: string;
            parentElement?: Element;
            theme?: object;
        });
        dispose(): void;
        header: Columnoptions[];
        /**
         * Get the records.
         */
        records: any[];
        /**
         * The data source.
         */
        dataSource: data.DataSource;
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
        getRowRecord(row: number): object;
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