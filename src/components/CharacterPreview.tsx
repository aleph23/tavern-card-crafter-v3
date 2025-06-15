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

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // 设置画布尺寸
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 绘制图片
        ctx?.drawImage(img, 0, 0);
        
        // 将角色卡数据嵌入到PNG中
        const jsonData = JSON.stringify(characterData);
        const canvas2 = document.createElement('canvas');
        const ctx2 = canvas2.getContext('2d');
        
        canvas2.width = canvas.width;
        canvas2.height = canvas.height;
        
        // 复制原图像
        ctx2?.drawImage(canvas, 0, 0);
        
        // 获取图像数据
        const imageData = ctx2?.getImageData(0, 0, canvas2.width, canvas2.height);
        if (imageData) {
          // 将JSON数据编码到图像的最后几个像素中（这是一个简化的实现）
          const jsonBytes = new TextEncoder().encode(jsonData);
          const dataView = new DataView(imageData.data.buffer);
          
          // 在图像数据末尾存储JSON长度和数据
          let offset = imageData.data.length - 4;
          dataView.setUint32(offset, jsonBytes.length, true);
          
          // 存储JSON数据（这里简化处理，实际应该有更复杂的编码方案）
          for (let i = 0; i < Math.min(jsonBytes.length, 1000); i++) {
            if (offset - i * 4 >= 0) {
              imageData.data[offset - i * 4 - 4] = jsonBytes[i];
            }
          }
          
          ctx2?.putImageData(imageData, 0, 0);
        }
        
        // 导出PNG文件
        canvas2.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${characterData.data.name || 'character'}_card.png`;
            link.click();
            URL.revokeObjectURL(url);
            
            toast({
              title: "导出成功",
              description: "PNG格式角色卡已导出"
            });
          }
        }, 'image/png');
      };
      
      img.onerror = () => {
        toast({
          title: "导出失败",
          description: "图像处理失败，请重试",
          variant: "destructive"
        });
      };
      
      img.src = characterImage;
    } catch (error) {
      toast({
        title: "导出失败",
        description: "PNG导出过程中出现错误",
        variant: "destructive"
      });
    }
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
          <pre className="bg-gray-900 dark:bg-gray-800 text-green-400 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap break-all">
            {JSON.stringify(characterData, null, 2)}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CharacterPreview;
