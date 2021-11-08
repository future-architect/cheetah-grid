import { cleanup, render } from "@testing-library/react";

import type { CheetahGridChildren } from "../src/gridProps";
import { parseLayout } from "../src/CheetahGrid";

import { Column, BodyLayout, HeaderLayout, Header, Line } from "../src/index";

afterEach(cleanup);

describe("", () => {
  function DumpComponent({ children }: { children: CheetahGridChildren<{}> }) {
    const json = parseLayout(children);
    return <div data-testid="layout" data-layout={JSON.stringify(json)}></div>;
  }

  test("only standard columns", () => {
    const dom = render(
      <DumpComponent>
        <Column field="name">Name</Column>
        <Column field="address">Address</Column>
      </DumpComponent>
    );
    const elem = dom.getByTestId("layout");
    expect(elem.getAttribute("data-layout")).not.toBeNull();
    expect(
      JSON.parse(elem.getAttribute("data-layout") as string)
    ).toStrictEqual({
      header: [
        { caption: "Name", field: "name" },
        { caption: "Address", field: "address" },
      ],
    });
  });

  test("multi line columns (1)", () => {
    const dom = render(
      <DumpComponent>
        <Line>
          <Column field="address">Address</Column>
        </Line>
        <Line>
          <Column field="name">Name</Column>
          <Column field="age">Age</Column>
        </Line>
      </DumpComponent>
    );
    const elem = dom.getByTestId("layout");
    expect(elem.getAttribute("data-layout")).not.toBeNull();
    expect(
      JSON.parse(elem.getAttribute("data-layout") as string)
    ).toStrictEqual({
      layout: [
        [{ caption: "Address", field: "address" }],
        [
          { caption: "Name", field: "name" },
          { caption: "Age", field: "age" },
        ],
      ],
    });
  });

  test("multi line columns (2)", () => {
    const dom = render(
      <DumpComponent>
        <BodyLayout>
          <Line>
            <Column field="address">Address</Column>
          </Line>
          <Line>
            <Column field="name">Name</Column>
            <Column field="age">Age</Column>
          </Line>
        </BodyLayout>
      </DumpComponent>
    );
    const elem = dom.getByTestId("layout");
    expect(elem.getAttribute("data-layout")).not.toBeNull();
    expect(
      JSON.parse(elem.getAttribute("data-layout") as string)
    ).toStrictEqual({
      layout: [
        [{ caption: "Address", field: "address" }],
        [
          { caption: "Name", field: "name" },
          { caption: "Age", field: "age" },
        ],
      ],
    });
  });

  test("multi line columns (3)", () => {
    const dom = render(
      <DumpComponent>
        <BodyLayout>
          <Column field="address">Address</Column>
          <Column field="name">Name</Column>
          <Column field="age">Age</Column>
        </BodyLayout>
      </DumpComponent>
    );
    const elem = dom.getByTestId("layout");
    expect(elem.getAttribute("data-layout")).not.toBeNull();
    expect(
      JSON.parse(elem.getAttribute("data-layout") as string)
    ).toStrictEqual({
      layout: [
        [
          { caption: "Address", field: "address" },
          { caption: "Name", field: "name" },
          { caption: "Age", field: "age" },
        ],
      ],
    });
  });

  test("multi line columns: error (1)", () => {
    const dom = render(
      <DumpComponent>
        <BodyLayout>
          <Line>
            <Column field="address">Address</Column>
          </Line>
        </BodyLayout>
        <BodyLayout>
          <Line>
            <Column field="name">Name</Column>
            <Column field="age">Age</Column>
          </Line>
        </BodyLayout>
      </DumpComponent>
    );
    const elem = dom.getByTestId("layout");
    expect(elem.getAttribute("data-layout")).not.toBeNull();
    expect(
      JSON.parse(elem.getAttribute("data-layout") as string)
    ).toStrictEqual({
      header: [{ caption: "Only one <BodyLayout> is acceptable" }],
    });
  });

  test("header and body definitions", () => {
    const dom = render(
      <DumpComponent>
        <HeaderLayout>
          <Line>
            <Header colSpan={2}>Address</Header>
          </Line>
          <Line>
            <Header>Name</Header>
            <Header>Age</Header>
          </Line>
        </HeaderLayout>
        <BodyLayout>
          <Line>
            <Column field="address" colSpan={2} />
          </Line>
          <Line>
            <Column field="name" />
            <Column field="age" />
          </Line>
        </BodyLayout>
      </DumpComponent>
    );
    const elem = dom.getByTestId("layout");
    expect(elem.getAttribute("data-layout")).not.toBeNull();
    expect(
      JSON.parse(elem.getAttribute("data-layout") as string)
    ).toStrictEqual({
      layout: {
        header: [
          [{ caption: "Address", colSpan: 2 }],
          [{ caption: "Name" }, { caption: "Age" }],
        ],
        body: [
          [{ caption: "", field: "address", colSpan: 2 }],
          [
            { caption: "", field: "name" },
            { caption: "", field: "age" },
          ],
        ],
      },
    });
  });
});
