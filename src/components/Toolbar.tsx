import { Globe, Moon, Sun, Server } from 'lucide-react'
import { Button } from '@/components/ui/glass/button'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import LocalDeploymentPanel from './LocalDeploymentPanel'

const Toolbar = () => {
  const { language, setLanguage } = useLanguage()

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
    </div>
  )
}

export default Toolbar
