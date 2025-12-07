/**
 * Logger utility for consistent, readable logging
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

interface LogOptions {
    data?: any;
    error?: Error;
}

/**
 * ANSI color codes for terminal output
 */
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',

    // Text colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',

    // Background colors
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
};

/**
 * Format timestamp
 */
const getTimestamp = (): string => {
    return new Date().toISOString();
};

/**
 * Get color for log level
 */
const getLevelColor = (level: LogLevel): string => {
    switch (level) {
        case 'error':
            return colors.red;
        case 'warn':
            return colors.yellow;
        case 'info':
            return colors.blue;
        case 'debug':
            return colors.magenta;
        case 'success':
            return colors.green;
        default:
            return colors.white;
    }
};

/**
 * Format log message with colors
 */
const formatMessage = (
    module: string,
    method: string,
    message: string,
    level: LogLevel = 'info'
): string => {
    const timestamp = colors.dim + getTimestamp() + colors.reset;
    const levelColor = getLevelColor(level);
    const levelText = `[${level.toUpperCase()}]`;
    const moduleText = `[${module}]`;
    const methodText = `[${method}]`;

    return `${timestamp} ${levelColor}${levelText}${colors.reset} ${colors.cyan}${moduleText}${colors.reset}${colors.blue}${methodText}${colors.reset} ${message}`;
};

/**
 * Logger class
 */
export class Logger {
    /**
     * Log info message
     */
    static info(module: string, method: string, message: string, options?: LogOptions): void {
        console.log(formatMessage(module, method, message, 'info'));
        if (options?.data) {
            console.log(colors.dim + 'Data:' + colors.reset, options.data);
        }
    }

    /**
     * Log warning message
     */
    static warn(module: string, method: string, message: string, options?: LogOptions): void {
        console.warn(formatMessage(module, method, message, 'warn'));
        if (options?.data) {
            console.warn(colors.dim + 'Data:' + colors.reset, options.data);
        }
    }

    /**
     * Log error message
     */
    static error(module: string, method: string, message: string, error?: Error | any): void {
        console.error(formatMessage(module, method, message, 'error'));

        if (error) {
            if (error instanceof Error) {
                console.error(colors.red + 'Error:' + colors.reset, error.message);
                if (error.stack) {
                    console.error(colors.dim + error.stack + colors.reset);
                }
            } else {
                console.error(colors.red + 'Error:' + colors.reset, error);
            }
        }
    }

    /**
     * Log debug message
     */
    static debug(module: string, method: string, message: string, options?: LogOptions): void {
        if (process.env.NODE_ENV === 'development') {
            console.debug(formatMessage(module, method, message, 'debug'));
            if (options?.data) {
                console.debug(colors.dim + 'Data:' + colors.reset, options.data);
            }
        }
    }

    /**
     * Log success message
     */
    static success(module: string, method: string, message: string, options?: LogOptions): void {
        console.log(formatMessage(module, method, message, 'success'));
        if (options?.data) {
            console.log(colors.dim + 'Data:' + colors.reset, options.data);
        }
    }

    /**
     * Log HTTP request
     */
    static request(method: string, path: string, statusCode?: number): void {
        const color = statusCode && statusCode >= 400 ? colors.red : colors.green;
        const status = statusCode ? `${color}${statusCode}${colors.reset}` : '';
        console.log(
            `${colors.dim}${getTimestamp()}${colors.reset} ${colors.cyan}[HTTP]${colors.reset} ${colors.bright}${method}${colors.reset} ${path} ${status}`
        );
    }

    /**
     * Log database query
     */
    static query(model: string, operation: string, duration?: number): void {
        const durationText = duration ? `${colors.yellow}(${duration}ms)${colors.reset}` : '';
        console.log(
            `${colors.dim}${getTimestamp()}${colors.reset} ${colors.magenta}[DB]${colors.reset} ${colors.cyan}${model}${colors.reset}.${operation} ${durationText}`
        );
    }
}

/**
 * Create a module-specific logger
 */
export const createLogger = (moduleName: string) => {
    return {
        info: (method: string, message: string, options?: LogOptions) =>
            Logger.info(moduleName, method, message, options),

        warn: (method: string, message: string, options?: LogOptions) =>
            Logger.warn(moduleName, method, message, options),

        error: (method: string, message: string, error?: Error | any) =>
            Logger.error(moduleName, method, message, error),

        debug: (method: string, message: string, options?: LogOptions) =>
            Logger.debug(moduleName, method, message, options),

        success: (method: string, message: string, options?: LogOptions) =>
            Logger.success(moduleName, method, message, options),
    };
};

// Export default logger
export default Logger;
