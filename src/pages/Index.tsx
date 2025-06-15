
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

import BasicInfoSection from "@/components/CharacterForm/BasicInfoSection";
import PersonalitySection from "@/components/CharacterForm/PersonalitySection";
import PromptsSection from "@/components/CharacterForm/PromptsSection";
import AlternateGreetings from "@/components/CharacterForm/AlternateGreetings";
import CharacterBook from "@/components/CharacterForm/CharacterBook";
import TagsSection from "@/components/CharacterForm/TagsSection";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            toast({
              title: "提示",
              description: "PNG 格式导入功能需要更复杂的实现，请使用 JSON 文件",
              variant: "destructive"
            });
            return;
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
            title: "导入成功",
            description: "角色卡数据已成功导入",
          });
        } catch (error) {
          toast({
            title: "导入失败",
            description: "文件格式错误或数据损坏",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            SillyTavern 角色卡 V3 生成器
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            创建专业的 SillyTavern V3 格式角色卡，支持 V1/V2/V3 格式导入导出
          </p>
          <div className="flex justify-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".json,.png"
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="mb-4">
              <Upload className="w-4 h-4 mr-2" />
              导入角色卡
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 表单部分 - 占2/3宽度 */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-800">
                  角色信息编辑
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
                    />
                    
                    <PersonalitySection 
                      data={characterData.data}
                      updateField={updateField}
                    />
                    
                    <PromptsSection 
                      data={characterData.data}
                      updateField={updateField}
                    />
                    
                    <AlternateGreetings 
                      greetings={characterData.data.alternate_greetings}
                      updateField={updateField}
                    />
                    
                    <CharacterBook 
                      entries={characterData.data.character_book?.entries || []}
                      updateField={updateField}
                    />
                    
                    <TagsSection 
                      tags={characterData.data.tags}
                      updateField={updateField}
                    />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* 预览部分 - 占1/3宽度 */}
          <div className="lg:col-span-1">
            <CharacterPreview 
              characterData={characterData}
              characterImage={characterImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
