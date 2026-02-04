<template>
 <PaneHead />
<el-table :data="tableData.list" style="width: 100%; margin-top: 16px">
    <el-table-column prop="id" label="ID" />
    <el-table-column prop="name" label="名稱" />
    <el-table-column prop="permissions_id" label="所屬組別">
        <template #default="scope">
            {{permissionName (scope.row.permissions_id)}}
        </template>
    </el-table-column>
    <el-table-column prop="mobile" label="手機號碼" />

    <el-table-column prop="active" label="狀態">
        <template #default="scope">
           <el-tag :type="scope.row.active ? 'success' : 'danger' ">{{ scope.row.active ? '正常' : '失效'}}</el-tag>
        </template>
    </el-table-column>
    
    <el-table-column label="創建時間">
        <template #default="scope">
            <div class="flex-box">
                <el-icon> <Clock/></el-icon>
                <span style="margin-left:10px">{{ scope.row.create_time }}</span>
            </div>
        </template>
    </el-table-column>

    <el-table-column label="操作">
      <template #default="scope">
        <el-button size="small" @click="open(scope.row)">編輯</el-button>
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
            style="width: 240px;"
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
                <el-button type="primary" @click="confirm">確認</el-button>
            </div>
        </template>
  </el-dialog>
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
     authAdmin(paginationData).then((data)=>{
        console.log(data,'authAdmin')
        console.log('原始 list:', data.data.data?.list)
        //API 回傳有資料 → 用回傳的 list,PI 回傳沒有資料 → 用空陣列 []，避免後面 .forEach 爆炸
        //因爲list的層級很深，來確保不會回傳undefined導致錯誤
        const list = data.data.data?.list || []
        const total = data.data.data?.total || 0
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
    .flex-box{
        display: flex;
        align-items:center ;
    }


</style>