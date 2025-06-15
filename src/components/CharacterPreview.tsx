import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Download, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { estimateTokens } from "@/utils/aiGenerator";

interface CharacterPreviewProps {
  characterData: any;
  characterImage: string | null;
}

const CharacterPreview = ({ characterData, characterImage }: CharacterPreviewProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(characterData, null, 2));
    toast({
      title: t('copySuccess'),
      description: t('copySuccessDesc'),
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
        title: t('hint') || "提示",
        description: t('uploadImageHint'),
        variant: "destructive"
      });
      return;
    }

    toast({
      title: t('hint') || "提示",
      description: t('pngExportHint'),
    });
  };

  // 计算总字符数和token数
  const calculateTotalStats = () => {
    const data = characterData.data;
    let totalChars = 0;
    let totalTokens = 0;

    const fields = [
      data.name, data.nickname, data.description, data.personality,
      data.scenario, data.first_mes, data.mes_example, data.creator_notes,
      data.system_prompt, data.post_history_instructions,
      ...(data.alternate_greetings || []),
      ...(data.tags || []).join(', '),
      ...(data.character_book?.entries || []).map((entry: any) => entry.content).join(' ')
    ];

    fields.forEach(field => {
      if (field && typeof field === 'string') {
        totalChars += field.length;
        totalTokens += estimateTokens(field);
      }
    });

    return { totalChars, totalTokens };
  };

  const { totalChars, totalTokens } = calculateTotalStats();

  return (
    <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm h-fit sticky top-4">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-between">
          {t('jsonPreview')}
          <div className="flex gap-2">
            <Button onClick={copyToClipboard} size="sm" variant="outline">
              <Copy className="w-4 h-4 mr-2" />
              {t('copy')}
            </Button>
            <Button onClick={downloadJson} size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Download className="w-4 h-4 mr-2" />
              {t('exportJson')}
            </Button>
            <Button onClick={downloadWithImage} size="sm" variant="outline">
              <ImageIcon className="w-4 h-4 mr-2" />
              {t('exportPng')}
            </Button>
          </div>
        </CardTitle>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex gap-4">
          <span>{t('totalChars')}: {totalChars}</span>
          <span>{t('totalTokens')}: {totalTokens}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] custom-scrollbar">
          <pre className="bg-gray-900 dark:bg-gray-800 text-green-400 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap">
            {JSON.stringify(characterData, null, 2)}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CharacterPreview;
