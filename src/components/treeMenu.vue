<template>
  <template v-for="(item, idx) in props.menuData" :key="item.name || idx">
    <!-- 沒有子菜單 -->
    <el-menu-item
      v-if="!item.children || item.children.length === 0"
      :index="getIndex(item)"
      class="menu-item"
      @click="handleClick(item, getIndex(item))"
    >
      <el-icon size="18" class="menu-icon">
        <component :is="item.meta.icon" />
      </el-icon>

      <span v-if="!props.isCollapse" class="menu-text">
        {{ zhCNtoTW(item.meta.name) }}
      </span>
    </el-menu-item>

    <!-- 有子菜單 -->
    <el-sub-menu
      v-else
      :index="getIndex(item)"
      class="sub-menu"
    >
      <template #title>
        <el-icon size="18" class="menu-icon">
          <component :is="item.meta.icon" />
        </el-icon>

        <span v-if="!props.isCollapse" class="menu-text">
          {{ zhCNtoTW(item.meta.name) }}
        </span>
      </template>

      <tree-menu
        :index="getIndex(item)"
        :menuData="item.children.filter(c => c.meta && c.meta.name)"
        :isCollapse=false
      />
    </el-sub-menu>
  </template>
</template>

<script>
export default {
  name: 'treeMenu'
}
</script>

<script setup>
import { useRouter } from 'vue-router';
import { useStore} from 'vuex';
import { zhCNtoTW } from '@/utils/zhCNtoTW'

// defineProps()是Vue 3的方式，用來讓子元件接收父元件傳進來的資料。
const props= defineProps(['menuData','index','isCollapse'])

// 生成唯一且為字串的索引，避免 Element Plus 事件校驗失敗
const getIndex = (item) => {
    const id = item.meta?.id || item.name || item.path
    return `${props.index}-${id}`
}

//創建router實例
const router= useRouter()
const store = useStore()
//點擊菜單
const handleClick=(item,active)=>{
    console.log('👆 點擊選單:', item.meta.name, '路由名稱:', item.name, '路徑:', item.meta.path)
    
    // 把頁面資訊存到 tab / menu 狀態中
    store.commit('addMenu',item.meta)

    store.commit('updateMenuActive', active)
    
    // 優先使用路由名稱 (Name) 進行跳轉，這對動態路由最可靠
    if (item.name && router.hasRoute(item.name)) {
        router.push({ name: item.name })
    } else if (item.meta?.path){
        // 退而求其次使用路徑
        router.push(item.meta.path)
    }
}

</script>
<style scoped>
.menu-item,
.sub-menu :deep(.el-sub-menu__title) {
  border-radius: 12px;
}

.menu-icon {
  margin-right: 10px;
  flex-shrink: 0;
}

.menu-text {
  font-size: 14px;
  font-weight: 500;
}
</style>