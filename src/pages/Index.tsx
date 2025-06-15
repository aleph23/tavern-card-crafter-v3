
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CharacterCardV3 {
  spec: string;
  spec_version: string;
  data: {
    name: string;
    description: string;
    personality: string;
    scenario: string;
    first_mes: string;
    mes_example: string;
    creator_notes: string;
    system_prompt: string;
    post_history_instructions: string;
    alternate_greetings: string[];
    character_book?: {
      entries: Array<{
        keys: string[];
        content: string;
        extensions: {
          position: string;
          role: string;
        };
      }>;
    };
    tags: string[];
    creator: string;
    character_version: string;
    extensions: Record<string, any>;
  };
}

const Index = () => {
  const { toast } = useToast();
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
      tags: [],
      creator: "",
      character_version: "1.0",
      extensions: {}
    }
  });

  const [newTag, setNewTag] = useState("");
  const [newGreeting, setNewGreeting] = useState("");

  const updateField = (field: string, value: any) => {
    setCharacterData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(characterData, null, 2));
    toast({
      title: "Copied!",
      description: "Character card JSON copied to clipboard",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            SillyTavern Character Card V3 Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create professional character cards in SillyTavern V3 format with an intuitive interface
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold text-gray-800">Character Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="personality">Personality</TabsTrigger>
                    <TabsTrigger value="prompts">Prompts</TabsTrigger>
                    <TabsTrigger value="extras">Extras</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">Character Name</Label>
                      <Input
                        id="name"
                        value={characterData.data.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="Enter character name..."
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                      <Textarea
                        id="description"
                        value={characterData.data.description}
                        onChange={(e) => updateField("description", e.target.value)}
                        placeholder="Describe your character's appearance, background, and key traits..."
                        className="mt-1 min-h-[120px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="creator" className="text-sm font-medium text-gray-700">Creator</Label>
                      <Input
                        id="creator"
                        value={characterData.data.creator}
                        onChange={(e) => updateField("creator", e.target.value)}
                        placeholder="Your name or username..."
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="version" className="text-sm font-medium text-gray-700">Character Version</Label>
                      <Input
                        id="version"
                        value={characterData.data.character_version}
                        onChange={(e) => updateField("character_version", e.target.value)}
                        placeholder="1.0"
                        className="mt-1"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="personality" className="space-y-4">
                    <div>
                      <Label htmlFor="personality" className="text-sm font-medium text-gray-700">Personality</Label>
                      <Textarea
                        id="personality"
                        value={characterData.data.personality}
                        onChange={(e) => updateField("personality", e.target.value)}
                        placeholder="Describe the character's personality traits, quirks, and behavioral patterns..."
                        className="mt-1 min-h-[120px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="scenario" className="text-sm font-medium text-gray-700">Scenario</Label>
                      <Textarea
                        id="scenario"
                        value={characterData.data.scenario}
                        onChange={(e) => updateField("scenario", e.target.value)}
                        placeholder="Set the scene and context for interactions..."
                        className="mt-1 min-h-[120px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="first_mes" className="text-sm font-medium text-gray-700">First Message</Label>
                      <Textarea
                        id="first_mes"
                        value={characterData.data.first_mes}
                        onChange={(e) => updateField("first_mes", e.target.value)}
                        placeholder="The character's opening message..."
                        className="mt-1 min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="mes_example" className="text-sm font-medium text-gray-700">Example Messages</Label>
                      <Textarea
                        id="mes_example"
                        value={characterData.data.mes_example}
                        onChange={(e) => updateField("mes_example", e.target.value)}
                        placeholder="Example dialogue to help define the character's speech patterns..."
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="prompts" className="space-y-4">
                    <div>
                      <Label htmlFor="system_prompt" className="text-sm font-medium text-gray-700">System Prompt</Label>
                      <Textarea
                        id="system_prompt"
                        value={characterData.data.system_prompt}
                        onChange={(e) => updateField("system_prompt", e.target.value)}
                        placeholder="System-level instructions for the AI..."
                        className="mt-1 min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="post_history" className="text-sm font-medium text-gray-700">Post History Instructions</Label>
                      <Textarea
                        id="post_history"
                        value={characterData.data.post_history_instructions}
                        onChange={(e) => updateField("post_history_instructions", e.target.value)}
                        placeholder="Instructions that appear after the chat history..."
                        className="mt-1 min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="creator_notes" className="text-sm font-medium text-gray-700">Creator Notes</Label>
                      <Textarea
                        id="creator_notes"
                        value={characterData.data.creator_notes}
                        onChange={(e) => updateField("creator_notes", e.target.value)}
                        placeholder="Notes for other users about your character..."
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="extras" className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Tags</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag..."
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
                      <Label className="text-sm font-medium text-gray-700">Alternate Greetings</Label>
                      <div className="flex gap-2 mt-1">
                        <Textarea
                          value={newGreeting}
                          onChange={(e) => setNewGreeting(e.target.value)}
                          placeholder="Add an alternate greeting..."
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

          {/* Preview Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center justify-between">
                  JSON Preview
                  <div className="flex gap-2">
                    <Button onClick={copyToClipboard} size="sm" variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button onClick={downloadJson} size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      <Download className="w-4 h-4 mr-2" />
                      Download
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
