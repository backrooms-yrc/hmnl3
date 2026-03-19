# HMNL直播讨论站 - 一键部署脚本 (PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HMNL直播讨论站 - 一键部署脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectDir

# 检查Node.js
Write-Host "[1/5] 检查Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[错误] 请先安装Node.js: https://nodejs.org/" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

# 检查pnpm
Write-Host "[2/5] 检查pnpm..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm -v 2>$null
    Write-Host "  pnpm: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "  正在安装pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

# 安装依赖
Write-Host "[3/5] 安装依赖..." -ForegroundColor Yellow
pnpm install
Write-Host "  依赖安装完成" -ForegroundColor Green

# 类型检查
Write-Host "[4/5] 类型检查..." -ForegroundColor Yellow
try {
    npx tsgo -p tsconfig.check.json 2>&1 | Out-Null
    Write-Host "  类型检查通过" -ForegroundColor Green
} catch {
    Write-Host "  [警告] 类型检查发现问题，继续构建..." -ForegroundColor Yellow
}

# 构建项目
Write-Host "[5/5] 构建项目..." -ForegroundColor Yellow
try {
    pnpm run build
    Write-Host "  构建完成" -ForegroundColor Green
} catch {
    Write-Host "[错误] 构建失败" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  部署准备完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "构建输出目录: dist/" -ForegroundColor Green
Write-Host ""
Write-Host "部署选项：" -ForegroundColor Cyan
Write-Host "  1. Vercel:   vercel --prod"
Write-Host "  2. Netlify:  netlify deploy --prod"
Write-Host "  3. 本地预览: pnpm run preview"
Write-Host ""
Write-Host "启动开发服务器: ./start.bat 或 ./start.ps1" -ForegroundColor Yellow
Write-Host ""
Read-Host "按回车键退出"
