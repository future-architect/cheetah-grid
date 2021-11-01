import type { ReactElement } from "react";
import type { BaseHeaderProps, StandardProps } from "./columnProps";

export type HeaderLayoutProps<T> = {
  children:
    | ReactElement<StandardProps<T>>
    | ReactElement<StandardProps<T>>[]
    | ReactElement<{ children: ReactElement<LineProps<T>> }>
    | ReactElement<{ children: ReactElement<LineProps<T>>[] }>;
};

export function HeaderLayout<T>(props: HeaderLayoutProps<T>) {
  return <div></div>;
}

export type BodyLayoutProps<T> = {
  children:
    | ReactElement<StandardProps<T>>
    | ReactElement<StandardProps<T>>[]
    | ReactElement<{ children: ReactElement<LineProps<T>> }>
    | ReactElement<{ children: ReactElement<LineProps<T>>[] }>;
};

export function BodyLayout<T>(props: BodyLayoutProps<T>) {
  return <div></div>;
}

export type LineProps<T> = {
  children:
    | ReactElement<BaseHeaderProps<T>>
    | ReactElement<BaseHeaderProps<T>>[];
};

export function Line<T>({ children }: LineProps<T>) {
  return <div></div>;
}

export type HeaderProps<T> = BaseHeaderProps<T>;

export function Header<T>(props: HeaderProps<T>) {
  return <div></div>;
}

export { processBaseHeaderProps as processHeaderProps } from "./columnProps";
