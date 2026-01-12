/* eslint-disable @typescript-eslint/no-explicit-any */
import defaultPrompts from '../config/defaultPrompts.json';

export interface PromptTemplate {
  name: string;
  description: string;
  template: string;
}

export type PromptCollection = Record<string, PromptTemplate>;

// Extend Window interface for Electron API
declare global {
  interface Window {
    electronAPI?: {
      loadPrompts: () => Promise<PromptCollection | null>;
      savePrompts: (prompts: PromptCollection) => Promise<boolean>;
      resetPrompts: () => Promise<boolean>;
    };
  }
}

class PromptManager {
  private prompts: PromptCollection;
  private isLoaded: boolean = false;

  constructor() {
    this.prompts = { ...defaultPrompts };
  }

  async loadPrompts(): Promise<void> {
    if (this.isLoaded) return;

    try {
      let loadedPrompts: PromptCollection | null = null;

      if (window.electronAPI) {
        loadedPrompts = await window.electronAPI.loadPrompts();
      } else {
        // Fallback for web mode
        const stored = localStorage.getItem('user_prompts');
        if (stored) {
          loadedPrompts = JSON.parse(stored);
        }
      }

      if (loadedPrompts) {
        // Merge with defaults to ensure all keys exist
        this.prompts = { ...defaultPrompts, ...loadedPrompts };
      }
    } catch (error) {
      console.error('Failed to load prompts:', error);
      // Fallback to defaults
      this.prompts = { ...defaultPrompts };
    } finally {
      this.isLoaded = true;
    }
  }

  async savePrompts(prompts: PromptCollection): Promise<void> {
    this.prompts = prompts;

    try {
      if (window.electronAPI) {
        await window.electronAPI.savePrompts(prompts);
      } else {
        localStorage.setItem('user_prompts', JSON.stringify(prompts));
      }
    } catch (error) {
      console.error('Failed to save prompts:', error);
      throw error;
    }
  }

  async resetPrompts(): Promise<void> {
    this.prompts = { ...defaultPrompts };

    try {
      if (window.electronAPI) {
        await window.electronAPI.resetPrompts();
      } else {
        localStorage.removeItem('user_prompts');
      }
    } catch (error) {
      console.error('Failed to reset prompts:', error);
      throw error;
    }
  }

  getPrompt(key: keyof typeof defaultPrompts): string {
    // Ensure loaded (though sync access might be needed before async load finishes,
    // in which case we use defaults initialized in constructor)
    return this.prompts[key]?.template || defaultPrompts[key].template;
  }

  getAllPrompts(): PromptCollection {
    return { ...this.prompts };
  }

  interpolatePrompt(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      // Check if data has the key
      if (Object.prototype.hasOwnProperty.call(data, key)) {
          const value = data[key];
          // Handle array joining if necessary, or just stringify
          if (Array.isArray(value)) {
              return value.join(', ');
          }
          return value !== undefined && value !== null ? String(value) : '';
      }
      // If key not found, return the match (placeholder) as is
      return match;
    });
  }
}

export const promptManager = new PromptManager();
