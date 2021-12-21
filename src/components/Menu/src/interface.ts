export interface MenuItemType {
  title: string;
  menu_key: string;
  tag?: string[];
  children?: MenuItemType[];
  type: string;
  method?: string;
  url?: string;
  path?: string;
  controller?: string;
}

export interface MenuGroupType {
  title: string;
  name: string;
  items: MenuItemType[];
}
