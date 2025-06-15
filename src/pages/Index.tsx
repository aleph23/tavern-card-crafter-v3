import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import AISettings, { AISettings as AISettingsType } from "@/components/AISettings";
import Toolbar from "@/components/Toolbar";
import BasicInfoSection from "@/components/CharacterForm/BasicInfoSection";
import PersonalitySection from "@/components/CharacterForm/PersonalitySection";
import PromptsSection from "@/components/CharacterForm/PromptsSection";
import AlternateGreetings from "@/components/CharacterForm/AlternateGreetings";
import CharacterBook from "@/components/CharacterForm/CharacterBook";
import TagsSection from "@/components/CharacterForm/TagsSection";
import MetadataSection from "@/components/CharacterForm/MetadataSection";
import CharacterPreview from "@/components/CharacterPreview";

interface CharacterBookEntry {
  keys: string[];
  content: string;
  insertion_order: number;
  enabled: boolean;
}

interface CharacterCardV3 {
  spec: string;
  spec_version: string;
  data: {
    name: string;
    nickname?: string;
    description: string;
    personality: string;
    scenario: string;
    first_mes: string;
    mes_example: string;
    creator_notes: string;
    creator_notes_multilingual?: {
      [key: string]: string;
    };
    system_prompt: string;
    post_history_instructions: string;
    alternate_greetings: string[];
    character_book?: {
      entries: CharacterBookEntry[];
    };
    tags: string[];
    creator: string;
    character_version: string;
    creation_date?: string;
    modification_date?: string;
    source?: string;
    extensions: Record<string, any>;
  };
}

const Index = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiSettings, setAISettings] = useState<AISettingsType | null>(null);

  const [characterData, setCharacterData] = useState<CharacterCardV3>({
    spec: "chara_card_v3",
    spec_version: "3.0",
    data: {
      name: "",
      description: "",
      personality: "",
      scenario: "",
      first_mes: "",
      mes_example: "",
      creator_notes: "",
      system_prompt: "",
      post_history_instructions: "",
      alternate_greetings: [],
      character_book: {
        entries: []
      },
      tags: [],
      creator: "",
      character_version: "1.0",
      creation_date: new Date().toISOString().split('T')[0],
      modification_date: new Date().toISOString().split('T')[0],
      extensions: {}
    }
  });

  const [characterImage, setCharacterImage] = useState<string | null>(null);

  useEffect(() => {
    // 加载保存的AI设置
    const savedSettings = localStorage.getItem('ai-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setAISettings(parsedSettings);
      } catch (error) {
        console.error('Failed to load AI settings:', error);
      }
    }
  }, []);

  const handleAISettingsChange = (newSettings: AISettingsType) => {
    setAISettings(newSettings);
    toast({
      title: t('settingsUpdated') || "设置已更新",
      description: t('settingsUpdatedDesc') || "AI设置已成功更新并保存",
    });
  };

  const updateField = (field: string, value: any) => {
    setCharacterData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
        modification_date: new Date().toISOString().split('T')[0]
      }
    }));
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          let parsedData;
          
          if (file.name.endsWith('.json')) {
            parsedData = JSON.parse(content);
          } else if (file.name.endsWith('.png')) {
            // 处理PNG文件，从中提取角色卡数据
            try {
              // PNG文件通常将角色卡数据存储在tEXt块中
              const base64Data = content.split(',')[1];
              const binaryString = atob(base64Data);
              const uint8Array = new Uint8Array(binaryString.length);
              
              for (let i = 0; i < binaryString.length; i++) {
                uint8Array[i] = binaryString.charCodeAt(i);
              }
              
              // 查找PNG文件中的tEXt块
              let foundData = null;
              
              // 查找 "chara" 关键字的tEXt块
              const charaKeyword = new TextEncoder().encode('chara');
              for (let i = 0; i < uint8Array.length - charaKeyword.length - 4; i++) {
                // 检查是否找到tEXt块标识符
                if (uint8Array[i] === 0x74 && uint8Array[i+1] === 0x45 && 
                    uint8Array[i+2] === 0x58 && uint8Array[i+3] === 0x74) {
                  // 跳过tEXt标识符
                  let pos = i + 4;
                  
                  // 查找关键字
                  let keywordMatch = true;
                  for (let j = 0; j < charaKeyword.length; j++) {
                    if (uint8Array[pos + j] !== charaKeyword[j]) {
                      keywordMatch = false;
                      break;
                    }
                  }
                  
                  if (keywordMatch) {
                    // 跳过关键字和null终止符
                    pos += charaKeyword.length + 1;
                    
                    // 读取数据直到块结束
                    let dataStart = pos;
                    let dataEnd = dataStart;
                    
                    // 找到数据的结束位置
                    while (dataEnd < uint8Array.length && uint8Array[dataEnd] !== 0) {
                      dataEnd++;
                    }
                    
                    // 提取base64编码的角色卡数据
                    const encodedData = new TextDecoder().decode(uint8Array.slice(dataStart, dataEnd));
                    
                    try {
                      // 解码base64数据
                      const decodedData = atob(encodedData);
                      foundData = JSON.parse(decodedData);
                      break;
                    } catch (decodeError) {
                      // 如果解码失败，尝试直接解析
                      try {
                        foundData = JSON.parse(encodedData);
                        break;
                      } catch (parseError) {
                        continue;
                      }
                    }
                  }
                }
              }
              
              // 如果没有找到tEXt块中的数据，尝试其他方法
              if (!foundData) {
                // 尝试查找JSON格式的字符串
                const textDecoder = new TextDecoder('utf-8', { fatal: false });
                const text = textDecoder.decode(uint8Array);
                
                // 查找可能的JSON数据模式
                const jsonPatterns = [
                  /\{"spec":"chara_card_v[23]".*?\}\}/s,
                  /\{"name":".*?".*?"description":".*?\}/s,
                  /\{"data":\{.*?\}\}/s
                ];
                
                for (const pattern of jsonPatterns) {
                  const match = text.match(pattern);
                  if (match) {
                    try {
                      foundData = JSON.parse(match[0]);
                      break;
                    } catch (e) {
                      continue;
                    }
                  }
                }
              }
              
              if (foundData) {
                parsedData = foundData;
              } else {
                toast({
                  title: t('hint') || "提示",
                  description: "此PNG文件中未找到角色卡数据，请确保使用包含角色卡信息的PNG文件",
                  variant: "destructive"
                });
                return;
              }
            } catch (pngError) {
              console.error('PNG processing error:', pngError);
              toast({
                title: t('hint') || "提示",
                description: "无法从PNG文件中提取角色卡数据，请尝试使用JSON格式文件",
                variant: "destructive"
              });
              return;
            }
          }

          // 兼容不同版本的角色卡格式
          if (parsedData.spec === "chara_card_v3" || parsedData.spec_version === "3.0") {
            setCharacterData(parsedData);
          } else if (parsedData.spec === "chara_card_v2" || parsedData.data) {
            // V2 格式转换为 V3
            const v3Data: CharacterCardV3 = {
              spec: "chara_card_v3",
              spec_version: "3.0",
              data: {
                name: parsedData.data?.name || parsedData.name || "",
                nickname: parsedData.data?.nickname,
                description: parsedData.data?.description || parsedData.description || "",
                personality: parsedData.data?.personality || parsedData.personality || "",
                scenario: parsedData.data?.scenario || parsedData.scenario || "",
                first_mes: parsedData.data?.first_mes || parsedData.first_mes || "",
                mes_example: parsedData.data?.mes_example || parsedData.mes_example || "",
                creator_notes: parsedData.data?.creator_notes || parsedData.creator_notes || "",
                system_prompt: parsedData.data?.system_prompt || "",
                post_history_instructions: parsedData.data?.post_history_instructions || "",
                alternate_greetings: parsedData.data?.alternate_greetings || [],
                character_book: parsedData.data?.character_book || { entries: [] },
                tags: parsedData.data?.tags || [],
                creator: parsedData.data?.creator || "",
                character_version: parsedData.data?.character_version || "1.0",
                creation_date: new Date().toISOString().split('T')[0],
                modification_date: new Date().toISOString().split('T')[0],
                extensions: parsedData.data?.extensions || {}
              }
            };
            setCharacterData(v3Data);
          } else {
            // V1 格式或其他格式
            const v3Data: CharacterCardV3 = {
              spec: "chara_card_v3",
              spec_version: "3.0",
              data: {
                name: parsedData.name || "",
                description: parsedData.description || "",
                personality: parsedData.personality || "",
                scenario: parsedData.scenario || "",
                first_mes: parsedData.first_mes || "",
                mes_example: parsedData.mes_example || "",
                creator_notes: parsedData.creator_notes || "",
                system_prompt: "",
                post_history_instructions: "",
                alternate_greetings: parsedData.alternate_greetings || [],
                character_book: { entries: [] },
                tags: parsedData.tags || [],
                creator: parsedData.creator || "",
                character_version: "1.0",
                creation_date: new Date().toISOString().split('T')[0],
                modification_date: new Date().toISOString().split('T')[0],
                extensions: {}
              }
            };
            setCharacterData(v3Data);
          }

          toast({
            title: t('importSuccess'),
            description: t('importSuccessDesc'),
          });
        } catch (error) {
          console.error('Import error:', error);
          toast({
            title: t('importError'),
            description: t('importErrorDesc'),
            variant: "destructive"
          });
        }
      };
      
      if (file.name.endsWith('.png')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-end mb-4">
            <Toolbar />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            {t('pageTitle')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-4">
            {t('pageDescription')}
          </p>
          <div className="flex justify-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".json,.png"
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} className="mb-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Upload className="w-4 h-4 mr-2" />
              {t('importCard')}
            </Button>
            <AISettings 
              onSettingsChange={handleAISettingsChange} 
              currentSettings={aiSettings}
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* 表单部分 - 调整宽度 */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                {t('characterInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[800px] custom-scrollbar pr-4">
                <div className="space-y-8">
                  <BasicInfoSection 
                    data={characterData.data}
                    updateField={updateField}
                    characterImage={characterImage}
                    setCharacterImage={setCharacterImage}
                    aiSettings={aiSettings}
                  />
                  
                  <PersonalitySection 
                    data={characterData.data}
                    updateField={updateField}
                    aiSettings={aiSettings}
                  />
                  
                  <PromptsSection 
                    data={characterData.data}
                    updateField={updateField}
                    aiSettings={aiSettings}
                  />
                  
                  <AlternateGreetings 
                    greetings={characterData.data.alternate_greetings}
                    updateField={updateField}
                    aiSettings={aiSettings}
                    characterData={characterData.data}
                  />
                  
                  <CharacterBook 
                    entries={characterData.data.character_book?.entries || []}
                    updateField={updateField}
                    aiSettings={aiSettings}
                    characterData={characterData.data}
                  />
                  
                  <TagsSection 
                    tags={characterData.data.tags}
                    updateField={updateField}
                    aiSettings={aiSettings}
                    characterData={characterData.data}
                  />
                  
                  <MetadataSection 
                    data={characterData.data}
                    updateField={updateField}
                  />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* 预览部分 - 调整宽度 */}
          <CharacterPreview 
            characterData={characterData}
            characterImage={characterImage}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
