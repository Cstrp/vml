import { toast } from "vue-sonner";

interface ToastOptions {
  description?: string | Component;
  duration?: number;
  action?: {
    label: string;
    onClick: VoidFunction;
  };
  [key: string]: unknown;
}

type ToastType = "success" | "error" | "warning" | "info";

const TOAST_METHODS = {
  success: toast.success,
  error: toast.error,
  warning: toast.warning,
  info: toast.info,
} as const;

export const useToast = () => {
  const show = (
    type: ToastType,
    title: string,
    options?: ToastOptions
  ): void => {
    const toastFn = TOAST_METHODS[type];

    if (!options) {
      toastFn(title);
      return;
    }

    const mergedOptions = options.action
      ? options
      : {
        ...options,
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      };

    toastFn(title, mergedOptions);
  };

  return {
    success: (title: string, options?: ToastOptions) =>
      show("success", title, options),
    error: (title: string, options?: ToastOptions) =>
      show("error", title, options),
    warning: (title: string, options?: ToastOptions) =>
      show("warning", title, options),
    info: (title: string, options?: ToastOptions) =>
      show("info", title, options),
    show,
    dismissAll: () => toast.dismiss(),
    dismiss: (id?: string | number) => toast.dismiss(id),
  } as const;
};
