/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { PromptCollection, promptManager } from '@/utils/promptManager';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';

export const PromptEditor: React.FC = () => {
  const [prompts, setPrompts] = useState<PromptCollection>({});
  const [activeTab, setActiveTab] = useState<string>('description_enhance');
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    await promptManager.loadPrompts();
    setPrompts(promptManager.getAllPrompts());
    setHasChanges(false);
  };

  const handlePromptChange = (key: string, newValue: string) => {
    setPrompts(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        template: newValue
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await promptManager.savePrompts(prompts);
      setHasChanges(false);
      toast({
        title: "Success",
        description: "Prompts saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save prompts",
        variant: "destructive"
      });
    }
  };

  const handleResetAll = async () => {
    if (!confirm("Are you sure you want to reset all prompts to default values? This cannot be undone.")) {
      return;
    }

    try {
      await promptManager.resetPrompts();
      setPrompts(promptManager.getAllPrompts());
      setHasChanges(false);
      toast({
        title: "Success",
        description: "Prompts reset to defaults",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset prompts",
        variant: "destructive"
      });
    }
  };

  // Preview state
  const [previewData, setPreviewData] = useState<any>({
    name: "Alice",
    description: "A young adventurer with blonde hair and blue eyes, wearing leather armor.",
    personality: "Brave, curious, sometimes reckless.",
    scenario: "A dark dungeon filled with monsters.",
    first_mes: "Hello traveler! What brings you to this dangerous place?",
    mes_example: "<START>\nAlice: Hi there!\nAlice: *waves hand*",
    system_prompt: "You are Alice.",
  });
  const [showPreview, setShowPreview] = useState(false);

  const getInterpolatedPreview = (key: string) => {
    const template = prompts[key]?.template || '';
    return promptManager.interpolatePrompt(template, previewData);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">Prompt Templates</h2>
          <p className="text-sm text-muted-foreground">Customize the prompts used for AI generation.</p>
        </div>
        <div className="space-x-2">
           <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Preview Interpolation</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Preview Interpolation</DialogTitle>
                <DialogDescription>See how the current prompt looks with sample data.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Sample Name</Label>
                    <Input value={previewData.name} onChange={e => setPreviewData({...previewData, name: e.target.value})} />
                  </div>
                  <div>
                    <Label>Sample Description</Label>
                    <Input value={previewData.description} onChange={e => setPreviewData({...previewData, description: e.target.value})} />
                  </div>
                </div>
                <div>
                   <Label className="font-bold">Result:</Label>
                   <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm mt-2">
                     {getInterpolatedPreview(activeTab)}
                   </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={handleResetAll} className="text-destructive hover:text-destructive">
            Reset All
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 h-[600px]">
        <ScrollArea className="w-full md:w-1/4 h-full border rounded-md">
           <div className="flex flex-col p-2 gap-1">
             {Object.entries(prompts).map(([key, prompt]) => (
               <Button
                 key={key}
                 variant={activeTab === key ? "default" : "ghost"}
                 className="justify-start text-left"
                 onClick={() => setActiveTab(key)}
               >
                 {prompt.name}
               </Button>
             ))}
           </div>
        </ScrollArea>

        <Card className="flex-1 flex flex-col">
          <CardHeader className="py-4">
            <CardTitle>{prompts[activeTab]?.name}</CardTitle>
            <CardDescription>{prompts[activeTab]?.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-4 pt-0">
             <Textarea
               className="h-full min-h-[400px] font-mono text-sm resize-none"
               value={prompts[activeTab]?.template || ''}
               onChange={(e) => handlePromptChange(activeTab, e.target.value)}
             />
             <div className="mt-2 text-xs text-muted-foreground text-right">
               Length: {prompts[activeTab]?.template?.length || 0} chars
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
