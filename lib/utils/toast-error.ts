import { toast } from 'sonner';
import { getSanitizedError } from './error-messages';

interface ToastOptions {
  id?: string | number;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Enterprise Toast Helper:
 * Intercepts any error object or rejection and displays a clean, non-technical,
 * formatted notification. Raw technical errors, stack traces, and database terms
 * are guaranteed never to appear in the toast UI.
 */
export function showErrorToast(error: unknown, fallbackMessage?: string, options?: ToastOptions) {
  const sanitized = getSanitizedError(error);
  const displayMessage = fallbackMessage || sanitized.message;

  toast.error(sanitized.title, {
    description: displayMessage,
    duration: options?.duration || 4500,
    id: options?.id,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : sanitized.correlationId
      ? {
          label: 'Copy Ref ID',
          onClick: () => {
            if (navigator?.clipboard && sanitized.correlationId) {
              navigator.clipboard.writeText(sanitized.correlationId);
              toast.info('Reference ID copied to clipboard');
            }
          },
        }
      : undefined,
  });
}

/**
 * Enterprise Success Toast Helper
 */
export function showSuccessToast(title: string, description?: string, options?: ToastOptions) {
  toast.success(title, {
    description,
    duration: options?.duration || 3500,
    id: options?.id,
    action: options?.action,
  });
}
