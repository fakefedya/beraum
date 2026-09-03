"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
}

export const CopyButton = ({ textToCopy, className }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("Скопировано в буфер");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Ошибка копирования");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className={className}
      title="Скопировать"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </Button>
  );
};
