
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Download, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CharacterPreviewProps {
  characterData: any;
  characterImage: string | null;
}

const CharacterPreview = ({ characterData, characterImage }: CharacterPreviewProps) => {
  const { toast } = useToast();

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

    toast({
      title: "提示",
      description: "PNG 格式导出功能需要更复杂的实现，请使用 JSON 导出",
    });
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm h-fit sticky top-4">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center justify-between">
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
        <ScrollArea className="h-[600px] custom-scrollbar">
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap">
            {JSON.stringify(characterData, null, 2)}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CharacterPreview;
