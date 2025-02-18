export {};

declare global {
  interface GlobalThis {
    __analytics_initialized?: boolean;
  }
}
