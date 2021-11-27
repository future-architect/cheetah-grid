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

export function Sort() {
  const [instance, instanceRef] = useCheetahGridInstance();
  /*
  const resetSort = useCallback(() => {
    if (instance) {
      instance.resetSort();
    }
  }, [instance]);
  */
  return (
    <div className="h-full w-full flex flex-col items-stretch">
      <CheetahGrid
        instance={instanceRef}
        style={{ flexGrow: 1 }}
        data={records}
        frozenColCount={2}
      >
        <HeaderLayout>
          <Line>
            <Header
              width={40}
              rowSpan={2}
              sort={(order, col, grid) => {
                const compare =
                  order === "desc"
                    ? (v1: number, v2: number) =>
                        v1 === v2 ? 0 : v1 > v2 ? 1 : -1
                    : (v1: number, v2: number) =>
                        v1 === v2 ? 0 : v1 < v2 ? 1 : -1;
                records.sort((r1, r2) => compare(r1.personid, r2.personid));
                console.log("sorted:", records);
                grid.records = records;
              }}
            >
              ID
            </Header>
            <Header width={60} rowSpan={2} sort></Header>
            <Header colSpan={2}>Name</Header>
            <Header rowSpan={2} width={280} sort>
              Email
            </Header>
          </Line>
          <Line>
            <Header width={200} sort>
              First Name
            </Header>
            <Header width={200} sort>
              Last Name
            </Header>
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
      {/* todo: fix
      <div className="card flex-grow-0 bordered flex flex-row items-center">
        <div className="card-body">
          <button className="btn mr-2" onClick={resetSort}>
            Reset Sort
          </button>
        </div>
      </div>
      */}
    </div>
  );
}
