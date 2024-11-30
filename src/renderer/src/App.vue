<script>
/**
 * App组件定义
 * 功能：子网划分小工具
 */
export default {
  name: 'App',
  data() {
    // 组件数据定义
    return {
      netCount: null, // 网段数量
      startIP: '', // 起始IP地址
      nets: [], // 网段信息数组
      hostbit: [], // 主机位数组
      beginIP: [], // 每个网段的起始IP数组
      netmask: [], // 子网掩码数组
      results: [], // 计算结果数组
      useAllZeroOne: 'false' // 是否使用全0和全1的广播地址
    }
  },
  methods: {
    /**
     * 创建网段元素
     * 根据网段数量netCount初始化nets数组
     */
    createElem() {
      this.nets = []
      for (let i = 0; i < this.netCount; i++) {
        this.nets.push({ count: 30 })
      }
    },
    /**
     * 初始化计算过程
     * 调用计算主机位、起始IP和子网掩码的方法，并重置结果数组
     */
    beginInit() {
      this.calcHostBit()
      this.calcBeginIP()
      this.calcNetMask()
      this.results = []
      for (let i = 0; i < this.netCount; i++) {
        this.calcTheMain(i)
      }
    },
    /**
     * 计算主机位
     * 根据每个网段所需的主机数量计算主机位，并进行排序
     */
    calcHostBit() {
      let b = 0
      this.hostbit = []

      for (let i = 0; i < this.netCount; i++) {
        let hostCount = parseInt(this.nets[i].count) + 2
        while ((1 << b) < hostCount) {
          b++
        }
        this.hostbit.push(b)
        b = 0
      }

      this.hostbit.sort((a, b) => b - a)
    },
    /**
     * 计算每个网段的起始IP
     * 根据主机位计算每个网段的起始IP地址
     */
    calcBeginIP() {
      this.__pointer = 0
      let increment = 0
      let startIP_Array

      this.beginIP[0] = this.startIP

      for (let i = 1; i <= this.netCount; i++) {
        startIP_Array = this.beginIP[i - 1].split('.').map(Number)

        increment = 1 << this.hostbit[this.__pointer]
        startIP_Array[3] += increment

        for (let j = 3; j > 0; j--) {
          let carryNum = Math.floor(startIP_Array[j] / 256)
          startIP_Array[j] %= 256
          startIP_Array[j - 1] += carryNum
        }

        this.__pointer++
        this.beginIP[i] = startIP_Array.join('.')
      }
    },
    /**
     * 计算子网掩码
     * 根据每个网段的主机数量计算子网掩码
     */
    calcNetMask() {
      this.netmask = []
      for (let i = 0; i < this.netCount; i++) {
        let hostCount = parseInt(this.nets[i].count) + 2
        let hostBits = 0

        while ((1 << hostBits) < hostCount) {
          hostBits++
        }

        let networkBits = 32 - hostBits
        let mask = []

        let bits = networkBits
        for (let octet = 0; octet < 4; octet++) {
          if (bits >= 8) {
            mask.push(255)
            bits -= 8
          } else {
            mask.push(256 - Math.pow(2, 8 - bits))
            bits = 0
          }
        }

        this.netmask.push(mask.join('.'))
      }
    },
    /**
     * 主要计算函数
     * 计算每个网段的网络地址、子网掩码、第一个地址、最后一个地址和广播地址
     * @param {number} i - 网段索引
     */
    calcTheMain(i) {
      let networkString = this.beginIP[i]
      let netmaskString = this.netmask[i]
      let broadcastString = this.beginIP[i + 1]

      let networkArray = networkString.split('.').map(Number)
      let netmaskArray = netmaskString.split('.').map(Number)
      let broadcastArray = broadcastString.split('.').map(Number)

      for (let j = 3; j > 0; j--) {
        if (--broadcastArray[j] < 0) {
          broadcastArray[j] = 255
        } else {
          break
        }
      }

      if (broadcastArray[3] % 2 === 0) {
        alert('计算错误，广播地址意外为偶数!')
        return
      }

      let broadcast = broadcastArray.join('.')

      networkArray[3] += 1
      let firstAddress = networkArray.join('.')

      broadcastArray[3] -= 1
      let lastAddress = broadcastArray.join('.')

      this.results.push({
        network: networkString,
        netmask: netmaskString,
        firstAddress,
        lastAddress,
        broadcast
      })
    },
    /**
     * 将子网掩码的位数转换为对应的十进制数
     * @param {number} n - 子网掩码的位数
     * @returns {number} - 对应的十进制数
     */
    changeToNum(n) {
      const maskMapping = [255, 254, 252, 248, 240, 224, 192, 128, 0]
      return maskMapping[n] || 0
    }
  }
}
</script>

<template>
  <!-- 子网划分小工具的UI部分 -->
  <el-card>
    <div><h1>子网划分 小工具</h1>
      <el-tag>V1.0.0</el-tag>
    </div>
  </el-card>
  <br>
  <el-card>
    <div>
      <!-- 输入网段数量和开始划分按钮 -->
      <el-input v-model="netCount" placeholder="输入划分网段的数量" style="width: 200px;"></el-input>
      <el-button type="primary" style="margin-left: 10px" @click="createElem">开始划分主机</el-button>
      <br><br>
      <!-- 是否使用全0和全1的广播地址选项 -->
      <el-radio-group v-model="useAllZeroOne" disabled>
        <el-radio label="false">使用全0和全1</el-radio>
        <el-radio label="true">不使用全0和全1</el-radio>
      </el-radio-group>

      <div>
        <br>
        <!-- 显示每个网段的主机数量输入框 -->
        <div id="div_showNet" style="border:1px solid #c3c3c3;width:500px;height:300px;">
          <div v-for="(net, index) in nets" :key="index">
            <span>第{{ index + 1 }}网段需要</span>
            <el-input v-model="nets[index].count" size="small" placeholder="台数"
                      style="width: 180px; margin-left: 10px;margin-top: 5px" />
            <span>台</span>
            <br v-if="(index + 1) % 2 === 0" />
          </div>
        </div>
      </div>

      <br><br>
      <!-- 输入起始IP地址和开始划分子网按钮 -->
      <el-input v-model="startIP" placeholder="输入被划分的IP地址" style="width: 200px;"></el-input>
      <el-button type="primary" style="margin-left: 10px" @click="beginInit">开始划分子网</el-button>
      <div>
        <br>
        <!-- 显示计算结果的表格 -->
        <el-table :data="results" border style="width: 100%">
          <el-table-column label="网络地址" prop="network" />
          <el-table-column label="子网掩码" prop="netmask" />
          <el-table-column label="第一地址" prop="firstAddress" />
          <el-table-column label="最后地址" prop="lastAddress" />
          <el-table-column label="广播地址" prop="broadcast" />
        </el-table>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
/* Add custom styles here if necessary */
</style>
