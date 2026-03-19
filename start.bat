@echo off
chcp 65001 >nul
title HMNL直播讨论站 - 开发服务器
cd /d "%~dp0"

echo ========================================
echo   HMNL直播讨论站 - 开发服务器
echo ========================================
echo.

:: 检查Node.js
echo [1/4] 检查Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo [错误] 请先安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo   Node.js: %NODE_VERSION%

:: 检查pnpm
echo [2/4] 检查pnpm...
pnpm -v >nul 2>&1
if errorlevel 1 (
    echo   正在安装pnpm...
    npm install -g pnpm
)

:: 安装依赖
echo [3/4] 安装依赖...
if not exist "node_modules" (
    pnpm install
    echo   依赖安装完成
) else (
    echo   依赖已存在，跳过安装
)

:: 启动开发服务器
echo [4/4] 启动开发服务器...
echo.
echo ========================================
echo   服务器启动中...
echo ========================================
echo.
echo 访问地址: http://127.0.0.1:2011
echo 按 Ctrl+C 停止服务器
echo.

npx vite --port 2011 --host 127.0.0.1
