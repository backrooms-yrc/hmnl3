#!/bin/bash

echo "================================"
echo "  浏览器缓存问题修复脚本"
echo "================================"
echo ""

echo "步骤 1/3: 清除 Vite 缓存..."
rm -rf node_modules/.vite
echo "✓ Vite 缓存已清除"
echo ""

echo "步骤 2/3: 验证代码完整性..."
if grep -q "Home," src/components/layouts/MainLayout.tsx && \
   grep -q "Sparkles" src/components/layouts/MainLayout.tsx && \
   grep -q "icon: Home" src/components/layouts/MainLayout.tsx && \
   grep -q "icon: Sparkles" src/components/layouts/MainLayout.tsx; then
    echo "✓ 代码完整性检查通过"
else
    echo "✗ 代码完整性检查失败"
    exit 1
fi
echo ""

echo "步骤 3/3: 运行代码质量检查..."
npm run lint > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ ESLint 检查通过"
else
    echo "✗ ESLint 检查失败"
    exit 1
fi
echo ""

echo "================================"
echo "  服务器端修复完成！"
echo "================================"
echo ""
echo "现在请在浏览器中执行以下操作："
echo ""
echo "  Windows/Linux: 按 Ctrl + Shift + R"
echo "  Mac:          按 Cmd + Shift + R"
echo ""
echo "或者："
echo ""
echo "  1. 按 F12 打开开发者工具"
echo "  2. 右键点击刷新按钮"
echo "  3. 选择'清空缓存并硬性重新加载'"
echo ""
echo "================================"
