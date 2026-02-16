<template>
    <PaneHead :route="route" />
    <div class="form">
        <el-form :inline="true" :model="searchForm">
            <el-form-item prop="out_trade_no">
                <el-input v-model="searchForm.out_trade_no" placeholder="訂單編號"/>
            </el-form-item>
            <el-form-item>
               <el-button type="primary" @click="onSubmit">查詢</el-button>
            </el-form-item>
        </el-form>
    </div>
    <el-table :data="tableData.list">
        <el-table-column prop="out_trade_no" label="訂單編號" width="150"></el-table-column>
        <el-table-column prop="hospital_name" label="就診醫院"></el-table-column>
        <el-table-column prop="service_name" label="陪診服務"></el-table-column>
        <el-table-column label="陪護師頭像" width="100">
            <template #default="scope">
                <el-avatar :size="40" :src="scope.row.companion ? scope.row.companion.avatar : ''">
                    <el-icon><User /></el-icon>
                </el-avatar>
            </template>
        </el-table-column>
        <el-table-column label="陪護師手機號" width="120">
            <template #default="scope">
              {{ scope.row.companion ? scope.row.companion.mobile : '' }}
            </template>
        </el-table-column>
        <el-table-column prop="price" label="總價" ></el-table-column>
        <el-table-column prop="paidPrice" label="已付" ></el-table-column>
        
        <el-table-column label="下單時間" width="120">
            <template #default="scope">
              {{ dayjs(scope.row.order_start_time).format('YYYY-MM-DD') }}
            </template>
        </el-table-column>
        <el-table-column label="訂單狀態">
            <template #default="scope">
              <!-- 優先顯示 trade_state，若無則顯示 service_state -->
              <el-tag :type="statusMap(scope.row.trade_state || scope.row.service_state)">
                  {{ scope.row.trade_state || scope.row.service_state }}
              </el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="service_state" label="接單狀態" ></el-table-column>
        <el-table-column prop="tel" label="聯繫人手機號" width="120"></el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
            <template #default="scope">
                <el-popconfirm
                    v-if="['待服務', '待服务', '已接單', '已接单'].includes(scope.row.trade_state) || ['待服務', '待服务', '已接單', '已接单'].includes(scope.row.service_state)"
                    confirm-button-text='是'
                    cancel-button-text='否'
                    :icon="InfoFilled"
                    icon-color="#626AEF"
                    title="是否確認完成"
                    @confirm="confirmEvent"
                > 
                    <template #reference>
                        <el-button type="primary" link>服務完成</el-button>  
                    </template>
                </el-popconfirm>
                <el-button v-else type="primary" link disabled>暫無服務</el-button>
            </template>
        </el-table-column>
    </el-table>
    <div class="pagination-info">
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

</template>

<script setup>
import { InfoFilled, User } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router'
import { reactive, onMounted } from 'vue'   
import { adminOrder } from '@/api/index.js'
import dayjs from 'dayjs'

const route = useRoute()

onMounted(() => {
    getListData()
})

// 分頁參數
const paginationData = reactive({
    pageNum: 1,
    pageSize: 10
})

//表單搜索
const searchForm = reactive({
    out_trade_no:'',
})
const onSubmit = () => {
    getListData()
}

// 列表數據
const tableData = reactive({
    list: [],
    total: 0
})

// 獲取列表數據
const getListData = () => {
    adminOrder({ ...paginationData, ...searchForm }).then(({ data }) => {
        const list = data.data?.list || []
        const total = data.data?.total || 0

        tableData.list = list
        tableData.total = total
    })
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

// 狀態映射
const statusMap =(key)=> {
    const obj = {
        '已取消': 'info', // 預留簡繁
        '待支付': 'warning',
        '已完成': 'success',
        '待服务': 'primary',
        '已接单': 'primary',
    }
    return obj[key] || 'primary'
}

//泡泡彈窗提交
const confirmEvent = () =>{

}


</script>

<style lang="less" scoped>
.form {
  display: flex;
  justify-content: flex-end;
  padding: 10px 0 10px 10px;
  background-color: #fff; 
}


</style>