import puppeteer, { type Browser, type Page, type PuppeteerLaunchOptions } from 'puppeteer-core';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import type { ScreenshotOptions, ScreenshotResult } from '../types/index.js';
import { ScreenshotError } from '../types/index.js';
import { DEFAULT_TIMEOUT, DEFAULT_WAIT_UNTIL } from '../constants.js';
import { generateScreenshotFilename } from '../utils/filename-sanitizer.js';

export class Screenshotter {
  private browser: Browser | null = null;
  private options: ScreenshotOptions;

  constructor(options: ScreenshotOptions) {
    this.options = options;
  }

  /**
   * 启动浏览器实例
   */
  async launch(): Promise<void> {
    if (this.browser) {
      return; // 已启动
    }

    const {
      browserOptions: {
        executablePath,
        headless = true,
        timeout = DEFAULT_TIMEOUT,
        proxy
      }
    } = this.options;

    // 查找 Chrome 可执行文件
    const chromePath = executablePath || this.findChromePath();

    if (!chromePath) {
      throw new ScreenshotError(
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
      throw new ScreenshotError(
        '',
        `Failed to launch browser: ${(error as Error).message}`
      );
    }
  }

  /**
   * 对 URL 进行截图
   */
  async screenshot(url: string): Promise<ScreenshotResult> {
    if (!this.browser) {
      await this.launch();
    }

    const {
      fullPage,
      width,
      height,
      deviceScaleFactor,
      outputDir,
      format,
      quality,
      browserOptions: {
        waitUntil = DEFAULT_WAIT_UNTIL,
        timeout = DEFAULT_TIMEOUT,
        userAgent
      },
      delay,
      selector,
      hideSelectors,
      verbose
    } = this.options;

    let page: Page | null = null;

    try {
      page = await this.browser!.newPage();

      // 设置视口
      await page.setViewport({
        width,
        height,
        deviceScaleFactor
      });

      // 设置 User-Agent
      if (userAgent) {
        await page.setUserAgent(userAgent);
      }

      // 设置超时
      page.setDefaultTimeout(timeout);

      if (verbose) {
        console.log(`Navigating to ${url}...`);
      }

      // 导航到页面
      await page.goto(url, {
        waitUntil,
        timeout
      });

      // 隐藏指定的元素
      if (hideSelectors && hideSelectors.length > 0) {
        if (verbose) {
          console.log(`Hiding elements: ${hideSelectors.join(', ')}`);
        }

        await page.evaluate((selectors) => {
          selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              (el as HTMLElement).style.display = 'none';
            });
          });
        }, hideSelectors);
      }

      // 延迟截图（如果指定）
      if (delay && delay > 0) {
        if (verbose) {
          console.log(`Waiting ${delay}ms before screenshot...`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // 确保输出目录存在
      await this.ensureOutputDir(outputDir);

      // 生成文件名
      const filename = generateScreenshotFilename(url, format);
      const filepath = join(outputDir, filename);

      if (verbose) {
        console.log(`Taking screenshot...`);
      }

      // 截图选项
      const screenshotOptions: any = {
        path: filepath,
        type: format
      };

      // 添加质量参数（仅 JPEG 和 WebP）
      if ((format === 'jpeg' || format === 'webp') && quality !== undefined) {
        screenshotOptions.quality = quality;
      }

      // 根据选择器或全页模式截图
      if (selector) {
        // 截取特定元素
        const element = await page.$(selector);
        if (!element) {
          throw new ScreenshotError(url, `Element not found: ${selector}`);
        }
        await element.screenshot(screenshotOptions);
      } else {
        // 全页或视口截图
        screenshotOptions.fullPage = fullPage;
        await page.screenshot(screenshotOptions);
      }

      if (verbose) {
        console.log(`Screenshot saved to: ${filepath}`);
      }

      return {
        url,
        filepath,
        success: true
      };
    } catch (error) {
      return {
        url,
        success: false,
        error: new ScreenshotError(
          url,
          `Failed to take screenshot: ${(error as Error).message}`
        )
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * 批量截图
   */
  async screenshotBatch(urls: string[]): Promise<ScreenshotResult[]> {
    const results: ScreenshotResult[] = [];

    for (const url of urls) {
      const result = await this.screenshot(url);
      results.push(result);
    }

    return results;
  }

  /**
   * 关闭浏览器实例
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * 确保输出目录存在
   */
  private async ensureOutputDir(dir: string): Promise<void> {
    try {
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
    } catch (error) {
      throw new ScreenshotError(
        '',
        `Failed to create output directory: ${(error as Error).message}`
      );
    }
  }

  /**
   * 查找 Chrome 可执行文件路径
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
