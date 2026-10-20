/**
 * Cleans a payload by removing null, undefined, and empty string values
 * This ensures we don't send unnecessary fields to the API
 * @param data - The data object to clean
 * @returns A new object with only truthy values
 */
export function cleanPayload<T extends Record<string, any>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([_, v]) => {
      // Keep the value if it's not null, undefined, or empty string
      return v !== null && v !== undefined && v !== ''
    })
  ) as Partial<T>
}

/**
 * Cleans a payload but preserves empty strings for specific fields
 * Useful when empty string is a valid value for certain fields
 * @param data - The data object to clean
 * @param preserveEmptyFields - Array of field names to preserve empty strings for
 * @returns A new object with cleaned values
 */
export function cleanPayloadWithPreserve<T extends Record<string, any>>(
  data: T,
  preserveEmptyFields: (keyof T)[]
): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([key, v]) => {
      // Preserve empty strings for specified fields
      if (preserveEmptyFields.includes(key as keyof T)) {
        return v !== null && v !== undefined
      }
      // Remove null, undefined, and empty strings for other fields
      return v !== null && v !== undefined && v !== ''
    })
  ) as Partial<T>
}
