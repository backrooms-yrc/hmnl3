@echo off
setlocal enabledelayedexpansion

REM 设置控制台代码页为UTF-8
chcp 65001 >nul 2>&1

REM 设置PowerShell执行策略以支持UTF-8
powershell -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8" >nul 2>&1

echo ========================================
echo   HMNL直播讨论站 - 一键部署脚本
echo ========================================
echo.

:: 检查Node.js是否安装
echo [1/7] 检查Node.js环境...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Node.js，请先安装Node.js (https://nodejs.org/)
    pause
    exit /b 1
)
echo [成功] Node.js已安装
node -v
echo.

:: 检查npm是否安装
echo [2/7] 检查npm环境...
npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到npm，请先安装npm
    pause
    exit /b 1
)
echo [成功] npm已安装
npm -v
echo.

:: 检查pnpm是否安装
echo [3/7] 检查pnpm环境...
pnpm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [提示] 未检测到pnpm，正在安装...
    npm install -g pnpm
    if %errorlevel% neq 0 (
        echo [错误] pnpm安装失败
        pause
        exit /b 1
    )
)
echo [成功] pnpm已安装
pnpm -v
echo.

:: 安装项目依赖
echo [4/7] 安装项目依赖...
pnpm install
if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)
echo [成功] 依赖安装完成
echo.

:: 检查环境变量文件
echo [5/7] 检查环境变量...
if not exist .env (
    echo [警告] 未找到.env文件，请先配置环境变量
    echo.
    echo 请创建.env文件并配置以下变量：
    echo VITE_SUPABASE_URL=your_supabase_url
    echo VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    echo VITE_APP_ID=your_app_id
    echo.
    pause
    exit /b 1
)
echo [成功] 环境变量配置已找到
echo.

:: 构建项目
echo [6/7] 构建项目...
call npm run build
if %errorlevel% neq 0 (
    echo [错误] 项目构建失败
    pause
    exit /b 1
)
echo [成功] 项目构建完成
echo.

:: 运行代码检查
echo [7/7] 运行代码检查...
call npm run lint
if %errorlevel% neq 0 (
    echo [警告] 代码检查发现问题，请查看输出
    echo.
) else (
    echo [成功] 代码检查通过
)
echo.

:: 获取本地IP地址
echo ========================================
echo   网络信息
echo ========================================
echo.
echo [1/2] 获取本地IP地址...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set LOCAL_IP=%%b
    )
)
if defined LOCAL_IP (
    echo [成功] 本地IP地址: %LOCAL_IP%
) else (
    echo [提示] 无法获取本地IP地址，请手动检查网络设置
)
echo.

:: 显示端口信息
echo [2/2] 检查常用端口...
echo.
echo 常用端口信息：
echo   - 开发服务器端口: 5173
echo   - Supabase默认端口: 54321 (API), 54322 (DB)
echo   - HTTPS端口: 443
echo   - HTTP端口: 80
echo.

echo ========================================
echo   部署准备完成！
echo ========================================
echo.
echo 项目已成功构建，可以部署到以下平台：
echo.
echo 1. Vercel:     vercel --prod
echo 2. Netlify:     netlify deploy --prod
echo 3. Supabase:   npx supabase deploy
echo.
echo ========================================
echo   本地访问信息
echo ========================================
echo.
if defined LOCAL_IP (
    echo 开发服务器访问地址：
    echo   - 本地访问: http://127.0.0.1:5173
    echo   - 局域网访问: http://%LOCAL_IP%:5173
) else (
    echo 开发服务器访问地址：
    echo   - 本地访问: http://127.0.0.1:5173
)
echo.
echo 启动开发服务器命令：
echo   pnpm run dev -- --host 127.0.0.1
echo.
echo 如需在局域网访问，请运行：
echo   pnpm run dev -- --host 0.0.0.0
echo.
pause
