<template>
  <el-menu
  :style="{width:!isCollapse? '230px':'64px'}"
    class="aside-container"
    @open="handleOpen"
    @close="handleClose"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b"
    :collapse="isCollapse"
    :default-active="active"
  >
    <p class="logo-lg">{{isCollapse?'LULU': 'Lulu陪診'}}</p>
    <tree-menu index="1" :menuData="menuData"/>
  </el-menu>
</template>


<script setup>

import treeMenu from './treeMenu.vue';
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore()
const isCollapse = computed(() => store.state.menu.isCollapse)


//點選時保持高亮效果
const active=computed(()=>store.state.menu.menuActive)

// 使用 store 中的動態菜單數據
const menuData = computed(() => {
  const dynamicMenu = store.state.menu.menuData
  // 如果有動態數據則使用，否則(例如未登入)可能為空
  return dynamicMenu && dynamicMenu.length > 0 ? dynamicMenu : []
})
const handleOpen = () => {}
const handleClose = () => {}

</script>

<style lang="less" scoped>

.aside-container{
  height: 100%;
  .logo-lg{
    font-size: 20px;
    height: 50px;
    line-height: 50px;
    color: #fff;
    text-align: center;
  }

}

</style>
