<template>
  <div class="page">
    <div class="shell">
      <div class="page-hero">
        <div>
          <div class="page-tag">Admin Management</div>
          <h1 class="page-title">管理員管理</h1>
          <p class="page-desc">查看管理員帳號、權限組別與狀態，並可直接編輯帳號資訊。</p>
        </div>
      </div>

      <div class="content-card">
        <el-table :data="tableData.list" class="admin-table">
          <el-table-column prop="id" label="ID" min-width="80" />
          <el-table-column prop="name" label="名稱" min-width="120" />

          <el-table-column prop="permissions_id" label="所屬組別" min-width="140">
            <template #default="scope">
              {{ permissionName(scope.row.permissions_id) }}
            </template>
          </el-table-column>

          <el-table-column prop="mobile" label="手機號碼" min-width="150" />

          <el-table-column prop="active" label="狀態" min-width="100">
            <template #default="scope">
              <el-tag
                class="status-tag"
                :type="scope.row.active ? 'success' : 'danger'"
              >
                {{ scope.row.active ? '正常' : '失效' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="建立時間" min-width="150">
            <template #default="scope">
              <div class="time-cell">
                <el-icon><Clock /></el-icon>
                <span>{{ scope.row.create_time }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" min-width="120" fixed="right">
            <template #default="scope">
              <el-button class="edit-btn" size="small" @click="open(scope.row)">
                編輯
              </el-button>
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
      v-model="dialogFormVisable"
      :before-close="beforeClose"
      title="編輯管理員資料"
      width="520"
      class="admin-dialog"
    >
      <el-form
        ref="formRef"
        label-width="100px"
        label-position="left"
        :model="form"
        :rules="rules"
        class="dialog-form"
      >
        <el-form-item label="手機號" prop="mobile">
          <el-input v-model="form.mobile" disabled />
        </el-form-item>

        <el-form-item label="暱稱" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>

        <el-form-item label="菜單權限" prop="permissions_id">
          <el-select
            v-model="form.permissions_id"
            placeholder="請選擇菜單權限"
            style="width: 100%"
          >
            <el-option
              v-for="item in options"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="dialogFormVisable = false">
            取消
          </el-button>
          <el-button type="primary" class="confirm-btn" @click="confirm">
            確認儲存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { authAdmin,menuSelectList,updateUser } from '@/api';
import {ref,reactive,onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { useRoute } from 'vue-router';


const route= useRoute()
console.log('當前路由參數:', route);

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
//彈窗
const dialogFormVisable=ref(false)
//關閉彈窗
const beforeClose=(done)=>{
      done()
}

const rules= reactive({
    name:[{required:true,trigger:'blur',message:'請填寫暱稱'}],
    permissions_id:[{required:true,trigger:'blur',message:'請選擇菜單權限' }]
})

const formRef=ref()
const form=reactive({
    name:'',
    permissions_id:'',
    mobile: ''
})

//表單提交
const confirm = async ()=>{
    if(!formRef.value) return
    await formRef.value.validate((valid , fields)=>{
        if(valid){
            const {name, permissions_id, mobile} = form
            updateUser({name, permissions_id, mobile}).then(({data})=>{
                if(data.code === 10000 || data.code === 1000 || data.code === 1){
                    ElMessage.success('修改成功')
                    dialogFormVisable.value = false
                    getListData()
                } else {
                    ElMessage.error(data.message || '修改失敗')
                }
            }).catch(err => {
                console.error('Update failed:', err)
                ElMessage.error('網路錯誤，請稍後再試')
            })
        }else{
            console.log('error submit!', fields);
        }
    })

}

onMounted(()=>{
    getListData()
    menuSelectList().then(({data})=>{
        options.value=data.data
    
    })
})
//請求列表
const getListData=()=>{
     authAdmin(paginationData).then(({data})=>{
        console.log(data,'authAdmin')
        console.log('原始 list:', data.data?.list)

        const list = data.data?.list || []
        const total = data.data?.total || 0
        console.log('tableData.list:', tableData.list)
        list.forEach(item=>{
            item.create_time = dayjs(item.create_time).format('YYYY-MM-DD')
        })
        tableData.list=list
        tableData.total=total
    })
}


//創建一個ref來存儲權限清單
const options=ref([])
//根據權限id匹配權限名稱
const permissionName=(id)=>{
   const data = options.value.find(el=> el.id === id)
    return data ? data.name:'超級管理員'
}

const open=(rowData)=>{
    dialogFormVisable.value = true
    Object.assign(form,{mobile:rowData.mobile ,name:rowData.name, permissions_id:rowData.permissions_id})
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


</script>
<style lang="less" scoped>
  .admin-table {
  margin-top: 14px;
  border-radius: 16px;
  overflow: hidden;
}

.time-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #5b6678;
}

.status-tag {
  border-radius: 999px;
  padding: 0 10px;
  font-weight: 700;
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

</style>