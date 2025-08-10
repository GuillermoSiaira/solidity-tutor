"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, Bot, User, Code2, Zap, AlertCircle } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { generateAIResponse } from "@/lib/groq-ai"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  codeSnippet?: string
}

interface EnhancedAITutorProps {
  currentCode: string
  executionResult?: any
  userId?: string
}

export function EnhancedAITutor({ currentCode, executionResult, userId }: EnhancedAITutorProps) {
  const { t, language } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "ai",
      content: t("ai.welcome"),
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}`)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Save chat history to Supabase (only if configured)
  const saveChatHistory = async (newMessages: Message[]) => {
    if (!userId || !isSupabaseConfigured()) return

    try {
      await supabase.from("chat_history").upsert({
        user_id: userId,
        session_id: sessionId,
        messages: newMessages,
      })
    } catch (error) {
      console.error("Error saving chat history:", error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      // Use AI response (Groq or fallback)
      const aiResponse = await generateAIResponse(input, currentCode, language, {
        executionResult,
        sessionHistory: messages,
      })

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiResponse.content,
        timestamp: new Date(),
        codeSnippet: aiResponse.codeSnippet,
      }

      const finalMessages = [...newMessages, aiMessage]
      setMessages(finalMessages)

      // Save to Supabase if available
      await saveChatHistory(finalMessages)
    } catch (error) {
      console.error("Error getting AI response:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          language === "es"
            ? "Lo siento, hubo un error al procesar tu pregunta. Por favor, inténtalo de nuevo."
            : "Sorry, there was an error processing your question. Please try again.",
        timestamp: new Date(),
      }
      setMessages([...newMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const isSpanish = language === "es"
  const groqConfigured = !!process.env.GROQ_API_KEY

  const suggestedQuestions = [
    isSpanish ? "¿Cómo optimizar el gas en mi contrato?" : "How to optimize gas in my contract?",
    isSpanish ? "¿Qué patrones de seguridad debo usar?" : "What security patterns should I use?",
    isSpanish ? "Explícame este código paso a paso" : "Explain this code step by step",
    isSpanish ? "¿Cómo hacer testing de contratos?" : "How to test smart contracts?",
  ]

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-blue-500" />
          {t("ai.title")}
          <Badge variant="secondary" className="ml-auto">
            <Zap className="h-3 w-3 mr-1" />
            {groqConfigured ? "Groq AI" : "Local AI"}
          </Badge>
        </CardTitle>
        {!groqConfigured && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Using fallback AI responses. Add Groq integration for enhanced AI capabilities.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 p-4">
        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.type === "user" ? "justify-end" : ""}`}>
                {message.type === "ai" && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[80%] ${message.type === "user" ? "order-first" : ""}`}>
                  <div
                    className={`rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.codeSnippet && (
                      <div className="mt-2 p-2 bg-black/10 rounded border">
                        <div className="flex items-center gap-1 mb-1">
                          <Code2 className="h-3 w-3" />
                          <span className="text-xs font-medium">Code Example</span>
                        </div>
                        <pre className="text-xs font-mono">{message.codeSnippet}</pre>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-3">{message.timestamp.toLocaleTimeString()}</p>
                </div>
                {message.type === "user" && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-green-100 text-green-600">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">{t("ai.thinking")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{t("ai.suggestions")}</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 bg-transparent"
                  onClick={() => setInput(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("ai.placeholder")}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            disabled={isLoading}
            className="text-sm"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
