<template>
  <div>
    <el-row class="login-container" justify="center">
      <el-card style="width: 480px;">
        <template #header>
            <div class="card-header">
                <img src="/login-head.png" alt="">
            </div>
        </template>
          <div class="jump-link">
            <el-link type="primary" @click="handleChange">{{formType? '返回登錄' : '註冊帳號'}}</el-link>
          </div>
          <el-form 
                  ref="loginFormRef"
                  :model="loginForm" 
                   label-width="0" 
                   style="max-width: 600px"
                   class="demo-ruleForm"
                   :rules="rules"
                   >
             <el-form-item prop="userName">
                <el-input v-model="loginForm.userName" placeholder="手機號" prefix-icon="UserFilled" ></el-input>
             
              </el-form-item>
             <el-form-item prop="passWord">
                <el-input v-model="loginForm.passWord" type="password" placeholder="密碼" prefix-icon="Lock"></el-input>
              </el-form-item>
             
              <el-form-item v-if="formType" prop="validCode">
                <el-input v-model="loginForm.validCode" placeholder="驗證碼" prefix-icon="Lock">
                  <template #append>
                    <span @click="countdownChange">{{countdown.validText}}</span>
                  </template>
                </el-input> 
              </el-form-item>

              <el-form-item>
                <el-button type="primary" :style="{width:'100%'}" @click="submitForm(loginFormRef)">
                    {{formType ? '註冊帳號' : '登錄'}}
                </el-button>
              </el-form-item>
          </el-form>
      </el-card>
    </el-row>
  </div>
</template>

<script setup>
import{ref,reactive} from 'vue'
import { ElMessage } from 'element-plus'
import {getCode,userAuthentication,login,menuPermissions } from'../../api'

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
  :deep(.el-card__header){
    padding: 0;
  }
  .login-container{
      display: flex;
      align-items: center;
      height: 100vh;
    .card-header{
      background-color:#f3e8ff;
      img{
          width: 430px;
          
      }
    }
    .jump-link{
      text-align: right;
      margin-bottom: 10px;
    }
  }
</style>
