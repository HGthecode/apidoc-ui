export interface MenuType {
  title?: string;
  url?: string;
  method?: string;
  sort?: number;
  menu_key: string;
  group?: string;
  controller?: string;
  tag?: string[];
  children: MenuType[];
  mdDetail?: string;
}

export interface MenuGroupType {
  title: string;
  name: string;
  items: MenuType[];
}
