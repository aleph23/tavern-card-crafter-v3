/* eslint-disable prefer-const */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Download, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { estimateTokens } from "@/utils/aiGenerator";
import { embedJsonInPng } from "@/utils/pngMetadata";

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
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${characterData.data.name || 'character'}_card_v3.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const downloadWithImage = async () => {
    if (!characterImage) {
      toast({
        title: t('hint') || "hint",
        description: "Please upload the character avatar first, or use the \"Export JSON\" button to export the JSON file directly.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Fetch the image as a blob
      const response = await fetch(characterImage);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      // Embed JSON data into PNG using proper tEXt chunk
      const jsonData = JSON.stringify(characterData);
      const pngWithMetadata = await embedJsonInPng(arrayBuffer, jsonData);

      // Create download link
      const url = URL.createObjectURL(new Blob([pngWithMetadata], { type: 'image/png' }));
      const link = document.createElement('a');
      link.href = url;
      const characterName =
        (characterData.data && characterData.data.name) ||
        characterData.name ||
        'character';
      link.download = `${characterName}_card.png`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export successfully",
        description: "PNG format role card has been exported with embedded character data"
      });
    } catch (error) {
      console.error('PNG export error:', error);
      toast({
        title: "Export failed",
        description: "An error occurred during PNG export: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive"
      });
    }
  };

  // Calculate the total number of characters and tokens
  const calculateTotalStats = () => {
    const {data} = characterData;
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

  // JSON syntax highlighting function
  const syntaxHighlight = (json: string) => {
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\\-]?\d+)?)/g, (match) => {
      let cls = 'text-yellow-300'; // Default color - Numbers and others
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-blue-300 font-semibold'; // Key name - Blue thick
        } else {
          cls = 'text-green-300'; // String value - green
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-purple-300'; // Boolean value - Purple
      } else if (/null/.test(match)) {
        cls = 'text-red-300'; // null value - red
      }
      return `<span class="${cls}">${match}</span>`;
    });
  };

  const highlightedJson = syntaxHighlight(JSON.stringify(characterData, null, 2));

  return (
    <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-400 dark:text-gray-200 flex items-start justify-between flex-col gap-3">
          <span>{t('jsonPreview')}</span>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button onClick={copyToClipboard} size="sm" variant="outline" className="flex-1 min-w-0">
              <Copy className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{t('copy')}</span>
            </Button>
            <Button onClick={downloadJson} size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex-1 min-w-0">
              <Download className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{t('exportJson')}</span>
            </Button>
            <Button onClick={downloadWithImage} size="sm" variant="outline" className="flex-1 min-w-0">
              <ImageIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{t('exportPng')}</span>
            </Button>
          </div>
        </CardTitle>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex flex-col sm:flex-row gap-2 sm:gap-4">
          <span>{t('totalChars')}: {totalChars}</span>
          <span>{t('totalTokens')}: {totalTokens}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] custom-scrollbar">
          <div className="bg-gray-900 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap break-all">
            <div
              className="text-gray-300"
              dangerouslySetInnerHTML={{ __html: highlightedJson }}
            />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CharacterPreview;
