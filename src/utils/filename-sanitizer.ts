/**
 * 文件名安全化工具
 * 用于从 URL 生成安全的文件名
 */

/**
 * 从 URL 生成安全的文件名
 * 格式: <URL安全化前50字符>_<年月日时分秒>.png
 *
 * @param url - 原始URL
 * @param extension - 文件扩展名（默认 'png'）
 * @returns 安全的文件名
 *
 * @example
 * generateScreenshotFilename('https://github.com/user/repo/issues/123')
 * // => 'github.com_user_repo_issues_123_20251229143025.png'
 */
export function generateScreenshotFilename(url: string, extension: string = 'png'): string {
  const safeName = sanitizeUrlForFilename(url);
  const timestamp = generateTimestamp();

  return `${safeName}_${timestamp}.${extension}`;
}

/**
 * 将 URL 转换为安全的文件名前缀
 * - 保留域名
 * - 替换非法字符为下划线
 * - 截取前50个字符
 *
 * @param url - 原始URL
 * @returns 安全化后的文件名前缀
 */
export function sanitizeUrlForFilename(url: string): string {
  try {
    const urlObj = new URL(url);

    // 构建完整的文件名部分：域名 + 路径 + 查询参数
    let fullPart = urlObj.hostname + urlObj.pathname + urlObj.search;

    // 安全化处理
    const safeName = fullPart
      // 替换非法文件名字符为下划线
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
      // 替换多个连续点为单个点（保留域名中的点）
      .replace(/\.{2,}/g, '.')
      // 替换空格为下划线
      .replace(/\s+/g, '_')
      // 替换多个连续斜杠和下划线为单个下划线
      .replace(/[/_]+/g, '_')
      // 去除开头和结尾的点和下划线
      .replace(/^[._]+|[._]+$/g, '');

    // 截取前50个字符
    const truncated = safeName.slice(0, 50);

    // 去除末尾的下划线或点
    const cleaned = truncated.replace(/[._]+$/, '');

    // 如果清理后为空，使用默认值
    return cleaned || 'screenshot';
  } catch (error) {
    // URL 解析失败，使用默认值
    return 'screenshot';
  }
}

/**
 * 生成时间戳字符串
 * 格式: YYYYMMDDHHMMSS
 *
 * @returns 时间戳字符串
 *
 * @example
 * generateTimestamp() // => '20251229143025'
 */
export function generateTimestamp(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
