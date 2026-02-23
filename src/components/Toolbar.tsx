import { Globe, Moon, Sun, Server } from 'lucide-react'
import { Button } from '@/components/ui/glass/button'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import LocalDeploymentPanel from './LocalDeploymentPanel'

const Toolbar = () => {
  const { language, setLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en')
  }

  return (
    <div className='flex items-center gap-2'>
      <LocalDeploymentPanel />

      <Button variant='outline' size='sm' onClick={toggleLanguage} className='gap-2'>
        <Globe className='h-4 w-4' />
        {language === 'en' ? '中文' : 'EN'}
      </Button>

      <Button variant='outline' size='sm' onClick={toggleTheme} className='gap-2'>
        {theme === 'light' ? (
          <>
            <Moon className='h-4 w-4' />
            {language === 'zh' ? '暗色' : 'Dark'}
          </>
        ) : (
          <>
            <Sun className='h-4 w-4' />
            {language === 'zh' ? '亮色' : 'Light'}
          </>
        )}
      </Button>
    </div>
  )
}

export default Toolbar
