
# Tavern Card Crafter - AI character card maker

## Project Introduction

Tavern Card Crafter is a professional AI character card maker that helps users easily create and edit character cards for chatbots and roleplay. The tool offers an intuitive interface and powerful features that make character creation easy and efficient.

## Key features:

### 🤖 AI intelligent assistant
- **Intelligent Character Creation**: Quickly generate basic character information through AI assistants
- **Multi-genre support**: Supports different types of characters such as anime, games, novels, and historical figures
- **Intelligent Content Extraction**: Paste any text, and AI automatically extracts and generates structured character information

### ✏️ Full character editing
- **Basic information**: Name, description, first-person perspective, etc
- **Personality Traits**: Detailed personality traits and behavior patterns
- **Setting Setting**: Backstory and environment description
- **Dialogue System**: Sample dialogues, greetings, alternative greetings
- **Character Book**: Worldview setting and memory entries
- **Tag Classification**: Role labeling and metadata management

![image](image/image01.png)
---
![image](image/image02.png)
### \uD83D\uDCF1 Multi-platform support
- **Web version**: Browser direct access and use
- **Desktop App**: A cross-platform Electron desktop app
- **Sidebar Layout**: AI assistant, character editing, JSON preview split tab interface

### \uD83D\uDD27 Practical features
- **Real-time preview**: Real-time preview in JSON format, syntax highlighting
- **Multi-format export**: Supports JSON and PNG format export
- **Localized Interface**: Completely Chinese interface, easy and intuitive to operate
- **Responsive Design**: Supports a wide range of devices and screen sizes
---
![image](image/image03.png)

## 技术栈

本项目基于现代Web技术构建：

- **React** - 用户界面框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速的构建工具
- **Electron** - 跨平台桌面应用框架
- **Tailwind CSS** - 实用优先的CSS框架
- **shadcn/ui** - 高质量的React组件库

## 快速开始

### 环境要求

确保您的系统已安装：
- Node.js (推荐使用 [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) 安装)
- npm 包管理器

### 安装和运行

```bash
# 1. 克隆项目
git clone <YOUR_GIT_URL>

# 2. 进入项目目录
cd tavern-card-crafter-v3

# 3. 安装依赖
npm install

# 4. 启动开发服务器（Web版本）
npm run dev

# 或启动桌面应用开发模式
npm run electron-dev
```

- **Web版本**：在浏览器中访问 `http://localhost:8080`
- **桌面版本**：自动打开 Electron 桌面应用窗口

### 构建和运行

#### Web 版本
```bash
# 构建 Web 版本
npm run build

# 预览构建结果
npm run preview
```

#### 桌面应用版本
```bash
# 快速运行桌面应用（生产模式）
npm run electron

# 构建并运行桌面应用
npm run electron-pack

# 构建桌面应用安装包
npm run electron-build
```

## 使用指南

### 🚀 快速开始
1. **启动应用**: 使用 `npm run electron-dev`（开发）或 `npm run electron`（生产）
2. **选择工作模式**: 使用左侧选项卡在三个功能间切换

### 📋 功能详解

#### 🤖 AI角色卡助手
1. **粘贴内容**: 将角色相关的任意文本粘贴到输入框
2. **选择类型**: 选择角色类型（动漫、游戏、小说、历史人物等）
3. **AI生成**: 点击"AI分析生成"，AI将智能提取并生成结构化信息
4. **一键填入**: 选择生成的字段，一键填入到角色编辑器

#### ✏️ 角色信息编辑
1. **基本信息**: 填写角色姓名、描述、头像等基础信息
2. **个性设定**: 详细描述角色的性格特征和行为模式
3. **对话系统**: 编写首条消息、对话示例和替代问候语
4. **世界观设定**: 添加角色书条目，丰富背景设定
5. **标签管理**: 为角色添加相关标签便于分类

#### 📄 JSON 预览
1. **实时预览**: 查看生成的JSON格式角色卡
2. **语法高亮**: 彩色显示JSON结构，便于阅读
3. **统计信息**: 显示总字符数和Token数量
4. **导出功能**:
   - **JSON导出**: 标准JSON格式文件
   - **PNG导出**: 将角色卡嵌入图片中（需上传头像）
   - **复制到剪贴板**: 快速复制JSON内容

### 💡 使用技巧
- **AI助手**: 可以粘贴角色介绍、小说片段、游戏资料等任意相关文本
- **分步编辑**: 使用选项卡分别专注于AI生成、手动编辑和预览导出
- **实时同步**: 三个选项卡的数据实时同步，随时切换查看效果

## 项目结构

```
src/
├── components/          # React组件
│   ├── CharacterForm/   # 角色编辑表单组件
│   │   ├── AIAssistant.tsx      # AI角色卡助手
│   │   ├── BasicInfoSection.tsx # 基本信息编辑
│   │   ├── PersonalitySection.tsx # 个性特征编辑
│   │   └── ...
│   ├── CharacterPreview.tsx     # JSON预览组件
│   ├── AISettings.tsx           # AI设置组件
│   ├── ui/             # 基础UI组件（shadcn/ui）
│   └── ...
├── pages/              # 页面组件
│   └── Index.tsx       # 主页面（侧边栏选项卡布局）
├── contexts/           # React上下文
│   ├── LanguageContext.tsx     # 多语言支持
│   └── ThemeContext.tsx        # 主题切换
├── hooks/              # 自定义Hook
├── utils/              # 工具函数
│   └── aiGenerator.ts  # AI生成相关工具
├── lib/                # 库文件
└── electron/           # Electron主进程文件
    ├── main.cjs        # 主进程入口
    └── preload.js      # 预加载脚本
```

## 贡献指南

欢迎提交Issue和Pull Request来帮助改进项目！

## 许可证

本项目采用MIT许可证。详情请查看LICENSE文件。

---

*让AI角色创作变得更简单、更高效！*
