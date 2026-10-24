// 森林还债管家 · 本地静态服务（仅用 Node 内置模块，无第三方依赖）
// 双击「启动还债管家.bat」会自动启动本文件；关闭对应的最小化窗口即停止服务。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, 'app');
const PORT = 28417;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

function safeJoin(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const target = path.join(ROOT, decoded);
  if (!target.startsWith(ROOT)) return null; // 防路径穿越
  return target;
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    res.end();
    return;
  }

  let target = safeJoin(req.url || '/');
  if (target === null) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  let stat = null;
  try {
    stat = fs.statSync(target);
  } catch {
    stat = null;
  }

  // 目录 → index.html；文件不存在 → SPA 兜底 index.html（前端路由）
  if (!stat || stat.isDirectory()) {
    target = path.join(ROOT, 'index.html');
    try {
      stat = fs.statSync(target);
    } catch {
      stat = null;
    }
  }

  if (!stat || !stat.isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('页面不存在');
    return;
  }

  const ext = path.extname(target).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] ?? 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  fs.createReadStream(target).pipe(res);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用：可能软件已在运行，或其他程序占用了该端口。`);
    console.error('可先关闭已打开的还债管家窗口，或重启电脑后再试。');
  } else {
    console.error('服务启动失败：', err.message);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`森林还债管家已启动：http://localhost:${PORT}/`);
  console.log('关闭本窗口即停止本地服务；数据仅保存在当前浏览器本机。');
});
