<template>
  <PaneHead />
  <div class="btns">
     <el-button :icon="Plus" type="primary" @click="open(null)" size=small >新增</el-button>
  </div>
  <el-table :data="tableData.list" style="width: 100%;">
    <el-table-column  prop="id" label="id"/>
    <el-table-column  prop="name" label="暱稱"/>
    <el-table-column  prop="permissionName" label="菜單權限" width="500px"/>
    <el-table-column  #default="scope">
         <el-button type="primary" @click="open(scope.row)">編輯</el-button>
    </el-table-column>
  </el-table>
  <div class="pagination-info" style="display: flex; justify-content: flex-end;">
    <el-pagination
      v-model:current-page="paginationData.pageNum"
      :page-size="paginationData.pageSize"
      :background="false"
      layout="total, prev, pager, next"
      :total="tableData.total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange">
    </el-pagination>
  </div>
  
  <el-dialog
    v-model="dialogFormVisable"
    :before-close="beforeClose"
    title="添加權限"
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
      <el-form-item label="名稱" prop="name">
          <el-input v-model="form.name" placeholder="請填寫權限名稱" />
      </el-form-item>
      <el-form-item label="權限" prop="permissions">
         <el-tree
            ref="treeRef"
            style="max-width:600px;"
            :data="permissionsData"
            node-key="id"
            show-checkbox
            :default-checked-keys="defaultKeys"
            :default-expanded-keys="[2]"
         />
      </el-form-item>
    </el-form>
    <template #footer>
        <div class="dialog-footer">
            <el-button type="primary" @click="confirm(formRef)">確認</el-button>
        </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { reactive, ref,onMounted, nextTick} from 'vue';
import { userGetMenu,userSetMenu,menuList} from '@/api';
import{ Plus }from '@element-plus/icons-vue';
    
   
    onMounted(()=>{
      //菜單數據
      userGetMenu().then(({data})=>{
        console.log(data)
        permissionsData.value=data.data
      })
      getListData()
    })

    //列表數據
    const tableData=reactive({
      list:[],
      total:0
    })

    //打開彈窗
    const open=(rowData = {})=>{
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

</script>

<style>
    .btns{
      padding: 10px 0 10px 10px;
      background-color: #fff;
    }
</style>