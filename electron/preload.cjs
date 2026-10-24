// 预加载脚本：仅向页面暴露有限的环境信息，不开放 Node 能力
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('appInfo', {
  platform: process.platform,
});
