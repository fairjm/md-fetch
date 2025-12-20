# md-fetch

[English](./README.md)

将网页内容转换为干净的 Markdown 格式的命令行工具。

## 作者

由 **Claude Code** 和 **Claude Sonnet** 开发

## 特性

- 🚀 使用原生 fetch API 获取网页内容
- 🌐 支持无头浏览器模式（Puppeteer）处理 SPA 页面
- 📄 使用 Mozilla Readability 提取主要内容
- ✨ 使用 Turndown 将 HTML 转换为 Markdown
- 📋 **自动生成 YAML frontmatter**（包含标题、URL、作者、发布时间等元数据）
- 🎯 支持自定义 CSS 选择器提取内容
- 🔒 代理支持（HTTP_PROXY/HTTPS_PROXY 环境变量）
- ⚙️ 可配置的超时、headers 等选项
- 🔄 自动重试（3 次，指数退避）
- 📦 最小化依赖

## 安装

### 开发环境安装

```bash
# 克隆项目（如果还没有）
git clone <repo-url>
cd md-fetch

# 安装依赖
pnpm install
```

### 全局安装

**使用 pnpm:**

```bash
# 1. 构建项目
pnpm build

# 2. 配置 pnpm（首次使用需要）
pnpm setup

# 3. 全局链接（开发时推荐）
pnpm link --global

# 4. 现在可以在任何位置使用 md-fetch 命令
md-fetch https://example.com
```

**使用 npm:**

```bash
# 1. 构建项目
pnpm build

# 2. 全局链接
npm link

# 3. 现在可以在任何位置使用 md-fetch 命令
md-fetch https://example.com
```

### 修改代码后重新安装

```bash
# 1. 重新构建
pnpm build

# 2. 无需重新 link，构建后会自动生效
md-fetch https://example.com
```

### 卸载

**使用 pnpm:**

```bash
# 取消全局链接
pnpm unlink --global

# 可选：清理 pnpm 全局 store 中未被引用的包（释放磁盘空间）
pnpm store prune
```

**使用 npm:**

```bash
# 取消全局链接
npm unlink -g md-fetch
```

**删除项目:**

```bash
# 如果想完全删除项目，直接删除项目目录即可
cd ..
rm -rf md-fetch  # 或在 Windows 上使用 rmdir /s md-fetch
```

## 使用

### 开发模式

```bash
# 基本使用 - 输出到 stdout
pnpm dev -- https://example.com

# 保存到文件
pnpm dev -- https://example.com -o output.md

# 浏览器模式（用于 SPA 页面）
pnpm dev -- -b https://react-app.example.com

# 禁用 readability，保留完整内容
pnpm dev -- https://example.com -R
# 或使用完整选项名
pnpm dev -- https://example.com --no-readability

# 使用自定义选择器
pnpm dev -- https://example.com -s "article.main-content"

# 处理多个 URL
pnpm dev -- https://example.com https://httpbin.org/html

# 自定义 HTTP headers
pnpm dev -- https://example.com -H "Authorization: Bearer token"

# 使用代理
pnpm dev -- https://example.com --proxy http://proxy.example.com:8080

# 详细日志
pnpm dev -- https://example.com --verbose

# 查看所有选项
pnpm dev -- --help
```

### 生产使用（全局安装后）

```bash
# 基本使用
md-fetch https://example.com

# 保存到文件
md-fetch https://example.com -o article.md

# 浏览器模式
md-fetch -b https://react-app.example.com

# 使用代理（从环境变量）
export HTTPS_PROXY=http://proxy.example.com:8080
md-fetch https://example.com
```

## 输出示例

md-fetch 会自动在 Markdown 文件开头添加 YAML frontmatter，包含页面的元数据：

```markdown
---
title: "Example Domain"
url: https://example.com
description: "Example Domain description"
author: "John Doe"
siteName: "Example"
publishedTime: 2024-01-01T00:00:00Z
modifiedTime: 2024-01-15T10:30:00Z
keywords:
  - example
  - demo
  - test
image: https://example.com/og-image.jpg
lang: en
---

# Example Domain

This domain is for use in illustrative examples...
```

### Frontmatter 字段说明

- `title` - 页面标题（优先从 Readability、Open Graph、Twitter Cards 或 `<title>` 标签提取）
- `url` - 原始 URL
- `description` - 页面描述或摘要
- `author` - 作者信息
- `siteName` - 站点名称
- `publishedTime` - 发布时间（ISO 8601 格式）
- `modifiedTime` - 最后修改时间（ISO 8601 格式）
- `keywords` - 关键词数组
- `image` - 页面主图片（Open Graph 或 Twitter Cards）
- `lang` - 页面语言代码

## CLI 选项

```
Usage: md-fetch <urls...> [options]

Arguments:
  urls                         URLs to convert to Markdown

Options:
  -V, --version                output the version number
  -o, --output <file>          Output to file instead of stdout
  -b, --browser                Use headless browser mode (for SPA pages)
  --browser-path <path>        Custom Chrome/Chromium executable path
  -R, --no-readability         Disable readability, keep full HTML content
  -s, --selector <selector>    Custom CSS selector to extract content
  -H, --header <header>        Custom HTTP header (can be repeated)
  --proxy <url>                Proxy server URL (also reads HTTP_PROXY/HTTPS_PROXY env vars)
  -t, --timeout <ms>           Request timeout in milliseconds (default: 30000)
  --user-agent <string>        Custom user agent (default: "md-fetch/1.0.0")
  --wait-until <event>         Browser wait condition (load|domcontentloaded|networkidle0|networkidle2)
  --verbose                    Enable verbose logging
  -h, --help                   display help for command
```

## 技术栈

- **TypeScript** - 类型安全
- **Node.js ≥18** - 使用原生 fetch API
- **ES 模块** - 现代 JavaScript
- **Commander** - CLI 参数解析
- **Mozilla Readability** - 智能内容提取
- **Turndown** - HTML 转 Markdown
- **JSDOM** - DOM 解析
- **Puppeteer-core** - 无头浏览器支持
- **Undici** - 代理支持

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev -- <url>

# 构建
pnpm build

# 运行测试
pnpm test
```

## 工作原理

1. **Fetch** - 使用原生 fetch 或 Puppeteer 无头浏览器获取 HTML 内容
2. **Extract** - 使用 Readability 或自定义选择器提取主要内容，同时提取页面元数据
3. **Convert** - 使用 Turndown 转换为 Markdown
4. **Generate Frontmatter** - 从提取的元数据生成 YAML frontmatter
5. **Output** - 将 frontmatter 和 Markdown 内容输出到 stdout 或保存到文件

## 代理支持

md-fetch 自动从环境变量读取代理配置：

```bash
# 设置代理
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080

# 排除某些域名
export NO_PROXY=localhost,127.0.0.1,.example.com

# 或通过命令行参数
md-fetch https://example.com --proxy http://proxy.example.com:8080
```

## 许可

MIT
