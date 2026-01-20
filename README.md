# Tavern Card Crafter - AI character card maker

---

## Project Introduction

This app began as an exclusively vibed character creator in Mandarin by user @Idun & Co.  I initially just wanted to fully translate it to EN, but the .PNG save function didn't work.  So I fixed that, then got to tinkering a little.  Like, for example, all of the elements of the version 3 card weren't captured. Not like we're ever going to use all of them, but just in case, they're there.

**However, today, the most import change is finally fully working (fingers crossed).**  Arguably the most important part of this or any similar application is the prompt sent to the AI helper.  Previously, they were hardcoded.  Now they're fully exposed. in-app editable and they save to an external .JSON file along side the executable.  Plus, feel free to break things experimenting; the defaults are still hardcoded to come to the rescue of a misplaced comma or un-escaped double-quote control character or three.

'That's cool,' you say, 'but you still didn't make it so that I could save my damned API key.'  And you'd be right.  But that's next.  I'd argue that editable prompts is much more important--and I'd be right.  Next week? External settings file.  And by March?  This thing will not only be creating all of your characters AND personae, it'll be playing them through to your bluetooth snowboard helmet headphones so that you can go get some fresh air...if that's still a thing.

![UI dark view](img/2025-10-23_113717.png "Dark")

![UI light view](img/2025-10-23_113814.png "Light")

### Key features

#### 🧩 Prompt Management (FINALLY)

- **Detestable Defaults** I spent a great deal of time coming up with perfectly mediocre prompts designed to leave you hungry and wanting. What better motivator to get you to hunt down that last shred of creativity?
- **Editable prompt templates**: Manage and edit prompt templates used across AI generation flows. Like, huh? Rename the saved prompts.json to prompts.YourMom and swap it in when you're making 'YourMom' bots.

#### 🤖 Hey Bots! Get Bots to make your bots

- **But Seriously** use the buggers for a little kick start. If you don't edit afterwards, your character will taste like ash.
- **AI Character Creation**: Quickly generate structured character information from free text using AI.
- **Multi-milieu support**: Stock types like anime, gaming, classic fiction, historical figures, to help compensate for full creative constipation.
- **AI Content Extraction**: Paste any text (novel excerpt, Mom's recipe cards, apology emails you never sent), and AI will extract and convert it into structured character fields and do what it does so well... Hallucinate details.
- **Prompt persistence**: User-created or edited prompts are persisted across sessions. Because they're in an external file.... Did I mention that already? On Desktop (packaged Electron releases) prompts are saved/persisted via Electron IPC to local file, prompts.json.

NOTE: For easy laziness, use the electron slop, err, app. The electron *app*... in releases. To your right.

#### ⚙️ AI Settings improvements

- **Any OpenAI-compatible API**: Builtin; Local options, plus OpenRouter, OpenAI, DeepSeek, Moonshot, OneAPI, Zhipu, and, of course, Yi.
- **Connection & generation controls**: Configure model/host settings, inference temperature, and max tokens. Who knows? Maybe your backend will even listen and obey. (Yes. I'm talking to you, rogue OpenRouter providers).

#### 📟 Multi-platform support (AI **really** wants me to lie to you about this. So I guess I will)

- **Dev/PITA version**: Browser access and use (Vite & Node.js based).
- **Desktop App**: *(Theoretically Cross-platform)* Electron desktop app with (also theoretical) filesystem access.
- **Sidebar Layout**: Because clickable menus are still easier than psychic links.

#### 🛠 Practical features

- **Real-time preview**: That's right kids. Gone are the days when the Type Setters Union has you over a barrel at the eleventh hour. Welcome to 1987!
- **Multi-format export**: Export cards as JSON and PNG formats (PNG export embeds the character card into an image; avatar upload required). That's right. Two. *That twice as many as one!*
- **Language & localization**: The UI is now primarily English. If anyone wants to check and see if the Mandarin is still correct, cool, let me know. Wanna translate into your own native scrawl? PR me your language under /src/contents/LanguageContext.tsx
- **Responsive Design**: Because. You can drag that bottom right corner wherever the hell you feel like.  I mean... don't get too crazy. But *almost* wherever.

#### ✏️ Full character editing *(character card v3)*

- **Basic information**, **Personality Traits**, **Scenario Settings**, **Dialogue**, **Character/Lore Book**, **Keyword/Tag Classification**: Everything from the version 3 spec.

![Pretty UI Picture](img/2025-10-23_114242.png)

---

# User Guide

## 🚀 Quick Start

1. Download and execute the application from Releases.
2. Enter your API key and pick a model in the 'AI Settings'.
3. Type words and click buttons.

## 📋 Detailed explanation of functions

### 🤖 AI character card from thin air

1. So, you can cut and paste something from fandom, wikipedia, or your friend's facebook page.
2. Then pick from a stock writing type (anime, gaming, novels, even well-known dead folk, etc. *(there is not et cetera)*).
3. Click "AI Analysis / Generation" — AI will not just extract, but also shamelessly embellish structured character fields.
4. Click generated fields to fill them into the Editor with one click.

### 🧾 Prompt templates and AI Settings

1. Open AI Settings and switch to the "Prompts Editor" tab.
2. Create or edit prompt templates in the PromptEditor UI.
3. Save templates — saved prompts persist across sessions (Electron packaged releases: filesystem via IPC; Web: localStorage).
4. As you add/fill in an element into the card, that new element gets sent to your AI assistant of choice, cluing them in on where you're going with this whole idea of yours. So if you work the form from top to bottom, each field gets added to what's sent in with the prompt.

### ✏️ Established Character Editing

Downloaded a card from Janny, Chub, or RisuAI, but it just isn't up (or down) to your standard?

1. Edit basic fields (name, description, avatar).
2. Edit moderate fields (personality, behavior patterns, and special scenario notes).
3. Edit fields of three and four dimensional space (first message, examples, and alternative greetings).
4. Teach your bot differential equations and then make it thinks it's Jim Simons.  You'll be broke or a billionaire in no time.

### 📄 JSON Preview

![preview the generated JSON before saving](img/2025-10-23_114417.png "JSON view")

1. Real-time JSON preview of the generated character card. That's right folks. When I said no more waiting for the type setter, I meant it! Bye bye thermographers! No more servants of questionable will carving stones. Bend photons to your will with reckless abandon!
2. Syntax highlighting now with de-fanged HTML content, sparing you from XSS vectors, vixens and vexes.
3. Statistics: shows total characters and token estimation for the total card and each field.
4. FIVE Export options:
   - JSON Export: download a standard JSON file.
   - PNG Export: export an image of the character card (requires avatar upload).
   - Copy to clipboard: quickly copy JSON content without even touching ctrl-C!
   - Read it from the screen and handwrite it on to a real piece of paper.
   - TTS it and record it into that old Sony Walkman.

## 💡 Usage Tips

- Use the AI Assistant to quickly bootstrap a card, then refine in the editor. Or don't. Maybe pride is just another obstacle to overcome.
- Create reusable prompts for specific genres/tones in the PromptEditor to get consistent results.
- The UI synchronizes data across the AI assistant, editor, and preview tabs in real time, because even copper-bound energy moves damn near as fast as light.

---

![For you light-loving masochists](img/2025-10-23_113929.png "AI results")

## For Development: Get started quickly (Probably don't read any of this, but AI likes to talk almost as much as I do, so it had to write another damned chapter.)

### Technology Stack (Pile? Mixed Salad?)

This project uses modern web and desktop technologies:

- React - User Interface Framework
- TypeScript - Type-safe JavaScript
- Vite - Fast build/development tooling
- Electron - Cross-platform desktop application wrapper
- Tailwind CSS - Utility-first CSS framework
- shadcn/ui - Component primitives and patterns

### Environmental Requirements

Make sure your system has:

- A minimally functional keyboard and mouse
- Node.js (use nvm if you want to manage Node versions)
- npm (or pnpm or yarn or...)

### Install and run

```bash
git clone https://github.com/aleph23/tavern-card-crafter-v3 tcc
cd tcc
nvm use <yourfavenodeversion>
npm install
npm run dev
```

Or for the bloat-lover in you

```bash
npm run electron-dev
```

- Web version: open `http://localhost:8080` (or the port Vite reports) in your browser
- Desktop (dev): running `npm run electron-dev` will open an Electron development window
- Desktop (full prompt persistence): Just be lazy and download the .exe.  Save your creative juices for your character development.

---

## Project structure

Note: The project file structure has undergone significant changes to support prompt management, prompt persistence, localized UI, and modular AI integration. The tree below is a representative layout; consult the repository for the canonical structure.

```vtree
src/
├── components/
│   ├── CharacterForm/
│   │   ├── AIAssistant.tsx
│   │   ├── AlternateGreetings.tsx
│   │   ├── BasicInfoSection.tsx
│   │   ├── CharacterBook.tsx
│   │   ├── MetadataSection.tsx
│   │   ├── PersonalitySection.tsx
│   │   ├── PromptsSection.tsx
│   │   └── TagsSection.tsx
│   ├── AISettings.tsx
│   ├── CharacterPreview.tsx
│   ├── PromptEditor.tsx
│   ├── Toolbar.tsx
│   └── ui/                          ## Third-party stock UI elements
├── config/
│   └──  defaultPrompts.json
├── contents/
│   ├── LanguageContent.tsx
│   └── ThemeContent.tsx
├── hooks/
│   ├── generatorHook.ts
│   ├── use-toast.ts
│   └── use-mobile.tsx
├── lib/
│   └── utils.ts
├── pages/
│   └── Index.tsx
├── utils/
│   ├── aiGenerator.ts
│   ├── buildApiUrl.ts
│   ├── promptManager.ts
│   ├── promptMigration.ts
├── types/
│   └── prompts.ts
└── electron/
    ├── main.cjs
    ├── preload.js
```

## Contribution Guide

Howdy — issues and pull requests are things you can do. If you add providers or functionality, include tests or don't. Sharing of prompts is always welcome. If it doesn't work, don't assume I already know.  Because I don't already know.  As best I can tell, it's perfect, so unless you say otherwise, I remain in another world.

## License

This project was licensed under the MIT license and I am way too not giving a damn to change that. See the LICENSE file for details. Or consider getting a life. Your choice.

---

## Changelog

### v0.3.0 (1/19/26)

#### New Features

- Add a prompt management system with editable templates, including a PromptEditor UI, default prompt configuration, and prompt interpolation utilities used across AI generation flows.
- Persist user-defined prompts via Electron IPC and local storage, with support for loading, saving, and resetting prompts in both desktop and web environments.
- Extend the AI settings dialog with tabbed navigation separating connection parameters from prompt template management.

#### Bug Fixes

- Escape JSON content before syntax highlighting in the character preview to prevent XSS vulnerabilities.
- Correct AI temperature handling by using a dedicated infTemp setting instead of overloading the generic temperature field.

#### Enhancements

- Refine AI settings layout with a wider dialog and clearer organization of connection and generation parameters.
- Centralize AI generation prompt text into reusable templates rather than hardcoded strings, simplifying future changes and localization.
- Add clearer error messaging for missing local models and for prompt save failures, including friendlier permission-denied guidance.
- Document and slightly clean up Electron window-creation logic and character preview documentation comments for better maintainability.

### 1/12/26

- Configurable temperature and max token response accessible via 'AI Settings'

### 10/25

- Translated to English from original repo.
- **Got saving to a PNG file actually working!**
- Only tested with local and openrouter. If you have trouble with another provider, please open an issue.
