import type { PuppeteerLifeCycleEvent } from 'puppeteer-core';

// Fetch 相关选项
export interface FetchOptions {
  headers?: Record<string, string>;
  proxy?: string;
  timeout?: number;
  userAgent?: string;
}

// 浏览器相关选项
export interface BrowserOptions {
  executablePath?: string;
  waitUntil?: PuppeteerLifeCycleEvent;
  timeout?: number;
  userAgent?: string;
  proxy?: string;
  headless?: boolean;
}

// 内容提取选项
export interface ExtractOptions {
  useReadability: boolean;
  selector?: string;
}

// 页面元数据
export interface PageMetadata {
  url: string;
  title?: string;
  description?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  siteName?: string;
  keywords?: string[];
  image?: string;
  lang?: string;
}

// 提取结果（包含内容和元数据）
export interface ExtractedContent {
  content: string;
  metadata: PageMetadata;
}

// Markdown 转换选项
export interface ConversionOptions {
  headingStyle?: 'atx' | 'setext';
  codeBlockStyle?: 'fenced' | 'indented';
  bulletListMarker?: '-' | '+' | '*';
}

// 处理选项（综合所有选项）
export interface ProcessOptions {
  useBrowser: boolean;
  useReadability: boolean;
  selector?: string;
  fetchOptions: FetchOptions;
  browserOptions?: BrowserOptions;
  conversionOptions?: ConversionOptions;
  verbose?: boolean;
}

// 批量处理结果
export interface FetchResult {
  url: string;
  markdown?: string;
  error?: Error;
  success: boolean;
}

// CLI 命令行选项
export interface CLIOptions {
  output?: string;
  browser?: boolean;
  browserPath?: string;
  readability?: boolean;
  selector?: string;
  file?: string;
  header?: string[];
  proxy?: string;
  timeout?: number;
  config?: string;
  userAgent?: string;
  waitUntil?: string;
  concurrent?: number;
  verbose?: boolean;
}

// 配置文件结构
export interface Config {
  browser?: {
    executablePath?: string;
    waitUntil?: string;
  };
  fetch?: {
    timeout?: number;
    headers?: Record<string, string>;
    proxy?: string;
  };
  conversion?: {
    headingStyle?: 'atx' | 'setext';
    codeBlockStyle?: 'fenced' | 'indented';
    bulletListMarker?: '-' | '+' | '*';
  };
  defaults?: {
    useReadability?: boolean;
    concurrent?: number;
  };
}

// 自定义错误类型
export class FetchError extends Error {
  constructor(
    public url: string,
    public statusCode?: number,
    message?: string
  ) {
    super(message || `Failed to fetch ${url}`);
    this.name = 'FetchError';
  }
}

export class BrowserError extends Error {
  constructor(
    public url: string,
    message: string
  ) {
    super(message);
    this.name = 'BrowserError';
  }
}

export class ExtractionError extends Error {
  constructor(
    public url: string,
    message: string
  ) {
    super(message);
    this.name = 'ExtractionError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ==================== 截图相关类型定义 ====================

// 截图选项
export interface ScreenshotOptions {
  // 截图模式
  fullPage: boolean;

  // 视口配置
  width: number;
  height: number;
  deviceScaleFactor: number; // 设备像素比例（1/2/3）

  // 输出配置
  outputDir: string;
  format: 'png' | 'jpeg' | 'webp';
  quality?: number; // JPEG/WebP 质量（0-100）

  // 浏览器配置
  browserOptions: BrowserOptions;

  // 页面配置
  delay?: number; // 截图前延迟（毫秒）
  selector?: string; // 截取特定元素
  hideSelectors?: string[]; // 隐藏的元素选择器列表

  // 其他
  verbose?: boolean;
}

// 截图 CLI 命令行选项
export interface ScreenshotCLIOptions {
  // 尺寸和视图
  fullPage?: boolean;
  viewport?: boolean;
  width?: number;
  height?: number;
  scale?: number;

  // 输出
  output?: string;
  format?: string;
  quality?: number;

  // 浏览器
  browserPath?: string;
  waitUntil?: string;
  timeout?: number;
  userAgent?: string;
  proxy?: string;

  // 内容
  delay?: number;
  selector?: string;
  hide?: string;

  // 其他
  verbose?: boolean;
}

// 截图结果
export interface ScreenshotResult {
  url: string;
  filepath?: string;
  success: boolean;
  error?: Error;
}

export class ScreenshotError extends Error {
  constructor(
    public url: string,
    message: string
  ) {
    super(message);
    this.name = 'ScreenshotError';
  }
}
