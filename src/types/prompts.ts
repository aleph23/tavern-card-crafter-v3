
export interface PromptTemplate {
  name: string;
  description: string;
  template: string;
}

export type PromptCollection = Record<string, PromptTemplate>;
