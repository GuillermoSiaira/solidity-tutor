"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useLanguage } from "@/hooks/use-language"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  height?: string
  onEditorReady?: (editor: any) => void
}

export function CodeEditor({
  value,
  onChange,
  language = "solidity",
  height = "100%",
  onEditorReady,
}: CodeEditorProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editor, setEditor] = useState<any>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const monacoRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { theme } = useTheme()
  const { t } = useLanguage()

  const initializeEditor = useCallback(async () => {
    if (!containerRef.current) return

    console.log("🚀 Starting Monaco Editor initialization...")

    try {
      setIsLoading(true)
      setError(null)
      setLoadingProgress(10)

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set up timeout for loading - reduced to 6 seconds
      timeoutRef.current = setTimeout(() => {
        console.error("❌ Monaco Editor loading timeout")
        setError("Advanced Editor loading timeout. Switching to Simple Editor is recommended.")
        setIsLoading(false)
      }, 6000)

      // Faster progress simulation
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 85) return prev
          return prev + Math.random() * 20
        })
      }, 200)

      console.log("📦 Importing Monaco Editor...")
      setLoadingProgress(20)

      // Use dynamic import with explicit error handling
      const monacoModule = await Promise.race([
        import("monaco-editor/esm/vs/editor/editor.api"),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Import timeout")), 4000)),
      ])

      console.log("✅ Monaco Editor imported successfully")
      clearInterval(progressInterval)
      setLoadingProgress(60)

      const monacoEditor = monacoModule as any
      monacoRef.current = monacoEditor

      // Skip worker setup for faster loading
      if (typeof window !== "undefined") {
        window.MonacoEnvironment = {
          getWorker: () => {
            // Return a minimal worker
            return new Worker(
              URL.createObjectURL(new Blob(["self.onmessage = () => {}"], { type: "application/javascript" })),
            )
          },
        }
      }

      setLoadingProgress(70)
      console.log("🎨 Setting up Solidity language...")

      // Quick language setup
      const languages = monacoEditor.languages.getLanguages()
      if (!languages.find((lang) => lang.id === "solidity")) {
        monacoEditor.languages.register({ id: "solidity" })

        // Minimal syntax highlighting for faster setup
        monacoEditor.languages.setMonarchTokensProvider("solidity", {
          tokenizer: {
            root: [
              [/\b(contract|function|public|private|uint256|address|mapping|require|emit)\b/, "keyword"],
              [/\/\/.*$/, "comment"],
              [/".*?"/, "string"],
              [/\b\d+\b/, "number"],
            ],
          },
        })
      }

      setLoadingProgress(80)

      // Define themes quickly
      monacoEditor.editor.defineTheme("solidity-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "keyword", foreground: "#569cd6", fontStyle: "bold" },
          { token: "comment", foreground: "#6a9955" },
          { token: "string", foreground: "#ce9178" },
          { token: "number", foreground: "#b5cea8" },
        ],
        colors: {
          "editor.background": "#1e1e1e",
          "editor.foreground": "#d4d4d4",
        },
      })

      monacoEditor.editor.defineTheme("solidity-light", {
        base: "vs",
        inherit: true,
        rules: [
          { token: "keyword", foreground: "#0000ff", fontStyle: "bold" },
          { token: "comment", foreground: "#008000" },
          { token: "string", foreground: "#a31515" },
          { token: "number", foreground: "#098658" },
        ],
        colors: {
          "editor.background": "#ffffff",
          "editor.foreground": "#000000",
        },
      })

      setLoadingProgress(90)
      console.log("🏗️ Creating editor instance...")

      // Create editor with minimal configuration for faster startup
      const editorInstance = monacoEditor.editor.create(containerRef.current, {
        value,
        language,
        theme: theme === "dark" ? "solidity-dark" : "solidity-light",
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        lineNumbers: "on",
        automaticLayout: true,
        wordWrap: "on",
        minimap: { enabled: false }, // Disable minimap for faster loading
        scrollBeyondLastLine: false,
        tabSize: 4,
        insertSpaces: true,
      })

      // Set up change listener
      editorInstance.onDidChangeModelContent(() => {
        const newValue = editorInstance.getValue()
        if (newValue !== value) {
          onChange(newValue)
        }
      })

      // Clear timeout since we succeeded
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      setLoadingProgress(100)
      setEditor(editorInstance)
      onEditorReady?.(editorInstance)

      console.log("🎉 Monaco Editor initialized successfully!")
      setTimeout(() => setIsLoading(false), 100)
    } catch (err) {
      console.error("💥 Monaco Editor initialization failed:", err)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setError(`Failed to load Advanced Editor. Please use Simple Editor instead.`)
      setIsLoading(false)
    }
  }, [value, onChange, language, onEditorReady, theme, t, retryCount])

  // Update theme when it changes
  useEffect(() => {
    if (editor && monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === "dark" ? "solidity-dark" : "solidity-light")
    }
  }, [theme, editor])

  useEffect(() => {
    if (typeof window !== "undefined") {
      initializeEditor()
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (editor) {
        editor.dispose()
      }
    }
  }, [initializeEditor])

  // Update editor value when prop changes
  useEffect(() => {
    if (editor && value !== editor.getValue()) {
      const position = editor.getPosition()
      editor.setValue(value)
      if (position) {
        editor.setPosition(position)
      }
    }
  }, [value, editor])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    setError(null)
    setLoadingProgress(0)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="mb-3">{error}</AlertDescription>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Advanced Editor
            </Button>
          </div>
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] space-y-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-sm font-medium mb-2">Loading Advanced Editor...</p>
          <div className="w-64 bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(loadingProgress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{Math.round(loadingProgress)}%</p>

          {/* Show loading stages */}
          {loadingProgress < 30 && <p className="text-xs text-blue-600 mt-1">Importing Monaco...</p>}
          {loadingProgress >= 30 && loadingProgress < 70 && (
            <p className="text-xs text-blue-600 mt-1">Setting up editor...</p>
          )}
          {loadingProgress >= 70 && loadingProgress < 95 && (
            <p className="text-xs text-blue-600 mt-1">Configuring themes...</p>
          )}
          {loadingProgress >= 95 && <p className="text-xs text-green-600 mt-1">Almost ready!</p>}

          <p className="text-xs text-muted-foreground mt-2">If this takes more than 6 seconds, try Simple Editor</p>
        </div>
      </div>
    )
  }

  return <div ref={containerRef} style={{ height }} className="border rounded-md overflow-hidden" />
}
