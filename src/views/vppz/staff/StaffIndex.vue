<template>
    <PaneHead/>
    <div class="btns">
        <el-button :icon="Plus" type="primary" @click="open()">新增</el-button>
        <el-popconfirm
            confirm-button-text='是'
            cancel-button-text='否'
            :icon="InfoFilled"
            icon-color="#626AEF"
            title="是否確認刪除"
            @confirm="confirmEvent"
         > 
         <template #reference>
             <el-button :icon="Delete" type="danger" >刪除</el-button>  
         </template>
       </el-popconfirm>
    </div>
    <el-table :data="tableData.list" style="width: 100%; margin-top: 16px" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="name" label="名稱" />
        <el-table-column label="頭像" >
            <template #default="scope">
                <el-image
                    style="width: 50px;height: 50px;"
                    :src="scope.row.avatar"
                />
            </template>
        </el-table-column>
        <el-table-column prop="sex" label="性別" >
            <template #default="scope">
                {{scope.row.sex === '1' ? '男' : '女'}}
            </template>
        </el-table-column>
        <el-table-column prop="mobile" label="手機號碼"/>
        <el-table-column prop="active" label="狀態">
            <template #default="scope">
               <el-tag :type="scope.row.active ? 'success' : 'danger' ">{{ scope.row.active ? '正常' : '失效'}}</el-tag>
            </template>
        </el-table-column>
         <el-table-column label="創建時間">
            <template #default="scope">
                <div class="flex-box">
                    <el-icon> <Clock/></el-icon>
                    <span style="margin-left:10px">{{ dayjs(scope.row.create_time).format('YYYY-MM-DD') }}</span>
                </div>
            </template>
        </el-table-column>

        <el-table-column label="操作">
            <template #default="scope">
                <el-button type="primary" @click="open(scope.row)">編輯</el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="paginationData.pageNum"
      :page-size="paginationData.pageSize"
      :background="false"
      layout="total, prev, pager, next"
      :total="tableData.total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange">
    </el-pagination>

  <el-dialog
    v-model="dialogFormVisible"
    :before-close="closeFormDialog"
    title="護理師添加"
    width="500"
  >
    <el-form
      ref="formRef"
      label-width="100px"
      label-position="left"
      :model="form"
      :rules="rules"
    >
        <el-form-item v-show="false" prop="id">
            <el-input v-model="form.id" />
        </el-form-item>
        <el-form-item label="暱稱" prop="name">
            <el-input v-model="form.name" placeholder="請輸入名稱" />
        </el-form-item>
        <el-form-item label="頭像" prop="avatar">
            <el-button v-if="!form.avatar" type="primary" @click="dialogImgVisible=true">點擊上傳</el-button>
            <el-image
                v-else
                :src="form.avatar"
                style="width: 100px;height:100px;"
            />
        </el-form-item>
        <el-form-item label="性別" prop="sex">
            <el-select v-model="form.sex" placeholder="請選擇性別">
                <el-option label="男" value="1"/>
                <el-option label="女" value="2"/>
            </el-select>
        </el-form-item>
        <el-form-item label="年齡" prop="age">
            <el-input-number v-model="form.age" :min="18" :max="50"/>
        </el-form-item>
        <el-form-item label="手機號碼" prop="mobile">
            <el-input v-model="form.mobile" placeholder="請輸入手機號碼"/>
        </el-form-item>
        <el-form-item label="是否生效" prop="active">
            <el-radio-group v-model="form.active">
                <el-radio :value="0">失效</el-radio>
                <el-radio :value="1">生效</el-radio>
            </el-radio-group>
        </el-form-item>
    </el-form>
    <template #footer>
        <div class="dialog-footer">
            <el-button type="primary" @click="confirm()">確認</el-button>
        </div>
    </template>    
  </el-dialog>
   <el-dialog
        v-model="dialogImgVisible"
        :before-close="closeImgDialog"
        title="選擇頭像"
        width="680px"
    >
        <div class="image-list">
            <div 
                v-for="(item,index) in fileList" 
                :key="item.name" class="img-box" 
                @click="selectIndex = index"
            >
                <el-image
                    style="width:148px;height: 148px;"
                    :src="item.url"
                />  
                <div v-if="selectIndex === index" class="select">
                    <el-icon color="#fff"> <Check/> </el-icon>
                </div> 
            </div>  
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogImgVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmImage()">確認</el-button>
            </div>
        </template>    
    </el-dialog>

</template>
<script setup>
import {Plus, Check, Clock, InfoFilled, Delete }from '@element-plus/icons-vue';
import {reactive, ref, onMounted,nextTick }from 'vue';
import dayjs from 'dayjs';
import { PhotoList, companion,companionList,deleteCompanion} from '@/api';
import { ElMessage } from 'element-plus';
import PaneHead from '@/components/paneHead.vue';


onMounted(()=>{
    PhotoList().then(({data})=>{
        fileList.value=data.data
    })
    getListData()
})

//Vue會自動更新畫面（分頁參數：第幾頁,幾筆資料）
    const paginationData = reactive({
      pageNum:1,
      pageSize:10
    })

//列表數據
    const tableData=reactive({
      list:[],
      total:0
    })

//獲取列表數據
const getListData=()=>{
    companionList(paginationData).then(({data})=>{
       const list = data.data?.list || []
       const total = data.data?.total || 0

       tableData.list = list
       tableData.total = total
    })
}

const dialogFormVisible=ref(false)
const closeFormDialog = (done) => {
  dialogFormVisible.value = false
  formRef.value?.resetFields()
  if (typeof done === 'function') done()
}

const dialogImgVisible=ref(false)
const closeImgDialog = (done) => {
  dialogImgVisible.value = false
  if (typeof done === 'function') done()
}

//表單校驗規則
const rules= reactive({
    name:[{required:true,trigger:'blur',message:'請輸入名稱'}],
    avatar:[{required:true,message:'請選擇頭像'}],
    sex:[{required:true,trigger:'change',message:'請選擇性別'}],
    mobile:[{required:true,trigger:'blur',message:'請輸入手機號碼'}],
})

const formRef=ref()
const form = reactive({
    id:'',
    mobile:'',
    active: 1,
    age:18,
    avatar:'',
    name:'',
    sex:''
}) 

//表單校驗與提交
const confirm = async () => {
    if (!formRef.value) return
    formRef.value.validate((valid) => {
        if (valid) {
            companion(form).then(({data}) => {
                if (data.code === 10000) {
                    ElMessage.success('操作成功')
                    closeFormDialog()
                    getListData()
                } else {
                    ElMessage.error(data.message)
                }
            })
        } else {
            console.log('表單驗證失敗')
            return false
        }
    })
}

const open = (rowData={})=> {
    dialogFormVisible.value=true
    nextTick(()=>{
        //如果是編輯
        if(rowData && rowData.id){
            Object.assign(form, rowData)      
        } 
    })
}

//拿到後端傳回來的圖片列表
const fileList=ref([])
//選中當前數據
const selectIndex=ref(0)
//確認選中頭像
const confirmImage=()=>{
    form.avatar = fileList.value[selectIndex.value].url
    //賦值後觸發表單校驗，使錯誤提示消失
    formRef.value?.validateField('avatar')
    dialogImgVisible.value=false
}

//點擊頁碼回調
const handleSizeChange=(val)=>{
        paginationData.pageSize=val
        getListData()
    }
//點擊當前頁
const handleCurrentChange=(val)=>{
        paginationData.pageNum=val
        getListData()
    }

//表格選中數據
const selectTableData=ref([])

//多選框選中數據
const handleSelectionChange=(val)=>{
    selectTableData.value = val.map(item => ({ id: item.id }))
 }   

//點擊刪除事件
const confirmEvent = () =>{
    if(!selectTableData.value.length){
      return  ElMessage.warning('請先選擇要刪除的護理師')
    }
    deleteCompanion({id:selectTableData.value}).then(({data})=>{
        if(data.code === 10000){
            ElMessage.success('刪除成功')
            getListData()
        }else{
            ElMessage.error(data.message)
        }
    }) 
}




</script>
<style lang="less" scoped>

.btns {
    padding: 10px 0 10px 10px;
    background-color: #fff;
    }
.image-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  .img-box {
    position: relative;
    .select {
      position: absolute;
      left: 0px;
      top: 0px;
      width: 24px;
      height: 24px;
      background-color: #67c23a;
      z-index: 999;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .el-image {
    margin-right: 10px;
    margin-bottom: 10px;
  }
}

.flex-box {
    display: flex;
    align-items: center;
}





</style>