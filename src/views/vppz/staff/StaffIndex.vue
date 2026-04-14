<template>
  <div class="companion-page">
    <div class="companion-shell">
      <div class="page-hero">
        <div>
          <div class="page-tag">Companion Management</div>
          <h1 class="page-title">陪診人員管理</h1>
          <p class="page-desc">管理陪診人員資料、狀態與頭像資訊，方便後台統一維護人員配置。</p>
        </div>
      </div>

      <div class="content-card">
        <div class="toolbar">
          <el-button :icon="Plus" class="add-btn" @click="open()">新增</el-button>

          <el-popconfirm
            confirm-button-text="是"
            cancel-button-text="否"
            :icon="InfoFilled"
            icon-color="#626AEF"
            title="是否確認刪除"
            @confirm="confirmEvent"
          >
            <template #reference>
              <el-button :icon="Delete" class="delete-btn">刪除</el-button>
            </template>
          </el-popconfirm>
        </div>

        <el-table
          :data="tableData.list"
          class="custom-table"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="90" />
          <el-table-column prop="name" label="名稱" min-width="140" />

          <el-table-column label="頭像" width="120">
            <template #default="scope">
              <el-avatar :size="48" :src="scope.row.avatar" />
            </template>
          </el-table-column>

          <el-table-column prop="sex" label="性別" width="100">
            <template #default="scope">
              {{ scope.row.sex === '1' ? '男' : '女' }}
            </template>
          </el-table-column>

          <el-table-column prop="mobile" label="手機號碼" min-width="160" />

          <el-table-column prop="active" label="狀態" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.active ? 'success' : 'danger'">
                {{ scope.row.active ? '正常' : '失效' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="建立時間" min-width="160">
            <template #default="scope">
              <div class="flex-box">
                <el-icon><Clock /></el-icon>
                <span style="margin-left: 10px">
                  {{ dayjs(scope.row.create_time).format('YYYY-MM-DD') }}
                </span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button class="edit-btn" @click="open(scope.row)">編輯</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrap">
          <el-pagination
            v-model:current-page="paginationData.pageNum"
            :page-size="paginationData.pageSize"
            :background="false"
            layout="total, prev, pager, next"
            :total="tableData.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <el-dialog
      v-model="dialogFormVisible"
      :before-close="closeFormDialog"
      :title="form.id ? '編輯陪診人員' : '新增陪診人員'"
      width="560"
      class="custom-dialog"
    >
      <el-form
        ref="formRef"
        label-width="100px"
        label-position="left"
        :model="form"
        :rules="rules"
        class="dialog-form"
      >
        <el-form-item v-show="false" prop="id">
          <el-input v-model="form.id" />
        </el-form-item>

        <el-form-item label="暱稱" prop="name">
          <el-input v-model="form.name" placeholder="請輸入名稱" />
        </el-form-item>

        <el-form-item label="頭像" prop="avatar">
          <div class="avatar-upload-wrap">
            <el-button
              v-if="!form.avatar"
              class="upload-btn"
              type="primary"
              @click="dialogImgVisible = true"
            >
              點擊選擇頭像
            </el-button>

            <el-image
              v-else
              :src="form.avatar"
              class="selected-avatar"
            />
          </div>
        </el-form-item>

        <el-form-item label="性別" prop="sex">
          <el-select v-model="form.sex" placeholder="請選擇性別" style="width: 100%">
            <el-option label="男" value="1" />
            <el-option label="女" value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="年齡" prop="age">
          <el-input-number v-model="form.age" :min="18" :max="50" />
        </el-form-item>

        <el-form-item label="手機號碼" prop="mobile">
          <el-input v-model="form.mobile" placeholder="請輸入手機號碼" />
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
          <el-button class="cancel-btn" @click="closeFormDialog">取消</el-button>
          <el-button type="primary" class="confirm-btn" @click="confirm()">確認</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="dialogImgVisible"
      :before-close="closeImgDialog"
      title="選擇頭像"
      width="760px"
      class="custom-dialog"
    >
      <div class="image-list">
        <div
          v-for="(item, index) in fileList"
          :key="item.name"
          class="img-box"
          :class="{ active: selectIndex === index }"
          @click="selectIndex = index"
        >
          <el-image :src="item.url" class="avatar-option" />
          <div v-if="selectIndex === index" class="select">
            <el-icon color="#fff"><Check /></el-icon>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="dialogImgVisible = false">取消</el-button>
          <el-button type="primary" class="confirm-btn" @click="confirmImage()">確認</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>


<script setup>
import {Plus, Check, Clock, InfoFilled, Delete }from '@element-plus/icons-vue';
import {reactive, ref, onMounted,nextTick }from 'vue';
import dayjs from 'dayjs';
import { PhotoList, companion,companionList,deleteCompanion} from '@/api';
import { ElMessage } from 'element-plus';


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
.companion-page {
  min-height: 100%;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(70, 120, 255, 0.08), transparent 24%),
    linear-gradient(180deg, #eef3f8 0%, #f4f7fb 100%);
  box-sizing: border-box;
}

.companion-shell {
  max-width: 1400px;
  margin: 0 auto;
}

.page-hero {
  margin-bottom: 20px;
  padding: 24px 28px;
  border-radius: 24px;
  background: linear-gradient(135deg, #1c4f92 0%, #163e74 100%);
  box-shadow: 0 18px 40px rgba(22, 62, 116, 0.16);
}

.page-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  margin-bottom: 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.92);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.4px;
}

.page-title {
  margin: 0 0 10px;
  font-size: 34px;
  line-height: 1.2;
  color: #fff;
  font-weight: 800;
}

.page-desc {
  margin: 0;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
}

.content-card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 22px;
  padding: 22px;
  box-shadow: 0 18px 48px rgba(31, 45, 61, 0.08);
  backdrop-filter: blur(6px);
}

.toolbar {
  display: flex;
  gap: 10px;
  margin: 10px 0 16px;
}

.add-btn {
  border: none;
  border-radius: 12px;
  padding: 10px 18px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(90deg, #5f97ff 0%, #356eff 100%);
  box-shadow: 0 10px 24px rgba(53, 110, 255, 0.2);
}

.delete-btn {
  border: none;
  border-radius: 12px;
  padding: 10px 18px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(90deg, #ff7b7b 0%, #f04438 100%);
}

.custom-table {
  border-radius: 16px;
  overflow: hidden;
  --el-table-border-color: #eef2f7;
  --el-table-header-bg-color: #f8fbff;
  --el-table-row-hover-bg-color: #f5f9ff;
}

:deep(.custom-table th.el-table__cell) {
  color: #243247;
  font-weight: 700;
  font-size: 14px;
  padding: 14px 0;
}

:deep(.custom-table td.el-table__cell) {
  padding: 16px 0;
  color: #425066;
}

:deep(.custom-table .el-table__inner-wrapper::before) {
  display: none;
}

.flex-box {
  display: flex;
  align-items: center;
}

.edit-btn {
  border-radius: 10px;
  border: 1px solid #d6e4ff;
  color: #2f6bff;
  background: #eef4ff;
  font-weight: 700;
}

.edit-btn:hover {
  color: #fff;
  border-color: #2f6bff;
  background: #2f6bff;
}

.pagination-wrap {
  margin-top: 22px;
  display: flex;
  justify-content: center;
}

:deep(.el-pagination) {
  padding: 8px 14px;
  border-radius: 14px;
  background: #f8fbff;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next),
:deep(.el-pagination .el-pager li) {
  border-radius: 10px;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(90deg, #5f97ff 0%, #356eff 100%);
  color: #fff;
}

:deep(.custom-dialog .el-dialog) {
  border-radius: 20px;
  overflow: hidden;
}

:deep(.custom-dialog .el-dialog__header) {
  margin-right: 0;
  padding: 22px 24px 12px;
  border-bottom: 1px solid #eef2f6;
}

:deep(.custom-dialog .el-dialog__title) {
  color: #223047;
  font-size: 20px;
  font-weight: 800;
}

:deep(.custom-dialog .el-dialog__body) {
  padding: 24px;
}

:deep(.dialog-form .el-input__wrapper),
:deep(.dialog-form .el-select__wrapper),
:deep(.dialog-form .el-input-number),
:deep(.dialog-form .el-radio-group) {
  border-radius: 12px;
}

.avatar-upload-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.upload-btn {
  border-radius: 999px;
  padding: 10px 18px;
  font-weight: 700;
  background: linear-gradient(90deg, #5f97ff, #356eff);
  border: none;
  box-shadow: 0 6px 18px rgba(53, 110, 255, 0.25);
}

.selected-avatar {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e5edf8;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.img-box {
  position: relative;
  padding: 6px;
  border-radius: 16px;
  border: 1px solid transparent;
  background: #f8fbff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.img-box:hover {
  border-color: #bfd4ff;
  background: #eef4ff;
}

.img-box.active {
  border-color: #5f97ff;
  box-shadow: 0 0 0 3px rgba(95, 151, 255, 0.12);
}

.avatar-option {
  width: 148px;
  height: 148px;
  border-radius: 14px;
  overflow: hidden;
}

.select {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background-color: #67c23a;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
}

.cancel-btn {
  border-radius: 12px;
  padding: 10px 18px;
}

.confirm-btn {
  border: none;
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 700;
  background: linear-gradient(90deg, #5f97ff 0%, #356eff 100%);
}

//下拉選單
:deep(.dialog-form .el-input-number .el-input__wrapper) {
  min-height: 42px;
  border-radius: 12px;
  box-shadow: none;
  background: #f8fafc;
  border: 1px solid transparent;
}

:deep(.dialog-form .el-input__wrapper:hover),
:deep(.dialog-form .el-select__wrapper:hover),
:deep(.dialog-form .el-input-number__wrapper:hover) {
  border-color: #d7e4ff;
  background: #f5f9ff;
}

:deep(.dialog-form .el-input__wrapper.is-focus),
:deep(.dialog-form .el-select__wrapper.is-focused),
:deep(.dialog-form .el-input-number__wrapper.is-focus) {
  border-color: #4f87ff;
  box-shadow: 0 0 0 3px rgba(79, 135, 255, 0.15);
  background: #fff;
}

:deep(.dialog-form .el-form-item__label) {
  color: #334155;
  font-weight: 700;
}

:deep(.dialog-form .el-radio) {
  margin-right: 18px;
}

:deep(.dialog-form .el-radio__label) {
  color: #334155;
}

:deep(.dialog-form .el-input-number) {
  width: 100%;
}

:deep(.dialog-form .el-input-number .el-input__wrapper) {
  width: 100%;
}

//下拉選單按鈕
.cancel-btn {
  border-radius: 12px;
  padding: 10px 20px;
  background: #f3f6fb;
  border: 1px solid #e3e8f2;
  color: #556070;
}

.cancel-btn:hover {
  background: #e9eff7;
}

.confirm-btn {
  border-radius: 12px;
  padding: 10px 22px;
  font-weight: 700;
  background: linear-gradient(90deg, #5f97ff, #356eff);
  border: none;
  box-shadow: 0 6px 18px rgba(53, 110, 255, 0.25);
}

</style>