<template>
  <div class="page">
    <div class="shell">
      <div class="page-hero">
        <div>
          <div class="page-tag">Order Management</div>
          <h1 class="page-title">訂單管理</h1>
          <p class="page-desc">
            管理訂單狀態、陪診服務與付款資訊，提供即時訂單追蹤。
          </p>
        </div>
      </div>

      <div class="content-card">
        <!-- 篩選列 -->
        <div class="filter-bar">
          <div class="filter-bar__left">
            <div class="filter-title">篩選條件</div>
            <div class="filter-subtitle">可依訂單編號快速查詢指定訂單</div>
          </div>

          <el-form :inline="true" :model="searchForm" class="filter-form">
            <el-form-item prop="out_trade_no" class="filter-item">
              <el-input
                v-model="searchForm.out_trade_no"
                placeholder="請輸入訂單編號"
                clearable
                class="filter-input"
              />
            </el-form-item>

            <el-form-item class="filter-item filter-actions">
              <el-button class="search-btn" type="primary" @click="onSubmit">
                查詢
              </el-button>
              <el-button class="reset-btn" @click="handleReset">
                重設
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 表格 -->
        <div class="table-wrap">
          <el-table :data="tableData.list" class="custom-table" >
            <el-table-column prop="out_trade_no" label="訂單編號" min-width="140" />

            <el-table-column label="就診醫院" min-width="110">
              <template #default="scope">
                {{ zhCNtoTW(scope.row.hospital_name) }}
              </template>
            </el-table-column>

            <el-table-column prop="service_name" label="陪診服務" min-width="100">
              <template #default="scope">
                {{ zhCNtoTW(scope.row.service_name) }}
              </template>
            </el-table-column>

            <el-table-column label="陪護師頭像" min-width="70">
              <template #default="scope">
                <el-avatar :size="40" :src="scope.row.companion ? scope.row.companion.avatar : ''">
                  <el-icon><User /></el-icon>
                </el-avatar>
              </template>
            </el-table-column>

            <el-table-column label="陪護師手機號" min-width="110">
              <template #default="scope">
                {{ scope.row.companion ? scope.row.companion.mobile : '' }}
              </template>
            </el-table-column>

            <el-table-column prop="price" label="總價" min-width="60" />

            <el-table-column label="下單時間" min-width="120">
              <template #default="scope">
                {{ dayjs(scope.row.order_start_time).format('YYYY-MM-DD') }}
              </template>
            </el-table-column>

            <el-table-column label="訂單狀態" min-width="80">
              <template #default="scope">
                <el-tag :type="statusMap(scope.row.trade_state || scope.row.service_state)">
                  {{ zhCNtoTW(scope.row.trade_state || scope.row.service_state) }}
                </el-tag>
              </template>
            </el-table-column>


            <el-table-column prop="tel" label="聯繫人手機號" min-width="130" />

            <el-table-column label="操作" min-width="80" >
              <template #default="scope">
                <el-popconfirm
                  v-if="['待服務', '待服务', '已接單', '已接单'].includes(scope.row.trade_state) || ['待服務', '待服务', '已接單', '已接单'].includes(scope.row.service_state)"
                  confirm-button-text="是"
                  cancel-button-text="否"
                  :icon="InfoFilled"
                  icon-color="#626AEF"
                  title="是否確認完成"
                  @confirm="confirmEvent(scope.row.out_trade_no)"
                >
                  <template #reference>
                    <el-button class="action-btn" type="primary" link>服務完成</el-button>
                  </template>
                </el-popconfirm>

                <el-button v-else class="action-btn is-disabled" type="primary" link disabled>
                  暫無服務
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分頁 -->
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
  </div>
</template>

<script setup>
import { InfoFilled, User } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router'
import { reactive, onMounted } from 'vue'   
import { adminOrder ,updateOrder} from '@/api/index.js'
import dayjs from 'dayjs'
import { zhCNtoTW } from '@/utils/zhCNtoTW'

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
  paginationData.pageNum = 1
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
const confirmEvent = (id) =>{
    updateOrder({id}).then(({data})=>{
        if(data.code === 10000){
            getListData()
        }
    })
}


</script>



<style lang="less" scoped>
/* 僅針對此頁防止表格外溢 */
.page {
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin: 10px 0 16px;
}

.search-form {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  width: 240px;
}

.custom-table {
  border-radius: 16px;
  overflow: hidden;
}

.action-btn {
  color: #2f6bff;
  font-weight: 700;
}

.action-btn.is-disabled {
  color: #94a3b8;
}

.form {
  display: none;
}

.pagination-info {
  display: none;
}

/* 搜尋欄 */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin: 10px 0 18px;
  padding: 18px 20px;
  border-radius: 18px;
  background: linear-gradient(180deg, #f8fbff 0%, #f3f7fd 100%);
  border: 1px solid #e7eef8;
}

.filter-bar__left {
  flex-shrink: 0;
}

.filter-title {
  margin-bottom: 4px;
  font-size: 16px;
  font-weight: 800;
  color: #243247;
}

.filter-subtitle {
  font-size: 13px;
  color: #7b8798;
}

.filter-form {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.filter-item {
  margin-bottom: 0;
}

.filter-input {
  width: 260px;
}

:deep(.filter-input .el-input__wrapper) {
  min-height: 42px;
  border-radius: 12px;
  box-shadow: none;
  background: #fff;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

:deep(.filter-input .el-input__wrapper:hover) {
  border-color: #d7e4ff;
  background: #fcfdff;
}

:deep(.filter-input .el-input__wrapper.is-focus) {
  border-color: #5f97ff;
  box-shadow: 0 0 0 3px rgba(95, 151, 255, 0.12);
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.search-btn {
  border: none;
  border-radius: 12px;
  padding: 10px 18px;
  font-weight: 700;
  background: linear-gradient(90deg, #5f97ff 0%, #356eff 100%);
  box-shadow: 0 10px 24px rgba(53, 110, 255, 0.2);
}

.reset-btn {
  border-radius: 12px;
  padding: 10px 18px;
  font-weight: 700;
  color: #556070;
  background: #fff;
  border: 1px solid #dbe5f2;
}

.reset-btn:hover {
  color: #2f6bff;
  border-color: #bfd4ff;
  background: #f7faff;
}

custom-table {
  min-width: 1500px;
}

</style>