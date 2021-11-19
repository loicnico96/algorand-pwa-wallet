import { isDev } from "./environment"

export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
}

export interface Logger {
  error: (error: unknown) => void
  log: (message: string, ...args: unknown[]) => void
  warn: (message: string, ...args: unknown[]) => void
}

export function createLogger(
  namespace: string,
  level: LogLevel = isDev ? LogLevel.INFO : LogLevel.ERROR
): Logger {
  return {
    error(error) {
      if (level >= LogLevel.ERROR) {
        // eslint-disable-next-line no-console
        console.error(`[${namespace}]`, error)
      }
    },

    log(...args) {
      if (level >= LogLevel.INFO) {
        // eslint-disable-next-line no-console
        console.log(`[${namespace}]`, ...args)
      }
    },

    warn(...args) {
      if (level >= LogLevel.WARN) {
        // eslint-disable-next-line no-console
        console.warn(`[${namespace}]`, ...args)
      }
    },
  }
}
