<template>
  <div class="common-layout">
  <el-container>
    <AppAside/>
  <el-container>
      <el-header class="app-hander">
          <navHeader/>
      </el-header>
      <el-main>
         <RouterView/>
      </el-main>
  </el-container>
  </el-container>
  </div>
</template>

<script setup>
import AppAside from '@/components/AppAside.vue';
import navHeader from '@/components/navHeader.vue';
</script>

<style  lang="less" scoped>
.common-layout{
  height: 100%;
  .el-container{
     height: 100%;
  }
}

.app-hander{
  height: 60px;
  padding: 0;
}

</style>