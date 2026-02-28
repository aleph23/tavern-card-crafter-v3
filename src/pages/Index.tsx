import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/glass/button'
import { Upload } from 'lucide-react'
import { UserIcon as User } from '@/components/ui/user'
import { FileTextIcon as FileText } from '@/components/ui/file-text'
import { BotMessageSquareIcon as Bot } from '@/components/ui/bot-message-square'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/glass/scroll-area'
import { useLanguage } from '@/contexts/LanguageContext'
import { CharacterCardV3, CharacterDataV3, CharacterBookEntry, Asset, UsedCharacterData } from '@/types/charactercard'
import { extractPNGCharacterData, readJSONCharacterFile, upgradeToV3, UpgradeCallbacks } from '@/utils/importManager'
import ConfigEditor from '@/components/ConfigEditor'
import { InferenceSettings } from '@/types/settings'
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
  const [infSettings, setInfSettings] = useState<InferenceSettings | null>(null)

  const [charaData, setCharacterData] = useState<CharacterCardV3>(() => {
    const today = Math.floor(Date.now() / 1000).toString()
    return {
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
        creator_notes_multilingual: '',
        source: '',
        system_prompt: '',
        post_history_instructions: '',
        character_book: { entries: [] },
        group_only_greetings: [],
        creation_date: '',
        modification_date: today,
        extensions: {},
        assets: [],
      },
    }
  })

  const [characterImage, setCharacterImage] = useState<string | null>(null)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        await configManager.loadConfig()
        const settings = configManager.getActiveAISettings()
        if (settings) {
          setInfSettings(settings)
        } else {
          setInfSettings(DEFAULT_SETTINGS)
        }
      } catch (error) {
        console.error('Failed to load AI settings:', error)
        setInfSettings(DEFAULT_SETTINGS)
      }
    }
    loadSettings()
  }, [])

  /**
   * Updates AI settings and displays a toast notification.
   */
  const handleInfSettingsChange = (newSettings: InferenceSettings) => {
    setInfSettings(newSettings)
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
      data: { ...prev.data, [field]: value, modification_date: Math.floor(Date.now() / 1000).toString() },
    }))
  }, [])

  const handleInsertField = (field: string, value: string | string[]) => {
    if (field === 'tags' && Array.isArray(value)) {
      // Merge existing tags and new tags to deduplicate
      const existingTags = charaData.data.tags || []
      const newTags = [...new Set([...existingTags, ...value])]
      updateField('tags', newTags)
    } else {
      updateField(field, value)
    }
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      let rawData: unknown

      if (file.name.endsWith('.json')) {
        // JSON import — clear any previous avatar image
        setCharacterImage(null)
        rawData = await readJSONCharacterFile(file)
      } else if (file.name.endsWith('.png')) {
        // PNG import — extract embedded data and set avatar simultaneously
        rawData = await extractPNGCharacterData(file)

        // If the data is successfully extracted from PNG, and the PNG image is set as the character avatar at the same time
        const reader = new FileReader()
        reader.onload = (e) => setCharacterImage(e.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        toast({
          title: t('hint') || 'hint',
          description: 'Please select JSON or PNG Format role card file',
          variant: 'destructive',
        })
        return
      }

      // Upgrade / normalise any payload version → CharacterCardV3.
      // Number coercion failures are surfaced as toasts so the user knows which fields
      // were defaulted or could not be resolved and need manual correction.
      const importCallbacks: UpgradeCallbacks = {
        onNumberDefaulted: (field, _rawValue, defaultUsed) => {
          toast({
            title: 'Field defaulted during import',
            description: `"${field}" could not be parsed — defaulted to ${defaultUsed}. You can correct it in the editor.`,
          })
        },
        onNumberMissing: (field, _rawValue) => {
          toast({
            title: 'Field requires your input',
            description: `"${field}" could not be resolved. Please fill it in manually in the editor.`,
            variant: 'destructive',
          })
        },
      }
      const v3Data = upgradeToV3(rawData, importCallbacks)
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
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileImport}
              accept='.json,.png'
              className='hidden'
              title={t('importCard')}
            />
            <Button onClick={() => fileInputRef.current?.click()} className='mb-4 cta-button-gradient'>
              <Upload className='mr-2' />
              {t('importCard')}
            </Button>
            <ConfigEditor onSettingsChange={handleInfSettingsChange} />
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
                <AIAssistant infSettings={infSettings} onInsertField={handleInsertField} />
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
                      {(() => {
                        const editableData: UsedCharacterData = charaData.data
                        return (
                          <>
                            <BasicInfoSection
                              data={editableData}
                              updateField={updateField}
                              characterImage={characterImage}
                              setCharacterImage={setCharacterImage}
                              infSettings={infSettings}
                            />

                            <PersonalitySection
                              data={editableData}
                              updateField={updateField}
                              infSettings={infSettings}
                            />

                            <PromptsSection data={editableData} updateField={updateField} infSettings={infSettings} />

                            <AlternateGreetings
                              greetings={
                                Array.isArray(editableData.alternate_greetings)
                                  ? editableData.alternate_greetings
                                  : typeof editableData.alternate_greetings === 'string'
                                    ? [editableData.alternate_greetings]
                                    : []
                              }
                              updateField={updateField}
                              infSettings={infSettings}
                              charaData={editableData}
                            />

                            <CharacterBook
                              entries={editableData.character_book?.entries || []}
                              updateField={updateField}
                              infSettings={infSettings}
                              charaData={editableData}
                            />

                            <TagsSection
                              tags={editableData.tags || []}
                              updateField={updateField}
                              infSettings={infSettings}
                              charaData={editableData}
                            />

                            <MetadataSection data={editableData} updateField={updateField} />
                          </>
                        )
                      })()}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}

            {/* JSON Preview Panel */}
            {activeTab === 'preview' && (
              <div className='flex-1 p-6 min-h-0 overflow-auto'>
                <CharacterPreview charaData={charaData} characterImage={characterImage} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Index
