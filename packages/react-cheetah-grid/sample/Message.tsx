import { CheetahGrid, Column, MenuColumn, CheckColumn } from "../src/index";

type Record = {
  text1: string;
  text2: string;
  val3: string;
  check4: boolean;
  msg: string;
};

const records: Record[] = [
  {
    text1: "text",
    text2: "123",
    val3: "",
    check4: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    val3: "",
    check4: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    val3: "",
    check4: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    val3: "",
    check4: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    val3: "",
    check4: false,
    msg: "message.",
  },

  {
    text1: "text",
    text2: "123",
    val3: "",
    check4: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    val3: "",
    check4: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    val3: "",
    check4: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    val3: "",
    check4: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    val3: "",
    check4: false,
    msg: "message.",
  },

  {
    text1: "text",
    text2: "123",
    val3: "",
    check4: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    val3: "",
    check4: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    val3: "",
    check4: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    val3: "",
    check4: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    val3: "",
    check4: false,
    msg: "message.",
  },
];

const options = [
  { value: "", label: "Choose your option" },
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
  { value: "3", label: "Option 3" },
  { value: "4", label: "Option 4" },
  { value: "5", label: "Option 5" },
  { value: "6", label: "Option 6" },
  { value: "7", label: "Option 7" },
];

export function Message() {
  return (
    <div className="h-full w-full flex flex-row items-stretch">
      <CheetahGrid style={{ flexGrow: 1 }} data={records}>
        <Column field={"text1"} width={150} message="msg">
          Msg from data
        </Column>
        <Column
          field={"text2"}
          width={150}
          editable
          message={(rec) => {
            return rec.text2.match(/^[a-zA-Z]*$/)
              ? null
              : "Please only alphabet.";
          }}
        >
          Alphabet Check
        </Column>
        <MenuColumn
          field={"val3"}
          width={210}
          options={options}
          editable
          message={(rec) => {
            console.log(rec);
            return rec.val3 ? null : "Please select.";
          }}
        >
          Verify Select
        </MenuColumn>
        <CheckColumn
          field={"check4"}
          width={120}
          editable
          message={(rec) => {
            return rec.check4 ? null : "Please check.";
          }}
        >
          Verify Check
        </CheckColumn>
        <Column
          field={"text1"}
          width={100}
          message={(rec) => ({
            type: "info",
            message: "Info Message.",
          })}
        >
          Info
        </Column>
        <Column
          field={"text1"}
          width={100}
          message={(rec) => ({
            type: "warning",
            message: "Warning Message.",
          })}
        >
          Warning
        </Column>
      </CheetahGrid>
    </div>
  );
}
