@echo off
cd /d "%~dp0"
echo 启动网站: http://localhost:8888/web/index.html
echo 若 8080 被占用，已改用 8888 端口
py -3 -m http.server 8888
pause
