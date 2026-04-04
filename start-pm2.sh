#!/bin/bash

PROJECT_DIR="/data/hmnl3n/app-883oyd7kz475 - 副本 (2)"
APP_NAME="miaoda-react-admin"
PORT=5173

echo "=========================================="
echo "PM2 服务启动脚本"
echo "=========================================="

cd "$PROJECT_DIR" || exit 1

echo ""
echo "[1/6] 检查 pm2 安装状态..."
if ! command -v pm2 &> /dev/null; then
    echo "pm2 未安装，正在全局安装..."
    npm install -g pm2
fi
pm2 --version

echo ""
echo "[2/6] 停止并删除现有进程..."
pm2 delete "$APP_NAME" 2>/dev/null || true

echo ""
echo "[3/6] 创建日志目录..."
mkdir -p logs

echo ""
echo "[4/6] 使用 pm2 启动服务..."
pm2 start ecosystem.config.js

echo ""
echo "[5/6] 保存 pm2 进程列表..."
pm2 save

echo ""
echo "[6/6] 配置 pm2 开机自启动..."
pm2 startup

echo ""
echo "=========================================="
echo "PM2 服务状态"
echo "=========================================="
pm2 list

echo ""
echo "=========================================="
echo "端口监听状态"
echo "=========================================="
netstat -tlnp 2>/dev/null | grep "$PORT" || ss -tlnp 2>/dev/null | grep "$PORT"

echo ""
echo "=========================================="
echo "服务访问地址"
echo "=========================================="
echo "本地访问: http://localhost:$PORT"
echo "网络访问: http://0.0.0.0:$PORT"
echo ""
echo "PM2 常用命令:"
echo "  pm2 list              - 查看所有进程"
echo "  pm2 logs $APP_NAME    - 查看日志"
echo "  pm2 restart $APP_NAME - 重启服务"
echo "  pm2 stop $APP_NAME    - 停止服务"
echo "  pm2 delete $APP_NAME  - 删除服务"
echo "  pm2 monit             - 实时监控"
echo "=========================================="
