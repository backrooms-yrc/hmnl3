#!/bin/bash

echo "========================================="
echo "   Git 安全检查工具 v1.0"
echo "========================================="

ERRORS=0

echo ""
echo "[1/4] 检查Git历史中的敏感文件..."

if git log --all -- ".env" 2>/dev/null | grep -q "commit"; then
  echo "❌ 发现: .env文件存在于Git历史中"
  git log --oneline --all -- .env | head -3
  ((ERRORS++))
else
  echo "✅ .env文件安全"
fi

echo ""
echo "[2/4] 检查.gitignore配置..."

if [ -f ".gitignore" ]; then
  if grep -q "^\.env$" .gitignore; then
    echo "✅ .gitignore包含.env规则"
  else
    echo "⚠️  .gitignore缺少.env规则"
    ((ERRORS++))
  fi
else
  echo "❌ .gitignore不存在"
  ((ERRORS++))
fi

echo ""
echo "[3/4] 检查未追踪的敏感文件..."

UNTRACKED_SENSITIVE=$(git ls-files --others --exclude-standard | grep -E "\.env|\.key$|\.pem$" || true)

if [ -n "$UNTRACKED_SENSITIVE" ]; then
  echo "⚠️  发现未追踪的敏感文件:"
  echo "$UNTRACKED_SENSITIVE"
  ((ERRORS++))
else
  echo "✅ 无未追踪的敏感文件"
fi

echo ""
echo "[4/4] 检查已暂存的敏感文件..."

STAGED=$(git diff --cached --name-only)
STAGED_SENSITIVE=""

if [ -n "$STAGED" ]; then
  STAGED_SENSITIVE=$(echo "$STAGED" | grep -E "\.env|\.env\." || true)
fi

if [ -n "$STAGED_SENSITIVE" ]; then
  echo "❌ 紧急: 敏感文件已暂存!"
  echo "$STAGED_SENSITIVE"
  echo ""
  echo "请立即执行: git reset HEAD <file>"
  ((ERRORS++))
else
  echo "✅ 暂存区安全"
fi

echo ""
echo "========================================="
if [ $ERRORS -eq 0 ]; then
  echo "✅ 所有检查通过! 仓库安全。"
  exit 0
else
  echo "❌ 发现 $ERRORS 个安全问题"
  echo ""
  echo "建议操作:"
  echo "1. 轮换所有暴露的凭证(API keys, tokens)"
  echo "2. 使用 git filter-branch 清理历史"
  echo "3. 强制推送: git push --force-with-lease"
  exit 1
fi