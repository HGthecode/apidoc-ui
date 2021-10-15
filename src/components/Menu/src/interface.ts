export interface MenuItemType {
  title: string;
  menu_key: string;
  tag?: string[];
  children?: MenuItemType[];
  type: string;
  method?: string;
  url?: string;
  key?: string;
  path?: string;
}

export interface MenuGroupType {
  title: string;
  name: string;
  items: MenuItemType[];
}
