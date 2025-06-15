
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Terminal, Play, FolderOpen, Code, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const LocalDeploymentPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const deploymentSteps = language === 'en' ? [
    "Download the project files",
    "Install Node.js (version 18 or higher)",
    "Install dependencies using npm",
    "Start the development server",
    "Open browser to view the application"
  ] : [
    "下载项目文件",
    "安装 Node.js（版本 18 或更高）",
    "使用 npm 安装依赖",
    "启动开发服务器",
    "打开浏览器查看应用"
  ];

  const commands = [
    "npm install",
    "npm run dev"
  ];

  const batFileContent = `@echo off
chcp 65001 >nul
echo Starting Character Card Creator...
echo.
echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Starting development server...
echo The application will be available at http://localhost:8080
echo Press Ctrl+C to stop the server
echo.
call npm run dev
pause`;

  const packageJsonContent = `{
  "name": "character-card-creator",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.0",
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-alert-dialog": "^1.1.1",
    "@radix-ui/react-aspect-ratio": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-checkbox": "^1.1.1",
    "@radix-ui/react-collapsible": "^1.1.0",
    "@radix-ui/react-context-menu": "^2.2.1",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-hover-card": "^1.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-menubar": "^1.1.1",
    "@radix-ui/react-navigation-menu": "^1.2.0",
    "@radix-ui/react-popover": "^1.1.1",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.0",
    "@radix-ui/react-scroll-area": "^1.1.0",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slider": "^1.2.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.1",
    "@radix-ui/react-toggle": "^1.1.0",
    "@radix-ui/react-toggle-group": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.4",
    "@tanstack/react-query": "^5.56.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.0",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.3.0",
    "input-otp": "^1.2.4",
    "lucide-react": "^0.462.0",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.53.0",
    "react-resizable-panels": "^2.1.3",
    "react-router-dom": "^6.26.2",
    "recharts": "^2.12.7",
    "sonner": "^1.5.0",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.3",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@typescript-eslint/eslint-plugin": "^7.2.0",
    "@typescript-eslint/parser": "^7.2.0",
    "@vitejs/plugin-react-swc": "^3.5.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.6",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.2.2",
    "vite": "^5.2.0"
  }
}`;

  const downloadBatFile = () => {
    const blob = new Blob([batFileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'start-server.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: language === 'en' ? "Downloaded" : "下载完成",
      description: language === 'en' ? "start-server.bat has been downloaded" : "start-server.bat 文件已下载",
    });
  };

  const downloadPackageJson = () => {
    const blob = new Blob([packageJsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'package.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: language === 'en' ? "Downloaded" : "下载完成",
      description: language === 'en' ? "package.json has been downloaded" : "package.json 文件已下载",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: language === 'en' ? "Copied" : "已复制",
      description: language === 'en' ? "Command copied to clipboard" : "命令已复制到剪贴板",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Server className="w-4 h-4" />
          {language === 'en' ? 'Local Deployment' : '本地部署'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Terminal className="w-5 h-5" />
            {language === 'en' ? 'Local Deployment Guide' : '本地部署指南'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* 部署步骤 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  {language === 'en' ? 'Deployment Steps' : '部署步骤'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deploymentSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 系统要求 */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'en' ? 'System Requirements' : '系统要求'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">{language === 'en' ? 'Required Software' : '必需软件'}</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Node.js 18+</li>
                      <li>• npm (comes with Node.js)</li>
                      <li>• {language === 'en' ? 'Modern web browser' : '现代网络浏览器'}</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">{language === 'en' ? 'System Support' : '系统支持'}</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Windows 10/11</li>
                      <li>• macOS 10.15+</li>
                      <li>• Linux (Ubuntu/Debian)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 命令行指令 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  {language === 'en' ? 'Command Line Instructions' : '命令行指令'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commands.map((command, index) => (
                    <div key={index} className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {index === 0 
                          ? (language === 'en' ? 'Install dependencies:' : '安装依赖:')
                          : (language === 'en' ? 'Start development server:' : '启动开发服务器:')
                        }
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
                          {command}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(command)}
                        >
                          {language === 'en' ? 'Copy' : '复制'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 下载文件 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  {language === 'en' ? 'Download Files' : '下载文件'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">start-server.bat</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {language === 'en' 
                          ? 'Automated startup script for Windows. Double-click to run after downloading project files.'
                          : 'Windows 自动启动脚本。下载项目文件后双击运行。'
                        }
                      </p>
                      <Button onClick={downloadBatFile} className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Download .bat File' : '下载 .bat 文件'}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">package.json</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {language === 'en' 
                          ? 'Project configuration file containing all dependencies and scripts.'
                          : '项目配置文件，包含所有依赖和脚本。'
                        }
                      </p>
                      <Button onClick={downloadPackageJson} className="w-full" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Download package.json' : '下载 package.json'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 使用说明 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  {language === 'en' ? 'Usage Instructions' : '使用说明'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                      {language === 'en' ? 'Quick Start (Windows)' : '快速启动（Windows）'}
                    </h4>
                    <ol className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
                      <li>1. {language === 'en' ? 'Download all project files from Lovable' : '从 Lovable 下载所有项目文件'}</li>
                      <li>2. {language === 'en' ? 'Download the start-server.bat file above' : '下载上面的 start-server.bat 文件'}</li>
                      <li>3. {language === 'en' ? 'Place the .bat file in the project root directory' : '将 .bat 文件放在项目根目录'}</li>
                      <li>4. {language === 'en' ? 'Double-click start-server.bat to run' : '双击 start-server.bat 运行'}</li>
                    </ol>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <h4 className="font-medium mb-2 text-green-900 dark:text-green-100">
                      {language === 'en' ? 'Manual Setup' : '手动设置'}
                    </h4>
                    <ol className="text-sm space-y-1 text-green-800 dark:text-green-200">
                      <li>1. {language === 'en' ? 'Install Node.js from https://nodejs.org' : '从 https://nodejs.org 安装 Node.js'}</li>
                      <li>2. {language === 'en' ? 'Open terminal/command prompt in project directory' : '在项目目录打开终端/命令提示符'}</li>
                      <li>3. {language === 'en' ? 'Run: npm install' : '运行: npm install'}</li>
                      <li>4. {language === 'en' ? 'Run: npm run dev' : '运行: npm run dev'}</li>
                      <li>5. {language === 'en' ? 'Open http://localhost:8080 in browser' : '在浏览器打开 http://localhost:8080'}</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LocalDeploymentPanel;
