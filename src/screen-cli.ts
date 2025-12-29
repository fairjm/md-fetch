import { Command } from 'commander';
import { Screenshotter } from './core/screenshotter.js';
import type { ScreenshotCLIOptions, ScreenshotOptions, BrowserOptions } from './types/index.js';
import { DEFAULT_TIMEOUT, DEFAULT_WAIT_UNTIL } from './constants.js';

export class ScreenCLI {
  private program: Command;

  constructor() {
    this.program = new Command();
    this.setupCommands();
  }

  /**
   * 解析整数选项
   */
  private parseIntOption(value: string): number {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error(`Invalid number: ${value}`);
    }
    return parsed;
  }

  private setupCommands(): void {
    this.program
      .name('md-fetch-screen')
      .description('Take screenshots of web pages using headless browser')
      .version('1.0.0')
      .argument('<urls...>', 'URLs to screenshot')
      // 尺寸和视图相关（保留简写）
      .option('-f, --full-page', 'Full page screenshot (default)')
      .option('--viewport', 'Viewport-only screenshot')
      .option('-W, --width <pixels>', 'Viewport width in pixels', this.parseIntOption, 1920)
      .option('-H, --height <pixels>', 'Viewport height in pixels', this.parseIntOption, 1080)
      .option('--scale <number>', 'Device scale factor for high-DPI screenshots (1/2/3)', parseFloat, 1)
      // 输出相关
      .option('--output <dir>', 'Output directory', '.')
      .option('--format <type>', 'Image format (png|jpeg|webp)', 'png')
      .option('--quality <number>', 'JPEG/WebP quality (0-100)', this.parseIntOption, 90)
      // 浏览器相关
      .option('--browser-path <path>', 'Custom Chrome/Chromium executable path')
      .option('--wait-until <event>', 'Browser wait condition (load|domcontentloaded|networkidle0|networkidle2)', DEFAULT_WAIT_UNTIL)
      .option('--timeout <ms>', 'Request timeout in milliseconds', this.parseIntOption, DEFAULT_TIMEOUT)
      .option('--user-agent <string>', 'Custom user agent')
      .option('--proxy <url>', 'Proxy server URL')
      // 内容相关
      .option('--delay <ms>', 'Delay before screenshot in milliseconds', this.parseIntOption, 0)
      .option('--selector <css>', 'CSS selector to screenshot specific element')
      .option('--hide <selectors>', 'CSS selectors to hide (comma-separated)')
      // 其他
      .option('--verbose', 'Enable verbose logging', false)
      .action(async (urls: string[], options: ScreenshotCLIOptions) => {
        await this.handleScreenshot(urls, options);
      });
  }

  /**
   * 处理截图命令
   */
  private async handleScreenshot(urls: string[], options: ScreenshotCLIOptions): Promise<void> {
    try {
      // 验证 URL
      if (!urls || urls.length === 0) {
        console.error('Error: At least one URL is required');
        process.exit(1);
      }

      // 验证图片格式
      const format = options.format?.toLowerCase() || 'png';
      if (!['png', 'jpeg', 'webp'].includes(format)) {
        console.error('Error: Format must be png, jpeg, or webp');
        process.exit(1);
      }

      // 验证像素比例
      const scale = options.scale || 1;
      if (scale < 1 || scale > 3) {
        console.error('Error: Scale must be between 1 and 3');
        process.exit(1);
      }

      // 验证质量
      if (options.quality !== undefined) {
        if (options.quality < 0 || options.quality > 100) {
          console.error('Error: Quality must be between 0 and 100');
          process.exit(1);
        }
      }

      // 验证并处理宽高参数
      const width = options.width ?? 1920;
      const height = options.height ?? 1080;

      if (isNaN(width) || width <= 0) {
        console.error('Error: Width must be a positive number');
        process.exit(1);
      }

      if (isNaN(height) || height <= 0) {
        console.error('Error: Height must be a positive number');
        process.exit(1);
      }

      // 构建截图选项
      const screenshotOptions: ScreenshotOptions = {
        fullPage: options.viewport ? false : (options.fullPage ?? true),
        width: Math.floor(width),
        height: Math.floor(height),
        deviceScaleFactor: scale,
        outputDir: options.output || '.',
        format: format as 'png' | 'jpeg' | 'webp',
        quality: options.quality,
        browserOptions: this.buildBrowserOptions(options),
        delay: options.delay,
        selector: options.selector,
        hideSelectors: this.parseHideSelectors(options.hide),
        verbose: options.verbose || false
      };

      // 创建截图器
      const screenshotter = new Screenshotter(screenshotOptions);

      try {
        if (options.verbose) {
          console.log('Screenshot options:');
          console.log(`  Mode: ${screenshotOptions.fullPage ? 'Full page' : 'Viewport only'}`);
          console.log(`  Viewport size: ${screenshotOptions.width}x${screenshotOptions.height}`);
          console.log(`  Device scale factor: ${screenshotOptions.deviceScaleFactor}x`);
          if (screenshotOptions.fullPage) {
            console.log(`  Note: In full-page mode, viewport size controls browser window, final image size depends on page content`);
          } else {
            console.log(`  Expected image size: ${screenshotOptions.width * screenshotOptions.deviceScaleFactor}x${screenshotOptions.height * screenshotOptions.deviceScaleFactor} pixels`);
          }
          console.log(`  Format: ${screenshotOptions.format}`);
          console.log(`  Output: ${screenshotOptions.outputDir}`);
          console.log('');
        }

        // 截图
        const results = await screenshotter.screenshotBatch(urls);

        // 显示结果
        let successCount = 0;
        let failureCount = 0;

        for (const result of results) {
          if (result.success) {
            successCount++;
            console.log(`✓ ${result.url}`);
            console.log(`  Saved to: ${result.filepath}`);
          } else {
            failureCount++;
            console.error(`✗ ${result.url}`);
            console.error(`  Error: ${result.error?.message}`);
          }
          console.log('');
        }

        // 汇总
        if (results.length > 1) {
          console.log(`Summary: ${successCount} succeeded, ${failureCount} failed`);
        }

        // 清理
        await screenshotter.close();

        // 如果有失败，退出码为 1
        if (failureCount > 0) {
          process.exit(1);
        }
      } catch (error) {
        await screenshotter.close();
        throw error;
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  }

  /**
   * 构建浏览器选项
   */
  private buildBrowserOptions(options: ScreenshotCLIOptions): BrowserOptions {
    return {
      executablePath: options.browserPath,
      waitUntil: (options.waitUntil as any) || DEFAULT_WAIT_UNTIL,
      timeout: options.timeout || DEFAULT_TIMEOUT,
      userAgent: options.userAgent,
      proxy: options.proxy,
      headless: true
    };
  }

  /**
   * 解析隐藏选择器（逗号分隔）
   */
  private parseHideSelectors(hideOption?: string): string[] | undefined {
    if (!hideOption) {
      return undefined;
    }

    return hideOption
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * 运行 CLI
   */
  async run(argv: string[]): Promise<void> {
    await this.program.parseAsync(argv);
  }
}
