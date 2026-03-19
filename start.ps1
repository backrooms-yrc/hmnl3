# HMNL直播讨论站 - 一键启动脚本 (PowerShell)
# 简化版 - 直接启动开发服务器

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HMNL直播讨论站 - 开发服务器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectDir

# 检查Node.js
Write-Host "[1/4] 检查Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[错误] 请先安装Node.js: https://nodejs.org/" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

# 检查pnpm
Write-Host "[2/4] 检查pnpm..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm -v 2>$null
    Write-Host "  pnpm: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "  正在安装pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

# 安装依赖
Write-Host "[3/4] 安装依赖..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    pnpm install
    Write-Host "  依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "  依赖已存在，跳过安装" -ForegroundColor Green
}

# 启动开发服务器
Write-Host "[4/4] 启动开发服务器..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  服务器启动中..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "访问地址: http://127.0.0.1:2011" -ForegroundColor Green
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host ""

npx vite --port 2011 --host 127.0.0.1
