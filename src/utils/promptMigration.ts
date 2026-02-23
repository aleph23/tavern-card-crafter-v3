import defaultPrompts from '../config/defaultPrompts.json'
import type { PromptCollection } from '../types/prompts'

export const migratePrompts = (existingPrompts: PromptCollection | null | undefined): PromptCollection => {
  // This is a placeholder for future migration logic
  // Currently, we just return the existing prompts or defaults
  // If the structure changes in the future, we can add logic here to transform old prompts to new format

  if (!existingPrompts) {
    return defaultPrompts
  }

  // Example migration check (not currently needed but good for structure)
  // if (existingPrompts.version < 2) { ... }

  return existingPrompts
}
