import type { FetchOptions } from '../types/index.js';
import { FetchError } from '../types/index.js';
import { DEFAULT_TIMEOUT, DEFAULT_USER_AGENT, RETRY_ATTEMPTS, RETRY_DELAY } from '../constants.js';
import { ProxyAgent } from 'undici';

export class Fetcher {
  /**
   * Get proxy URL from environment variables or options
   */
  private getProxyUrl(url: string, proxyOption?: string): string | undefined {
    // 优先使用命令行参数中的代理
    if (proxyOption) {
      return proxyOption;
    }

    // 从环境变量读取代理
    const urlObj = new URL(url);
    const protocol = urlObj.protocol;

    // 检查 NO_PROXY
    const noProxy = process.env.NO_PROXY || process.env.no_proxy;
    if (noProxy) {
      const noProxyList = noProxy.split(',').map(s => s.trim());
      if (noProxyList.some(pattern => {
        if (pattern === '*') return true;
        if (pattern.startsWith('.')) return urlObj.hostname.endsWith(pattern);
        return urlObj.hostname === pattern;
      })) {
        return undefined;
      }
    }

    // 根据协议选择代理
    if (protocol === 'https:') {
      return process.env.HTTPS_PROXY || process.env.https_proxy ||
             process.env.HTTP_PROXY || process.env.http_proxy;
    } else {
      return process.env.HTTP_PROXY || process.env.http_proxy;
    }
  }

  /**
   * Fetch HTML content from a URL
   */
  async fetch(url: string, options: FetchOptions = {}): Promise<string> {
    const {
      headers = {},
      timeout = DEFAULT_TIMEOUT,
      userAgent = DEFAULT_USER_AGENT,
      proxy
    } = options;

    // 获取代理 URL
    const proxyUrl = this.getProxyUrl(url, proxy);

    // 构建 fetch 选项
    const fetchOptions: RequestInit & { dispatcher?: ProxyAgent } = {
      headers: {
        'User-Agent': userAgent,
        ...headers
      },
      signal: AbortSignal.timeout(timeout)
    };

    // 如果有代理，使用 ProxyAgent
    if (proxyUrl) {
      fetchOptions.dispatcher = new ProxyAgent(proxyUrl);
    }

    let lastError: Error | null = null;

    // 重试逻辑
    for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          throw new FetchError(
            url,
            response.status,
            `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const html = await response.text();
        return html;
      } catch (error) {
        lastError = error as Error;

        // 如果是最后一次尝试，抛出错误
        if (attempt === RETRY_ATTEMPTS - 1) {
          break;
        }

        // 指数退避：等待时间 = RETRY_DELAY * 2^attempt
        const delay = RETRY_DELAY * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    // 所有重试都失败了
    if (lastError instanceof FetchError) {
      throw lastError;
    }

    throw new FetchError(
      url,
      undefined,
      `Failed to fetch after ${RETRY_ATTEMPTS} attempts: ${lastError?.message}`
    );
  }

  /**
   * Fetch multiple URLs with concurrency control (for future batch processing)
   */
  async fetchBatch(
    urls: string[],
    options: FetchOptions = {},
    concurrent: number = 3
  ): Promise<Array<{ url: string; html?: string; error?: Error }>> {
    // 这个方法在 Phase 3 批量处理时实现
    // 目前先返回一个简单的顺序实现
    const results: Array<{ url: string; html?: string; error?: Error }> = [];

    for (const url of urls) {
      try {
        const html = await this.fetch(url, options);
        results.push({ url, html });
      } catch (error) {
        results.push({ url, error: error as Error });
      }
    }

    return results;
  }

  /**
   * Sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
