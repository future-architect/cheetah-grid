import { useMemo, useState, useCallback } from "react";
import {
  CheetahGrid,
  Column,
  DataSource,
  SelectedCellEvent,
  useCheetahGridInstance,
} from "../src/index";

type Record = {
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
  col6: string;
};

function useDataSource() {
  return useMemo(function initDataSource() {
    return new DataSource<Record>({
      get(index: number) {
        return {
          col1: `(${index + 1}, 1)`,
          col2: `(${index + 1}, 2)`,
          col3: `(${index + 1}, 3)`,
          col4: `(${index + 1}, 4)`,
          col5: `(${index + 1}, 5)`,
          col6: `(${index + 1}, 6)`,
        };
      },
      length: 1000,
    });
  }, []);
}

function useSelectCallback() {
  const [selection, setSelection] = useState("");
  const [instance, instanceRef] = useCheetahGridInstance();

  const showSelection = useCallback(() => {
    if (instance) {
      alert(
        `Select: ${JSON.stringify(
          instance.selection.select
        )}, Range: ${JSON.stringify(instance.selection.range)}`
      );
    }
  }, [instance]);

  const cellSelectCallback = useCallback((e: SelectedCellEvent) => {
    setSelection(`select event: ${JSON.stringify(e)}`);
  }, []);
  return { selection, instanceRef, showSelection, cellSelectCallback };
}

export function Selection() {
  const dataSource = useDataSource();
  const { instanceRef, selection, showSelection, cellSelectCallback } =
    useSelectCallback();

  return (
    <div className="h-full w-full flex flex-col items-stretch">
      <CheetahGrid
        style={{ flexGrow: 1 }}
        data={dataSource}
        instance={instanceRef}
        onCellSelect={cellSelectCallback}
      >
        <Column field={"col1"} width={100} message="msg">
          Col1
        </Column>
        <Column field={"col2"} width={100} message="msg">
          Col2
        </Column>
        <Column field={"col3"} width={100} message="msg">
          Col3
        </Column>
        <Column field={"col4"} width={100} message="msg">
          Col4
        </Column>
        <Column field={"col5"} width={100} message="msg">
          Col5
        </Column>
        <Column field={"col6"} width={100} message="msg">
          Col6
        </Column>
      </CheetahGrid>
      <div className="card flex-grow-0 bordered flex flex-row items-center">
        <div className="card-body">
          <input
            type="text"
            placeholder="selected cell"
            className="input input-bordered"
            readOnly
            value={selection}
          />
        </div>
        <button className="btn mr-2" onClick={showSelection}>
          Show Selection
        </button>
      </div>
    </div>
  );
}
