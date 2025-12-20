export const DEFAULT_TIMEOUT = 30000;
export const DEFAULT_CONCURRENT = 3;
export const DEFAULT_USER_AGENT = 'md-fetch/1.0.0';
export const DEFAULT_WAIT_UNTIL = 'networkidle2' as const;

export const WAIT_UNTIL_OPTIONS = ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'] as const;

export const CONFIG_FILE_NAMES = [
  '.md-fetchrc',
  '.md-fetchrc.json',
  '.md-fetchrc.yaml',
  '.md-fetchrc.yml',
  'md-fetch.config.js'
] as const;

export const RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 1000; // ms
