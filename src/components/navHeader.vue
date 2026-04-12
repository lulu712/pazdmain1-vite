<template>
  <div class="header-container">
    <div class="header-left">
      <div class="collapse-btn" @click="store.commit('collapseMenu')">
        <el-icon size="20"><Fold /></el-icon>
      </div>

      <ul class="tabs-wrap">
        <li
          v-for="(item, index) in selectMenu"
          :key="item.path"
          :class="{ selected: route.path === item.path }"
          class="tab-item"
        >
          <router-link class="tab-link" :to="{ path: item.path }">
            <el-icon class="tab-icon" size="14">
              <component :is="item.icon" />
            </el-icon>
            <span class="tab-text">{{ zhCNtoTW(item.name) }}</span>
          </router-link>

          <el-icon size="12" class="close-icon" @click="closetTab(item, index)">
            <Close />
          </el-icon>
        </li>
      </ul>
    </div>

    <div class="header-right">
      <el-dropdown @command="handleClick">
        <div class="user-entry">
          <el-avatar :src="userInfo.avatar" class="user-avatar" />
          <div class="user-meta">
            <p class="user-role">Administrator</p>
            <p class="user-name">{{ userInfo.name }}</p>
          </div>
        </div>

        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="cancel">登出</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>


<script setup>

import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus'
import { zhCNtoTW } from '@/utils/zhCNtoTW'


//拿到store實例
const store= useStore()

//當前路由對象
const route= useRoute()
const router=useRouter()

//拿到菜單數據
const selectMenu=computed(()=>store.state.menu.selectMenu)

//連動用戶訊息(頭像及名稱)避免 localStorage 沒資料時報錯
const userInfo = JSON.parse(localStorage.getItem('pz_userInfo') || '{}')


// 點擊關閉 tab
const closetTab = (item, index) => {
  // 1. 從 Vuex 中移除該 tab
  store.commit('closeMenu', item)

  // 2. 如果刪除的不是「當前頁面」，就不用做任何跳轉
  if (route.path !== item.path) return

  // 3. 取得「刪除後」最新的 tab 列表
  const tabs = selectMenu.value

  // 4. 如果刪除後已經沒有任何 tab
  // → 導回首頁
  if (tabs.length === 0) {
    router.push('/')
    return
  }

  // 5. 決定下一個要跳轉的頁面
  // 優先使用「右邊的 tab」
  // 如果沒有右邊（代表刪掉最後一個），就退回左邊的 tab
  const nextTab = tabs[index] || tabs[index - 1]

  // 6. 跳轉到計算好的目標頁面
  router.push({
    path: nextTab.path
  })
}


const handleClick= (command) => {
    if(command==="cancel"){
         // 1. 刪除登入資訊
        localStorage.removeItem('pz_token')
        localStorage.removeItem('pz_userInfo')

        // 2. 提示訊息
        ElMessage.success('已登出')

        // 3. 導回登入頁
        router.replace('/Login')

    }
  
}


</script>

<style lang="less" scoped>
.header-container {
  height: 72px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 22px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(222, 231, 243, 0.9);
  box-sizing: border-box;
}

.header-left {
  min-width: 0;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  overflow: hidden;
}

.collapse-btn {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #35507a;
  background: #f4f8ff;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.collapse-btn:hover {
  background: #e9f1ff;
  color: #2f6bff;
}

.tabs-wrap {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  padding: 0;
  margin: 0;
  list-style: none;
  flex: 1;
}

.tabs-wrap::-webkit-scrollbar {
  height: 6px;
}

.tabs-wrap::-webkit-scrollbar-thumb {
  background: rgba(140, 156, 181, 0.25);
  border-radius: 999px;
}

.tab-item {
  height: 42px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px 0 14px;
  border-radius: 14px;
  background: #f7faff;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.tab-item:hover {
  background: #eef4ff;
  border-color: #d7e4ff;
}

.tab-item.selected {
  background: linear-gradient(90deg, rgba(95, 151, 255, 0.14) 0%, rgba(53, 110, 255, 0.14) 100%);
  border-color: #bfd4ff;
  box-shadow: 0 8px 18px rgba(53, 110, 255, 0.08);
}

.tab-link {
  height: 100%;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #3b4a62;
  text-decoration: none;
}

.tab-item.selected .tab-link {
  color: #2f6bff;
}

.tab-icon {
  flex-shrink: 0;
}

.tab-text {
  font-size: 14px;
  font-weight: 600;
}

.close-icon {
  color: #8e9bb0;
  visibility: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-item:hover .close-icon,
.tab-item.selected .close-icon {
  visibility: visible;
}

.close-icon:hover {
  color: #ff5b6b;
}

.header-right {
  height: 100%;
  display: flex;
  align-items: center;
  margin-left: 18px;
  flex-shrink: 0;
}

.user-entry {
  min-width: 170px;
  height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px 0 10px;
  border-radius: 16px;
  background: #f7faff;
  border: 1px solid #e2ebfb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-entry:hover {
  background: #eef4ff;
  border-color: #cddcff;
}

.user-avatar {
  flex-shrink: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.user-role {
  margin: 0 0 2px;
  font-size: 12px;
  color: #8d98ab;
  line-height: 1;
}

.user-name {
  margin: 0;
  font-size: 14px;
  color: #223047;
  font-weight: 700;
  line-height: 1.2;
}

:deep(.el-dropdown) {
  outline: none;
}
</style>