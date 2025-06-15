
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Plus, X, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  const [newTag, setNewTag] = useState("");
  const [newGreeting, setNewGreeting] = useState("");
  const [newEntryKeys, setNewEntryKeys] = useState("");
  const [newEntryContent, setNewEntryContent] = useState("");
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

  const addTag = () => {
    if (newTag.trim() && !characterData.data.tags.includes(newTag.trim())) {
      updateField("tags", [...characterData.data.tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField("tags", characterData.data.tags.filter(tag => tag !== tagToRemove));
  };

  const addGreeting = () => {
    if (newGreeting.trim()) {
      updateField("alternate_greetings", [...characterData.data.alternate_greetings, newGreeting.trim()]);
      setNewGreeting("");
    }
  };

  const removeGreeting = (index: number) => {
    updateField("alternate_greetings", characterData.data.alternate_greetings.filter((_, i) => i !== index));
  };

  const addBookEntry = () => {
    if (newEntryKeys.trim() && newEntryContent.trim()) {
      const keys = newEntryKeys.split(',').map(k => k.trim()).filter(k => k);
      const entry: CharacterBookEntry = {
        keys,
        content: newEntryContent.trim(),
        insertion_order: 100,
        enabled: true
      };
      
      const currentEntries = characterData.data.character_book?.entries || [];
      updateField("character_book", {
        entries: [...currentEntries, entry]
      });
      
      setNewEntryKeys("");
      setNewEntryContent("");
    }
  };

  const removeBookEntry = (index: number) => {
    const currentEntries = characterData.data.character_book?.entries || [];
    updateField("character_book", {
      entries: currentEntries.filter((_, i) => i !== index)
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCharacterImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          let parsedData;
          
          // 尝试解析 JSON
          if (file.name.endsWith('.json')) {
            parsedData = JSON.parse(content);
          } else if (file.name.endsWith('.png')) {
            // 处理 PNG 格式的角色卡（包含 JSON 数据）
            // 这里简化处理，实际需要从 PNG 的 tEXt 块中提取数据
            toast({
              title: "提示",
              description: "PNG 格式导入功能需要更复杂的实现，请使用 JSON 文件",
              variant: "destructive"
            });
            return;
          }

          // 兼容不同版本的角色卡格式
          if (parsedData.spec === "chara_card_v3" || parsedData.spec_version === "3.0") {
            // V3 格式
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(characterData, null, 2));
    toast({
      title: "复制成功",
      description: "角色卡 JSON 已复制到剪贴板",
    });
  };

  const downloadJson = () => {
    const dataStr = JSON.stringify(characterData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${characterData.data.name || 'character'}_card_v3.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const downloadWithImage = () => {
    if (!characterImage) {
      toast({
        title: "提示",
        description: "请先上传角色头像",
        variant: "destructive"
      });
      return;
    }

    // 这里简化处理，实际需要将 JSON 数据嵌入到 PNG 文件中
    toast({
      title: "提示",
      description: "PNG 格式导出功能需要更复杂的实现，请使用 JSON 导出",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            SillyTavern 角色卡 V3 生成器
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            创建专业的 SillyTavern V3 格式角色卡，支持 V1/V2/V3 格式导入导出
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 表单部分 */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center justify-between">
                  角色信息
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileImport}
                      accept=".json,.png"
                      className="hidden"
                    />
                    <Button onClick={() => fileInputRef.current?.click()} size="sm" variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      导入
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 mb-6">
                    <TabsTrigger value="basic">基础</TabsTrigger>
                    <TabsTrigger value="personality">性格</TabsTrigger>
                    <TabsTrigger value="prompts">提示词</TabsTrigger>
                    <TabsTrigger value="book">角色书</TabsTrigger>
                    <TabsTrigger value="extras">其他</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">角色名称</Label>
                        <Input
                          id="name"
                          value={characterData.data.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          placeholder="输入角色名称..."
                          className="mt-1"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="nickname" className="text-sm font-medium text-gray-700">昵称（可选）</Label>
                        <Input
                          id="nickname"
                          value={characterData.data.nickname || ""}
                          onChange={(e) => updateField("nickname", e.target.value)}
                          placeholder="输入昵称..."
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">角色头像</Label>
                      <div className="mt-2 flex items-center gap-4">
                        <input
                          type="file"
                          ref={imageInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <Button onClick={() => imageInputRef.current?.click()} size="sm" variant="outline">
                          <ImageIcon className="w-4 h-4 mr-2" />
                          上传头像
                        </Button>
                        {characterImage && (
                          <img src={characterImage} alt="角色头像" className="w-16 h-16 rounded-lg object-cover" />
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">描述</Label>
                      <Textarea
                        id="description"
                        value={characterData.data.description}
                        onChange={(e) => updateField("description", e.target.value)}
                        placeholder="描述角色的外观、背景和主要特征..."
                        className="mt-1 min-h-[120px]"
                      />
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label htmlFor="creator" className="text-sm font-medium text-gray-700">创作者</Label>
                        <Input
                          id="creator"
                          value={characterData.data.creator}
                          onChange={(e) => updateField("creator", e.target.value)}
                          placeholder="您的名字或用户名..."
                          className="mt-1"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="version" className="text-sm font-medium text-gray-700">角色版本</Label>
                        <Input
                          id="version"
                          value={characterData.data.character_version}
                          onChange={(e) => updateField("character_version", e.target.value)}
                          placeholder="1.0"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="source" className="text-sm font-medium text-gray-700">来源链接（可选）</Label>
                      <Input
                        id="source"
                        value={characterData.data.source || ""}
                        onChange={(e) => updateField("source", e.target.value)}
                        placeholder="https://example.com/characters/..."
                        className="mt-1"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="personality" className="space-y-4">
                    <div>
                      <Label htmlFor="personality" className="text-sm font-medium text-gray-700">性格特征</Label>
                      <Textarea
                        id="personality"
                        value={characterData.data.personality}
                        onChange={(e) => updateField("personality", e.target.value)}
                        placeholder="描述角色的性格特点、行为模式和习惯..."
                        className="mt-1 min-h-[120px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="scenario" className="text-sm font-medium text-gray-700">场景设定</Label>
                      <Textarea
                        id="scenario"
                        value={characterData.data.scenario}
                        onChange={(e) => updateField("scenario", e.target.value)}
                        placeholder="设定交互的场景和背景..."
                        className="mt-1 min-h-[120px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="first_mes" className="text-sm font-medium text-gray-700">首条消息</Label>
                      <Textarea
                        id="first_mes"
                        value={characterData.data.first_mes}
                        onChange={(e) => updateField("first_mes", e.target.value)}
                        placeholder="角色的开场白..."
                        className="mt-1 min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="mes_example" className="text-sm font-medium text-gray-700">对话示例</Label>
                      <Textarea
                        id="mes_example"
                        value={characterData.data.mes_example}
                        onChange={(e) => updateField("mes_example", e.target.value)}
                        placeholder="示例对话，帮助定义角色的说话方式..."
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="prompts" className="space-y-4">
                    <div>
                      <Label htmlFor="system_prompt" className="text-sm font-medium text-gray-700">系统提示词</Label>
                      <Textarea
                        id="system_prompt"
                        value={characterData.data.system_prompt}
                        onChange={(e) => updateField("system_prompt", e.target.value)}
                        placeholder="给 AI 的系统级指令..."
                        className="mt-1 min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="post_history" className="text-sm font-medium text-gray-700">历史后指令</Label>
                      <Textarea
                        id="post_history"
                        value={characterData.data.post_history_instructions}
                        onChange={(e) => updateField("post_history_instructions", e.target.value)}
                        placeholder="在聊天历史后出现的指令..."
                        className="mt-1 min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="creator_notes" className="text-sm font-medium text-gray-700">创作者备注</Label>
                      <Textarea
                        id="creator_notes"
                        value={characterData.data.creator_notes}
                        onChange={(e) => updateField("creator_notes", e.target.value)}
                        placeholder="给其他用户的关于角色的说明..."
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="book" className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">角色书条目</Label>
                      <div className="space-y-2 mt-2">
                        <Input
                          value={newEntryKeys}
                          onChange={(e) => setNewEntryKeys(e.target.value)}
                          placeholder="关键词（用逗号分隔）..."
                        />
                        <Textarea
                          value={newEntryContent}
                          onChange={(e) => setNewEntryContent(e.target.value)}
                          placeholder="条目内容..."
                          className="min-h-[80px]"
                        />
                        <Button onClick={addBookEntry} size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          添加条目
                        </Button>
                      </div>
                      <div className="space-y-2 mt-4">
                        {characterData.data.character_book?.entries.map((entry, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg relative">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute top-1 right-1"
                              onClick={() => removeBookEntry(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <div className="pr-8">
                              <div className="text-sm font-medium text-gray-700 mb-1">
                                关键词: {entry.keys.join(', ')}
                              </div>
                              <p className="text-sm text-gray-600">{entry.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="extras" className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">标签</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="添加标签..."
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        />
                        <Button onClick={addTag} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {characterData.data.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer">
                            {tag}
                            <X className="w-3 h-3 ml-1" onClick={() => removeTag(tag)} />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">备用问候语</Label>
                      <div className="flex gap-2 mt-1">
                        <Textarea
                          value={newGreeting}
                          onChange={(e) => setNewGreeting(e.target.value)}
                          placeholder="添加备用问候语..."
                          className="min-h-[60px]"
                        />
                        <Button onClick={addGreeting} size="sm" className="self-end">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 mt-2">
                        {characterData.data.alternate_greetings.map((greeting, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg relative">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute top-1 right-1"
                              onClick={() => removeGreeting(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <p className="text-sm pr-8">{greeting}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* 预览部分 */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center justify-between">
                  JSON 预览
                  <div className="flex gap-2">
                    <Button onClick={copyToClipboard} size="sm" variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      复制
                    </Button>
                    <Button onClick={downloadJson} size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      <Download className="w-4 h-4 mr-2" />
                      导出 JSON
                    </Button>
                    <Button onClick={downloadWithImage} size="sm" variant="outline">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      导出 PNG
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-[600px] text-sm font-mono">
                  {JSON.stringify(characterData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
