
import { markRaw } from 'vue'

//定義、存儲狀態(菜單展開收起)
const state = {
  isCollapse: false,
  selectMenu: [],
  menuData: [],
  menuActive: '1-1'
}

//修改狀態
const mutations = {
  collapseMenu(state) {
    //把 isCollapse 的布林值取反（true ↔ false）
    state.isCollapse = !state.isCollapse
  },
  addMenu(state, payload) {
    //須對數據進行去重複,加入新的選單項目,沒點過回傳-1然後添加
    //
    if (state.selectMenu.findIndex(item => item.path === payload.path) === -1) {
      state.selectMenu.push(payload)
    }
  },
  closeMenu(state, payload) {
    //1.找到點擊數據的索引
    const index = state.selectMenu.findIndex(val => val.name === payload.name)
    //2.通過索引刪除數組指定元素
    state.selectMenu.splice(index, 1)
  },

  // 設置動態菜單並註冊路由
  dynamicMenu(state, payload) {
    // 兼容處理：payload 可能是 API 回傳對象，也可能是包含 data 的對象
    const menuList = payload.data?.data || payload.data || []
    state.menuData = menuList

    // 後端 component → 實際檔案映射
    const componentMap = {
      'auth/admin': 'auth/admin/AdminIndex',
      'auth/group': 'auth/group/GroupIndex',
      'vppz/staff': 'vppz/staff/StaffIndex',
      'vppz/order': 'vppz/order/OrderIndex',
      'login': 'Login/LoginView',
      'mainPage': 'MainPage',
      'dashboard': 'dashboard/DashboardIndex'
    }

    // Vite 寫法：使用 import.meta.glob 獲取所有視圖組件
    const modules = import.meta.glob('../views/**/*.vue', { eager: true })
    const available = Object.keys(modules)

    // 遞歸處理路由註冊（扁平化註冊到 main 下）
    const bindRoutes = (list) => {
      list.forEach(item => {
        // 如果有 component，代表是實際頁面，需要註冊路由
        if (item.component) {
          const compKey = componentMap[item.component.replace(/^\//, '')]
          if (!compKey) {
            console.warn(`⚠️ 未能識別的組件名稱: ${item.component}，請檢查 componentMap。`)
            return
          }

          // Vite 的 glob 得到的路徑會是 "../views/xxx.vue"
          const componentPath = `../views/${compKey}.vue`

          if (available.includes(componentPath)) {
            // 標準化路徑：確保以 / 開頭，並作為絕對路徑註冊
            const targetPath = '/' + (item.meta?.path || item.path || '').replace(/^\//, '')

            const componentModule = modules[componentPath]
            const routeComponent = componentModule.default || componentModule

            // 直接註冊（不再註冊為 main 的子路由，這樣路徑匹配最穩健）
            if (payload.router) {
              const layoutModule = modules['../views/MainPage.vue']
              const layoutComponent = layoutModule.default || layoutModule

              // 註冊頂層路由
              payload.router.addRoute({
                path: targetPath,
                name: `${item.name}-parent`, // 給個唯一的名稱
                component: markRaw(layoutComponent),
                children: [
                  {
                    path: '',
                    name: item.name,
                    meta: item.meta || {},
                    component: markRaw(routeComponent)
                  }
                ]
              })
            }
          } else {
            console.error(`❌ 找不到組件檔案: ${componentPath} (原始映射: ${item.component})。請確認檔案是否存在。`)
          }
        }

        // 遞歸處理子菜單
        if (item.children && item.children.length) {
          bindRoutes(item.children)
        }
      })
    }

    bindRoutes(menuList)
  },
  updateMenuActive(state, payload) {
    state.menuActive = payload
  }
}

export default {
  state,
  mutations,
}
