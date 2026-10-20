import { toast } from 'sonner'
import { FieldErrors } from 'react-hook-form'

/**
 * Displays form validation errors as a toast notification
 * @param errors - FieldErrors object from react-hook-form
 */
export function showFormErrors(errors: FieldErrors) {
  const errorEntries = Object.entries(errors)
  
  if (errorEntries.length === 0) {
    return
  }

  const errorMessages = errorEntries
    .map(([field, error]) => {
      const fieldName = field.charAt(0).toUpperCase() + field.slice(1)
      const message = error?.message || 'Invalid value'
      return `${fieldName}: ${message}`
    })
    .join('\n')

  toast.error('Please fix the following errors:', {
    description: errorMessages,
    duration: 5000,
  })
}

/**
 * Displays a single form error as a toast notification
 * @param fieldName - Name of the field with the error
 * @param message - Error message
 */
export function showFormError(fieldName: string, message: string) {
  const formattedFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
  toast.error(`${formattedFieldName}: ${message}`, {
    duration: 5000,
  })
}
