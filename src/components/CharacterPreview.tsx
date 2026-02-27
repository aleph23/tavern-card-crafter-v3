/* eslint-disable @typescript-eslint/no-explicit-any */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/glass/card'
import { Button } from '@/components/ui/glass/button'
import { ScrollArea } from '@/components/ui/glass/scroll-area'
import { Copy, Download, ImageIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/contexts/LanguageContext'
import { estimateTokens } from '@/utils/aiGenerator'
import { CharacterCardV3 } from '@/types/charactercard'

interface CharacterPreviewProps {
  characterData: CharacterCardV3
  characterImage: string | null
}

/**
 * Renders a character preview component with options to copy, download JSON, or export as PNG.
 *
 * The component utilizes hooks for toast notifications and language translation. It provides functionality to copy character data to the clipboard, download the character data as a JSON file, and export the character data embedded in a PNG image. It also calculates total characters and tokens from various fields in the character data and highlights JSON syntax for better readability.
 *
 * @param characterData - The data of the character to be previewed, including various attributes.
 * @param characterImage - The URL of the character's image to be used for PNG export.
 * @returns A JSX element representing the character preview.
 */
const CharacterPreview = ({ characterData, characterImage }: CharacterPreviewProps) => {
  const { toast } = useToast()
  const { t } = useLanguage()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(characterData, null, 2))
    toast({ title: t('copySuccess'), description: t('copySuccessDesc') })
  }

  /**
   * Downloads character data as a JSON file.
   */
  const downloadJson = () => {
    const dataStr = JSON.stringify(characterData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = `${characterData.data.name || 'character'}_card_v3.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  /**
   * Downloads a PNG image with embedded character data.
   *
   * The function checks if a character image is provided; if not, it displays a toast notification prompting the user to upload an avatar.
   * It fetches the image, embeds JSON character data into the PNG using the tEXt chunk format, creates a download link, and triggers the download.
   * In case of an error during the process, it logs the error and displays a failure notification.
   *
   * @param characterImage - The URL of the character image to be downloaded.
   * @param characterData - The data associated with the character to be embedded in the PNG.
   * @returns void
   * @throws Error If an error occurs during the image fetching or embedding process.
   */
  const downloadWithImage = async () => {
    if (!characterImage) {
      toast({ title: t('hint') || 'hint', description: t('uploadImageHint'), variant: 'destructive' })
      return
    }

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Set the canvas size
        canvas.width = img.width
        canvas.height = img.height

        // Draw the image
        ctx?.drawImage(img, 0, 0)

        // Convert canvas to blob first
        canvas.toBlob(async (blob) => {
          if (!blob) {
            toast({ title: 'Export failed', description: 'Failed to create image blob', variant: 'destructive' })
            return
          }

          try {
            // Read the PNG data
            const arrayBuffer = await blob.arrayBuffer()
            const uint8Array = new Uint8Array(arrayBuffer)

            // Prepare the character data as base64
            const jsonData = JSON.stringify(characterData)
            const base64Data = btoa(unescape(encodeURIComponent(jsonData)))

            // Create tEXt chunk
            const keyword = 'chara'
            const keywordBytes = new TextEncoder().encode(keyword)
            const textBytes = new TextEncoder().encode(base64Data)

            // Calculate chunk length (keyword + null terminator + text)
            const chunkLength = keywordBytes.length + 1 + textBytes.length

            // Create the chunk data
            const chunkData = new Uint8Array(chunkLength + 12) // +12 for length(4) + type(4) + CRC(4)

            // Write length (big-endian)
            const dataView = new DataView(chunkData.buffer)
            dataView.setUint32(0, chunkLength, false)

            // Write chunk type "tEXt"
            chunkData[4] = 0x74 // 't'
            chunkData[5] = 0x45 // 'E'
            chunkData[6] = 0x58 // 'X'
            chunkData[7] = 0x74 // 't'

            // Write keyword
            chunkData.set(keywordBytes, 8)

            // Write null separator
            chunkData[8 + keywordBytes.length] = 0

            // Write text data
            chunkData.set(textBytes, 8 + keywordBytes.length + 1)

            // Calculate CRC for type + data
            const crcData = chunkData.slice(4, 8 + chunkLength)
            const crc = calculateCRC32(crcData)
            dataView.setUint32(8 + chunkLength, crc, false)

            // Find IEND chunk position (last 12 bytes of PNG)
            let iendPosition = uint8Array.length - 12

            // Verify it's actually IEND
            if (
              uint8Array[iendPosition + 4] !== 0x49 || // 'I'
              uint8Array[iendPosition + 5] !== 0x45 || // 'E'
              uint8Array[iendPosition + 6] !== 0x4e || // 'N'
              uint8Array[iendPosition + 7] !== 0x44
            ) {
              // 'D'
              // Search for IEND if not at expected position
              for (let i = uint8Array.length - 12; i >= 0; i--) {
                if (
                  uint8Array[i + 4] === 0x49 &&
                  uint8Array[i + 5] === 0x45 &&
                  uint8Array[i + 6] === 0x4e &&
                  uint8Array[i + 7] === 0x44
                ) {
                  iendPosition = i
                  break
                }
              }
            }

            // Create new PNG with injected tEXt chunk
            const newPNG = new Uint8Array(uint8Array.length + chunkData.length)
            newPNG.set(uint8Array.slice(0, iendPosition), 0)
            newPNG.set(chunkData, iendPosition)
            newPNG.set(uint8Array.slice(iendPosition), iendPosition + chunkData.length)

            // Create blob and download
            const newBlob = new Blob([newPNG], { type: 'image/png' })
            const url = URL.createObjectURL(newBlob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${characterData.data.name || 'character'}_card.png`
            link.click()
            URL.revokeObjectURL(url)

            toast({
              title: 'Export successfully',
              description: 'PNG format character card has been exported with embedded data',
            })
          } catch (error) {
            console.error('Error injecting PNG chunk:', error)
            toast({
              title: 'Export failed',
              description: 'Failed to embed character data in PNG',
              variant: 'destructive',
            })
          }
        }, 'image/png')
      }

      img.onerror = () => {
        toast({
          title: 'Export failed',
          description: 'Image processing failed, please try again',
          variant: 'destructive',
        })
      }

      img.src = characterImage
    } catch (error) {
      toast({ title: 'Export failed', description: 'An error occurred during PNG export', variant: 'destructive' })
    }
  }

  /**
   * Calculate CRC32 checksum for PNG chunks
   */
  const calculateCRC32 = (data: Uint8Array): number => {
    let crc = 0xffffffff

    // CRC table (standard PNG CRC table)
    const crcTable = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      }
      crcTable[n] = c
    }

    for (let i = 0; i < data.length; i++) {
      crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
    }

    return (crc ^ 0xffffffff) >>> 0
  }

  // Calculate the total number of characters and tokens
  /**
   * Calculates the total character count and token estimate from character data fields.
   *
   * This function extracts various fields from the charaData object, including name, nickname,
   * description, and others. It iterates through these fields, checking if they are non-empty strings,
   * and accumulates their lengths for totalChars and estimates tokens using the estimateTokens function
   * for totalTokens. The results are returned as an object containing both totals.
   */
  const calculateTotalStats = () => {
    const { data } = characterData
    let totalChars = 0
    let totalTokens = 0

    const fields = [
      data.name,
      data.nickname,
      data.description,
      data.personality,
      data.scenario,
      data.first_mes,
      data.mes_example,
      data.creator_notes,
      data.system_prompt,
      data.post_history_instructions,
      ...(data.alternate_greetings || []),
      ...(data.tags || []).join(', '),
      ...(data.character_book?.entries || []).map((entry) => entry.content).join(' '),
    ]

    fields.forEach((field) => {
      if (field && typeof field === 'string') {
        totalChars += field.length
        totalTokens += estimateTokens(field)
      }
    })

    return { totalChars, totalTokens }
  }

  const { totalChars, totalTokens } = calculateTotalStats()
  /**
   * Escapes HTML special characters in a string to prevent XSS attacks.
   *
   * This function replaces characters like &, <, >, ", and ' with their corresponding HTML entities.
   * This is crucial when inserting user-generated content into the DOM to avoid execution of malicious scripts.
   *
   * @param unsafe - The input string that may contain HTML special characters.
   * @returns The escaped string safe for HTML insertion.
   */
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  /**
   * Highlights syntax in a JSON string by wrapping elements in HTML span tags with appropriate classes.
   * The function uses a regular expression to identify JSON elements such as keys, string values, booleans,
   * and null values, applying specific CSS classes for each type. The matched elements are then returned
   * as a formatted string suitable for display with syntax highlighting. Also includes security measures to
   * escape HTML characters.
   *
   * @param json - The JSON string to be highlighted.
   */
  const syntaxHighlight = (json: string) => {
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\\-]?\d+)?)/g,
      (match) => {
        let cls = 'text-accent'
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-primary font-semibold' // Key
          } else {
            cls = 'text-success' // String
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-primary/70' // Boolean (or a variant)
        } else if (/null/.test(match)) {
          cls = 'text-destructive' // Null
        }

        // SECURITY FIX: Escape the content BEFORE wrapping it in HTML.
        // This neutralizes <script> tags into harmless text,
        // preventing them from executing while still displaying them.
        return `<span class="${cls}">${escapeHtml(match)}</span>`
      }
    )
  }

  const highlightedJson = syntaxHighlight(JSON.stringify(characterData, null, 2))

  return (
    <Card className='shadow-lg border-0 bg-card/80 backdrop-blur-sm'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-xl font-semibold text-foreground/80 flex items-start justify-between flex-col gap-3'>
          <span>{t('jsonPreview')}</span>
          <div className='flex flex-col sm:flex-row gap-2 w-full'>
            <Button onClick={copyToClipboard} size='sm' variant='outline' className='flex-1 min-w-0'>
              <Copy className='w-4 h-4 mr-2 flex-shrink-0' />
              <span className='truncate'>{t('copy')}</span>
            </Button>
            <Button onClick={downloadJson} size='sm' className='cta-button-gradient shadow-md flex-1 min-w-0'>
              <Download className='w-4 h-4 mr-2 flex-shrink-0' />
              <span className='truncate'>{t('exportJson')}</span>
            </Button>
            <Button onClick={downloadWithImage} size='sm' variant='outline' className='flex-1 min-w-0'>
              <ImageIcon className='w-4 h-4 mr-2 flex-shrink-0' />
              <span className='truncate'>{t('exportPng')}</span>
            </Button>
          </div>
        </CardTitle>

        <div className='text-sm text-muted-foreground mt-2 flex flex-col sm:flex-row gap-2 sm:gap-4'>
          <span>
            {t('totalChars')}: {totalChars}
          </span>
          <span>
            {t('totalTokens')}: {totalTokens}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className='h-[600px] custom-scrollbar'>
          <div className='bg-muted p-4 rounded-lg text-sm font-mono whitespace-pre-wrap break-all border border-border/10'>
            <div className='text-foreground/90 leading-relaxed' dangerouslySetInnerHTML={{ __html: highlightedJson }} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default CharacterPreview
