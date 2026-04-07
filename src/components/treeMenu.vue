<template>
    <!-- 第一層 SubMenu -->
    <!-- <el-sub-menu index="1">
        <template #title>
        <el-icon><Location /></el-icon>
        <span>Navigator One</span>
        </template>  -->

        <!-- Gro     One -->
        <!-- <el-menu-item-group title="Group One">
        <el-menu-item index="1-1">item one</el-menu-item>
        <el-menu-item index="1-2">item two</el-menu-item>
        </el-menu-item-group> -->

        <!-- Group Two -->
        <!-- <el-menu-item-group title="Group Two">
        <el-menu-item index="1-3">item three</el-menu-item>
        </el-menu-item-group> -->

        <!-- 第二層 SubMenu -->
        <!-- <el-sub-menu index="1-4">
        <template #title>item four</template>
        <el-menu-item index="1-4-1">item one</el-menu-item>
        </el-sub-menu>
    </el-sub-menu> -->

    <!-- Menu Item 2 -->
    <!-- <el-menu-item index="2">
        <el-icon><Menu /></el-icon>
        <span>Navigator Two</span>
    </el-menu-item> -->

    <!-- Menu Item 3 -->
    <!-- <el-menu-item index="3" disabled>
        <el-icon><Document /></el-icon>
        <span>Navigator Three</span>
    </el-menu-item> -->

    <template v-for="(item, idx) in props.menuData" :key="item.name || idx">
    <!-- 沒有子菜單 -->
    <el-menu-item   
        @click="handleClick(item, getIndex(item))"
        v-if="!item.children || item.children.length ==0"   
        :index="getIndex(item)"
        :key="getIndex(item)">

        <el-icon size="20">
             <component :is="item.meta.icon"></component>
        </el-icon>
             <span>{{zhCNtoTW(item.meta.name)}}</span> 
            
    </el-menu-item> 

    <!-- 有子菜單 -->
    <el-sub-menu v-else :index="getIndex(item)">
            <!-- #title是插槽用來識別這是標題,# 是 v-slot: 的簡寫 -->
             <template #title>   
                <el-icon size="20">
                    <component :is="item.meta.icon"></component>
                </el-icon>
                <span>{{zhCNtoTW(item.meta.name)}}</span> 
             </template>     
        <tree-menu :index="getIndex(item)" 
        :menuData="item.children.filter(c=>c.meta && c.meta.name)" />       
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
const props= defineProps(['menuData','index'])

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
    
    //把數據傳遞進去
    store.commit('addMenu',item.meta)

    store.commit('updateMenuActive', active)
    
    // 優先使用路由名稱 (Name) 進行跳轉，這對動態路由最可靠
    if (item.name && router.hasRoute(item.name)) {
        router.push({ name: item.name })
    } else {
        // 退而求其次使用路徑
        router.push(item.meta.path)
    }
}

</script>

<style scoped>

</style>