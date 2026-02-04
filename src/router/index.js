import { createRouter, createWebHashHistory } from 'vue-router'

import Layout from '../views/MainPage.vue'
import Login from '../views/Login/LoginView.vue'
import store from '../store'
import { menuPermissions } from '../api'

const routes = [
    {
        path: '/',
        component: Layout,
        name: 'main',
        // 有本地存儲的話，導向儲存的第一個菜單路由
        redirect: () => {
            const data = JSON.parse(localStorage.getItem('pz_v3pz') || '{}')
            const first = data.menu?.menuData?.[0]
            // 如果有選單數據，優先導向第一個子選單，否則導向該選單路徑。若無數據則導向登錄。
            return first ? (first.children?.[0]?.meta?.path || first.meta?.path || '/') : '/Login'
        },
        children: []
    },
    {
        path: '/Login',
        component: Login
    },
    // 解決重新整理後，動態路由尚未加載完成導致的 No match found 警告
    {
        path: '/:pathMatch(.*)*',
        component: Layout
    }
]



const router = createRouter({
    //路由數據
    routes,
    //路由匹配模式
    history: createWebHashHistory()
})
// 用於追蹤本會話（Session）是否已加載動態路由，防止刷新後丟失路由
let isRoutesLoaded = false

router.beforeEach(async (to) => {
    const token = localStorage.getItem('pz_token')

    // 沒登入，且不是去 login → 導回 login
    if (!token && to.path !== '/Login') return '/Login'

    // 已登入，但想去 login → 導回首頁
    if (token && to.path === '/Login') return '/dashboard'

    // 如果已登入且尚未在當前頁面生命週期加載路由
    if (token && !isRoutesLoaded) {

        try {
            // 情況 A：Store 裡已有數據（來自持久化插件），只需重新註冊到 router
            if (store.state.menu.menuData.length > 0) {

                store.commit('dynamicMenu', { data: { data: store.state.menu.menuData }, router })
            }
            // 情況 B：Store 是空的（初次登入或持久化失效），需要調用 API
            else {

                const data = await menuPermissions()
                store.commit('dynamicMenu', { ...data, router })
            }

            isRoutesLoaded = true


            // 防止 No match found，強制重新解析路徑
            return to.fullPath
        } catch (e) {
            console.error('❌ 動態路由恢復失敗', e)
            localStorage.removeItem('pz_token')
            return '/Login'
        }
    }
})


export default router