<template>
  <div class="dashboard-container">
    <div class="header">
      <div class="title">控制台</div>
      <div class="subtitle">用於展示當前系統中的統計數據、統計報表及重要實時數據</div>
    </div>

    <el-row :gutter="20">
      <el-col :span="10">
        <el-card class="user-card" shadow="never">
          <div class="user-info">
            <el-avatar :size="64" :src="userInfo.avatar" class="avatar" />
            <div class="info-content">
              <span class="username">{{ userInfo.name || userInfo.userName }}</span>
            </div>
          </div>
          <div class="login-details">
            <p>當前權限：{{ userInfo.role === 'admin' ? '超級管理員' : '普通用戶' }}</p>
            <p>登錄的ip：127.0.0.1</p>
          </div>
        </el-card>
      </el-col>

      <el-col :span="14">
        <el-card class="status-card" shadow="never">
          <el-row :gutter="10">
            <el-col :span="12" v-for="item in statusList" :key="item.name">
              <div class="status-item">
                <!-- 使用遮罩技術來實現變色 -->
                <div 
                  class="status-icon" 
                  :style="{ 
                    backgroundColor: item.color,
                    maskImage: `url(${item.icon})`,
                    webkitMaskImage: `url(${item.icon})`
                  }"
                ></div>
                <div class="status-info">
                  <span class="status-value">{{ item.value }}</span>
                  <span class="status-label">{{ item.name }}</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row class="chart-row">
      <el-col :span="24">
        <el-card shadow="never">
          <div ref="chartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import * as echarts from 'echarts'
import { adminOrder } from '@/api'

const userInfo = JSON.parse(localStorage.getItem('pz_userInfo') || '{}')
const chartRef = ref(null)

const statusList = reactive([
  { name: '待支付', value: 0, icon: '/dzf.png', color: '#f56c6c' },
  { name: '待服務', value: 0, icon: '/dfw.png', color: '#909399' },
  { name: '已完成', value: 0, icon: '/ywc.png', color: '#67c23a' },
  { name: '已取消', value: 0, icon: '/yqx.png', color: '#e6a23c' }
])

// 獲取統計數據
const getStats = async () => {
  const { data } = await adminOrder({ pageNum: 1, pageSize: 10000 })
  const list = data.data?.list || []
  const counts = { '待支付': 0, '待服務': 0, '已完成': 0, '已取消': 0 }
  
  list.forEach(item => {
    const state = item.trade_state || item.service_state
    if (state === '待支付') counts['待支付']++
    else if (['待服務', '待服务', '已接單', '已接单'].includes(state)) counts['待服務']++
    else if (state === '已完成') counts['已完成']++
    else if (state === '已取消') counts['已取消']++
  })
  
  statusList.forEach(item => item.value = counts[item.name])
}

// 初始化圖表
const initChart = () => {
  const myChart = echarts.init(chartRef.value)
  myChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['訂單數'], right: 'center', top: 0 },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: Array(5).fill('2024-07-26'),
      axisLine: { lineStyle: { color: '#eee' } },
      axisLabel: { color: '#999' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#eee' } },
      axisLabel: { show: false }
    },
    series: [{
      name: '訂單數',
      type: 'line',
      smooth: true,
      data: [150, 230, 180, 140, 210],
      itemStyle: { color: '#a3d8d6' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(163, 216, 214, 0.3)' },
          { offset: 1, color: 'rgba(163, 216, 214, 0.1)' }
        ])
      },
      symbol: 'circle',
      symbolSize: 8
    }]
  })
  window.addEventListener('resize', () => myChart.resize())
}

onMounted(() => {
  getStats()
  initChart()
})
</script>

<style lang="less" scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;

  .header {
    margin-bottom: 20px;
    .title { font-size: 18px; font-weight: bold; color: #333; }
    .subtitle { font-size: 14px; color: #999; margin-top: 5px; }
  }

  .user-card {
    height: 165px;
    .user-info {
      display: flex;
      align-items: center;
      padding-bottom: 15px;
      border-bottom: 1px solid #f0f0f0;
      .username { font-size: 20px; font-weight: 500; color: #333; margin-left: 15px; }
    }
    .login-details {
      margin-top: 10px;
      p { font-size: 13px; color: #666; margin: 3px 0; }
    }
  }

  .status-card {
    height: 165px;
    .status-item {
      display: flex;
      align-items: center;
      padding: 10px;
      .status-icon {
        width: 40px;
        height: 40px;
        margin-right: 12px;
        mask-size: contain;
        mask-repeat: no-repeat;
        mask-position: center;
        -webkit-mask-size: contain;
        -webkit-mask-repeat: no-repeat;
        -webkit-mask-position: center;
      }
      .status-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        .status-value { font-size: 22px; font-weight: bold; color: #333; line-height: 1.2; }
        .status-label { font-size: 12px; color: #999; margin-top: 2px; }
      }
    }
  }

  .chart-row {
    margin-top: 15px;
    .chart-container { height: 350px; width: 100%; }
  }
}

:deep(.el-card) { border: none; border-radius: 8px; }
</style>