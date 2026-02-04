import request from '../utils/request'

//發送驗證碼
export const getCode = (data) => {
     return request.post('/get/code', data)
}


//註冊用戶
export const userAuthentication = (data) => {
     return request.post('/user/authentication', data)
}

//登錄頁面
export const login = (data) => {
     return request.post('/login', data)
}


//權限管理列表
export const authAdmin = (params) => {
     return request.get('/auth/admin', { params })
}

//菜單權限數據(顯示樹形結構,GET)
export const userGetMenu = () => {
     return request.get('/user/getmenu')
}

//菜單權限修改(POST)
export const userSetMenu = (data) => {
     return request.post('/user/setmenu', data)

}
//菜單權限列表(顯示列表,GET(需傳參數))
export const menuList = (params) => {
     return request.get('/menu/list', { params })
}

//權限下拉列表
export const menuSelectList = () => {
     return request.get('/menu/selectlist')
}

//用戶信息修改(POST)
export const updateUser = (data) => {
     return request.post('/update/user', data)
}
//用戶菜單權限(GET)
export const menuPermissions = () => {
     return request.get('/menu/permissions')
}

//陪護師頭像列表(GET)
export const PhotoList = () => {
     return request.get('/photo/list')
}

//陪護師創建(POST)
export const companion = (data) => {
     return request.post('/companion', data)
}

//陪護列表(GET)
export const companionList = (params) => {
     return request.get('/companion/list', { params })
}

//陪護師刪除(POST)
export const deleteCompanion = (data) => {
     return request.post('/delete/companion', data)
}

