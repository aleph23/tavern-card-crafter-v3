
# Tavern Card Crafter - AI角色卡制作工具

## 项目简介

Tavern Card Crafter 是一个专业的AI角色卡片制作工具，帮助用户轻松创建和编辑用于聊天机器人和角色扮演的角色卡片。该工具提供直观的界面和强大的功能，让角色创作变得简单高效。

## 主要功能

- **智能角色创建**: 通过AI助手快速生成角色基础信息
- **完整角色编辑**: 支持角色的详细信息编辑，包括：
  - 基本信息（姓名、描述、第一人称视角等）
  - 个性特征和行为模式
  - 场景设定和背景故事
  - 示例对话和问候语
  - 角色标签和分类
- **实时预览**: 编辑过程中实时查看角色卡片效果
- **多格式导出**: 支持JSON格式导出，兼容主流AI聊天平台
- **本地化界面**: 完全中文界面，操作简单直观
- **响应式设计**: 支持各种设备和屏幕尺寸

## 技术栈

本项目基于现代Web技术构建：

- **React** - 用户界面框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速的构建工具
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

# 4. 启动开发服务器
npm run dev
```

启动后，在浏览器中访问 `http://localhost:8080` 即可开始使用。

### 构建生产版本

```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 使用指南

1. **创建角色**: 在主界面填写角色的基本信息
2. **设置个性**: 详细描述角色的性格特征和行为模式
3. **编写对话**: 添加示例对话和问候语
4. **预览效果**: 实时查看角色卡片的最终效果
5. **导出使用**: 将角色卡片导出为JSON格式，导入到您喜欢的AI聊天平台

## 项目结构

```
src/
├── components/          # React组件
│   ├── CharacterForm/   # 角色编辑表单组件
│   ├── ui/             # 基础UI组件
│   └── ...
├── pages/              # 页面组件
├── contexts/           # React上下文
├── hooks/              # 自定义Hook
├── utils/              # 工具函数
└── lib/                # 库文件
```

## 贡献指南

欢迎提交Issue和Pull Request来帮助改进项目！

## 许可证

本项目采用MIT许可证。详情请查看LICENSE文件。

---

*让AI角色创作变得更简单、更高效！*
