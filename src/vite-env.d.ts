/// <reference types="vite/client" />

import { PromptCollection } from './types/prompts';
import { AppConfig } from './types/config';

declare global {
  interface Window {
    electronAPI?: {
      // Menu event listening
      onMenuAction: (callback: (event: any, ...args: any[]) => void) => void;
      removeAllListeners: (channel: string) => void;

      // Prompt management
      loadPrompts: () => Promise<PromptCollection | null>;
      savePrompts: (prompts: PromptCollection) => Promise<{ success: boolean; path: string }>;
      resetPrompts: () => Promise<boolean>;

      // Config management
      loadConfig: () => Promise<AppConfig | null>;
      saveConfig: (config: AppConfig) => Promise<{ success: boolean; path: string }>;
      resetConfig: () => Promise<boolean>;
    };
  }
}
