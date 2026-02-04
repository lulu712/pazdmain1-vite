import { createStore } from "vuex";
import menu from "./menu";
import createPersistedstate from "vuex-persistedstate";

//vuex實例是不具持久化的,故需手動添加持久化插件
export default createStore({
  plugins: [createPersistedstate({
    key: 'pz_v3pz'
  })],
  modules: {
    menu
  }
})