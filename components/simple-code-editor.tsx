"use client"

import { Textarea } from "@/components/ui/textarea"

interface SimpleCodeEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SimpleCodeEditor({ value, onChange, placeholder }: SimpleCodeEditorProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="font-mono text-sm resize-none h-full min-h-[400px] bg-background text-foreground border-border focus:border-primary focus:ring-1 focus:ring-primary"
      style={{
        fontSize: "14px",
        lineHeight: "1.5",
        fontFamily:
          "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Monaco, Menlo, 'Ubuntu Mono', monospace",
      }}
      spellCheck={false}
    />
  )
}
