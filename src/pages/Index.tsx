import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/glass/button'
import { Upload } from 'lucide-react'
import { UserIcon as User } from '@/components/ui/user'
import { FileTextIcon as FileText } from '@/components/ui/file-text'
import { BotMessageSquareIcon as Bot } from '@/components/ui/bot-message-square'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/glass/scroll-area'
import { useLanguage } from '@/contexts/LanguageContext'
import { CharacterCardV3, CharacterCardV2, CharacterDataV3, CharacterBookEntry, Asset } from '@/types/charactercard'
import ConfigEditor from '@/components/ConfigEditor'
import { Settings as AISettingsType } from '@/types/settings'
import { DEFAULT_SETTINGS } from '@/config/defaultSettings'
import Toolbar from '@/components/Toolbar'
import BasicInfoSection from '@/components/CharacterForm/BasicInfoSection'
import PersonalitySection from '@/components/CharacterForm/PersonalitySection'
import PromptsSection from '@/components/CharacterForm/PromptsSection'
import AlternateGreetings from '@/components/CharacterForm/AlternateGreetings'
import CharacterBook from '@/components/CharacterForm/CharacterBook'
import TagsSection from '@/components/CharacterForm/TagsSection'
import MetadataSection from '@/components/CharacterForm/MetadataSection'
import CharacterPreview from '@/components/CharacterPreview'
import AIAssistant from '@/components/CharacterForm/AIAssistant'
import { configManager } from '@/utils/configManager'

type GenericField = string | string[] | CharacterBookEntry[] | Record<string, unknown> | Asset[] | boolean | number

/**
 * Main component for managing AI character card functionality.
 *
 * This component handles the import of character data from JSON and PNG files, manages AI settings, and provides a user interface for editing character information. It utilizes various hooks to manage state and effects, including loading saved settings from local storage and updating character data based on user input. The component also features a tabbed interface for different functionalities such as editing and previewing character data.
 *
 * @returns JSX.Element representing the character card interface.
 */
const Index = () => {
  const { toast } = useToast()
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState('assistant')
  const [aiSettings, setAISettings] = useState<AISettingsType | null>(null)
  const today = new Date().toISOString().split('T')[0]

  const [characterData, setCharacterData] = useState<CharacterCardV3>({
    spec: 'chara_card_v3',
    spec_version: '3.0',
    data: {
      name: '',
      nickname: '',
      description: '',
      personality: '',
      mes_example: '',
      scenario: '',
      first_mes: '',
      alternate_greetings: [],
      tags: [],
      creator: '',
      character_version: '',
      creator_notes: '',
      creator_notes_multilingual: {},
      system_prompt: '',
      post_history_instructions: '',
      character_book: { entries: [] },
      group_only_greetings: [],
      creation_date: '',
      modification_date: today,
      extensions: {},
      assets: [],
    },
  })

  const [characterImage, setCharacterImage] = useState<string | null>(null)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        await configManager.loadConfig()
        const settings = configManager.getActiveAISettings()
        if (settings) {
          setAISettings(settings)
        } else {
          setAISettings(DEFAULT_SETTINGS)
        }
      } catch (error) {
        console.error('Failed to load AI settings:', error)
        setAISettings(DEFAULT_SETTINGS)
      }
    }
    loadSettings()
  }, [])

  /**
   * Updates AI settings and displays a toast notification.
   */
  const handleAISettingsChange = (newSettings: AISettingsType) => {
    setAISettings(newSettings)
    toast({
      title: t('settingsUpdated') || 'Settings updated',
      description: t('settingsUpdatedDesc') || 'AI settings have been successfully updated and saved',
    })
  }

  /**
   * Updates a specified field in the character data with a new value and sets the modification date.
   */
  const updateField = useCallback((field: string, value: GenericField) => {
    setCharacterData((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value, modification_date: new Date().toISOString().split('T')[0] },
    }))
  }, [])

  const handleInsertField = (field: string, value: string | string[]) => {
    if (field === 'tags' && Array.isArray(value)) {
      // Merge existing tags and new tags to deduplicate
      const existingTags = characterData.data.tags || []
      const newTags = [...new Set([...existingTags, ...value])]
      updateField('tags', newTags)
    } else {
      updateField(field, value)
    }
  }

  /**
   * Extract character data from a PNG file.
   *
   * This function reads a PNG file and searches for character data within it using multiple methods:
   * first by locating the tEXt chunk, then by performing a string search for JSON patterns,
   * and finally by searching for base64 encoded data. If character data is found, it resolves the promise
   * with the parsed data; otherwise, it rejects with an error.
   *
   * @param file - The PNG file from which to extract character data.
   * @returns A promise that resolves with the extracted character data.
   * @throws Error If the file cannot be read or if no character data is found.
   */
  const extractPNGCharacterData = async (file: File): Promise<GenericField> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          const uint8Array = new Uint8Array(arrayBuffer)

          console.log('PNG file size:', uint8Array.length)

          // Method 1: Find PNG t EXt block
          let foundData = null

          // PNG t EXt block search
          for (let i = 8; i < uint8Array.length - 8; i++) {
            // Read block length
            const chunkLength =
              (uint8Array[i] << 24) | (uint8Array[i + 1] << 16) | (uint8Array[i + 2] << 8) | uint8Array[i + 3]

            // Check if it is a t EXt block (0x74455874)
            if (
              uint8Array[i + 4] === 0x74 &&
              uint8Array[i + 5] === 0x45 &&
              uint8Array[i + 6] === 0x58 &&
              uint8Array[i + 7] === 0x74
            ) {
              console.log('Found tEXt chunk at:', i, 'length:', chunkLength)

              const textStart = i + 8
              const textEnd = textStart + chunkLength

              if (textEnd <= uint8Array.length) {
                try {
                  // Find keyword end position (null bytes)
                  let keyEnd = textStart
                  while (keyEnd < textEnd && uint8Array[keyEnd] !== 0) {
                    keyEnd++
                  }

                  // Decode keywords using UTF-8
                  const keyword = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array.slice(textStart, keyEnd))
                  console.log('tEXt keyword:', keyword)

                  // Check whether it is a keyword related to a character card
                  if (keyword === 'chara' || keyword === 'card_v3' || keyword === 'card_v2' || keyword === 'Comment') {
                    const dataStart = keyEnd + 1
                    const textDataBytes = uint8Array.slice(dataStart, textEnd)

                    console.log('Found potential character data, length:', textDataBytes.length)

                    // Try base64 decoding
                    try {
                      // First decode with UTF-8
                      const textData = new TextDecoder('utf-8', { fatal: false }).decode(textDataBytes)
                      const decoded = atob(textData)

                      // Convert base64 decoded bytes to UTF-8 strings
                      const decodedBytes = new Uint8Array(decoded.length)
                      for (let j = 0; j < decoded.length; j++) {
                        decodedBytes[j] = decoded.charCodeAt(j)
                      }
                      const decodedText = new TextDecoder('utf-8', { fatal: false }).decode(decodedBytes)
                      const parsed = JSON.parse(decodedText)

                      console.log('Successfully parsed base64 JSON with UTF-8 handling')
                      foundData = parsed
                      break
                    } catch (e) {
                      // Try to parse directly on JSON
                      try {
                        const textData = new TextDecoder('utf-8', { fatal: false }).decode(textDataBytes)
                        const parsed = JSON.parse(textData)
                        console.log('Successfully parsed direct JSON with UTF-8 handling')
                        foundData = parsed
                        break
                      } catch (e2) {
                        console.log('Failed to parse as JSON')
                      }
                    }
                  }
                } catch (e) {
                  console.log('Error processing tEXt chunk:', e)
                }
              }

              // Jump to the next block
              i += 8 + chunkLength + 4 - 1 // -1 Because the for loop will+1
            }
          }

          // Method 2: If the t EXt block method fails, try string search
          if (!foundData) {
            console.log('tEXt method failed, trying string search...')

            // Using UTF-8 Decoder handles the entire file
            const decoder = new TextDecoder('utf-8', { fatal: false })
            const fullText = decoder.decode(uint8Array)

            // Find possible JSON start locations
            const jsonPatterns = [
              /"spec"\s*:\s*"chara_card_v[123]"/g,
              /"name"\s*:\s*"/g,
              /\{\s*"name"\s*:/g,
              /\{\s*"char_name"\s*:/g,
            ]

            for (const pattern of jsonPatterns) {
              const matches = [...fullText.matchAll(pattern)]
              console.log(`Pattern ${pattern.source} found ${matches.length} matches`)

              for (const match of matches) {
                if (!match.index) {
                  continue
                }
                // Backwards looking for braces at the beginning of JSON
                let jsonStart = match.index
                while (jsonStart > 0 && fullText[jsonStart] !== '{') {
                  jsonStart--
                }

                if (jsonStart >= 0) {
                  // Looking forward to the end of JSON
                  let braceCount = 0
                  let jsonEnd = -1

                  for (let i = jsonStart; i < fullText.length; i++) {
                    if (fullText[i] === '{') {
                      braceCount++
                    }
                    if (fullText[i] === '}') {
                      braceCount--
                    }
                    if (braceCount === 0 && i > jsonStart) {
                      jsonEnd = i + 1
                      break
                    }
                  }

                  if (jsonEnd > jsonStart) {
                    try {
                      const jsonStr = fullText.substring(jsonStart, jsonEnd)
                      const parsed = JSON.parse(jsonStr)
                      console.log('Successfully parsed JSON from string search with UTF-8')
                      foundData = parsed
                      break
                    } catch (e) {
                      console.log('Failed to parse extracted JSON')
                    }
                  }
                }
              }

              if (foundData) {
                break
              }
            }
          }

          // Method 3: Find base64 encoded data
          if (!foundData) {
            console.log('String search failed, trying base64 search...')

            const decoder = new TextDecoder('utf-8', { fatal: false })
            const fullText = decoder.decode(uint8Array)

            // Find a long base64 string
            const base64Pattern = /[A-Za-z0-9+/]{100,}={0,2}/g
            const base64Matches = [...fullText.matchAll(base64Pattern)]

            console.log(`Found ${base64Matches.length} potential base64 strings`)

            for (const match of base64Matches) {
              try {
                const decoded = atob(match[0])

                // Convert base64 decoded bytes to UTF-8 strings
                const decodedBytes = new Uint8Array(decoded.length)
                for (let j = 0; j < decoded.length; j++) {
                  decodedBytes[j] = decoded.charCodeAt(j)
                }
                const decodedText = new TextDecoder('utf-8', { fatal: false }).decode(decodedBytes)

                if (
                  decodedText.includes('"name"') ||
                  decodedText.includes('"char_name"') ||
                  decodedText.includes('chara_card')
                ) {
                  const parsed = JSON.parse(decodedText)
                  console.log('Successfully parsed base64 character data with UTF-8')
                  foundData = parsed
                  break
                }
              } catch (e) {
                // Keep trying the next one
              }
            }
          }

          if (foundData) {
            console.log('Character data found:', foundData)
            resolve(foundData)
          } else {
            console.log('No character data found in PNG')
            reject(new Error('No character data found in PNG'))
          }
        } catch (error) {
          console.error('PNG parsing error:', error)
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      let parsedData

      if (file.name.endsWith('.json')) {
        // Processing JSON files - Clear previous pictures
        setCharacterImage(null)

        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = () => reject(new Error('Failed to read JSON file'))
          reader.readAsText(file)
        })

        parsedData = JSON.parse(content)
      } else if (file.name.endsWith('.png')) {
        // Processing PNG files
        parsedData = await extractPNGCharacterData(file)

        // If the data is successfully extracted from PNG, and the PNG image is set as the character avatar at the same time
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setCharacterImage(result)
        }
        reader.readAsDataURL(file)
      } else {
        toast({
          title: t('hint') || 'hint',
          description: 'Please select JSON or PNG Format role card file',
          variant: 'destructive',
        })
        return
      }

      // Helper to safely get array fields
      const getArrayField = (source: GenericField, key: string) => {
        const val = source?.[key]
        if (Array.isArray(val)) return val
        if (typeof val === 'string' && val.length > 0) return [val]
        return []
      }

      // Normalize data source (V2/V3 uses .data, V1 uses root)
      const src = parsedData.data || parsedData
      const root = parsedData // Keep root for fallback access

      const v3Data: CharacterCardV3 = {
        spec: 'chara_card_v3',
        spec_version: '3.0',
        data: {
          // Name mapping: prioritize char_name (often used for real name) over name
          name: src.char_name || src.name || root.char_name || root.name || '',
          nickname: src.nickname || root.nickname || '',
          description: src.description || root.description || '',
          personality: src.personality || root.personality || '',
          scenario: src.scenario || root.scenario || '',
          first_mes: src.first_mes || root.first_mes || '',
          mes_example: src.mes_example || root.mes_example || '',
          creator_notes: src.creator_notes || root.creator_notes || '',
          system_prompt: src.system_prompt || root.system_prompt || '',
          post_history_instructions: src.post_history_instructions || root.post_history_instructions || '',
          alternate_greetings: getArrayField(src, 'alternate_greetings'),
          character_book: src.character_book || root.character_book || { entries: [] },
          tags: src.tags || root.tags || [],
          creator: src.creator || root.creator || '',
          character_version: src.character_version || root.character_version || '1.0',
          group_only_greetings: getArrayField(src, 'group_only_greetings'),
          // Date logic: Prioritize existing date in data, then root, then create_date (V1/V2), then fallback to today ONLY if missing
          creation_date:
            src.creation_date ??
            root.creation_date ??
            src.create_date ??
            root.create_date ??
            new Date().toISOString().split('T')[0],
          modification_date: new Date().toISOString().split('T')[0],
          extensions: src.extensions || root.extensions || {},
          assets: getArrayField(src, 'assets'),
        },
      }

      setCharacterData(v3Data)

      toast({ title: t('importSuccess'), description: t('importSuccessDesc') })
    } catch (error) {
      console.error('Import error:', error)
      toast({
        title: t('importError') || 'Import failed',
        description: file.name.endsWith('.png')
          ? 'The role card data is not found in this PNG file. Please make sure to use the PNG file containing the role card information.'
          : t('importErrorDesc'),
        variant: 'destructive',
      })
    }
  }

  return (
    <div className='min-h-screen p-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-8'>
          <div className='flex justify-end mb-4'>
            <Toolbar />
          </div>
          <h1 className='text-4xl font-bold text-gradient mb-4'>{t('pageTitle')}</h1>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto mb-4'>{t('pageDescription')}</p>
          <div className='flex justify-center gap-4'>
            <input type='file' ref={fileInputRef} onChange={handleFileImport} accept='.json,.png' className='hidden'
              title={t('importCard')}
            />
            <Button onClick={() => fileInputRef.current?.click()} className='mb-4 cta-button-gradient'>
              <Upload className='mr-2' />
              {t('importCard')}
            </Button>
            <ConfigEditor onSettingsChange={handleAISettingsChange} />
          </div>
        </div>

        {/* Full screen sidebar tab layout */}
        <div className='flex h-[calc(100vh-180px)] bg-background/50 backdrop-blur-sm rounded-lg shadow-lg'>
          {/* Left sidebar */}
          <div className='w-56 glass-panel border-r border-border flex flex-col'>
            <div className='p-4 border-b border-border'>
              <h2 className='text-lg font-semibold text-foreground'>Feature Panel</h2>
            </div>
            <nav className='flex-1 p-2'>
              <div className='space-y-1'>
                <button
                  onClick={() => setActiveTab('assistant')}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-all duration-200 ${
                    activeTab === 'assistant'
                      ? 'cta-button-gradient text-primary-foreground shadow-md'
                      : 'text-foreground/80 hover:bg-muted'
                  }`}
                >
                  <Bot className='w-5 h-5' />
                  <span className='font-medium'>AI character card assistant</span>
                </button>
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-all duration-200 ${
                    activeTab === 'editor'
                      ? 'cta-button-gradient text-primary-foreground shadow-md'
                      : 'text-foreground/80 hover:bg-muted'
                  }`}
                >
                  <User className='w-5 h-5' />
                  <span className='font-medium'>Role information edit</span>
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-all duration-200 ${
                    activeTab === 'preview'
                      ? 'cta-button-gradient text-primary-foreground shadow-md'
                      : 'text-foreground/80 hover:bg-muted'
                  }`}
                >
                  <FileText className='w-5 h-5' />
                  <span className='font-medium'>JSON Preview</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Content area on the right */}
          <div className='flex-1 flex flex-col'>
            {/* AI Assistant Panel */}
            {activeTab === 'assistant' && (
              <div className='flex-1 p-6 min-h-0 overflow-auto'>
                <AIAssistant aiSettings={aiSettings} onInsertField={handleInsertField} />
              </div>
            )}

            {/* Role Information Editing Panel */}
            {activeTab === 'editor' && (
              <div className='flex-1 flex flex-col min-h-0'>
                <div className='p-6 border-b border-border flex-shrink-0'>
                  <h1 className='text-2xl font-semibold text-foreground'>{t('characterInfo')}</h1>
                </div>
                <div className='flex-1 min-h-0'>
                  <ScrollArea className='h-full'>
                    <div className='p-6 space-y-8'>
                      <BasicInfoSection
                        data={characterData.data}
                        updateField={updateField}
                        characterImage={characterImage}
                        setCharacterImage={setCharacterImage}
                        aiSettings={aiSettings}
                      />

                      <PersonalitySection data={characterData.data} updateField={updateField} aiSettings={aiSettings} />

                      <PromptsSection data={characterData.data} updateField={updateField} aiSettings={aiSettings} />

                      <AlternateGreetings  greetings={ Array.isArray(characterData.data.alternate_greetings)
                            ? (characterData.data.alternate_greetings)
                            : typeof characterData.data.alternate_greetings === 'string'
                              ? [characterData.data.alternate_greetings] : []
                        }
                        group_only_greetings={ Array.isArray(characterData.data.group_only_greetings)
                            ? (characterData.data.group_only_greetings)
                            : typeof characterData.data.group_only_greetings === 'string'
                              ? [characterData.data.group_only_greetings] : []
                        }
                        updateField={updateField}
                        aiSettings={aiSettings}
                      />

                      <CharacterBook
                        entries={characterData.data.character_book?.entries || []}
                        updateField={updateField}
                        aiSettings={aiSettings}
                        characterData={characterData.data}
                      />

                      <TagsSection
                        tags={characterData.data.tags}
                        updateField={updateField}
                        aiSettings={aiSettings}
                        characterData={characterData.data}
                      />

                      <MetadataSection data={characterData.data} updateField={updateField} />
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}

            {/* JSON Preview Panel */}
            {activeTab === 'preview' && (
              <div className='flex-1 p-6 min-h-0 overflow-auto'>
                <CharacterPreview characterData={characterData} characterImage={characterImage} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Index
