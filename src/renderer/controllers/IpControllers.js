class IpControllers {
  // 将十进制IP地址转换为二进制格式
  convertDecimalToBinary(str) {
    const octets = str.split('.');
    const binaryOctets = octets.map(octet => {
      return parseInt(octet, 10).toString(2).padStart(8, '0');
    });
    return binaryOctets.join('.');
  }

  // 将二进制IP地址转换为十进制格式
  convertBinaryToDecimal(binary) {
    const binaryOctets = binary.split('.');
    const decimalOctets = binaryOctets.map(bin => parseInt(bin, 2));
    return decimalOctets.join('.');
  }

  // 将CIDR表示法转换为子网掩码
  convertCidrToSubnetMask(cidr) {
    let mask = '';
    for (let i = 0; i < 32; i++) {
      mask += (i < cidr) ? '1' : '0';
    }

    const octets = [];
    for (let i = 0; i < 4; i++) {
      octets.push(parseInt(mask.slice(i * 8, (i + 1) * 8), 2));
    }

    return octets.join('.');
  }

  // 计算下一个IP地址
  incrementIp(ip, increment) {
    const octets = ip.split('.').map(Number);
    let carry = increment;

    // 从最后一位开始增加
    for (let i = 3; i >= 0; i--) {
      octets[i] += carry;
      if (octets[i] > 255) {
        octets[i] = 0;
        carry = 1;
      } else if (octets[i] < 0) {
        octets[i] = 255;
        carry = -1;
      } else {
        carry = 0;
      }
    }

    return octets.join('.');
  }

  // 生成每个子网的详细信息，确保每个子网的网络地址从指定地址开始
  generateSubnets(networkAddress, subnetSize, subnetCount) {
    const subnets = [];
    let currentNetwork = networkAddress; // 开始的网络地址

    // 每个子网的增量，单位为IP地址数量
    const subnetIncrement = subnetSize;

    for (let i = 0; i < subnetCount; i++) {
      // 计算当前子网的网络地址和广播地址
      const subnetNetwork = currentNetwork;
      const subnetBroadcast = this.incrementIp(currentNetwork, subnetSize - 1); // 减去一个地址以得到广播地址

      // 计算可用IP地址范围
      const availableRangeStart = this.incrementIp(subnetNetwork, 1); // 排除网络地址
      const availableRangeEnd = this.incrementIp(subnetBroadcast, -1); // 排除广播地址

      subnets.push({
        networkAddress: subnetNetwork,
        broadcastAddress: subnetBroadcast,
        subnetMask: this.convertCidrToSubnetMask(32 - Math.log2(subnetSize)), // 计算子网掩码
        availableRange: `${availableRangeStart} - ${availableRangeEnd}`
      });

      // 更新下一个子网的网络地址，步长为子网大小
      currentNetwork = this.incrementIp(subnetNetwork, subnetSize);
    }

    return subnets;
  }

  // 获取子网信息并返回
  getNetworkDetails(startingAddress, subnetSize, subnetCount) {
    return this.generateSubnets(startingAddress, subnetSize, subnetCount);
  }
}

export default IpControllers;
