declare interface Fn<T = any, R = T> {
  (...arg: T[]): R;
}

declare interface PromiseFn<T = any, R = T> {
  (...arg: T[]): Promise<R>;
}

declare type RefType<T> = T | null;
declare type Nullable<T> = T | null;
declare type ElRef<T extends HTMLElement = HTMLDivElement> = Nullable<T>;

declare type LabelValueOptions = {
  label: string;
  value: any;
  [key: string]: string | number | boolean;
}[];

declare type ObjectType = {
  [key: string]: any;
};
