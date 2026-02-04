<template>
<div class="header-container">
    <div class="header-left flex-box">
        <el-icon size="20" @click="store.commit('collapseMenu')"><Fold /></el-icon>
        <ul class="flex-box">
            <li 
                v-for="(item,index) in selectMenu" 
                :key="item.path"
                :class="{selected :route.path === item.path}"
                class="tab flex-box">
                <el-icon class="icon" size="12"><component :is="item.icon" /></el-icon>
                <router-link class="test flex-box" :to="{path: item.path}">
                    {{item.name}}
                </router-link> 
                <el-icon size="12" class="close" @click="closetTab(item,index)"><Close/></el-icon>
            </li>
        </ul>
    </div>
    <div class="header-right">
        <el-dropdown @command="handleClick">
            <div class="el-dropdown-link flex-box">
                <el-avatar
                    :src="userInfo.avatar"
                />
                <p class="user-name">{{userInfo.name}}</p>
            </div>
            <!-- 登入主頁-->
            <template #dropdown >
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

//拿到store實例
const store= useStore()

//當前路由對象
const route= useRoute()
const router=useRouter()

//拿到菜單數據
const selectMenu=computed(()=>store.state.menu.selectMenu)

//連動用戶訊息(頭像及名稱)
const userInfo = JSON.parse(localStorage.getItem('pz_userInfo'))


//點擊關閉tag
const closetTab=(item,index)=>{
    store.commit('closeMenu',item)
    //刪除的是非當前頁tag
    if(route.path !== item.path){
        return
    }
   const selectMenuData= selectMenu.value
    //刪除的是最後一項
    if(index === selectMenuData.length){
        //如果tag只有一個元素
        if(!selectMenuData.length){
            router.push('/')
        }else{
            router.push({
                path:selectMenuData[index-1].path
            })
        }
    }else{  //如果刪除的世間位置tag
            router.push({
                path:selectMenuData[index].path
            })
    }
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
.flex-box{
    display: flex;
    align-items: center;
    height: 100%;
}
.header-container{
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    background-color: #fff;
    padding-right: 25px;
    .header-left{
         height: 100%;
        .icon{
            width: 45px;
            height: 100%;
        }
        .icon:hover{
            background-color: #f5f5f5;
            cursor: pointer;
        }
        .tab{
            padding: 0px;
            height: 100%;
            .text{
                margin: 0,5px;
            }
            .close{
                visibility: hidden;
            }
            &.selected{
                a{
                    color: #409eff;
                }
                i{
                    color:#409eff;
                }
                background-color: #f5f5f5;
            }
        }
        .tab:hover{
            background: #f5f5f5;
            .close{
                visibility: inherit;
                cursor: pointer;
                color: #333;
            }
        }
    }
    .header-right{
        .user-name{
            margin-left: 10px;
        }
    }
    a{
       height: 100%;
       color: #333;
       font-size: 15px;
    }
}

</style>