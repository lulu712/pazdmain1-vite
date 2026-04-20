<template>
  <div class="page">
    <div class="shell">
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
.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
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
</style>