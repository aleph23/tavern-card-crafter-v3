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
    return '';
  }

  // Remove the end slash
  const cleanUrl = baseUrl.replace(/\/+$/, '');

  // Ollama special treatment
  if (provider === 'ollama') {
    if (baseUrl.includes('/v1/chat/completions')) {
      return cleanUrl;
    }
    return `${cleanUrl}/v1/chat/completions`;
  }

  // Special processing of Zhipu GLM
  if (provider === 'zhipu') {
    if (baseUrl.includes('/chat/completions')) {
      return cleanUrl;
    }
    return `${cleanUrl}/chat/completions`;
  }

  // Standard processing from other providers
  if (baseUrl.includes('/chat/completions')) {
    return cleanUrl;
  }

  // Smartly add endpoints
  if (cleanUrl.includes('/v1')) {
    return `${cleanUrl}/chat/completions`;
  } else {
    return `${cleanUrl}/v1/chat/completions`;
  }
};
