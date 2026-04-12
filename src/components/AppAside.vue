<template>
  <el-menu
    :style="{ width: !isCollapse ? '244px' : '84px' }"
    class="aside-container"
    @open="handleOpen"
    @close="handleClose"
    :collapse="isCollapse"
    :default-active="active"
    background-color="transparent"
    text-color="#dbe7ff"
    active-text-color="#ffffff"
  >
    <div class="brand-wrap" :class="{ collapse: isCollapse }">
      <div class="brand-logo">
        <img :src=logo alt="logo" class="logo-img" />
      </div>

      <div v-if="!isCollapse" class="brand-text">
        <p class="brand-en">Admin Dashboard</p>
        <h1 class="brand-title">Lulu陪診</h1>
      </div>

    </div>

    <div class="menu-scroll">
      <tree-menu 
          index="1" 
          :menuData="menuData" 
          :isCollapse="isCollapse"
          />
    </div>
  </el-menu>
</template>

<script setup>

import treeMenu from './treeMenu.vue';
import { computed } from 'vue';
import { useStore } from 'vuex';
import logo from '@/assets/pz_logo.png'

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
.aside-container {
  height: 100%;
  border-right: none;
  background: linear-gradient(180deg, #183b6b 0%, #122f57 55%, #0f2748 100%);
  box-shadow: 8px 0 30px rgba(16, 39, 72, 0.12);
  transition: width 0.25s ease;
  overflow: hidden;
}

.brand-wrap {
  height: 86px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 18px 14px;
  position: relative;
}

.brand-wrap::after {
  content: '';
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
}

.brand-wrap.collapse {
  justify-content: center;
  padding: 16px 0 14px;
}

.brand-logo {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  backdrop-filter: blur(8px);
}

.logo-img {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.brand-text {
  min-width: 0;
}

.brand-en {
  margin: 0 0 2px;
  font-size: 12px;
  line-height: 1;
  color: rgba(219, 231, 255, 0.72);
  letter-spacing: 0.4px;
}

.brand-title {
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
  color: #ffffff;
  font-weight: 800;
}


.menu-scroll {
  padding: 14px 10px 18px;
  height: calc(100% - 86px);
  overflow-y: auto;
}

.menu-scroll::-webkit-scrollbar {
  width: 6px;
}

.menu-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 46px;
  line-height: 46px;
  border-radius: 12px;
  margin-bottom: 8px;
  color: #dbe7ff !important;
  transition: all 0.2s ease;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, rgba(95, 151, 255, 0.95) 0%, rgba(53, 110, 255, 0.95) 100%) !important;
  color: #ffffff !important;
  box-shadow: 0 10px 20px rgba(53, 110, 255, 0.22);
}

:deep(.el-sub-menu .el-menu-item) {
  min-width: auto;
  background: transparent !important;
  padding-left: 44px !important;
}

:deep(.el-sub-menu .el-menu-item.is-active) {
  background: rgba(95, 151, 255, 0.18) !important;
  box-shadow: none;
}

:deep(.el-menu--collapse .el-menu-item),
:deep(.el-menu--collapse .el-sub-menu__title) {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 !important;
}

:deep(.el-menu--collapse .el-sub-menu__icon-arrow) {
  display: none;
}


:deep(.el-sub-menu__title .menu-text),
:deep(.el-menu-item .menu-text) {
  color: inherit;
}

:deep(.el-menu-item .menu-icon),
:deep(.el-sub-menu__title .menu-icon) {
  color: inherit;
}

:deep(.el-menu-item.is-active .menu-text),
:deep(.el-menu-item.is-active .menu-icon) {
  color: #fff;
}
/* 收合時整個 menu item 置中 */
:deep(.el-menu--collapse .el-menu-item),
:deep(.el-menu--collapse .el-sub-menu__title) {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 !important;
}

/* icon 完全置中 */
:deep(.el-menu--collapse .menu-icon) {
  margin: 0 !important;
}

/* 子選單箭頭拿掉 */
:deep(.el-menu--collapse .el-sub-menu__icon-arrow) {
  display: none;
}

</style>