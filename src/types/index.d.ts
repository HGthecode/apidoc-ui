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

declare interface SelectOptionType {
  label: string;
  value: string | number;
}

declare module "highlight.js/lib/core.js";
declare module "highlight.js/lib/languages/json";
declare module "highlight.js/lib/languages/htmlbars";
declare module "highlight.js/lib/languages/php";
declare module "highlight.js/lib/languages/javascript";
declare module "highlight.js/lib/languages/php-template";
declare module "highlight.js/lib/languages/xml";
