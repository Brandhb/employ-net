type LogLevel = "info" | "warn" | "error" | "debug";

interface LogMessage {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
}

const LOG_EMOJIS = {
  info: "ℹ️",
  warn: "⚠️",
  error: "🚨",
  debug: "🔍",
  success: "✅",
  database: "🗄️",
  user: "👤",
  security: "🔒",
  payment: "💰",
  time: "⏱️",
  network: "🌐",
};

class Logger {
  private module: string;

  constructor(module: string) {
    this.module = module;
  }

  private getTimestamp(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = this.getTimestamp();
    const emoji = LOG_EMOJIS[level];
    return `${timestamp} ${emoji} [${this.module}] ${message}`;
  }

  private log(level: LogLevel, message: string, data?: any) {
    const formattedMessage = this.formatMessage(level, message);
    const logMessage: LogMessage = {
      timestamp: new Date().toISOString(),
      level,
      module: this.module,
      message,
      data: data ? this.sanitizeData(data) : undefined
    };

    // In development, log to console with colors
    if (process.env.NODE_ENV === "development") {
      const styles = {
        info: "color: #3b82f6",
        warn: "color: #f59e0b",
        error: "color: #ef4444",
        debug: "color: #6b7280",
      };

      if (data) {
        console.groupCollapsed(`%c${formattedMessage}`, styles[level]);
        console.log("Data:", this.sanitizeData(data));
        console.groupEnd();
      } else {
        console.log(`%c${formattedMessage}`, styles[level]);
      }
    }

    // In production, you might want to send logs to a service
    if (process.env.NODE_ENV === "production") {
      // Implement production logging (e.g., to a logging service)
      // this.sendToLoggingService(logMessage);
    }
  }

  private sanitizeData(data: any): any {
    // Deep clone the data
    const sanitized = JSON.parse(JSON.stringify(data));

    // List of sensitive fields to redact
    const sensitiveFields = [
      "password",
      "token",
      "secret",
      "accountNumber",
      "routingNumber",
      "ssn",
      "creditCard",
      "apiKey",
      "privateKey",
      "accessToken",
      "refreshToken",
    ];

    // Recursively redact sensitive data
    const redact = (obj: any) => {
      if (!obj || typeof obj !== "object") return;

      Object.keys(obj).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (sensitiveFields.includes(lowerKey) || 
            sensitiveFields.some(field => lowerKey.includes(field))) {
          obj[key] = "🔒 [REDACTED]";
        } else if (typeof obj[key] === "object") {
          redact(obj[key]);
        }
      });
    };

    redact(sanitized);
    return sanitized;
  }

  info(message: string, data?: any) {
    this.log("info", message, data);
  }

  warn(message: string, data?: any) {
    this.log("warn", message, data);
  }

  error(message: string, data?: any) {
    this.log("error", message, data);
  }

  debug(message: string, data?: any) {
    if (process.env.NODE_ENV === "development") {
      this.log("debug", message, data);
    }
  }

  success(message: string, data?: any) {
    this.log("info", `✅ ${message}`, data);
  }

  database(message: string, data?: any) {
    this.log("info", `🗄️ ${message}`, data);
  }

  security(message: string, data?: any) {
    this.log("info", `🔒 ${message}`, data);
  }

  payment(message: string, data?: any) {
    this.log("info", `💰 ${message}`, data);
  }

  user(message: string, data?: any) {
    this.log("info", `👤 ${message}`, data);
  }

  time(message: string, data?: any) {
    this.log("info", `⏱️ ${message}`, data);
  }

  network(message: string, data?: any) {
    this.log("info", `🌐 ${message}`, data);
  }
}

export function createLogger(module: string) {
  return new Logger(module);
}