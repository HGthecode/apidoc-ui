/**
 * mock数据自定义生成规则
 */
import Mock from "mockjs";
import { createIdcard } from "../index";

Mock.Random.extend({
  phone: function () {
    let phonePrefixs = [
      "130",
      "131",
      "132",
      "133",
      "135",
      "137",
      "138",
      "152",
      "155",
      "157",
      "159",
      "170",
      "177",
      "180",
      "182",
      "183",
      "185",
      "187",
      "188",
      "189",
      "191",
    ];
    return this.pick(phonePrefixs) + Mock.mock(/\d{8}/);
  },
  idcard: function () {
    return createIdcard();
  },
  regexp: function (e, n) {
    let key = "regexp";
    if (n) {
      key = key + "|" + n;
    }
    const res = Mock.mock({
      [key]: eval(e),
    });
    return res.regexp;
  },
});
