import { useMemo, useState, useCallback, ChangeEvent } from "react";
import {
  CheetahGrid,
  Line,
  Column,
  CheckColumn,
  ButtonColumn,
  HeaderLayout,
  BodyLayout,
  Header,
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

function useSelect(
  defaultValue: "" | "MATERIAL_DESIGN" | "BASIC"
): [
  "" | "MATERIAL_DESIGN" | "BASIC",
  (e: ChangeEvent<HTMLSelectElement>) => void
] {
  const [selectedValue, setSelectedValue] = useState<
    "" | "MATERIAL_DESIGN" | "BASIC"
  >(defaultValue);

  const callback = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    if (
      e.target.value === "" ||
      e.target.value === "MATERIAL_DESIGN" ||
      e.target.value === "BASIC"
    ) {
      setSelectedValue(e.target.value);
    }
  }, []);
  return [selectedValue, callback];
}

export function Theme() {
  const [theme, setTheme] = useSelect("");
  return (
    <div className="h-full w-full flex flex-col items-stretch">
      <CheetahGrid
        style={{ flexGrow: 1 }}
        data={records}
        frozenColCount={2}
        theme={theme}
      >
        <HeaderLayout>
          <Line>
            <Header width={40} rowSpan={2}>
              ID
            </Header>
            <Header width={60} rowSpan={2}>
              Check
            </Header>
            <Header colSpan={2}>Name</Header>
            <Header rowSpan={2} width={280}>
              Email
            </Header>
            <Header rowSpan={2}>Fav</Header>
          </Line>
          <Line>
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
          <ButtonColumn
            onClick={(data: Record) => {
              alert(`click: ${data.personid}`);
            }}
            buttonCaption="Fav💖"
          ></ButtonColumn>
        </BodyLayout>
      </CheetahGrid>
      <div className="card flex-grow-0 bordered flex flex-row items-center">
        <div className="card-body">
          <select onChange={setTheme}>
            <option value="">(default)</option>
            <option value="MATERIAL_DESIGN">MATERIAL_DESIGN</option>
            <option value="BASIC">BASIC</option>
          </select>
        </div>
      </div>
    </div>
  );
}
