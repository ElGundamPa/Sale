const enabled = import.meta.env.DEV;

export const logger = {
  info: (...args: unknown[]) => {
    if (enabled) console.log("[vegas]", ...args);
  },
  warn: (...args: unknown[]) => {
    if (enabled) console.warn("[vegas]", ...args);
  },
  error: (...args: unknown[]) => {
    console.error("[vegas]", ...args);
  },
};
