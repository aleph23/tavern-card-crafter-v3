
import { estimateTokens } from "@/utils/aiGenerator";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface TextCounterProps {
  text: string;
  className?: string;
  showTokens?: boolean;
}

const TextCounter = ({ text, className, showTokens = true }: TextCounterProps) => {
  const { t } = useLanguage();
  const charCount = text.length;
  const tokenCount = estimateTokens(text);

  return (
    <div className={cn("text-xs text-gray-500 dark:text-gray-400 flex gap-4", className)}>
      <span>{t('chars')}: {charCount}</span>
      {showTokens && <span>{t('tokens')}: {tokenCount}</span>}
    </div>
  );
};

export default TextCounter;
