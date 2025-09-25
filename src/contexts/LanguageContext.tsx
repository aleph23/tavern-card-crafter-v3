
import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'zh' | 'en';
  setLanguage: (lang: 'zh' | 'en') => void;
  t: (key: string) => string;
}

const translations = {
  zh: {
    // Page title
    pageTitle: 'SillyTavern 角色卡 V3 生成器',
    pageDescription: '创建专业的 SillyTavern V3 格式角色卡，支持 V1/V2/V3 格式导入导出',

    // Button
    importCard: '导入角色卡',
    aiSettings: 'AI 设置',
    copy: '复制',
    exportJson: '导出 JSON',
    exportPng: '导出 PNG',
    save: '保存',
    cancel: '取消',

    // Form title
    characterInfo: '角色信息编辑',
    basicInfo: '基本信息',
    personality: '性格设定',
    prompts: '提示设定',
    alternateGreetings: '备选问候语',
    characterBook: '角色书',
    tags: '标签',
    metadata: '元数据',

    // Field Tags
    name: '角色名称',
    nickname: '昵称',
    description: '角色描述',
    personalityDescription: '性格描述',
    scenario: '场景设定',
    first_mes: '首条信息',
    mes_example: '对话示例',
    creatorNotes: '作者注释',
    systemPrompt: '系统提示',
    postHistoryInstructions: '对话后指令',
    creator: '作者',
    characterVersion: '角色版本',

    // Preview
    jsonPreview: 'JSON 预览',
    totalChars: '总字符',
    totalTokens: '总Token',
    chars: '字符',
    tokens: 'Token',

    // information
    importSuccess: '导入成功',
    importSuccessDesc: '角色卡数据已成功导入',
    importError: '导入失败',
    importErrorDesc: '文件格式错误或数据损坏',
    copySuccess: '复制成功',
    copySuccessDesc: '角色卡 JSON 已复制到剪贴板',
    uploadImageHint: '请先上传角色头像',
    pngExportHint: 'PNG 格式导出功能需要更复杂的实现，请使用 JSON 导出',

    // AI generate
    aiGenerate: 'AI 生成',
    generating: '生成中...',
    generateSuccess: '生成成功',
    generateError: '生成失败',
    configError: '配置错误',
    configApiKey: '请先在AI设置中配置API密钥',
    incompleteInfo: '信息不完整',
    fillNameDesc: '请先填写角色名称和角色描述',
    unknownError: '未知错误',

    // Alternative greetings
    addNewGreeting: '添加新问候语',
    addAlternateGreetingPlaceholder: '添加备用问候语...',
    aiGenerateGreeting: 'AI生成问候语',
    alternateGreetingGenerated: '备用问候语已生成完成',

    // Label
    enterTag: '输入标签...',
    aiGenerateTags: 'AI生成标签',
    tagsGenerated: '标签已生成完成',

    // Character Book
    addNewEntry: '添加新条目',
    addEntry: '添加条目',
    aiGenerateEntry: 'AI生成条目',
    entryGenerated: '角色书条目已生成完成',
    entry: '条目',
    keywords: '关键词',
    content: '内容',
    insertionOrder: '插入顺序',
    enabled: '启用',

    // Topic Switch
    lightMode: '浅色模式',
    darkMode: '深色模式',
  },
  en: {
    // Page titles
    pageTitle: 'SillyTavern Character Card V3 Generator',
    pageDescription: 'Create professional SillyTavern V3 format character cards with V1/V2/V3 import/export support',

    // Buttons
    importCard: 'Import Card',
    aiSettings: 'AI Settings',
    copy: 'Copy',
    exportJson: 'Export JSON',
    exportPng: 'Export PNG',
    save: 'Save',
    cancel: 'Cancel',

    // Form titles
    characterInfo: 'Character Information Editor',
    basicInfo: 'Basic Information',
    personality: 'Personality',
    prompts: 'Prompts',
    alternateGreetings: 'Alternate Greetings',
    characterBook: 'Character Book',
    tags: 'Tags',
    metadata: 'Metadata',

    // Field labels
    name: 'Character Name',
    nickname: 'Nickname',
    description: 'Character Description',
    personalityDescription: 'Personality Description',
    scenario: 'Scenario',
    first_mes: 'First Message',
    mes_example: 'Message Example',
    creatorNotes: 'Creator Notes',
    systemPrompt: 'System Prompt',
    postHistoryInstructions: 'Post History Instructions',
    creator: 'Creator',
    characterVersion: 'Character Version',

    // Preview
    jsonPreview: 'JSON Preview',
    totalChars: 'Total Characters',
    totalTokens: 'Total Tokens',
    chars: 'Characters',
    tokens: 'Tokens',

    // Messages
    importSuccess: 'Import Successful',
    importSuccessDesc: 'Character card data has been successfully imported',
    importError: 'Import Failed',
    importErrorDesc: 'File format error or corrupted data',
    copySuccess: 'Copy Successful',
    copySuccessDesc: 'Character card JSON has been copied to clipboard',
    uploadImageHint: 'Please upload character avatar first',
    pngExportHint: 'PNG export requires more complex implementation, please use JSON export',

    // AI Generation
    aiGenerate: 'AI Generate',
    generating: 'Generating...',
    generateSuccess: 'Generation Successful',
    generateError: 'Generation Failed',
    configError: 'Configuration Error',
    configApiKey: 'Please configure API key in AI settings first',
    incompleteInfo: 'Incomplete Information',
    fillNameDesc: 'Please fill in character name and description first',
    unknownError: 'Unknown Error',

    // Alternate Greetings
    addNewGreeting: 'Add New Greeting',
    addAlternateGreetingPlaceholder: 'Add alternate greeting...',
    aiGenerateGreeting: 'AI Generate Greeting',
    alternateGreetingGenerated: 'Alternate greeting has been generated',

    // Tags
    enterTag: 'Enter tag...',
    aiGenerateTags: 'AI Generate Tags',
    tagsGenerated: 'Tags have been generated',

    // Character Book
    addNewEntry: 'Add New Entry',
    addEntry: 'Add Entry',
    aiGenerateEntry: 'AI Generate Entry',
    entryGenerated: 'Character book entry has been generated',
    entry: 'Entry',
    keywords: 'Keywords',
    content: 'Content',
    insertionOrder: 'Insertion Order',
    enabled: 'Enabled',

    // Theme toggle
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'zh' | 'en'>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'zh' | 'en';
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: 'zh' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['zh']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
