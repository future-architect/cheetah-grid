import {
  Children,
  JSXElementConstructor,
  Component,
  createRef,
  RefObject,
} from "react";
import type { ReactElement } from "react";
import * as cheetahGrid from "cheetah-grid";

const {
  CLICK_CELL,
  DBLCLICK_CELL,
  DBLTAP_CELL,
  MOUSEDOWN_CELL,
  MOUSEUP_CELL,
  SELECTED_CELL,
  KEYDOWN,
  MOUSEMOVE_CELL,
  MOUSEENTER_CELL,
  MOUSELEAVE_CELL,
  MOUSEOVER_CELL,
  MOUSEOUT_CELL,
  INPUT_CELL,
  PASTE_CELL,
  CONTEXTMENU_CELL,
  RESIZE_COLUMN,
  SCROLL,
  EDITABLEINPUT_CELL,
  MODIFY_STATUS_EDITABLEINPUT_CELL,
  CHANGED_VALUE,
  CHANGED_HEADER_VALUE,
  FOCUS_GRID,
  BLUR_GRID,
} = cheetahGrid.ListGrid.EVENT_TYPE;
import {
  ListGrid,
  ColumnDefine,
  ListGridConstructorOptions,
} from "cheetah-grid";

import {
  CheetahGridChildren,
  CheetahGridProps,
  isDataSourceProps,
  isStaticRecordProps,
  isDataProps,
} from "./gridProps";

// Columns
import { Column, processColumnProps } from "./Column";
import { NumberColumn, processNumberColumnProps } from "./NumberColumn";
import { CheckColumn, processCheckColumnProps } from "./CheckColumn";
import { RadioColumn, processRadioColumnProps } from "./RadioColumn";
import { MenuColumn, processMenuColumnProps } from "./MenuColumn";
import { IconColumn, processIconColumnProps } from "./IconColumn";
import {
  PercentCompleteBarColumn,
  processPercentCompleteBarColumnProps,
} from "./PercentCompleteBarColumn";
import { ImageColumn, processImageColumnProps } from "./ImageColumn";
import {
  MultilineTextColumn,
  processMultilineTextColumnProps,
} from "./MultilineTextColumn";
import { ButtonColumn, processButtonColumnProps } from "./ButtonColumn";
import {
  BranchGraphColumn,
  processBranchGraphColumnProps,
} from "./BranchGraphColumn";
import {
  CellDefine,
  HeaderBodyLayoutDefine,
  HeaderCellDefine,
} from "cheetah-grid/list-grid/layout-map/api";
import { StandardProps } from "./columnProps";
import {
  BodyLayout,
  BodyLayoutProps,
  Header,
  HeaderLayout,
  HeaderLayoutProps,
  Line,
  processHeaderProps,
} from "./Layout";

const childComponentTypes = new Map<
  string | JSXElementConstructor<any>,
  { name: string; processFunc: (p: any) => any }
>([
  [Column, { name: "Column", processFunc: processColumnProps }],
  [NumberColumn, { name: "Column", processFunc: processNumberColumnProps }],
  [CheckColumn, { name: "Column", processFunc: processCheckColumnProps }],
  [ImageColumn, { name: "Column", processFunc: processImageColumnProps }],
  [RadioColumn, { name: "Column", processFunc: processRadioColumnProps }],
  [MenuColumn, { name: "Column", processFunc: processMenuColumnProps }],
  [IconColumn, { name: "Column", processFunc: processIconColumnProps }],
  [
    PercentCompleteBarColumn,
    { name: "Column", processFunc: processPercentCompleteBarColumnProps },
  ],
  [
    MultilineTextColumn,
    { name: "Column", processFunc: processMultilineTextColumnProps },
  ],
  [
    BranchGraphColumn,
    { name: "Column", processFunc: processBranchGraphColumnProps },
  ],
  [ButtonColumn, { name: "Column", processFunc: processButtonColumnProps }],
  [BodyLayout, { name: "BodyLayout", processFunc: () => {} }],
  [HeaderLayout, { name: "HeaderLayout", processFunc: () => {} }],
  [Header, { name: "Header", processFunc: processHeaderProps }],
  [Line, { name: "Line", processFunc: () => {} }],
]);

const eventTypes: { [key: string]: string } = {
  [CLICK_CELL]: "onCellClick",
  [DBLCLICK_CELL]: "onCellDoubleClick",
  [DBLTAP_CELL]: "onCellDoubleTap",
  [MOUSEDOWN_CELL]: "onCellMouseDown",
  [MOUSEUP_CELL]: "onCellMouseUp",
  [SELECTED_CELL]: "onCellSelect",
  [KEYDOWN]: "onKeyDown",
  [MOUSEMOVE_CELL]: "onCellMouseMove",
  [MOUSEENTER_CELL]: "onCellMouseEnter",
  [MOUSELEAVE_CELL]: "onCellMouseLeave",
  [MOUSEOVER_CELL]: "onCellMouseOver",
  [MOUSEOUT_CELL]: "onCellMouseOut",
  [INPUT_CELL]: "onCellInput",
  [PASTE_CELL]: "onCellPaste",
  [RESIZE_COLUMN]: "onColumnResize",
  [CONTEXTMENU_CELL]: "onCellContextMenu",
  [SCROLL]: "onScroll",
  [EDITABLEINPUT_CELL]: "onCellEditableInput",
  [MODIFY_STATUS_EDITABLEINPUT_CELL]: "onModifyStatusEditableInput",
  [CHANGED_VALUE]: "onValueChange",
  [CHANGED_HEADER_VALUE]: "onHeaderValueChange",
  [FOCUS_GRID]: "onFocus",
  [BLUR_GRID]: "onBlur",
};

function childrenToHeader<T>(
  children: ReactElement<StandardProps<T>> | ReactElement<StandardProps<T>>[]
) {
  return Children.map(children, function makeHeaderDef(child) {
    const childComponentType = childComponentTypes.get(child.type);
    if (childComponentType) {
      return childComponentType.processFunc(child.props);
    } else {
      return { caption: "invalid column type" };
    }
  });
}

function classifyColumns(children: ReactElement | ReactElement[]) {
  const result = new Map<
    string,
    { elements: ReactElement[]; type: string | JSXElementConstructor<any> }
  >();
  Children.forEach(children, function checkType(child) {
    const childComponent = childComponentTypes.get(child.type);
    const name = childComponent ? childComponent.name : "*";
    const entry = result.get(name);
    if (entry) {
      entry.elements.push(child);
    } else {
      result.set(name, { elements: [child], type: child.type });
    }
  });
  return result;
}

function parseBodyLayout<T>(bodyLayout: ReactElement<BodyLayoutProps<T>>) {
  const bodyChildrenClasses = classifyColumns(bodyLayout.props.children);
  const lines = bodyChildrenClasses.get("Line");
  if (bodyChildrenClasses.size === 1 && lines) {
    const layout = lines.elements.map((child) => {
      return childrenToHeader<T>(child.props.children);
    });
    return layout;
  }
  const layout = childrenToHeader<T>(bodyLayout.props.children as any);
  return [layout];
}

function parseHeaderLayout<T>(
  headerLayout: ReactElement<HeaderLayoutProps<T>>
) {
  const headerChildrenClasses = classifyColumns(headerLayout.props.children);
  const lines = headerChildrenClasses.get("Line");
  if (headerChildrenClasses.size === 1 && lines) {
    const header = lines.elements.map((child) => {
      return childrenToHeader<T>(child.props.children);
    });
    return header;
  }
  const header = childrenToHeader<T>(headerLayout.props.children as any);
  return [header];
}

export function parseLayout<T>(children: CheetahGridChildren<T>): {
  header?: any[];
  layout?: any[][] | { body: any[][]; header: any[][] };
} {
  const classes = classifyColumns(children);
  const size = classes.size;
  if (size === 1) {
    const lines = classes.get("Line");
    if (lines) {
      const layout = lines.elements.map((child) => {
        return childrenToHeader<T>(child.props.children);
      });
      return {
        layout,
      };
    }
    const bodyLayouts = classes.get("BodyLayout");
    if (bodyLayouts) {
      if (bodyLayouts.elements.length !== 1) {
        return {
          header: [{ caption: "Only one <BodyLayout> is acceptable" }],
        };
      } else {
        const layout = parseBodyLayout(bodyLayouts.elements[0]);
        return {
          layout,
        };
      }
    }
    if (classes.get("HeaderLayout")) {
      return {
        header: [{ caption: "<BodyLayout> is required" }],
      };
    }
  } else if (size === 2) {
    const bodyLayouts = classes.get("BodyLayout");
    const headerLayouts = classes.get("HeaderLayout");
    if (bodyLayouts && headerLayouts) {
      if (
        bodyLayouts.elements.length === 1 &&
        headerLayouts.elements.length === 1
      ) {
        const body = parseBodyLayout(bodyLayouts.elements[0]);
        const header = parseHeaderLayout(headerLayouts.elements[0]);
        return {
          layout: {
            body,
            header,
          },
        };
      }
      return {
        header: [
          {
            caption:
              "Only single <BodyLayout> and single <HeaderLayout> tags are allowed",
          },
        ],
      };
    }
  }
  return {
    header: childrenToHeader<T>(children as ReactElement<StandardProps<T>>[]),
  };
}

export class CheetahGrid<T> extends Component<CheetahGridProps<T>> {
  cgRef: RefObject<HTMLDivElement>;
  grid?: ListGrid<T>;
  records?: T[];

  constructor(props: CheetahGridProps<T>) {
    super(props);
    this.cgRef = createRef();
  }

  shouldComponentUpdate(nextProps: CheetahGridProps<T>, _nextState: {}) {
    const { children, frozenColCount, defaultRowHeight, theme } = nextProps;
    if (this.grid) {
      const { layout, header } = parseLayout(children);
      if (layout) {
        this.grid.layout = layout;
      } else if (header) {
        this.grid.header = header;
      }
      if (this.props.instance) {
        this.props.instance.current = this.grid;
      }
      if (frozenColCount && this.grid.frozenColCount !== frozenColCount) {
        this.grid.frozenColCount = frozenColCount;
      }
      if (defaultRowHeight && this.grid.defaultRowHeight !== defaultRowHeight) {
        this.grid.defaultRowHeight = defaultRowHeight;
      }
      if (theme && this.grid.theme !== theme) {
        this.grid.theme = cheetahGrid.themes.of(theme);
      }
      if (isStaticRecordProps<T>(this.props)) {
        if (!Object.is(this.props.records, this.records)) {
          this.grid.records = this.props.records;
          this.records = this.props.records;
        }
      } else if (isDataProps<T>(this.props)) {
        if (
          Array.isArray(this.props.data) &&
          !Object.is(this.props.data, this.records)
        ) {
          this.grid.records = this.props.data;
          this.records = this.props.data;
        }
      }
    }
    return false;
  }

  componentDidMount() {
    const {
      children,
      frozenColCount,
      defaultRowHeight,
      headerRowHeight,
      instance,
      theme,
    } = this.props;
    const opt: ListGridConstructorOptions<T> = {
      parentElement: this.cgRef.current,
      frozenColCount,
      defaultRowHeight,
      headerRowHeight,
      theme,
    };

    if (isStaticRecordProps<T>(this.props)) {
      opt.records = this.props.records;
      this.records = this.props.records;
    } else if (isDataSourceProps<T>(this.props)) {
      opt.dataSource = this.props.dataSource;
      this.records = undefined;
    } else if (isDataProps<T>(this.props)) {
      if (Array.isArray(this.props.data)) {
        opt.records = this.props.data;
        this.records = this.props.data;
      } else {
        opt.dataSource = this.props.data;
        this.records = undefined;
      }
    }
    const { layout, header } = parseLayout(children);
    if (layout) {
      opt.layout = layout;
    } else if (header) {
      opt.header = header;
    }
    if (this.props.instance) {
      this.props.instance.current = this.grid;
    }

    this.grid = new ListGrid<T>(opt);
    for (const eventType of Object.keys(eventTypes)) {
      this.grid.listen(eventType, (e: any) => {
        const events: { [key: string]: any } = this.props;
        const propName = eventTypes[eventType];
        const event = events[propName];
        if (event) {
          return event(e);
        }
      });
    }
    if (instance) {
      instance.current = this.grid;
    }
  }

  componentWillUnmount() {
    if (this.grid) {
      this.grid.dispose();
      this.grid = undefined;
    }
  }

  render() {
    const { style } = this.props;
    return <div style={style} ref={this.cgRef} key="root"></div>;
  }
}
