# HMNL 直播系统 - UI 设计规范

## 版本信息
- **版本**: 1.0.0
- **发布日期**: 2026-04-04
- **设计系统**: MDUI 3 (Material Design 3)

---

## 1. 色彩系统

### 1.1 主题色系

#### 1.1.1 Light Theme (浅色主题)
```css
--md-sys-color-primary: 210 24% 24%;           /* 主色 - 深蓝色 */
--md-sys-color-on-primary: 0 0% 100%;          /* 主色上的文字 - 白色 */
--md-sys-color-primary-container: 210 24% 90%; /* 主色容器 - 浅蓝色 */
--md-sys-color-on-primary-container: 210 24% 8%; /* 主色容器上的文字 */

--md-sys-color-secondary: 210 20% 30%;         /* 次色 - 蓝灰色 */
--md-sys-color-on-secondary: 0 0% 100%;        /* 次色上的文字 */
--md-sys-color-secondary-container: 210 20% 92%; /* 次色容器 */
--md-sys-color-on-secondary-container: 210 20% 12%;

--md-sys-color-tertiary: 38 50% 40%;           /* 第三色 - 橙色 */
--md-sys-color-on-tertiary: 0 0% 100%;         /* 第三色上的文字 */
--md-sys-color-tertiary-container: 38 50% 90%; /* 第三色容器 */
--md-sys-color-on-tertiary-container: 38 50% 12%;

--md-sys-color-error: 0 84% 60%;               /* 错误色 - 红色 */
--md-sys-color-on-error: 0 0% 100%;            /* 错误色上的文字 */
--md-sys-color-error-container: 0 84% 90%;     /* 错误容器 */
--md-sys-color-on-error-container: 0 84% 12%;

--md-sys-color-background: 210 20% 98%;        /* 背景色 */
--md-sys-color-on-background: 210 20% 10%;     /* 背景上的文字 */

--md-sys-color-surface: 0 0% 100%;             /* 表面色 - 白色 */
--md-sys-color-on-surface: 210 20% 10%;        /* 表面上的文字 */
--md-sys-color-surface-variant: 210 20% 92%;   /* 表面变体色 */
--md-sys-color-on-surface-variant: 210 20% 30%; /* 表面变体上的文字 */

--md-sys-color-outline: 210 20% 50%;           /* 轮廓色 */
--md-sys-color-outline-variant: 210 20% 85%;   /* 轮廓变体色 */
```

#### 1.1.2 Dark Theme (深色主题)
```css
--md-sys-color-primary: 210 24% 80%;           /* 主色 - 亮蓝色 */
--md-sys-color-on-primary: 210 24% 20%;        /* 主色上的文字 */
--md-sys-color-primary-container: 210 24% 30%; /* 主色容器 */
--md-sys-color-on-primary-container: 210 24% 90%;

--md-sys-color-secondary: 210 20% 80%;         /* 次色 - 亮蓝灰色 */
--md-sys-color-on-secondary: 210 20% 20%;
--md-sys-color-secondary-container: 210 20% 30%;
--md-sys-color-on-secondary-container: 210 20% 90%;

--md-sys-color-tertiary: 38 50% 80%;           /* 第三色 - 亮橙色 */
--md-sys-color-on-tertiary: 38 50% 20%;
--md-sys-color-tertiary-container: 38 50% 30%;
--md-sys-color-on-tertiary-container: 38 50% 90%;

--md-sys-color-error: 0 84% 80%;               /* 错误色 - 亮红色 */
--md-sys-color-on-error: 0 84% 20%;
--md-sys-color-error-container: 0 84% 30%;
--md-sys-color-on-error-container: 0 84% 90%;

--md-sys-color-background: 210 20% 6%;         /* 背景色 - 深灰 */
--md-sys-color-on-background: 210 20% 90%;

--md-sys-color-surface: 210 20% 8%;            /* 表面色 - 深灰 */
--md-sys-color-on-surface: 210 20% 90%;
--md-sys-color-surface-variant: 210 20% 20%;
--md-sys-color-on-surface-variant: 210 20% 70%;
```

### 1.2 色彩使用规范

#### 1.2.1 主色使用场景
- 主按钮 (Filled Button)
- 主要链接
- 重要操作的默认状态
- 激活状态的导航项

#### 1.2.2 次色使用场景
- 次要按钮 (Filled Tonal Button)
- 次要操作
- 辅助功能按钮

#### 1.2.3 错误色使用场景
- 错误提示
- 删除操作
- 警告提示
- 表单验证错误

#### 1.2.4 中性色使用场景
- 文字颜色
- 背景色
- 边框色
- 占位符

### 1.3 色彩对比度要求
- 正常文本: ≥ 4.5:1 (WCAG AA)
- 大号文本(18px+): ≥ 3:1
- UI组件: ≥ 3:1

---

## 2. 排版规范

### 2.1 字体层级

#### 2.1.1 Display (展示文本)
```css
Display Large:  57px / 64px / 400 / -0.25px
Display Medium: 45px / 52px / 400
Display Small:  36px / 44px / 400
```

#### 2.1.2 Headline (标题文本)
```css
Headline Large:  32px / 40px / 400
Headline Medium: 28px / 36px / 400
Headline Small:  24px / 32px / 400
```

#### 2.1.3 Title (标题)
```css
Title Large:  22px / 28px / 400
Title Medium: 16px / 24px / 500 / 0.15px
Title Small:  14px / 20px / 500 / 0.1px
```

#### 2.1.4 Body (正文)
```css
Body Large:  16px / 24px / 400 / 0.5px
Body Medium: 14px / 20px / 400 / 0.25px
Body Small:  12px / 16px / 400 / 0.4px
```

#### 2.1.5 Label (标签)
```css
Label Large:  14px / 20px / 500 / 0.1px
Label Medium: 12px / 16px / 500 / 0.5px
Label Small:  11px / 16px / 500 / 0.5px
```

### 2.2 字体使用规范

#### 2.2.1 字体族
```css
font-family: 'Roboto', system-ui, -apple-system, sans-serif;
```

#### 2.2.2 字重
- 正常文本: 400
- 强调文本: 500
- 标题: 400/500
- 按钮: 500

#### 2.2.3 行高
- 标题: 1.1-1.2
- 正文: 1.5-1.6
- 标签: 1.2-1.3

#### 2.2.4 字间距
- Display: -0.25px
- Headline: 0
- Title: 0.1-0.15px
- Body: 0.25-0.5px
- Label: 0.1-0.5px

### 2.3 文本样式工具类

```css
.md-sys-typescale-display-large
.md-sys-typescale-display-medium
.md-sys-typescale-display-small
.md-sys-typescale-headline-large
.md-sys-typescale-headline-medium
.md-sys-typescale-headline-small
.md-sys-typescale-title-large
.md-sys-typescale-title-medium
.md-sys-typescale-title-small
.md-sys-typescale-body-large
.md-sys-typescale-body-medium
.md-sys-typescale-body-small
.md-sys-typescale-label-large
.md-sys-typescale-label-medium
.md-sys-typescale-label-small
```

---

## 3. 圆角系统

### 3.1 圆角值定义

```css
--md-sys-shape-corner-none: 0;
--md-sys-shape-corner-extra-small: 6px;
--md-sys-shape-corner-small: 10px;
--md-sys-shape-corner-medium: 16px;
--md-sys-shape-corner-large: 20px;
--md-sys-shape-corner-extra-large: 32px;
--md-sys-shape-corner-full: 9999px;
```

### 3.2 圆角使用规范

| 组件类型 | 圆角值 | 说明 |
|---------|--------|------|
| 按钮 | Large (20px) | 主按钮圆角 |
| 输入框 | Extra Small (6px) | 表单输入 |
| 卡片 | Extra Large (32px) | 内容卡片 |
| 徽章 | Full (9999px) | 圆形徽章 |
| 头像 | Full (9999px) | 圆形头像 |
| 对话框 | Extra Large (32px) | 弹窗圆角 |
| 标签页 | Full (9999px) | 圆形标签 |
| 进度条 | Full (9999px) | 圆形进度 |
| 滑块 | Full (9999px) | 圆形滑块 |
| 下拉菜单 | Large (20px) | 菜单圆角 |
| 工具提示 | Medium (16px) | 提示圆角 |
| 警告框 | Large (20px) | 警告圆角 |
| 侧边栏 | Large (20px) | 侧边栏 |

### 3.3 圆角工具类

```css
.rounded-mdui-xs      /* Extra Small: 6px */
.rounded-mdui-sm      /* Small: 10px */
.rounded-mdui-md      /* Medium: 16px */
.rounded-mdui-lg      /* Large: 20px */
.rounded-mdui-xl      /* Extra Large: 32px */
.rounded-mdui-full    /* Full: 9999px */
```

---

## 4. 阴影系统

### 4.1 阴影层级

```css
--md-sys-elevation-level1: 0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.08);
--md-sys-elevation-level2: 0px 2px 6px rgba(0, 0, 0, 0.12), 0px 1px 3px rgba(0, 0, 0, 0.08);
--md-sys-elevation-level3: 0px 4px 12px rgba(0, 0, 0, 0.12), 0px 2px 4px rgba(0, 0, 0, 0.08);
--md-sys-elevation-level4: 0px 8px 20px rgba(0, 0, 0, 0.12), 0px 4px 8px rgba(0, 0, 0, 0.08);
--md-sys-elevation-level5: 0px 12px 28px rgba(0, 0, 0, 0.12), 0px 6px 12px rgba(0, 0, 0, 0.08);
```

### 4.2 阴影使用场景

| 悬浮层级 | 阴影 | 使用场景 |
|---------|------|---------|
| Level 1 | 0px 1px 3px | 按钮、卡片默认状态 |
| Level 2 | 0px 2px 6px | 悬浮卡片、输入框聚焦 |
| Level 3 | 0px 4px 12px | 悬浮按钮、对话框 |
| Level 4 | 0px 8px 20px | 悬浮悬浮按钮、弹窗 |
| Level 5 | 0px 12px 28px | 深度悬浮元素 |

### 4.3 阴影工具类

```css
.md-sys-elevation-1
.md-sys-elevation-2
.md-sys-elevation-3
.md-sys-elevation-4
.md-sys-elevation-5
```

### 4.4 扩展阴影效果

```css
.shadow-soft      /* 柔和阴影 */
.shadow-medium    /* 中等阴影 */
.shadow-strong    /* 强烈阴影 */
.shadow-colored   /* 彩色阴影 */
```

---

## 5. 动画系统

### 5.1 动画时长

```css
--md-sys-motion-duration-short1: 50ms;
--md-sys-motion-duration-short2: 100ms;
--md-sys-motion-duration-short3: 150ms;
--md-sys-motion-duration-short4: 200ms;
--md-sys-motion-duration-medium1: 250ms;
--md-sys-motion-duration-medium2: 300ms;
--md-sys-motion-duration-medium3: 350ms;
--md-sys-motion-duration-medium4: 400ms;
--md-sys-motion-duration-long1: 450ms;
--md-sys-motion-duration-long2: 500ms;
--md-sys-motion-duration-long3: 550ms;
--md-sys-motion-duration-long4: 600ms;
```

### 5.2 动画缓动

```css
--md-sys-motion-easing-linear: linear;
--md-sys-motion-easing-standard: linear;
--md-sys-motion-easing-standard-accelerate: linear;
--md-sys-motion-easing-standard-decelerate: linear;
--md-sys-motion-easing-emphasized: linear;
--md-sys-motion-easing-emphasized-accelerate: linear;
--md-sys-motion-easing-emphasized-decelerate: linear;
```

### 5.3 动画类型

#### 5.3.1 淡入淡出
```css
.md-motion-fade-in
.md-motion-fade-out
```

#### 5.3.2 缩放
```css
.md-motion-scale-in
.md-motion-scale-out
```

#### 5.3.3 滑动
```css
.md-motion-slide-up
.md-motion-slide-down
.md-motion-slide-in-from-left
.md-motion-slide-out-to-left
.md-motion-slide-in-from-right
.md-motion-slide-out-to-right
```

#### 5.3.4 页面过渡
```css
.page-enter
.page-exit
```

### 5.4 动画使用规范

| 动画类型 | 时长 | 缓动 | 使用场景 |
|---------|------|------|---------|
| 短动画 | 50-150ms | linear | 按钮交互、状态切换 |
| 中动画 | 200-350ms | linear | 对话框、侧边栏 |
| 长动画 | 400-600ms | linear | 页面过渡、复杂动画 |

---

## 6. 组件样式规范

### 6.1 按钮组件

#### 6.1.1 按钮变体

| 变体 | 背景色 | 文字色 | 使用场景 |
|------|--------|--------|---------|
| Filled | Primary | On Primary | 主要操作 |
| Filled Tonal | Secondary Container | On Secondary Container | 次要操作 |
| Filled Error | Error | On Error | 错误操作 |
| Outlined | Transparent | Primary | 次要操作 |
| Outlined Error | Transparent | Error | 错误操作 |
| Text | Transparent | Primary | 次要操作 |
| Text Error | Transparent | Error | 错误操作 |
| Elevated | Surface Container Low | Primary | 卡片内操作 |
| Tonal | Secondary Container | On Secondary Container | 次要操作 |
| Icon | Transparent | On Surface Variant | 图标按钮 |
| Icon Filled | Primary Container | On Primary Container | 主要图标 |
| Icon Tonal | Secondary Container | On Secondary Container | 次要图标 |
| Icon Outlined | Transparent | On Surface Variant | 图标按钮 |
| FAB | Primary Container | On Primary Container | 悬浮操作 |
| FAB Extended | Primary Container | On Primary Container | 文本悬浮操作 |
| Glass | Primary/10 | Primary | 玻璃态按钮 |

#### 6.1.2 按钮尺寸

| 尺寸 | 高度 | 内边距 | 字体 | 使用场景 |
|------|------|--------|------|---------|
| Default | 44px | 24px 10px | Label Large | 普通按钮 |
| Small | 36px | 16px 6px | Label Medium | 小按钮 |
| Large | 56px | 32px 16px | Label Large | 大按钮 |
| XL | 64px | 40px 20px | Title Small | 特大按钮 |
| Icon | 44px × 44px | - | - | 图标按钮 |
| FAB | 56px × 56px | - | - | 悬浮操作按钮 |

### 6.2 卡片组件

#### 6.2.1 卡片变体

| 变体 | 背景色 | 阴影 | 边框 | 使用场景 |
|------|--------|------|------|---------|
| Elevated | Surface | Level 1 | 无 | 默认卡片 |
| Filled | Surface Container Highest | None | 无 | 强调卡片 |
| Outlined | Surface | None | Outline Variant | 分隔卡片 |
| Glass | Surface/70 | Level 1 | Outline/15 | 玻璃态卡片 |
| Glass Light | Surface/70 | Level 1 | Outline/15 | 轻度玻璃态 |
| Glass Heavy | Surface/90 | Level 3 | Outline/25 | 重度玻璃态 |

#### 6.2.2 卡片尺寸

| 类型 | 圆角 | 内边距 | 最大宽度 |
|------|------|--------|---------|
| 默认 | Extra Large (32px) | 16px | 100% |
| 小卡片 | Large (20px) | 12px | 280px |
| 大卡片 | Extra Large (32px) | 24px | 100% |

### 6.3 输入框组件

#### 6.3.1 输入框状态

| 状态 | 边框色 | 阴影 | 背景色 |
|------|--------|------|--------|
| 默认 | Outline Variant | None | Surface/60 |
| 聚焦 | Primary/50 | 0 0 0 3px Primary/10 | Surface/80 |
| 错误 | Error | None | Surface |
| 禁用 | Outline/30 | None | Surface/50 |

#### 6.3.2 输入框尺寸

| 尺寸 | 高度 | 字体 | 内边距 |
|------|------|------|--------|
| Default | 48px | Body Medium | 16px |
| Small | 40px | Body Small | 12px |
| Large | 56px | Body Large | 20px |

### 6.4 对话框组件

#### 6.4.1 对话框样式

| 属性 | 值 |
|------|-----|
| 圆角 | Extra Large (32px) |
| 背景 | Surface/85 |
| 毛玻璃 | Blur 12px |
| 边框 | Outline Variant/15 |
| 阴影 | Level 4 |
| 最大宽度 | 480px (平板) / 100% (移动) |

#### 6.4.2 对话框动画

| 动画 | 时长 | 缓动 |
|------|------|------|
| 进入 | 300ms | Cubic(0.2, 0, 0, 1) |
| 退出 | 200ms | Cubic(0.4, 0, 1, 1) |

### 6.5 徽章组件

#### 6.5.1 徽章样式

| 属性 | 值 |
|------|-----|
| 圆角 | Full (9999px) |
| 字体 | Label Small (11px) |
| 内边距 | 0 4px |
| 高度 | 16px |
| 最小宽度 | 16px |

#### 6.5.2 徽章变体

| 变体 | 背景色 | 文字色 |
|------|--------|--------|
| Default | Error | On Error |
| Primary | Primary | On Primary |
| Secondary | Secondary | On Secondary |

### 6.6 侧边栏组件

#### 6.6.1 侧边栏样式

| 属性 | 值 |
|------|-----|
| 背景 | Surface/80 |
| 毛玻璃 | Blur 12px |
| 边框 | Outline Variant/15 |
| 圆角 | Large (20px) |
| 阴影 | Level 1 |

#### 6.6.2 侧边栏动画

| 动画 | 时长 | 缓动 |
|------|------|------|
| 进入 | 200ms | Cubic(0.4, 0, 0.2, 1) |
| 退出 | 200ms | Cubic(0.4, 0, 0.2, 1) |

---

## 7. 交互反馈机制

### 7.1 状态层

#### 7.1.1 状态层颜色

| 状态 | 透明度 |
|------|--------|
| Hover | 0.08 |
| Focus | 0.12 |
| Active | 0.16 |

#### 7.1.2 状态层动画

```css
transition: opacity 150ms linear;
```

### 7.2 涟漪效果

#### 7.2.1 涟漪参数

| 属性 | 值 |
|------|-----|
| 时长 | 250ms |
| 缩放 | 0 → 4 |
| 透明度 | 0.16 → 0 |
| 缓动 | linear |

### 7.3 悬浮效果

#### 7.3.1 悬浮提升

| 属性 | 值 |
|------|-----|
| 上移距离 | 4px |
| 阴影层级 | Level 3 |
| 时长 | 200ms |
| 缓动 | linear |

#### 7.3.2 悬浮缩放

| 属性 | 值 |
|------|-----|
| 缩放比例 | 1.02 |
| 时长 | 200ms |
| 缓动 | linear |

### 7.4 点击效果

#### 7.4.1 点击缩放

| 属性 | 值 |
|------|-----|
| 缩放比例 | 0.98 |
| 时长 | 200ms |
| 缓动 | linear |

---

## 8. 响应式布局

### 8.1 断点定义

```css
xs: 375px   /* 小手机 */
sm: 640px   /* 大手机/小平板 */
md: 768px   /* 平板 */
lg: 1024px  /* 小笔记本 */
xl: 1280px  /* 桌面 */
2xl: 1536px /* 大屏幕 */
```

### 8.2 容器宽度

| 断点 | 最大宽度 | 左右内边距 |
|------|---------|-----------|
| 默认 | 100% | 1rem |
| sm (640px) | 640px | 1.5rem |
| md (768px) | 768px | 1.5rem |
| lg (1024px) | 1024px | 2rem |
| xl (1280px) | 1280px | 2.5rem |
| 2xl (1536px) | 1400px | 3rem |

### 8.3 响应式字体

| 屏幕宽度 | 字体大小 |
|---------|---------|
| < 600px | 14px |
| 600-904px | 14px |
| 905-1239px | 15px |
| 1240-1439px | 15px |
| ≥ 1440px | 16px |

### 8.4 移动端适配

#### 8.4.1 最小触摸区域

```css
min-width: 48px;
min-height: 48px;
```

#### 8.4.2 安全区域

```css
safe-top: env(safe-area-inset-top)
safe-bottom: env(safe-area-inset-bottom)
safe-left: env(safe-area-inset-left)
safe-right: env(safe-area-inset-right)
```

---

## 9. 毛玻璃效果

### 9.1 毛玻璃参数

```css
--glass-blur-light: 8px;
--glass-blur-medium: 16px;
--glass-blur-heavy: 24px;
--glass-blur-ultra: 40px;

--glass-opacity-light: 0.7;
--glass-opacity-medium: 0.8;
--glass-opacity-heavy: 0.9;
```

### 9.2 毛玻璃组件

#### 9.2.1 毛玻璃卡片

| 变体 | 模糊 | 透明度 | 边框 |
|------|------|--------|------|
| Light | 8px | 0.7 | Outline/15 |
| Medium | 16px | 0.8 | Outline/20 |
| Heavy | 24px | 0.9 | Outline/25 |

#### 9.2.2 毛玻璃对话框

| 属性 | 值 |
|------|-----|
| 模糊 | 24px |
| 透明度 | 0.95 |
| 边框 | Outline/30 |
| 阴影 | Level 4 |

#### 9.2.3 毛玻璃导航栏

| 属性 | 值 |
|------|-----|
| 模糊 | 24px |
| 透明度 | 0.85 |
| 边框 | Outline/15 |

---

## 10. 无障碍设计

### 10.1 色彩对比度

- 正常文本: ≥ 4.5:1 (WCAG AA)
- 大号文本: ≥ 3:1
- UI组件: ≥ 3:1

### 10.2 最小触摸区域

- 按钮: 48px × 48px
- 链接: 48px × 48px
- 输入框: 44px 高度

### 10.3 焦点可见性

```css
focus-visible:outline-2
focus-visible:ring-offset-2
focus-visible:ring-primary
```

### 10.4 减少动画偏好

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. 性能优化

### 11.1 GPU加速

```css
transform: translateZ(0);
backface-visibility: hidden;
perspective: 1000px;
```

### 11.2 内容可见性

```css
content-visibility: auto;
```

### 11.3 will-change优化

```css
will-change: transform;
will-change: opacity;
will-change: scroll-position;
```

### 11.4 contain属性

```css
contain: layout;
contain: paint;
contain: strict;
```

---

## 12. 主题切换

### 12.1 主题类名

```css
.dark  /* 深色主题 */
```

### 12.2 主题切换动画

| 属性 | 值 |
|------|-----|
| 时长 | 300ms |
| 缓动 | linear |

---

## 13. 设计原则

### 13.1 材料设计3原则

1. **材料 metaphor**: 元素具有物理质感
2. **生动的视觉**: 动画和过渡效果
3. **有意义的动画**: 动画有目的性和连贯性

### 13.2 交互原则

1. **即时反馈**: 操作后立即反馈
2. **可撤销**: 提供撤销操作
3. **可预测**: 行为符合用户预期
4. **高效**: 减少用户操作步骤

### 13.3 视觉原则

1. **一致性**: 统一的设计语言
2. **层次**: 明确的信息层次
3. **留白**: 合理的空白区域
4. **对齐**: 元素对齐一致

---

## 14. 实施指南

### 14.1 CSS变量使用

```css
/* 使用 CSS 变量 */
background: hsl(var(--md-sys-color-primary));
color: hsl(var(--md-sys-color-on-primary));

/* 使用 Tailwind 工具类 */
className="bg-primary text-on-primary"
```

### 14.2 组件使用

```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 按钮
<Button variant="filled" size="default">按钮</Button>

// 卡片
<Card variant="elevated">
  <CardHeader>
    <CardTitle>标题</CardTitle>
    <CardDescription>描述</CardDescription>
  </CardHeader>
  <CardContent>内容</CardContent>
</Card>
```

### 14.3 工具类使用

```tsx
<div className="md-sys-shape-corner-xl md-sys-elevation-3">
  <div className="md-sys-typescale-title-large">标题</div>
  <div className="md-sys-typescale-body-medium">正文</div>
</div>
```

---

## 15. 版本历史

### 1.0.0 (2026-04-04)
- 初始版本发布
- 实现 MDUI 3 设计系统
- 完整的色彩系统
- 完整的组件样式
- 响应式布局支持
- 毛玻璃效果
- 动画系统

---

## 16. 参考资源

- [Material Design 3](https://m3.material.io/)
- [MDUI 3](https://mdui.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/)

---

**文档维护**: HMNL 设计团队  
**最后更新**: 2026-04-04
