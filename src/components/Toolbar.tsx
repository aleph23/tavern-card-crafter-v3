
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Globe, Sun, Moon } from "lucide-react";

const Toolbar = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Globe className="w-4 h-4" />
        {language === 'zh' ? 'EN' : '中文'}
      </Button>
      
      <Button
        onClick={toggleTheme}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        {theme === 'light' ? (
          <>
            <Moon className="w-4 h-4" />
            {t('darkMode')}
          </>
        ) : (
          <>
            <Sun className="w-4 h-4" />
            {t('lightMode')}
          </>
        )}
      </Button>
    </div>
  );
};

export default Toolbar;
