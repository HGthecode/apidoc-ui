<script>
import { Menu, Tag, Input, Select, Icon } from "ant-design-vue";
import cloneDeep from "lodash/cloneDeep";
function hasKeyword(item, keyword) {
  if (
    item.title.indexOf(keyword) > -1 ||
    (item.url && item.url.indexOf(keyword) > -1) ||
    (item.tag && item.tag.indexOf(keyword) > -1)
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
    InputSearch: Input.Search,
    Select,
    SelectOption: Select.Option,
    Icon
  },
  props: {
    apiData: {
      type: Array,
      default: () => []
    },
    groups: {
      type: Array,
      default: () => []
    },
    sideSize: {
      type: String,
      default: ""
    },
    docs: {
      type: Array,
      default: () => []
    },
    config: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      currentGroupName: 0,
      menuData: []
    };
  },
  watch: {
    apiData() {
      this.onSearch();
    },
    docs() {
      this.onSearch();
    }
  },

  created() {
    this.onSearch();
  },
  methods: {
    onMenuClick(data) {
      this.$emit("change", data);
    },
    renderItem(menu) {
      if (!menu.hidden) {
        if (menu.items) {
          // 分组
          return this.renderGroup(menu);
        }
        if (menu.children) {
          return this.renderSubMenu(menu);
        }
        return this.renderMenuItem(menu);
      }
      return null;
    },
    renderGroup(menu) {
      const itemArr = [];
      if (menu.items && menu.items.length) {
        menu.items.forEach(item => itemArr.push(this.renderItem(item)));
        return (
          <MenuItemGroup title={menu.title} {...{ key: menu.name }}>
            {itemArr}
          </MenuItemGroup>
        );
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
        <MenuSubMenu {...{ key: menu.controller }}>
          <span slot="title">
            <Icon type="folder-open" />
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
          <MenuItem
            {...{
              key: menu.url,
              on: {
                click: () => {
                  this.onMenuClick(menu);
                }
              }
            }}
          >
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
      } else if (menu && menu.type === "md") {
        //doc文档
        return (
          <MenuItem
            {...{
              key: menu.path,
              on: {
                click: () => {
                  this.onMenuClick(menu);
                }
              }
            }}
          >
            <span class="action-title">
              <div>
                <Icon type="file-text" />
                {menu.title}
              </div>
            </span>
          </MenuItem>
        );
      }
      return (
        <MenuItem {...{ key: menu.path }}>
          <span>{menu.title}</span>
        </MenuItem>
      );
    },
    handleGroupMenuData(data) {
      const { groups, currentGroupName } = this;
      if (!(groups && groups.length)) {
        return data;
      }
      const apiData = cloneDeep(data);
      if (currentGroupName) {
        // 指定分组
        return apiData.filter(p => p.group == currentGroupName);
      }
      const groupNames = groups.map(p => p.name);
      let groupData = groups.map(item => {
        if (item.name === 0) {
          item.items = apiData.filter(p => !groupNames.includes(p.group));
        } else {
          item.items = apiData.filter(p => p.group == item.name);
        }
        return item;
      });
      return groupData;
    },
    handleDocsData(docsData, key = "") {
      const { config, currentGroupName } = this;
      let data = null;
      if (
        docsData &&
        docsData.length &&
        (!currentGroupName || currentGroupName === "markdown_doc")
      ) {
        let items = [];
        if (key) {
          items = filterMenu(docsData, key);
        } else {
          items = docsData;
        }
        // 过滤分组
        data = {
          title:
            config.docs && config.docs.menu_title
              ? config.docs.menu_title
              : "文档",
          items: items
        };
      }
      return data;
    },
    onSearch(key) {
      const apiData = cloneDeep(this.apiData);
      const docsData = cloneDeep(this.docs);
      let menuData = [];
      if (key) {
        const filterData = filterMenu(apiData, key);
        // 分组
        const groupData = this.handleGroupMenuData(filterData);
        menuData = groupData;
      } else {
        // 无搜索条件,显示所有
        const groupData = this.handleGroupMenuData(apiData);
        menuData = groupData;
      }

      const docsList = this.handleDocsData(docsData, key);
      if (docsList) {
        this.menuData = [docsList, ...menuData];
      } else {
        this.menuData = menuData;
      }
    },
    renderGroupsSelect() {
      const { groups, currentGroupName } = this;
      if (!(groups && groups.length)) {
        return null;
      }
      const that = this;
      const selectOptions = groups.map(item => {
        return <SelectOption value={item.name}>{item.title}</SelectOption>;
      });
      const selectProps = {
        props: {
          value: currentGroupName,
          allowClear: true,
          placeholder: "选择分组"
        },
        on: {
          change: val => {
            that.currentGroupName = val;
            that.onSearch();
          }
        },
        style: {
          width: "140px",
          minWidth: "120px",
          marginRight: "10px"
        }
      };
      return <Select {...selectProps}>{selectOptions}</Select>;
    }
  },
  render() {
    const { renderGroupsSelect } = this;
    const menuTree = this.menuData.map(item => {
      return this.renderItem(item);
    });

    return (
      <div class="doc-menu">
        <div class="doc-menu-header">
          <div class="header-search">
            {renderGroupsSelect()}
            <InputSearch
              allowClear={true}
              placeholder="请输入关键词"
              style="flex"
              {...{ on: { search: this.onSearch } }}
            />
          </div>
        </div>
        <div class="doc-menu-box">
          <Menu style="width: 100%" mode="inline">
            {menuTree}
          </Menu>
        </div>
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
    padding: 6px;
    border-bottom: 1px solid #ddd;
    .header-search {
      display: flex;
    }
  }
  .doc-menu-box {
    width: 100%;
    height: calc(100vh - 100px);
    overflow: hidden;
    overflow-y: auto;
    padding-bottom: 50px;
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
