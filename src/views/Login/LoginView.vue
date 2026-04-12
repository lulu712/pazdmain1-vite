<template>
  <div class="login-page">
    <div class="login-layout">
      <div class="login-banner">
        <div class="banner-content">
          <div class="brand-block">
            <div class="logo-box">
              <img :src="logo" alt="logo" class="banner-logo" />
            </div>
              <div class="brand-text">
                <div class="system-subtitle">Admin Dashboard</div>
            </div>
          </div>
            <h1 class="system-title">陪診服務後台管理系統</h1>
            <p class="system-desc">
            提供訂單管理、服務資訊管理與權限控管，協助平台維持穩定營運。
            </p>
        </div>
      </div>
      <div class="login-panel">
        <el-card class="login-card" shadow="never">
          <div class="card-title">
            <h2>{{ formType ? '註冊帳號' : '歡迎登入' }}</h2>
            <p>{{ formType ? '建立新的管理帳號' : '請輸入帳號密碼登入系統' }}</p>
          </div>

          <div class="jump-link">
            <el-link type="primary" @click="handleChange">
              {{ formType ? '返回登入' : '註冊帳號' }}
            </el-link>
          </div>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            label-width="0"
            class="demo-ruleForm"
            :rules="rules"
          >
            <el-form-item prop="userName">
              <el-input
                v-model="loginForm.userName"
                placeholder="請輸入手機號"
                size="large"
              />
            </el-form-item>

            <el-form-item prop="passWord">
              <el-input
                v-model="loginForm.passWord"
                type="password"
                placeholder="請輸入密碼"
                show-password
                size="large"
              />
            </el-form-item>

            <el-form-item v-if="formType" prop="validCode">
              <el-input
                v-model="loginForm.validCode"
                placeholder="請輸入驗證碼"
                size="large"
              >
                <template #append>
                  <span class="code-text" @click="countdownChange">
                    {{ countdown.validText }}
                  </span>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                class="submit-btn"
                @click="submitForm(loginFormRef)"
              >
                {{ formType ? '註冊帳號' : '登入系統' }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import{ref,reactive} from 'vue'
import { ElMessage } from 'element-plus'
import {getCode,userAuthentication,login,menuPermissions } from'../../api'
import logo from '@/assets/pz_logo.png'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

//表單數據
const loginForm=reactive({
  userName:'13797053405',
  passWord:'123456',
  validCode:''
})

//帳號校驗規則
const validateUser=(rule,value,callback)=>{
  //不能為空
  if(value===''){
    callback(new Error('請輸入帳號'))
  }else{
     const phoneReg=/^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
     phoneReg.test(value) ? callback() : callback(new Error('手機號碼格式錯誤，請再檢查一次'))
  }
}
//密碼校驗
const validatePass=(rule,value,callback)=>{
  //不能為空
  if(value===''){
    callback(new Error('請輸入密碼'))
  }else{
    const reg=/^[a-zA-Z0-9_-]{4,16}$/
    reg.test(value) ? callback() : callback(new Error('密碼格式錯誤,需要4-16位字符,請確認格式'))
  }
}

//表單校驗
const rules=reactive({
  userName:[{validator: validateUser,trigger:'blur'}],
  passWord:[{validator: validatePass,trigger:'blur'}],
})

//切換表單(0登錄 1註冊)
const formType= ref(0)

//點擊切換登錄和註冊
const handleChange=()=>{
  formType.value=formType.value ? 0:1
}

//發送短信
const countdown= reactive({
  validText:'獲取驗證碼',
  time:60
})

//設定不能重複點擊發送
let flag=false

const countdownChange=()=>{
  //如已發送不處理
  if(flag)return
  //判斷手機號是否正確
  const phoneReg=/^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
  if(!loginForm.userName || !phoneReg.test(loginForm.userName)){
    return ElMessage({
      message: '請檢查手機號碼是否正確',
      type: 'warning',
  })
  }
  //倒數計時定時器
  const time= setInterval(()=>{
    if(countdown.time <=0){
      countdown.time=60
      countdown.validText=`獲取驗證碼`
      flag=false
      clearInterval(time)
    }else{
     countdown.time -=1
     countdown.validText=`剩餘${countdown.time}s` 
    } 
  },1000)
  flag=true
  //調用驗證碼
  getCode({tel:loginForm.userName}).then(({data})=>{
    console.log(data,'data')
    if(data.code === 1000){
      ElMessage.success('發送成功')
    }
  })
}

const router=useRouter()
const store= useStore()



//表單校驗
const loginFormRef=ref()

//表單提交
const submitForm = async (formEl) => {
  if (!formEl) return;

  await formEl.validate((valid, fields) => {
    if (valid) {

      // 註冊頁面
      if (formType.value) {
        userAuthentication(loginForm).then(({ data }) => {
          if (data.code === 10000) {
            ElMessage.success('註冊成功,請登錄');
            formType.value = 0;
          }
        });
      } 
      // 登錄頁面
      else {
        login(loginForm).then(({ data }) => {
          if (data.code === 10000) {
            ElMessage.success('登錄成功!');
            console.log(data)
            //將token和用戶信息緩存到瀏覽器
            localStorage.setItem('pz_token',data.data.token)
            localStorage.setItem('pz_userInfo',JSON.stringify(data.data.userInfo))
            menuPermissions().then((data)=>{
              store.commit('dynamicMenu', { ...data, router })
              router.push('/')
            })
           
          }
        });
      }
    } else {
      console.log('error submit!', fields);
    }
  });
};




</script>

<style lang="less" scoped>
.login-page {
  min-height: 100vh;
  background: #eef3f8;
}

.login-layout {
  min-height: 100vh;
  display: flex;
}

.login-banner {
  width: 42%;
  min-width: 420px;
  background: linear-gradient(160deg, #1d4f91 0%, #163d70 100%);
  display: flex;
  align-items: center;
  padding: 48px;
  color: #fff;
  justify-content: flex-start;
  padding-left: 80px;

}

.banner-content {
  max-width: 420px;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}

.logo-box {
  width: 96px;
  height: 96px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  transform: translateY(-4px);

}

.banner-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.system-subtitle {
  font-size: 24px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.78);
  letter-spacing: 0.5px;
}

.system-title {
  font-size: 40px;
  line-height: 1.2;
  font-weight: 800;
  margin: 0 0 20px;
  color: #ffffff;
}

.system-desc {
  font-size: 16px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.82);
  margin: 0;
  max-width: 480px;
}

.login-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.login-card {
  width: 100%;
  max-width: 460px;
  border: none;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(31, 45, 61, 0.08);
}

:deep(.el-card__body) {
  padding: 32px;
}

.card-title {
  margin-bottom: 20px;
}

.card-title h2 {
  margin: 0 0 8px;
  font-size: 30px;
  color: #1f2d3d;
}

.card-title p {
  margin: 0;
  font-size: 14px;
  color: #7a8899;
}

.jump-link {
  text-align: right;
  margin-bottom: 18px;
}

:deep(.el-input__wrapper) {
  min-height: 46px;
  border-radius: 12px;
  box-shadow: none;
  background: #f8fafc;
}

:deep(.el-input-group__append) {
  cursor: pointer;
}

.code-text {
  color: #2f6bff;
  font-weight: 600;
}

.submit-btn {
  width: 100%;
  height: 46px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(90deg, #4f8cff 0%, #2f6bff 100%);
  border: none;
}

@media (max-width: 900px) {
  .login-layout {
    flex-direction: column;
  }

  .login-banner {
    width: 100%;
    min-width: auto;
    padding: 36px 24px;
    position: relative;
    overflow: hidden;
  }


  .login-banner::after {
    content: '';
    position: absolute;
    right: -100px;
    top: -100px;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255,255,255,0.1), transparent);
  }

  .login-panel {
    padding: 24px 16px 40px;
  }
}
</style>