@echo off
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [提示] 未检测到 Node.js，本软件需要 Node.js 20 及以上版本才能启动。
  echo 请先安装 Node.js 后，再重新双击本文件。
  pause
  exit /b 1
)

start "还债管家-本地服务" /min cmd /c "node server.js"
timeout /t 1 /nobreak >nul
start "" "http://localhost:28417/"

echo 已在浏览器打开「森林还债管家」。
echo 退出软件：在任务栏找到最小化的「还债管家-本地服务」窗口，关闭它即可。
echo.
pause
