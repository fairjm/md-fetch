# md-fetch - Web to Markdown CLI Tool

## 项目概述
一个基于 Node.js 的 CLI 工具，用于将 URL 内容转换为干净的 Markdown 格式。

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

### 核心处理流程
```
URL 输入 → Processor
         ↓
   fetch/browser (获取 HTML)
         ↓
   Extractor (提取内容)
         ↓
   Converter (转为 Markdown)
         ↓
   输出 (stdout/file)
```

### 关键模块
- **fetcher** (`src/core/fetcher.ts`): 使用原生 fetch 执行 HTTP 请求
- **browser** (`src/core/browser.ts`): Puppeteer 集成，用于 SPA 页面
- **extractor** (`src/core/extractor.ts`): 使用 readability 提取主要内容
- **converter** (`src/core/converter.ts`): 使用 turndown 将 HTML 转为 Markdown
- **processor** (`src/core/processor.ts`): 协调整个处理流程
- **cli** (`src/cli.ts`): CLI 接口和参数解析

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
│   ├── index.ts              # CLI 入口点
│   ├── cli.ts                # CLI 参数解析
│   ├── constants.ts          # 常量定义
│   ├── core/
│   │   ├── fetcher.ts        # HTTP fetch 逻辑
│   │   ├── browser.ts        # Puppeteer 浏览器管理
│   │   ├── extractor.ts      # 内容提取
│   │   ├── converter.ts      # HTML 转 Markdown
│   │   └── processor.ts      # 主处理编排器
│   ├── utils/
│   │   ├── config.ts         # 配置文件处理
│   │   ├── logger.ts         # 日志工具
│   │   ├── validator.ts      # 输入验证
│   │   └── file.ts           # 文件 I/O
│   └── types/
│       └── index.ts          # TypeScript 类型定义
├── dist/                     # 构建输出
├── tests/                    # 测试文件
└── bin/
    └── md-fetch.js           # 可执行入口
```

## 设计决策
1. **puppeteer-core**: 不捆绑浏览器，减小包体积，用户需自行安装 Chrome
2. **ES 模块**: 使用现代 Node.js 模块系统
3. **TypeScript 严格模式**: 确保类型安全
4. **最小化依赖**: 只保留核心功能必需的依赖

## CLI 用法示例
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

## 错误处理
- **网络错误**: 自动重试 3 次，带指数退避
- **浏览器错误**: 提供清晰的 Chrome 安装提示
- **提取错误**: 如果 readability 失败，回退到原始 HTML
- **批量处理**: 单个失败不影响其他 URL，最后汇总报告

## 当前状态

### 已实现功能
- ✅ HTTP fetch 获取网页内容
- ✅ Readability 内容提取
- ✅ HTML 转 Markdown
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

### 待实现功能
- ⏳ 从文件批量读取 URL
