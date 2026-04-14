<template>
  <div class="order-page">
    <div class="order-shell">
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
        <el-table :data="tableData.list" class="custom-table">
          <el-table-column prop="out_trade_no" label="訂單編號" width="160" />

          <el-table-column label="就診醫院" min-width="180">
            <template #default="scope">
              {{ zhCNtoTW(scope.row.hospital_name) }}
            </template>
          </el-table-column>

          <el-table-column prop="service_name" label="陪診服務" min-width="150">
            <template #default="scope">
              {{ zhCNtoTW(scope.row.service_name) }}
            </template>
          </el-table-column>

          <el-table-column label="陪護師頭像" width="110">
            <template #default="scope">
              <el-avatar :size="40" :src="scope.row.companion ? scope.row.companion.avatar : ''">
                <el-icon><User /></el-icon>
              </el-avatar>
            </template>
          </el-table-column>

          <el-table-column label="陪護師手機號" width="140">
            <template #default="scope">
              {{ scope.row.companion ? scope.row.companion.mobile : '' }}
            </template>
          </el-table-column>

          <el-table-column prop="price" label="總價" width="100" />
          <el-table-column prop="paidPrice" label="已付" width="100" />

          <el-table-column label="下單時間" width="130">
            <template #default="scope">
              {{ dayjs(scope.row.order_start_time).format('YYYY-MM-DD') }}
            </template>
          </el-table-column>

          <el-table-column label="訂單狀態" width="120">
            <template #default="scope">
              <el-tag :type="statusMap(scope.row.trade_state || scope.row.service_state)">
                {{ zhCNtoTW(scope.row.trade_state || scope.row.service_state) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="接單狀態" width="120">
            <template #default="scope">
              {{ zhCNtoTW(scope.row.service_state) }}
            </template>
          </el-table-column>

          <el-table-column prop="tel" label="聯繫人手機號" width="140" />

          <el-table-column label="操作" width="120" fixed="right">
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
.order-page {
  min-height: 100%;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(70, 120, 255, 0.08), transparent 24%),
    linear-gradient(180deg, #eef3f8 0%, #f4f7fb 100%);
  box-sizing: border-box;
}

.order-shell {
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

.search-btn {
  border: none;
  border-radius: 12px;
  padding: 10px 18px;
  font-weight: 700;
  background: linear-gradient(90deg, #5f97ff 0%, #356eff 100%);
  box-shadow: 0 10px 24px rgba(53, 110, 255, 0.2);
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

.action-btn {
  color: #2f6bff;
  font-weight: 700;
}

.action-btn.is-disabled {
  color: #94a3b8;
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

.form {
  display: none;
}

.pagination-info {
  display: none;
}

//搜尋欄
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
  font-size: 16px;
  font-weight: 800;
  color: #243247;
  margin-bottom: 4px;
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

</style>