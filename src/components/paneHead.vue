<template>
    <div class="panel-heading">
        <!-- 使用可選鏈接防止路由數據尚未加載時報錯 -->
        <div class="panel-lead">{{ currentRoute.meta?.name }}</div>
        <p class="description">{{ currentRoute.meta?.describe }}</p>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { computed } from 'vue';

// 接受路由傳入的參數（可選，若不傳則自動取當前路由，將介紹欄由後端路由傳入）
const props = defineProps({
    route: {
        type: Object,
        default: null
    }
})

const route = useRoute()

// 優先使用 props 傳入的 route，否則使用 hook 獲取的 route
const currentRoute = computed(() => props.route || route || { meta: {} })

</script>

<style lang="less" scoped >

.panel-heading {
    padding: 15px;
    background: #e8edf0;
    border-color: #e8edf0;
    position: relative;
.panel-lead {
      font-size: 14px;
.title {
        font-weight: bold;
        font-style: normal;
      }
.description {
        margin-top: 5px;
      }
    }
  }

</style>