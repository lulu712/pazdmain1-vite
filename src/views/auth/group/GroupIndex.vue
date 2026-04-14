<template>
  <div class="permission-page">
    <div class="permission-shell">
      <div class="page-hero">
        <div>
          <div class="page-tag">Permission Management</div>
          <h1 class="page-title">權限管理</h1>
          <p class="page-desc">管理角色權限名稱與菜單勾選設定，統一維護後台操作範圍。</p>
        </div>
      </div>

      <div class="content-card">
        <div class="toolbar">
          <el-button
            :icon="Plus"
            type="primary"
            class="add-btn"
            @click="open(null)"
          >
            新增
          </el-button>
        </div>

        <el-table :data="tableData.list" class="permission-table">
          <el-table-column prop="id" label="ID" min-width="100" />
          <el-table-column prop="name" label="名稱" min-width="180" />

          <el-table-column prop="permissionName" label="菜單權限" min-width="360">
            <template #default="scope">
              {{ zhCNtoTW(scope.row.permissionName) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" min-width="140" fixed="right">
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
      title="新增權限"
      width="560"
      class="permission-dialog"
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

        <el-form-item label="名稱" prop="name">
          <el-input v-model="form.name" placeholder="請填寫權限名稱" />
        </el-form-item>

        <el-form-item label="權限" prop="permissions">
          <div class="tree-wrap">
            <el-tree
              ref="treeRef"
              class="permission-tree"
              :data="permissionsData"
              node-key="id"
              show-checkbox
              :default-checked-keys="defaultKeys"
              :default-expanded-keys="[2]"
            />
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="beforeClose">取消</el-button>
          <el-button type="primary" class="confirm-btn" @click="confirm(formRef)">
            確認
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>


<script setup>
import {reactive, ref,onMounted, nextTick} from 'vue';
import { userGetMenu,userSetMenu,menuList} from '@/api';
import{ Plus }from '@element-plus/icons-vue';
import { zhCNtoTW } from '@/utils/zhCNtoTW'


    onMounted(()=>{
      //菜單數據
      userGetMenu().then(({data})=>{
        console.log(data)
        permissionsData.value = formatTreeData(data.data)
      })
      getListData()
    })

    //列表數據
    const tableData=reactive({
      list:[],
      total:0
    })

    //打開彈窗
    const open=(rowData = null)=>{
        dialogFormVisable.value=true
        //彈窗打開form生成是非同步的
        nextTick(()=>{
          if(rowData){
            Object.assign(form,{ id:rowData.id, name:rowData.name })
            treeRef.value.setCheckedKeys(rowData.permission)
          }
        })
      }

    //Vue會自動更新畫面（分頁參數：第幾頁,幾筆資料）
    const paginationData = reactive({
      pageNum:1,
      pageSize:10
    })
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
    
    //請求列表數據
    const getListData=()=>{
      menuList(paginationData).then(({data})=>{
        const{list , total}=data.data
        tableData.list=list
        tableData.total=total
      
      })
    }

    

    const formRef=ref()

    //form的數據(新增)
    const form=reactive({
      id:'',
      name:'',
      permissions:''
    })

    //樹形菜單權限數據(初始變量)
    const permissionsData=ref([])
    
    //控制彈窗的顯示隱藏
    const dialogFormVisable= ref(false)

    //關閉彈窗的回調
    const beforeClose=()=>{
      dialogFormVisable.value=false
      //重置表單
      formRef.value.resetFields()
      //tree選擇重置
      treeRef.value.setCheckedKeys(defaultKeys)
    }

    //選中權限
    const defaultKeys=[4,5]
    //為了拿到tree的實例創建
    const treeRef =ref()

    //表單校驗
    const rules=reactive({
      name:[{required:true, trigger:'blur', message:'請輸入權限名稱'}]
    })

    //表單提交
    const confirm = async(formEl) => {
      if (!formEl) return
      await formEl.validate((valid, fields)=>{
        if(valid){
          //獲取到選擇的checkbox數據
         const permissions= JSON.stringify(treeRef.value.getCheckedKeys())
          userSetMenu({name: form.name, permissions, id: form.id }).then(({data})=>{
              console.log(data)
              beforeClose()
              getListData()
          })
        }else{
          console.log('error submit!', fields);
        }
      })
    }

//將權限樹由簡中改成繁中
const formatTreeData = (list) => {
  return list.map(item => ({
    ...item,
    label: zhCNtoTW(item.label || item.name || ''),
    children: item.children ? formatTreeData(item.children) : []
  }))
}

</script>

<style scoped>
.permission-page {
  min-height: 100%;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(70, 120, 255, 0.08), transparent 24%),
    linear-gradient(180deg, #eef3f8 0%, #f4f7fb 100%);
  box-sizing: border-box;
}

.permission-shell {
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
  justify-content: flex-start;
  margin: 10px 0 16px;
}

.add-btn {
  border: none;
  border-radius: 12px;
  padding: 10px 18px;
  font-weight: 700;
  background: linear-gradient(90deg, #5f97ff 0%, #356eff 100%);
  box-shadow: 0 10px 24px rgba(53, 110, 255, 0.2);
}

.permission-table {
  border-radius: 16px;
  overflow: hidden;
  --el-table-border-color: #eef2f7;
  --el-table-header-bg-color: #f8fbff;
  --el-table-row-hover-bg-color: #f5f9ff;
}

:deep(.permission-table th.el-table__cell) {
  color: #243247;
  font-weight: 700;
  font-size: 14px;
  padding: 14px 0;
}

:deep(.permission-table td.el-table__cell) {
  padding: 16px 0;
  color: #425066;
}

:deep(.permission-table .el-table__inner-wrapper::before) {
  display: none;
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

:deep(.permission-dialog .el-dialog) {
  border-radius: 20px;
  overflow: hidden;
}

:deep(.permission-dialog .el-dialog__header) {
  margin-right: 0;
  padding: 22px 24px 12px;
  border-bottom: 1px solid #eef2f6;
}

:deep(.permission-dialog .el-dialog__title) {
  color: #223047;
  font-size: 20px;
  font-weight: 800;
}

:deep(.permission-dialog .el-dialog__body) {
  padding: 24px;
}

:deep(.dialog-form .el-input__wrapper) {
  min-height: 42px;
  border-radius: 12px;
  box-shadow: none;
  background: #f8fafc;
}

:deep(.dialog-form .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(79, 135, 255, 0.12);
}

.tree-wrap {
  width: 100%;
  padding: 14px;
  border-radius: 16px;
  background: #f8fbff;
  border: 1px solid #e8eef8;
}

:deep(.permission-tree) {
  background: transparent;
  color: #334155;
}

:deep(.permission-tree .el-tree-node__content) {
  height: 38px;
  border-radius: 10px;
}

:deep(.permission-tree .el-tree-node__content:hover) {
  background: #eef4ff;
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

@media (max-width: 768px) {
  .permission-page {
    padding: 16px;
  }

  .page-hero {
    padding: 20px;
    border-radius: 20px;
  }

  .page-title {
    font-size: 28px;
  }

  .content-card {
    padding: 16px;
    border-radius: 18px;
  }
}
</style>