import { useState, useCallback } from "react";
import type { ChangeEvent } from "react";
import {
  CheetahGrid,
  Column,
  NumberColumn,
  ButtonColumn,
  CheckColumn,
  MenuColumn,
  IconColumn,
  ImageColumn,
  RadioColumn,
  MultilineTextColumn,
  PercentCompleteBarColumn,
  BranchGraphColumn,
} from "../src/index";
import type { BranchGraphCommand } from "../src/index";

type Record = {
  name: string;
  check: boolean;
  num: number;
  favorite: "Hamburger" | "Spaghetti" | "Steak" | "Mac and Cheese";
  feeling: number;
  sleepy: number;
  imageUrl: string;
  link: string;
  longText: string;
  familyTree: BranchGraphCommand;
};

const options = [
  {
    label: "Hamburger",
    value: "Hamburger",
  },
  {
    label: "Spaghetti",
    value: "Spaghetti",
  },
  {
    label: "Steak",
    value: "Steak",
  },
  {
    label: "Mac and Cheese",
    value: "Mac and Cheese",
  },
];

function useCheckBox(
  defaultValue: boolean
): [boolean, (e: ChangeEvent<HTMLInputElement>) => void] {
  const [checkValue, setCheckValue] = useState(defaultValue);

  const callback = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setCheckValue(Boolean(e.target.checked));
  }, []);

  return [checkValue, callback];
}

function useSelect(
  defaultValue: "" | "inline" | "popup"
): ["" | "inline" | "popup", (e: ChangeEvent<HTMLSelectElement>) => void] {
  const [selectedValue, setSelectedValue] = useState<"" | "inline" | "popup">(
    defaultValue
  );

  const callback = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    if (
      e.target.value === "" ||
      e.target.value === "inline" ||
      e.target.value === "popup"
    ) {
      setSelectedValue(e.target.value);
    }
  }, []);
  return [selectedValue, callback];
}

const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

const records: Record[] = [
  {
    name: "Mr. A",
    check: true,
    num: 10000,
    favorite: "Hamburger",
    feeling: 3,
    sleepy: 10,
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Kooshki_%28Iranian_Cheetah%29_03.jpg/440px-Kooshki_%28Iranian_Cheetah%29_03.jpg",
    link: "https://en.wikipedia.org/wiki/File:Kooshki_(Iranian_Cheetah)_03.jpg",
    longText: loremIpsum,
    familyTree: [
      { command: "branch", branch: "main" },
      { command: "commit", branch: "main" },
    ],
  },
  {
    name: "Ms. B",
    check: false,
    num: 1000000,
    favorite: "Spaghetti",
    feeling: 2,
    sleepy: 50,
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Cheetah_%28Kruger_National_Park%2C_South_Africa%2C_2001%29.jpg/180px-Cheetah_%28Kruger_National_Park%2C_South_Africa%2C_2001%29.jpg",
    link: "https://en.wikipedia.org/wiki/File:Cheetah_(Kruger_National_Park,_South_Africa,_2001).jpg",
    longText: loremIpsum,
    familyTree: { command: "commit", branch: "main" },
  },
  {
    name: "Dr. C",
    check: true,
    num: 100000000,
    favorite: "Steak",
    feeling: 5,
    sleepy: 100,
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Cheetah_at_Whipsnade_Zoo%2C_Dunstable.jpg/180px-Cheetah_at_Whipsnade_Zoo%2C_Dunstable.jpg",
    link: "https://en.wikipedia.org/wiki/File:Cheetah_at_Whipsnade_Zoo,_Dunstable.jpg",
    longText: loremIpsum,
    familyTree: [
      { command: "branch", branch: { from: "main", to: "brother" } },
      { command: "commit", branch: "brother" },
    ],
  },
  {
    name: "D Jr.",
    check: false,
    num: 10000000000,
    favorite: "Mac and Cheese",
    feeling: 4,
    sleepy: 30,
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/TanzanianCheetah.jpg/180px-TanzanianCheetah.jpg",
    link: "https://en.wikipedia.org/wiki/File:TanzanianCheetah.jpg",
    longText: loremIpsum,
    familyTree: { command: "commit", branch: "main" },
  },
];

export function Columns() {
  const [checkEditable, setCheckEditable] = useCheckBox(false);
  const [checkDisabled, setCheckDisabled] = useCheckBox(false);
  const [menuEditable, setMenuEditable] = useCheckBox(false);
  const [menuDisabled, setMenuDisabled] = useCheckBox(false);
  const [columnEditable, setColumnEditable] = useSelect("");
  const [columnDisabled, setColumnDisabled] = useCheckBox(false);
  const [buttonDisabled, setButtonDisabled] = useCheckBox(false);

  return (
    <div className="h-full w-full flex flex-col items-stretch">
      <CheetahGrid
        style={{ flexGrow: 1 }}
        data={records}
        defaultRowHeight={100}
        headerRowHeight={24}
      >
        <ImageColumn
          field="imageUrl"
          width={100}
          style={{ imageSizing: "keep-aspect-ratio" }}
          onClick={(rec: Record) => {
            window.open(rec.link, "_blank");
          }}
        >
          Face
        </ImageColumn>
        <Column
          field="name"
          editable={columnEditable}
          disabled={columnDisabled}
        >
          Name
        </Column>
        <NumberColumn
          field="num"
          width={150}
          editable={columnEditable}
          disabled={columnDisabled}
        >
          Number
        </NumberColumn>
        <CheckColumn
          field="check"
          disabled={checkDisabled}
          editable={checkEditable}
          key="check"
        >
          Check
        </CheckColumn>
        <RadioColumn
          field="check"
          disabled={checkDisabled}
          editable={checkEditable}
          key="radio"
        >
          Radio
        </RadioColumn>
        <MenuColumn
          field="favorite"
          options={options}
          disabled={menuDisabled}
          editable={menuEditable}
          width={170}
        >
          Favorite
        </MenuColumn>
        <IconColumn
          field="feeling"
          content="⭐️"
          className="material-icons"
          style={{ color: "gold" }}
          width={130}
          editable={columnEditable}
          disabled={columnDisabled}
        >
          Feeling Happy
        </IconColumn>
        <PercentCompleteBarColumn
          field="sleepy"
          formatter={(v) => `${v}%`}
          style={{ barHeight: 10 }}
        >
          Sleepy
        </PercentCompleteBarColumn>
        <MultilineTextColumn
          field="longText"
          width="200"
          style={{ autoWrapText: true }}
        >
          Description
        </MultilineTextColumn>
        <BranchGraphColumn field="familyTree" start="top">
          Family Tree
        </BranchGraphColumn>
        <ButtonColumn
          onClick={(data: Record) => {
            alert(`click: ${data.name}`);
          }}
          buttonCaption="Fav💖"
          disabled={buttonDisabled}
        >
          Button
        </ButtonColumn>
      </CheetahGrid>

      <div className="card flex-grow-0 bordered">
        <div className="card-body">
          <div>
            <span
              className="border-b-2 inline-block mr-4"
              style={{ width: 180 }}
            >
              Check, Radio
            </span>
            <label>
              <input
                type="checkbox"
                checked={checkEditable}
                onChange={setCheckEditable}
              />
              Editable
            </label>
            <label>
              <input
                type="checkbox"
                checked={checkDisabled}
                onChange={setCheckDisabled}
              />
              Disable
            </label>
          </div>
          <div>
            <span
              className="border-b-2 inline-block mr-4"
              style={{ width: 180 }}
            >
              Column, Number, Icon
            </span>
            <select onChange={setColumnEditable}>
              <option value="">no editable</option>
              <option value="inline">editable(inline)</option>
              <option value="popup">editable(popup)</option>
            </select>
            <label>
              <input
                type="checkbox"
                checked={columnDisabled}
                onChange={setColumnDisabled}
              />
              Disable
            </label>
          </div>
          <div>
            <span
              className="border-b-2 inline-block  mr-4"
              style={{ width: 180 }}
            >
              Menu
            </span>
            <label>
              <input
                type="checkbox"
                checked={menuEditable}
                onChange={setMenuEditable}
              />
              Editable
            </label>
            <label>
              <input
                type="checkbox"
                checked={menuDisabled}
                onChange={setMenuDisabled}
              />
              Disable
            </label>
          </div>
          <div>
            <span
              className="border-b-2 inline-block mr-4"
              style={{ width: 180 }}
            >
              Button's click
            </span>
            <label>
              <input
                type="checkbox"
                checked={buttonDisabled}
                onChange={setButtonDisabled}
              />
              Disable
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
