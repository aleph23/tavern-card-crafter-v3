
import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'zh' | 'en';
  setLanguage: (lang: 'zh' | 'en') => void;
  t: (key: string) => string;
}

const translations = {
  zh: {
    // 页面标题
    pageTitle: 'SillyTavern 角色卡 V3 生成器',
    pageDescription: '创建专业的 SillyTavern V3 格式角色卡，支持 V1/V2/V3 格式导入导出',
    
    // 按钮
    importCard: '导入角色卡',
    aiSettings: 'AI 设置',
    copy: '复制',
    exportJson: '导出 JSON',
    exportPng: '导出 PNG',
    
    // 表单标题
    characterInfo: '角色信息编辑',
    basicInfo: '基本信息',
    personality: '性格设定',
    prompts: '提示设定',
    alternateGreetings: '备选问候语',
    characterBook: '角色书',
    tags: '标签',
    metadata: '元数据',
    
    // 字段标签
    name: '角色名称',
    nickname: '昵称',
    description: '角色描述',
    personalityDescription: '性格描述',
    scenario: '场景设定',
    firstMessage: '首条信息',
    messageExample: '对话示例',
    creatorNotes: '作者注释',
    systemPrompt: '系统提示',
    postHistoryInstructions: '对话后指令',
    creator: '作者',
    characterVersion: '角色版本',
    
    // 预览
    jsonPreview: 'JSON 预览',
    totalChars: '总字符',
    totalTokens: '总Token',
    chars: '字符',
    tokens: 'Token',
    
    // 消息
    importSuccess: '导入成功',
    importSuccessDesc: '角色卡数据已成功导入',
    importError: '导入失败',
    importErrorDesc: '文件格式错误或数据损坏',
    copySuccess: '复制成功',
    copySuccessDesc: '角色卡 JSON 已复制到剪贴板',
    uploadImageHint: '请先上传角色头像',
    pngExportHint: 'PNG 格式导出功能需要更复杂的实现，请使用 JSON 导出',
    
    // AI 生成
    aiGenerate: 'AI 生成',
    generating: '生成中...',
    
    // 主题切换
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
    firstMessage: 'First Message',
    messageExample: 'Message Example',
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
    
    // Theme toggle
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'zh' | 'en'>('zh');

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
