
import { Globe, Moon, Sun, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import LocalDeploymentPanel from "./LocalDeploymentPanel";

const Toolbar = () => {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <div className="flex items-center gap-2">
      <LocalDeploymentPanel />

      <Button
        variant="outline"
        size="sm"
        onClick={toggleLanguage}
        className="gap-2"
      >
        <Globe className="h-4 w-4" />
        {language === 'zh' ? 'EN' : '中文'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className="gap-2"
      >
        {theme === 'light' ? (
          <>
            <Moon className="h-4 w-4" />
            {language === 'zh' ? '暗色' : 'Dark'}
          </>
        ) : (
          <>
            <Sun className="h-4 w-4" />
            {language === 'zh' ? '亮色' : 'Light'}
          </>
        )}
      </Button>
    </div>
  );
};

export default Toolbar;
