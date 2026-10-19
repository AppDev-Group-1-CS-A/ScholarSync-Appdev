/**
 * Simple toast notification utility
 * Provides fallback console/alert if sonner is not available
 */

const createFallbackToast = () => ({
  error: (message: string) => {
    console.error(message);
    if (typeof window !== "undefined") {
      alert(`Error: ${message}`);
    }
  },
  success: (message: string) => {
    console.log(message);
  },
  info: (message: string) => {
    console.info(message);
    if (typeof window !== "undefined") {
      alert(message);
    }
  },
  warning: (message: string) => {
    console.warn(message);
    if (typeof window !== "undefined") {
      alert(`Warning: ${message}`);
    }
  },
});

let toastImpl: ReturnType<typeof createFallbackToast>;

// Try to use sonner if available, otherwise use fallback
try {
  const sonnerModule = require("sonner");
  if (sonnerModule && sonnerModule.toast) {
    toastImpl = sonnerModule.toast;
  } else {
    toastImpl = createFallbackToast();
  }
} catch (error) {
  // Use fallback if sonner is not installed
  toastImpl = createFallbackToast();
}

export const toast = toastImpl;
