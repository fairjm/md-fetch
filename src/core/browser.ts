import puppeteer, { type Browser, type Page, type PuppeteerLaunchOptions } from 'puppeteer-core';
import type { BrowserOptions } from '../types/index.js';
import { BrowserError } from '../types/index.js';
import { DEFAULT_TIMEOUT, DEFAULT_WAIT_UNTIL } from '../constants.js';
import { existsSync } from 'fs';

export class BrowserFetcher {
  private browser: Browser | null = null;
  private options: BrowserOptions;

  constructor(options: BrowserOptions = {}) {
    this.options = options;
  }

  /**
   * Launch browser instance
   */
  async launch(): Promise<void> {
    if (this.browser) {
      return; // Already launched
    }

    const {
      executablePath,
      headless = true,
      timeout = DEFAULT_TIMEOUT,
      proxy
    } = this.options;

    // 查找 Chrome 可执行文件
    const chromePath = executablePath || this.findChromePath();

    if (!chromePath) {
      throw new BrowserError(
        '',
        'Chrome/Chromium not found. Please install Chrome or specify the path with --browser-path'
      );
    }

    const launchOptions: PuppeteerLaunchOptions = {
      executablePath: chromePath,
      headless,
      timeout,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    };

    // 添加代理参数
    if (proxy) {
      launchOptions.args!.push(`--proxy-server=${proxy}`);
    }

    try {
      this.browser = await puppeteer.launch(launchOptions);
    } catch (error) {
      throw new BrowserError(
        '',
        `Failed to launch browser: ${(error as Error).message}`
      );
    }
  }

  /**
   * Fetch page content using browser
   */
  async fetchPage(url: string): Promise<string> {
    if (!this.browser) {
      await this.launch();
    }

    const {
      waitUntil = DEFAULT_WAIT_UNTIL,
      timeout = DEFAULT_TIMEOUT,
      userAgent
    } = this.options;

    let page: Page | null = null;

    try {
      page = await this.browser!.newPage();

      // 设置 User-Agent
      if (userAgent) {
        await page.setUserAgent(userAgent);
      }

      // 设置超时
      page.setDefaultTimeout(timeout);

      // 导航到页面
      await page.goto(url, {
        waitUntil,
        timeout
      });

      // 获取 HTML 内容
      const html = await page.content();

      return html;
    } catch (error) {
      throw new BrowserError(
        url,
        `Failed to fetch page: ${(error as Error).message}`
      );
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Close browser instance
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Find Chrome executable path
   */
  private findChromePath(): string | undefined {
    // 常见的 Chrome 安装路径
    const possiblePaths = [
      // Windows
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
      // macOS
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      // Linux
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium'
    ];

    // 尝试查找可用的路径
    for (const path of possiblePaths) {
      try {
        if (existsSync(path)) {
          return path;
        }
      } catch {
        continue;
      }
    }

    // 从环境变量读取
    return process.env.CHROME_PATH || process.env.CHROMIUM_PATH;
  }
}
