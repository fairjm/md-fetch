# md-fetch - Web Content Processing CLI Tools

## 项目概述
一套基于 Node.js 的 CLI 工具集，包含：
1. **md-fetch** - 将 URL 内容转换为干净的 Markdown 格式
2. **md-fetch-screen** - 对网页进行高质量截图

## 技术栈
- **语言**: TypeScript (ES 模块)
- **运行时**: Node.js ≥18
- **包管理器**: pnpm
- **核心依赖**:
  - `commander`: CLI 参数解析
  - `@mozilla/readability`: 内容提取
  - `turndown`: HTML 转 Markdown
  - `puppeteer-core`: 无头浏览器（不自带 Chrome）
  - `jsdom`: DOM 解析
  - `undici`: 代理支持

## 架构设计

### md-fetch 核心处理流程
```
URL 输入 → Processor
         ↓
   fetch/browser (获取 HTML)
         ↓
   Extractor (提取内容 + 元数据)
         ↓
   Converter (转为 Markdown)
         ↓
   Generate Frontmatter (生成 YAML)
         ↓
   输出 (stdout/file)
```

### md-fetch-screen 截图流程
```
URL 输入 → Screenshotter
         ↓
   Browser.launch (启动浏览器)
         ↓
   Page.setViewport (设置视口 + 像素比例)
         ↓
   Page.goto (导航到 URL)
         ↓
   隐藏元素 (可选)
         ↓
   延迟等待 (可选)
         ↓
   Screenshot (全页/视口/元素)
         ↓
   保存文件 (自动命名)
```

### 关键模块
- **fetcher** (`src/core/fetcher.ts`): 使用原生 fetch 执行 HTTP 请求
- **browser** (`src/core/browser.ts`): Puppeteer 集成，用于 SPA 页面
- **extractor** (`src/core/extractor.ts`): 使用 readability 提取主要内容和元数据
- **converter** (`src/core/converter.ts`): 使用 turndown 将 HTML 转为 Markdown
- **processor** (`src/core/processor.ts`): 协调 Markdown 转换流程
- **screenshotter** (`src/core/screenshotter.ts`): 截图核心类，管理浏览器和截图逻辑
- **filename-sanitizer** (`src/utils/filename-sanitizer.ts`): URL 安全化和时间戳生成
- **cli** (`src/cli.ts`): md-fetch CLI 接口和参数解析
- **screen-cli** (`src/screen-cli.ts`): md-fetch-screen CLI 接口和参数解析

## 开发命令
```bash
# 安装依赖
pnpm install

# 开发模式运行
pnpm dev <url>

# 构建
pnpm build

# 测试
pnpm test
```

## 项目结构
```
md-fetch/
├── src/
│   ├── index.ts              # md-fetch CLI 入口点
│   ├── cli.ts                # md-fetch CLI 参数解析
│   ├── screen.ts             # md-fetch-screen CLI 入口点
│   ├── screen-cli.ts         # md-fetch-screen CLI 参数解析
│   ├── constants.ts          # 常量定义
│   ├── core/
│   │   ├── fetcher.ts        # HTTP fetch 逻辑
│   │   ├── browser.ts        # Puppeteer 浏览器管理
│   │   ├── extractor.ts      # 内容提取
│   │   ├── converter.ts      # HTML 转 Markdown
│   │   ├── processor.ts      # Markdown 主处理编排器
│   │   └── screenshotter.ts  # 截图核心类
│   ├── utils/
│   │   ├── frontmatter.ts    # YAML frontmatter 生成
│   │   └── filename-sanitizer.ts  # 文件名安全化
│   └── types/
│       └── index.ts          # TypeScript 类型定义
├── dist/                     # 构建输出
│   ├── index.js              # md-fetch 可执行文件
│   └── screen.js             # md-fetch-screen 可执行文件
└── package.json              # 包配置（定义两个可执行命令）
```

## 设计决策
1. **puppeteer-core**: 不捆绑浏览器，减小包体积，用户需自行安装 Chrome
2. **ES 模块**: 使用现代 Node.js 模块系统
3. **TypeScript 严格模式**: 确保类型安全
4. **最小化依赖**: 只保留核心功能必需的依赖

## CLI 用法示例

### md-fetch (Markdown 转换)
```bash
# 基本使用
md-fetch https://example.com

# 保存到文件
md-fetch https://example.com -o article.md

# 浏览器模式（用于 SPA）
md-fetch https://react-app.com -b

# 自定义选择器
md-fetch https://example.com -s "article.main-content"

# 多个 URL
md-fetch url1.com url2.com url3.com

# 自定义 headers
md-fetch https://example.com -H "Authorization: Bearer token"

# 详细日志
md-fetch https://example.com --verbose
```

### md-fetch-screen (网页截图)
```bash
# 基本截图（全页，标准分辨率）
md-fetch-screen https://example.com

# 视口截图，自定义尺寸
md-fetch-screen https://example.com --viewport -W 1440 -H 900

# 高清截图（2倍像素比例）
md-fetch-screen https://example.com --scale 2

# 截取特定元素
md-fetch-screen https://example.com --selector "#main-content"

# 隐藏广告和弹窗
md-fetch-screen https://example.com --hide ".ad,.popup"

# JPEG 格式，指定输出目录
md-fetch-screen https://example.com --format jpeg --quality 85 --output ./screenshots

# 等待页面加载后延迟截图
md-fetch-screen https://example.com --wait-until networkidle0 --delay 2000

# 批量截图
md-fetch-screen https://site1.com https://site2.com https://site3.com

# 详细日志
md-fetch-screen https://example.com --verbose
```

## 错误处理
- **网络错误**: 自动重试 3 次，带指数退避
- **浏览器错误**: 提供清晰的 Chrome 安装提示
- **提取错误**: 如果 readability 失败，回退到原始 HTML
- **批量处理**: 单个失败不影响其他 URL，最后汇总报告

## 当前状态

### md-fetch 已实现功能
- ✅ HTTP fetch 获取网页内容
- ✅ Readability 内容提取
- ✅ HTML 转 Markdown
- ✅ YAML frontmatter 自动生成
- ✅ 输出到 stdout 或文件
- ✅ 自定义选择器提取
- ✅ 禁用 readability 选项
- ✅ 自定义 HTTP headers
- ✅ 超时配置
- ✅ 详细日志模式
- ✅ 多个 URL 处理
- ✅ 自动重试（3次，指数退避）
- ✅ 浏览器模式（Puppeteer 无头浏览器）
- ✅ 代理支持（环境变量 HTTP_PROXY/HTTPS_PROXY/NO_PROXY）

### md-fetch-screen 已实现功能
- ✅ 全页截图模式
- ✅ 视口截图模式
- ✅ 自定义视口尺寸（宽度/高度）
- ✅ 设备像素比例（scale）支持高清截图
- ✅ 多种图片格式（PNG/JPEG/WebP）
- ✅ 质量控制（JPEG/WebP）
- ✅ 截取特定元素（CSS 选择器）
- ✅ 隐藏元素功能
- ✅ 截图前延迟
- ✅ 自动文件命名（URL + 时间戳）
- ✅ 批量截图
- ✅ 代理支持
- ✅ 详细日志模式
- ✅ 参数验证和错误处理

### 待实现功能
- ⏳ 从文件批量读取 URL
