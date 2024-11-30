<script>
import IPAddressInput from "../components/iPAddressInput.vue";

export default {
  name: "home",
  components: {
    IPAddressInput
  }
};
</script>

<template>
  <el-card>
    <div><h1>子网划分 小工具</h1> <el-tag>V1.0.0</el-tag></div>
  </el-card>
  <br>
  <el-card>
    <IPAddressInput></IPAddressInput>
  </el-card>
</template>

<style scoped>

</style>
