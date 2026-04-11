#!/bin/bash

# ===========================================
# Git 分叉修复脚本
# 解决 filter-branch 后的分支分叉问题
# ===========================================

set -e

echo "========================================="
echo "   Git 分支分叉修复工具"
echo "========================================="
echo ""

PROJECT_DIR="/data/hmnl3n/app-883oyd7k475 - 副本 (2)"

cd "$PROJECT_DIR"

# 步骤1: 检查当前状态
echo "[1/6] 检查Git仓库状态..."
if [ ! -d ".git" ]; then
  echo "❌ 错误: 不是Git仓库"
  exit 1
fi

CURRENT_BRANCH=$(git branch --show-current)
REMOTE_NAME="hmnl3"

echo "✅ 当前分支: $CURRENT_BRANCH"
echo "✅ 远程仓库: $REMOTE_NAME"
echo ""

# 步骤2: 获取最新远程状态
echo "[2/6] 获取远程仓库状态..."
git fetch "$REMOTE_NAME" --prune || {
  echo "⚠️  获取失败，尝试继续..."
}
echo "✅ 远程状态已更新"
echo ""

# 步骤3: 显示分叉详情
echo "[3/6] 分析分支分叉情况..."
LOCAL_COMMITS=$(git rev-list --count HEAD)
REMOTE_COMMITS=$(git rev-list --count "$REMOTE_NAME/$CURRENT_BRANCH" 2>/dev/null || echo "未知")
DIVERGED=$(git rev-list --left-right --count HEAD..."$REMOTE_NAME/$CURRENT_BRANCH" 2>/dev/null || echo "? ?")

echo "本地提交数: $LOCAL_COMMITS"
echo "远程提交数: $REMOTE_COMMITS"
echo "分叉统计(本地|远程): $DIVERGED"
echo ""

# 步骤4: 清理filter-branch备份引用
echo "[4/6] 清理旧的备份引用..."
if [ -d ".git/refs/original" ]; then
  rm -rf .git/refs/original
  echo "✅ 已清理 refs/original"
else
  echo "ℹ️  无需清理"
fi

# 清理reflog过期条目
git reflog expire --expire=now --all 2>/dev/null || true
echo "✅ 已清理过期的reflog"
echo ""

# 步骤5: 执行安全强制推送
echo "[5/6] 执行强制推送 (使用 --force-with-lease)..."
echo ""
echo "⚠️  注意: 这将覆盖远程历史以匹配本地!"
echo "   使用 --force-with-lease 确保安全性"
echo ""

read -p "是否继续? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ 用户取消操作"
  exit 1
fi

git push "$REMOTE_NAME" "$CURRENT_BRANCH" --force-with-lease && {
  echo ""
  echo "✅ 推送成功!"
} || {
  echo ""
  echo "❌ 推送失败，尝试标准force push..."
  git push "$REMOTE_NAME" "$CURRENT_BRANCH" --force
}

echo ""

# 步骤6: 验证修复结果
echo "[6/6] 验证修复结果..."
echo ""

AHEAD_BEHIND=$(git rev-list --left-right --count HEAD..."$REMOTE_NAME/$CURRENT_BRANCH" 2>/dev/null)

if echo "$AHEAD_BEHIND" | grep -q "^0\t0$"; then
  echo "✅ 分支已完全同步!"
else
  echo "⚠️  仍有差异: $AHEAD_BEHIND"
  echo "   可能需要进一步处理"
fi

echo ""
echo "========================================="
echo "            修复完成"
echo "========================================="
echo ""
echo "建议操作:"
echo "1. 通知团队成员执行:"
echo "   git fetch --all"
echo "   git reset --hard $REMOTE_NAME/$CURRENT_BRANCH"
echo ""
echo "2. 验证IDE中的错误标记已消失"
echo ""
echo "3. 运行项目测试确保正常工作"
echo ""