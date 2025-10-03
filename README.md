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

## ![image](image/image01.png)

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

## Technology Stack

This project is built on modern web technology:

- **React** - User Interface Framework
- **Type Script** - Type-safe Java Script
- **Vite** - Quick build tool
- **Electron** - Cross-platform desktop application framework
- **Tailwind CSS** - Practical and priority CSS framework
- **shadcn/ui** - High-quality React component library

## Get started quickly

### Environmental Requirements

Make sure your system is installed:

- Node js (recommended to use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) Installation)
- npm package manager

### Install and run

```bash
# 1. Clone project
git clone <YOUR_GIT_URL>

# 2. Enter the project directory
cd tavern-card-crafter-v3

# 3. Installation dependencies
npm install

# 4. Start the development server (Web version)
npm run dev

# Or start desktop application development mode
npm run electron-dev
```

- **Web version**: Access in the browser `http://localhost:8080`
- **Desktop Version**: Automatically open the Electron desktop application window

### Build and run

#### Web Version

```bash
# Build a web version
npm run build

# Preview build results
npm run preview
```

#### Desktop application version

```bash
# Quickly run desktop applications (production mode)
npm run electron

# Build and run desktop applications
npm run electron-pack

# Build a desktop application installation package
npm run electron-build
```

## User Guide

### 🚀 Start quickly

1. **Start the application**: use `npm run electron-dev`(Development) or `npm run electron`(Production)
2. **Select working mode**: Use the left tab to switch between the three functions

### 📋 Detailed explanation of functions

#### 🤖 AI character card assistant

1. **Paste content**: Paste any character-related text into the input box
2. **Select type**: Select character type (animation, games, novels, historical characters, etc.)
3. **AI Generation**: Click "AI Analysis Generation", and AI will intelligently extract and generate structured information
4. **Fill in**: with one click: Select the generated field and fill in the role editor with one click

#### ✏️ Character information editing

1. **Basic Information**: Fill in the basic information such as character name, description, avatar, etc.
2. **Personality Setting**: Describe the character characteristics and behavior patterns of the character in detail
3. **Dialogue System**: Write first message, conversation examples and alternative greetings
4. **Worldview Settings**: Add character book entries to enrich background settings
5. **Tag management**: Adding relevant tags to roles is easy to classify

#### 📄 JSON Preview

1. **Real-time preview**: View the generated JSON format role card
2. **Syntax Highlight**: Color displays JSON structure for easy reading
3. **Statistics**: Display the total number of characters and tokens
4. **Export function**:

- **JSON Export**: Standard JSON format file
- **PNG Export**: Embed the character card into the picture (need to upload the avatar)
- **Copy to clipboard**: Quickly copy JSON content

### 💡 Usage Tips

- **AI Assistant**: You can paste any related text such as character introduction, novel clips, game information, etc.
- **Step editing**: Use tabs to focus on AI generation, manual editing, and preview export respectively
- **Real-time synchronization**: The data of three tabs is synchronized in real time, and the effect can be switched to view at any time.

## Project structure

```
src/
├── components/          # React Components
│   ├── CharacterForm/   # Role Edit Form Component
│   │   ├── AIAssistant.tsx      # AI character card assistant
│   │   ├── BasicInfoSection.tsx # Basic information edit
│   │   ├── PersonalitySection.tsx # Personality traits Edit
│   │   └── ...
│   ├── CharacterPreview.tsx     # JSON preview component
│   ├── AISettings.tsx           # AI Setup Components
│   ├── ui/             # Basic UI components (shadcn/ui）
│   └── ...
├── pages/              # Page Components
│   └── Index.tsx       # Main page (sidebar tab layout)
├── contexts/           # React context
│   ├── LanguageContext.tsx     # Multilingual support
│   └── ThemeContext.tsx        # Topic Switch
├── hooks/              # Custom Hook
├── utils/              # Tool functions
│   └── aiGenerator.ts  # AI generation related tools
├── lib/                # Library files
└── electron/           # Electron main process file
    ├── main.cjs        # Main process entry
    └── preload.js      # Preload scripts
```

## Contribution Guide

Welcome to submit Issue and Pull Request to help improve your project!

## License

This project adopts a MIT license. For details, please see the LICENSE file.

---

_Make AI character creation simpler and more efficient! _
