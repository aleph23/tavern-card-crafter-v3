
import { estimateTokens } from "@/utils/aiGenerator";
import { cn } from "@/lib/utils";

interface TextCounterProps {
  text: string;
  className?: string;
  showTokens?: boolean;
}

const TextCounter = ({ text, className, showTokens = true }: TextCounterProps) => {
  const charCount = text.length;
  const tokenCount = estimateTokens(text);

  return (
    <div className={cn("text-xs text-gray-500 flex gap-4", className)}>
      <span>字符: {charCount}</span>
      {showTokens && <span>Token: {tokenCount}</span>}
    </div>
  );
};

export default TextCounter;
