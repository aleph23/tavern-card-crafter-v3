import React, { useMemo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { ThemeColors } from '@/types/settings'
import { hexToOklch, oklchToHex } from '@/utils/themeUtils'
import { Label } from '@/components/ui/glass/label'
import { Button } from '@/components/ui/glass/button'
import { RotateCcw } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const AppearanceSettings = () => {
  const { colors, updateColor, resetColors } = useTheme()
  const { t } = useLanguage()

  const handleColorChange = (key: keyof ThemeColors, hex: string) => {
    const oklch = hexToOklch(hex)
    updateColor(key, oklch)
  }

  const renderColorPicker = (key: keyof ThemeColors, label: string, description: string) => {
    const hexValue = oklchToHex(colors[key])

    return (
      <div key={key} className='flex flex-col gap-2 p-4 bg-muted/40 rounded-xl border border-border/50'>
        <div className='flex items-center justify-between'>
          <Label className='text-sm font-semibold text-foreground/90'>{label}</Label>
          <span className='text-xs font-mono text-muted-foreground uppercase'>{hexValue}</span>
        </div>
        <div className='flex items-center gap-3'>
          <div className='relative group'>
            <input
              type='color'
              value={hexValue}
              onChange={(e) => handleColorChange(key, e.target.value)}
              className='w-12 h-12 rounded-lg cursor-pointer border-2 border-border/50 hover:border-primary/50 transition-colors'
            />
            <div
              className='absolute inset-0 rounded-lg pointer-events-none border border-white/10'
              style={{ backgroundColor: hexValue }}
            />
          </div>
          <div className='flex-1 text-xs text-muted-foreground leading-tight'>{description}</div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6 animate-fade-in'>
      <div className='flex items-center justify-between px-1'>
        <div>
          <h2 className='text-xl font-bold text-foreground'>Appearance Settings</h2>
          <p className='text-sm text-muted-foreground'>Personalize the application's color palette</p>
        </div>
        <Button variant='outline' size='sm' onClick={resetColors} className='gap-2 h-9 px-3'>
          <RotateCcw className='h-4 w-4' />
          Reset Defaults
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {renderColorPicker(
          'primary',
          'Primary Brand',
          'Main background color. Used for large buttons, active sidebar items, and major UI accents.'
        )}
        {renderColorPicker(
          'secondary',
          'Secondary Base',
          'Supporting dark color. Used for sidebar backgrounds and secondary text-on-brand scenarios.'
        )}
        {renderColorPicker(
          'primaryForeground',
          'Primary Text',
          'Optimized text color for display on top of the Primary background.'
        )}
        {renderColorPicker(
          'secondaryForeground',
          'Accent & Emphasis',
          'Controls highlights, tag backgrounds, and the primary Accent color.  The Ring color is a split-complimentary of this.'
        )}
        <div className='md:col-span-2'>
          {renderColorPicker(
            'border',
            'UI Borders & Details',
            'Structural color for dividers, input borders, and gradient finishing touches across panels.'
          )}
        </div>
      </div>

      <div className='mt-8 p-4 bg-primary/5 rounded-xl border border-primary/20 text-xs text-muted-foreground'>
        <p className='font-medium text-foreground/80 mb-1'>About the Color System</p>
        These colors are processed using the <strong>OKLCH</strong> color space, ensuring consistent lightness and
        chroma perceived by the human eye. Changes are applied instantly and saved to your local storage.
      </div>
    </div>
  )
}

export default AppearanceSettings
