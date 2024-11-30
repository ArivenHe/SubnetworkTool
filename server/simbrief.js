const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');

async function fetchAndConvertXMLtoJSON(url, outputFilePath) {
  try {
    // 发送HTTP请求获取XML数据
    const response = await axios.get(url);
    const xmlData = response.data;

    const parser = new xml2js.Parser({ explicitArray: false });
    const jsonData = await parser.parseStringPromise(xmlData);

    const stages = {};
    if (jsonData.OFP && jsonData.OFP.navlog && jsonData.OFP.navlog.fix) {
      jsonData.OFP.navlog.fix.forEach(fix => {
        const { name, pos_lat, pos_long, stage } = fix;
        if (!stages[stage]) {
          stages[stage] = [];
        }
        stages[stage].push({ name, pos_lat, pos_long });
      });
    }
    jsonData.stages = stages;

    if (jsonData.OFP) {
      if (jsonData.OFP.origin && jsonData.OFP.origin.notam) delete jsonData.OFP.origin.notam;
      if (jsonData.OFP.destination && jsonData.OFP.destination.notam) delete jsonData.OFP.destination.notam;
      if (jsonData.OFP.alternate && jsonData.OFP.alternate.notam) delete jsonData.OFP.alternate.notam;
      if (jsonData.OFP.notams) delete jsonData.OFP.notams;
      if (jsonData.OFP.times) delete jsonData.OFP.times;
      if (jsonData.OFP.weights) delete jsonData.OFP.weights;
      if (jsonData.OFP.impacts) delete jsonData.OFP.impacts;
      if (jsonData.OFP.crew) delete jsonData.OFP.crew;
      if (jsonData.OFP.text) delete jsonData.OFP.text;
      if (jsonData.OFP.files) delete jsonData.OFP.files;
      if (jsonData.OFP.database_updates) delete jsonData.OFP.database_updates;
      if (jsonData.OFP.tracks) delete jsonData.OFP.tracks;
      if (jsonData.OFP.fms_downloads) delete jsonData.OFP.fms_downloads;
      if (jsonData.OFP.images) delete jsonData.OFP.images;
      if (jsonData.OFP.links) delete jsonData.OFP.links;
      if (jsonData.OFP.prefile) delete jsonData.OFP.prefile;
      if (jsonData.OFP.vatsim_prefile) delete jsonData.OFP.vatsim_prefile;
      if (jsonData.OFP.ivao_prefile) delete jsonData.OFP.ivao_prefile;
      if (jsonData.OFP.pilotedge_prefile) delete jsonData.OFP.pilotedge_prefile;
      if (jsonData.OFP.poscon_prefile) delete jsonData.OFP.poscon_prefile;
      if (jsonData.OFP.map_data) delete jsonData.OFP.map_data;
      if (jsonData.OFP.alternate_navlog) delete jsonData.OFP.alternate_navlog;
      if (jsonData.OFP.navlog) delete jsonData.OFP.navlog;
      if (jsonData.OFP.takeoff_altn) delete jsonData.OFP.takeoff_altn;
      if (jsonData.OFP.enroute_altn) delete jsonData.OFP.enroute_altn;
      if (jsonData.OFP.etops) delete jsonData.OFP.etops;
      if (jsonData.OFP.tlr) delete jsonData.OFP.tlr;
      if (jsonData.OFP.atc) delete jsonData.OFP.atc;
      if (jsonData.OFP.aircraft) delete jsonData.OFP.aircraft;
      if (jsonData.OFP.fuel) delete jsonData.OFP.fuel;
      if (jsonData.OFP.sigmets) delete jsonData.OFP.sigmets;
      if (jsonData.OFP.fuel_extra) delete jsonData.OFP.fuel_extra;
      if (jsonData.OFP) delete jsonData.OFP.takeoff_altn
      if (jsonData.OFP) delete jsonData.OFP.enroute_altn
      if (jsonData.OFP) delete jsonData.OFP.etops
      if (jsonData.OFP) delete jsonData.OFP.tlr
      delete jsonData.OFP.tracks
    }



    fs.writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');

    console.log('JSON data has been saved to', outputFilePath);

    return jsonData;
  } catch (error) {
    console.error('Error fetching or converting data:', error);
  }
}

// 示例URL（你需要替换为实际的API URL）
const apiUrl = 'https://www.simbrief.com/api/xml.fetcher.php?username=LH0310';

// 输出文件路径
const outputFilePath = 'output.json';

// 调用函数获取并转换数据
fetchAndConvertXMLtoJSON(apiUrl, outputFilePath);
