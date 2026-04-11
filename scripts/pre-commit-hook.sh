#!/bin/bash

# ===========================================
# Git Pre-commit Hook - 敏感文件防护
# 自动检测并阻止敏感文件提交
# 安装方式: cp scripts/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
# ===========================================

# 定义敏感文件模式
SENSITIVE_PATTERNS=(
  "\.env$"
  "\.env\."
  "\.pem$"
  "\.key$"
  "^id_rsa"
  "credentials\.json"
  "secrets\.json"
  "service-account\.json"
  "\.p12$"
  "\.pfx$"
  "private-key\.pem"
)

# 获取即将提交的文件
FILES=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$FILES" ]; then
  exit 0
fi

BLOCKED_FILES=0
FOUND_ISSUES=0

echo "🔒 正在执行安全检查..."

for FILE in $FILES; do
  # 检查文件名是否匹配敏感模式
  for PATTERN in "${SENSITIVE_PATTERNS[@]}"; do
    if echo "$FILE" | grep -qE "$PATTERN"; then
      echo ""
      echo "❌ 阻止提交: 检测到敏感文件 -> $FILE"
      echo "   原因: 文件名匹配敏感模式 '$PATTERN'"
      
      git reset HEAD "$FILE" 2>/dev/null || true
      
      ((BLOCKED_FILES++))
      break
    fi
  done
  
  # 检查文件内容是否包含可能的凭证
  if [ -f "$FILE" ]; then
    # 检测API Keys, Tokens, Passwords等
    if grep -qiE "(api[_-]?key|secret[_-]?key|password|token|credential)" "$FILE" 2>/dev/null; then
      # 排除代码中的示例和注释
      if ! grep -qE "(example|sample|placeholder|your-|<.*>)" "$FILE"; then
        echo ""
        echo "⚠️  警告: $FILE 可能包含敏感信息"
        echo "   建议: 请确认该文件不包含真实的API密钥或密码"
        ((FOUND_ISSUES++))
      fi
    fi
    
    # 检测JWT Token (Base64编码的JSON)
    if grep -qE "eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+" "$FILE" 2>/dev/null; then
      echo ""
      echo "⚠️  警告: $FILE 可能包含JWT Token"
      ((FOUND_ISSUES++))
    fi
    
    # 检测私钥格式
    if grep -qE "-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----" "$FILE" 2>/dev/null; then
      echo ""
      echo "❌ 阻止提交: $FILE 包含私钥!"
      git reset HEAD "$FILE" 2>/dev/null || true
      ((BLOCKED_FILES++))
    fi
  fi
done

# 输出结果
echo ""

if [ $BLOCKED_FILES -gt 0 ]; then
  echo "==========================================="
  echo "❌ 提交被阻止!"
  echo "==========================================="
  echo ""
  echo "发现 ${BLOCKED_FILES} 个敏感文件已被从暂存区移除:"
  echo ""
  echo "请执行以下操作之一:"
  echo "1. 将敏感文件添加到 .gitignore"
  echo "2. 使用环境变量替代硬编码的凭证"
  echo "3. 如果确实需要提交，请使用 --no-verify 参数跳过检查"
  echo ""
  exit 1
elif [ $FOUND_ISSUES -gt 0 ]; then
  echo "==========================================="
  echo "⚠️  发现潜在安全问题 (${FOUND_ISSUES}个)"
  echo "==========================================="
  echo ""
  echo "建议在提交前审查以上文件的内容"
  echo "如确认无风险，可使用 --no-verify 强制提交"
  echo ""
  exit 0
else
  echo "✅ 安全检查通过"
  exit 0
fi