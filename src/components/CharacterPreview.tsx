
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
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
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

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set the canvas size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw pictures
        ctx?.drawImage(img, 0, 0);

        // Embed role card data into PNG
        const jsonData = JSON.stringify(characterData);
        const canvas2 = document.createElement('canvas');
        const ctx2 = canvas2.getContext('2d');

        canvas2.width = canvas.width;
        canvas2.height = canvas.height;

        // Copy the original image
        ctx2?.drawImage(canvas, 0, 0);

        // Get image data
        const imageData = ctx2?.getImageData(0, 0, canvas2.width, canvas2.height);
        if (imageData) {
          // Encode JSON data into the last few pixels of the image (this is a simplified implementation)
          const jsonBytes = new TextEncoder().encode(jsonData);
          const dataView = new DataView(imageData.data.buffer);

          // Store JSON length and data at the end of the image data
          let offset = imageData.data.length - 4;
          dataView.setUint32(offset, jsonBytes.length, true);

          // Storing JSON data (there is simplified here, there should be a more complex encoding scheme in fact)
          for (let i = 0; i < Math.min(jsonBytes.length, 1000); i++) {
            if (offset - i * 4 >= 0) {
              imageData.data[offset - i * 4 - 4] = jsonBytes[i];
            }
          }

          ctx2?.putImageData(imageData, 0, 0);
        }

        // Export PNG file
        canvas2.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${characterData.data.name || 'character'}_card.png`;
            link.click();
            URL.revokeObjectURL(url);

            toast({
              title: "Export successfully",
              description: "PNG format role card has been exported"
            });
          }
        }, 'image/png');
      };

      img.onerror = () => {
        toast({
          title: "Export failed",
          description: "Image processing failed, please try again",
          variant: "destructive"
        });
      };

      img.src = characterImage;
    } catch (error) {
      toast({
        title: "Export failed",
        description: "An error occurred during PNG export",
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
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
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
        <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-start justify-between flex-col gap-3">
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
