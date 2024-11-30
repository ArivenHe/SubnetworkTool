<template>
  <div>
    <el-input v-model="netCount" placeholder="输入划分网段的数量" style="width: 200px;"></el-input>
    <el-button type="primary" style="margin-left: 10px" @click="createElem">开始划分主机</el-button>

    <div>
       <br>
      <div id="div_showNet" style="border:1px solid #c3c3c3;width:500px;height:300px;">
      <div v-for="(net, index) in nets" :key="index">
        <span>第{{ index + 1 }}网段需要</span>
        <el-input v-model="nets[index].count" size="small" placeholder="台数" style="width: 180px; margin-left: 10px;margin-top: 5px"/>
        <span>台</span>
        <br v-if="(index + 1) % 2 === 0" />
      </div>
    </div>
    </div>

    <br><br>
    <el-input v-model="startIP" placeholder="输入被划分的IP地址" style="width: 200px;"></el-input>
    <el-button type="primary" style="margin-left: 10px" @click="beginInit">开始划分子网</el-button>
   <div>
     <br>
      <el-table :data="results" border style="width: 100%">
      <el-table-column label="网络地址" prop="network" />
      <el-table-column label="子网掩码" prop="netmask" />
      <el-table-column label="第一地址" prop="firstAddress" />
      <el-table-column label="最后地址" prop="lastAddress" />
      <el-table-column label="广播地址" prop="broadcast" />
    </el-table>
   </div>
  </div>
</template>

<script>
import { ElInput, ElButton, ElTable, ElTableColumn } from 'element-plus';

export default {
  name: 'SubnetCalculator',
  components: {
    ElInput,
    ElButton,
    ElTable,
    ElTableColumn,
  },
  data() {
    return {
      netCount: null,
      startIP: '',
      nets: [],
      hostbit: [],
      beginIP: [],
      netmask: [],
      results: []
    };
  },
  methods: {
    createElem() {
      // Create input elements dynamically for each subnet
      this.nets = [];
      for (let i = 0; i < this.netCount; i++) {
        this.nets.push({ count: 100 });
      }
    },
    beginInit() {
      this.calcHostBit();
      this.calcBeginIP();
      this.calcNetMask();
      this.results = [];
      for (let i = 0; i < this.netCount; i++) {
        this.calcTheMain(i);
      }
    },
    calcHostBit() {
      let b = 0;
      this.hostbit = [];

      for (let i = 0; i < this.netCount; i++) {
        let hostCount = parseInt(this.nets[i].count) + 2; // including network and broadcast
        while ((1 << b) < hostCount) {
          b++;
        }
        this.hostbit.push(b);
        b = 0;
      }

      this.hostbit.sort((a, b) => b - a); // Sort in descending order
    },
    calcBeginIP() {
      this.__pointer = 0;
      let increment = 0;
      let startIP_Array;

      this.beginIP[0] = this.startIP;

      for (let i = 1; i <= this.netCount; i++) {
        startIP_Array = this.beginIP[i - 1].split('.').map(Number);

        increment = 1 << this.hostbit[this.__pointer];
        startIP_Array[3] += increment;

        for (let j = 3; j > 0; j--) {
          let carryNum = Math.floor(startIP_Array[j] / 256);
          startIP_Array[j] %= 256;
          startIP_Array[j - 1] += carryNum;
        }

        this.__pointer++;
        this.beginIP[i] = startIP_Array.join('.');
      }
    },
    calcNetMask() {
      this.netmask = [];
      for (let i = 0; i < this.netCount; i++) {
        let n = this.hostbit[i];
        let mask;

        if (n == 32) mask = "0.0.0.0";
        else if (n > 24) mask = `255.${this.changeToNum(n - 24)}.0.0`;
        else if (n > 16) mask = `255.255.${this.changeToNum(n - 16)}.0.0`;
        else if (n > 8) mask = `255.255.255.${this.changeToNum(n - 8)}`;
        else mask = `255.255.255.255.${this.changeToNum(n)}`;

        this.netmask.push(mask);
      }
    },
    calcTheMain(i) {
      let networkString = this.beginIP[i];
      let netmaskString = this.netmask[i];
      let broadcastString = this.beginIP[i + 1];

      let networkArray = networkString.split('.').map(Number);
      let netmaskArray = netmaskString.split('.').map(Number);
      let broadcastArray = broadcastString.split('.').map(Number);

      for (let j = 3; j > 0; j--) {
        if (--broadcastArray[j] < 0) {
          broadcastArray[j] = 255;
        } else {
          break;
        }
      }

      if (broadcastArray[3] % 2 === 0) {
        alert("计算错误，广播地址意外为偶数!");
        return;
      }

      let broadcast = broadcastArray.join('.');

      networkArray[3] += 1;
      let firstAddress = networkArray.join('.');

      broadcastArray[3] -= 1;
      let lastAddress = broadcastArray.join('.');

      this.results.push({
        network: networkString,
        netmask: netmaskString,
        firstAddress,
        lastAddress,
        broadcast
      });
    },
    changeToNum(n) {
      const maskMapping = [255, 254, 252, 248, 240, 224, 192, 128, 0];
      return maskMapping[n] || 0;
    }
  }
};
</script>

<style scoped>
#div_showNet {
  padding: 10px;
}
</style>
