import { useState } from "react";
import { CheetahGrid, Column } from "../src/index";

type Record = {
  personid: number;
  fname: string;
  lname: string;
  email: string;
};

const records: Record[] = [
  {
    personid: 1,
    fname: "Sophia",
    lname: "Hill",
    email: "sophia_hill@example.com",
  },
  {
    personid: 2,
    fname: "Aubrey",
    lname: "Martin",
    email: "aubrey_martin@example.com",
  },
  {
    personid: 3,
    fname: "Avery",
    lname: "Jones",
    email: "avery_jones@example.com",
  },
  {
    personid: 4,
    fname: "Joseph",
    lname: "Rodriguez",
    email: "joseph_rodriguez@example.com",
  },
  {
    personid: 5,
    fname: "Samuel",
    lname: "Campbell",
    email: "samuel_campbell@example.com",
  },
  {
    personid: 6,
    fname: "Joshua",
    lname: "Ortiz",
    email: "joshua_ortiz@example.com",
  },
  {
    personid: 7,
    fname: "Mia",
    lname: "Foster",
    email: "mia_foster@example.com",
  },
  {
    personid: 8,
    fname: "Landon",
    lname: "Lopez",
    email: "landon_lopez@example.com",
  },
  {
    personid: 9,
    fname: "Audrey",
    lname: "Cox",
    email: "audrey_cox@example.com",
  },
  {
    personid: 10,
    fname: "Anna",
    lname: "Ramirez",
    email: "anna_ramirez@example.com",
  },
];

function useLog() {
  const [log, setLog] = useState("");
  function appendLog(key: string, event: any) {
    setLog(log + `🎉 ${key}: ${JSON.stringify(event)}\n`);
  }
  return { log, setLog, appendLog };
}

export function Events() {
  const { log, setLog, appendLog } = useLog();
  return (
    <div className="h-full w-full flex flex-row items-stretch">
      <CheetahGrid
        style={{ flexGrow: 1 }}
        data={records}
        onCellClick={(e) => {
          console.log("onCellClick", e);
          appendLog("onCellClick", e);
        }}
        onCellDoubleClick={(e) => {
          appendLog("onCellDoubleClick", e);
        }}
        onCellDoubleTap={(e) => {
          appendLog("onCellDoubleTap", e);
        }}
        onCellMouseDown={(e) => {
          appendLog("onCellMouseDown", e);
        }}
        onCellMouseUp={(e) => {
          appendLog("onCellMouseUp", e);
        }}
        onCellSelect={(e) => {
          appendLog("onCellSelect", e);
        }}
        onKeyDown={(e) => {
          appendLog("onKeyDown", e);
        }}
        onCellInput={(e) => {
          appendLog("onCellInput", e);
        }}
        onCellPaste={(e) => {
          appendLog("onCellPaste", e);
        }}
        onCellContextMenu={(e) => {
          appendLog("onCellContextMenu", e);
        }}
        onColumnResize={(e) => {
          appendLog("onColumnResize", e);
        }}
        onScroll={(e) => {
          appendLog("onScroll", e);
        }}
        onCellEditableInput={(e) => {
          appendLog("onCellEditableInput", e);
        }}
        onModifyStatusEditableInput={(e) => {
          appendLog("onModifyStatusEditableInput", e);
        }}
        onValueChange={(e) => {
          appendLog("onValueChange", e);
        }}
        onHeaderValueChange={(e) => {
          appendLog("onHeaderValueChange", e);
        }}
        onFocus={(e) => {
          appendLog("onFocus", e);
        }}
        onBlur={(e) => {
          appendLog("onBlur", e);
        }}
      >
        <Column field="personid" width={50}>
          ID
        </Column>
        <Column field="fname" width={100}>
          First Name
        </Column>
        <Column field="lname" width={100}>
          Last Name
        </Column>
        <Column field="email" width={300}>
          E-Mail
        </Column>
      </CheetahGrid>
      <textarea
        className="textarea h-full w-96 textarea-bordered"
        value={log}
        onChange={(e) => {
          console.log(e);
          setLog(e.currentTarget.value);
        }}
      ></textarea>
    </div>
  );
}
