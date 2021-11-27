import { CheetahGrid, Column, ButtonColumn } from "../src/index";

type Record = {
  text: string;
  iconContent: string;
};

const records: Record[] = [
  { text: "file", iconContent: "\uf15b" },
  { text: "audio", iconContent: "\uf1c7" },
  { text: "code", iconContent: "\uf1c9" },
  { text: "image", iconContent: "\uf1c5" },
];

export function Icon() {
  return (
    <div className="h-full w-full flex flex-row items-stretch">
      <CheetahGrid style={{ flexGrow: 1 }} data={records}>
        <Column
          field="text"
          width={180}
          icon={{
            font: "normal normal normal 14px/1 FontAwesome",
            content: "iconContent",
            width: 16, // Optional
            color: "#fff", // Optional
          }}
        >
          Text
        </Column>
        <ButtonColumn
          width={180}
          buttonCaption={"BUTTON"}
          onClick={(rec: Record) => {
            alert(JSON.stringify(rec));
          }}
          icon={{
            font: "normal normal normal 14px/1 FontAwesome",
            content: "iconContent",
            width: 16, // Optional
            color: "#fff", // Optional
          }}
        >
          First Name
        </ButtonColumn>
      </CheetahGrid>
    </div>
  );
}
