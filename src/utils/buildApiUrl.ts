/**
 * Build a complete API URL based on the base URL and provider type.
 *
 * The function first checks if the baseUrl is provided; if not, it returns an empty string.
 * It then cleans the baseUrl by removing any trailing slashes. Depending on the provider,
 * it applies specific rules for constructing the final URL, including special handling for
 * 'ollama' and 'zhipu' providers, and a default behavior for others.
 *
 * @param baseUrl - The base URL to be processed.
 * @param provider - The provider type.
 * @returns The constructed API URL based on the provided baseUrl and provider.
 */
export const buildApiUrl = (baseUrl: string, provider: string): string => {
  if (!baseUrl) {
    return ''
  }

  // Remove the end slash
  const cleanUrl = baseUrl.replace(/\/+$/, '')
  return cleanUrl
}
