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
