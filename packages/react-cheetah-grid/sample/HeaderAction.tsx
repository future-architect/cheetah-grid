import { ChangedHeaderValueCellEvent } from "cheetah-grid/ts-types";
import { useCallback } from "react";
import {
  CheetahGrid,
  Line,
  Column,
  CheckColumn,
  HeaderLayout,
  BodyLayout,
  Header,
  useCheetahGridInstance,
} from "../src/index";

type Record = {
  personid: number;
  check: boolean;
  fname: string;
  lname: string;
  email: string;
};

const records: Record[] = [
  {
    personid: 1,
    check: false,
    fname: "Sophia",
    lname: "Hill",
    email: "sophia_hill@example.com",
  },
  {
    personid: 2,
    check: false,
    fname: "Aubrey",
    lname: "Martin",
    email: "aubrey_martin@example.com",
  },
  {
    personid: 3,
    check: false,
    fname: "Avery",
    lname: "Jones",
    email: "avery_jones@example.com",
  },
  {
    personid: 4,
    check: false,
    fname: "Joseph",
    lname: "Rodriguez",
    email: "joseph_rodriguez@example.com",
  },
  {
    personid: 5,
    check: false,
    fname: "Samuel",
    lname: "Campbell",
    email: "samuel_campbell@example.com",
  },
  {
    personid: 6,
    check: false,
    fname: "Joshua",
    lname: "Ortiz",
    email: "joshua_ortiz@example.com",
  },
  {
    personid: 7,
    check: false,
    fname: "Mia",
    lname: "Foster",
    email: "mia_foster@example.com",
  },
  {
    personid: 8,
    check: false,
    fname: "Landon",
    lname: "Lopez",
    email: "landon_lopez@example.com",
  },
  {
    personid: 9,
    check: false,
    fname: "Audrey",
    lname: "Cox",
    email: "audrey_cox@example.com",
  },
  {
    personid: 10,
    check: false,
    fname: "Anna",
    lname: "Ramirez",
    email: "anna_ramirez@example.com",
  },
];

export function HeaderAction() {
  const [instance, instanceRef] = useCheetahGridInstance();
  const onChangeHeaderValue = useCallback(
    (v: ChangedHeaderValueCellEvent) => {
      console.log(v);
      for (const record of records) {
        record.check = v.value;
      }
      instance?.invalidate();
    },
    [instance]
  );
  return (
    <div className="h-full w-full flex flex-col items-stretch">
      <CheetahGrid
        instance={instanceRef}
        style={{ flexGrow: 1 }}
        data={records}
        frozenColCount={2}
        onHeaderValueChange={onChangeHeaderValue}
      >
        <HeaderLayout>
          <Line>
            <Header width={40} rowSpan={2}>
              ID
            </Header>
            <Header width={60} headerType="multilinetext">
              {"Check\nAll"}
            </Header>
            <Header colSpan={2}>Name</Header>
            <Header rowSpan={2} width={280}>
              Email
            </Header>
          </Line>
          <Line>
            <Header headerType="check" headerAction="check"></Header>

            <Header width={200}>First Name</Header>
            <Header width={200}>Last Name</Header>
          </Line>
        </HeaderLayout>
        <BodyLayout>
          <Column field={"personid"} />
          <CheckColumn field={"check"} />
          <Column field={"fname"} />
          <Column field={"lname"} />
          <Column field={"email"} />
        </BodyLayout>
      </CheetahGrid>
    </div>
  );
}
