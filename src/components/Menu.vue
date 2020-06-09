<script>
import { Menu, Tag, Input } from "ant-design-vue";
import cloneDeep from "lodash/cloneDeep";
function hasKeyword(item, keyword) {
  if (
    item.title.indexOf(keyword) > -1 ||
    (item.url && item.url.indexOf(keyword) > -1)
  ) {
    return true;
  }
  return false;
}

function filterMenu(menus, keyword) {
  const newMenus = menus.filter(item => {
    let res = hasKeyword(item, keyword);
    if (item.children && item.children.length) {
      item.children = filterMenu(item.children, keyword);
      if (item.children && item.children.length) {
        res = true;
      }
    }
    return res;
  });
  return newMenus;
}

export default {
  components: {
    Tag,
    Menu,
    MenuSubMenu: Menu.SubMenu,
    MenuItem: Menu.Item,
    MenuItemGroup: Menu.ItemGroup,
    InputSearch: Input.Search
  },
  props: {
    apiData: {
      type: Array,
      default: () => []
    },
    sideSize: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      menuData: []
    };
  },
  watch: {
    apiData(val) {
      this.menuData = val;
    }
  },

  created() {
    this.menuData = this.apiData;
  },
  methods: {
    handleClick(e) {
      const key = e.key;
      const keyArr = key.split("-");
      let data = this.menuData;
      for (let i = 0; i < keyArr.length; i++) {
        const index = keyArr[i];
        if (data[index].children) {
          data = data[index].children;
        } else {
          data = data[index];
        }
      }
      this.$emit("change", data);
    },
    renderItem(menu) {
      if (!menu.hidden) {
        return menu.children
          ? this.renderSubMenu(menu)
          : this.renderMenuItem(menu);
      }
      return null;
    },
    renderSubMenu(menu) {
      const itemArr = [];
      if (menu.children && menu.children.length) {
        menu.children.forEach(item => itemArr.push(this.renderItem(item)));
      }
      let controller = "";
      if (menu.controller) {
        controller = <b style="margin-right:10px;">{menu.controller}</b>;
      }
      return (
        <MenuSubMenu {...{ key: menu.id }}>
          <span slot="title">
            {controller}
            <span>{menu.title}</span>
          </span>
          {itemArr}
        </MenuSubMenu>
      );
    },
    renderMenuItem(menu) {
      if (menu && menu.url && menu.method) {
        // 接口
        let tagColor = "";
        switch (menu.method) {
          case "GET":
            tagColor = "#87d068";
            break;
          case "POST":
            tagColor = "#2db7f5";
            break;
          case "PUT":
            tagColor = "#ff9800";
            break;
          case "DELETE":
            tagColor = "#ff4d4f";
            break;
          default:
            tagColor = "#ddd";
            break;
        }

        return (
          <MenuItem {...{ key: menu.id }}>
            <span class="action-title">
              <div>
                <Tag class="action-title-tag" color={tagColor}>
                  {menu.method}
                </Tag>
                {menu.title}
                <span style="margin-left:10px;">{menu.url}</span>
              </div>
            </span>
          </MenuItem>
        );
      }
      return (
        <MenuItem {...{ key: menu.id }}>
          <span>{menu.title}</span>
        </MenuItem>
      );
    },
    onSearch(key) {
      const apiData = cloneDeep(this.apiData);
      if (key) {
        const menuData = filterMenu(apiData, key);
        this.menuData = menuData;
      } else {
        // 无搜索条件,显示所有
        this.menuData = apiData;
      }
    }
  },
  render() {
    const menuTree = this.menuData.map(item => {
      return this.renderItem(item);
    });

    return (
      <div class="doc-menu">
        <div class="doc-menu-header">
          <div class="header-search">
            <InputSearch
              allowClear={true}
              placeholder="请输入搜索关键词"
              {...{ on: { search: this.onSearch } }}
            />
          </div>
        </div>
        <Menu
          style="width: 100%"
          mode="inline"
          {...{ on: { click: this.handleClick } }}
        >
          {menuTree}
        </Menu>
      </div>
    );
  }
};
</script>

<style lang="less" scoped>
.doc-menu {
  .action-title-tag {
    width: 50px;
    text-align: center;
    padding: 0 3px;
  }
  .doc-menu-url {
    padding: 2px 10px;
    background: #f1f1f1;
    border-radius: 4px;
    line-height: 1.6;
    margin-bottom: 5px;
  }
  .doc-menu-header {
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }
}
/deep/ .ant-menu-sub.ant-menu-inline > .ant-menu-item {
  height: auto;
}
/deep/ .ant-menu-inline,
.ant-menu-vertical,
.ant-menu-vertical-left {
  border: none;
}
</style>
