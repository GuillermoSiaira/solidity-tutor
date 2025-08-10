"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Sparkles, Code2 } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  codeSnippet?: string
}

interface AITutorChatProps {
  currentCode: string
  executionResult?: any
}

export function AITutorChat({ currentCode, executionResult }: AITutorChatProps) {
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

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(input, currentCode, executionResult)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiResponse.content,
        timestamp: new Date(),
        codeSnippet: aiResponse.codeSnippet,
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateAIResponse = (question: string, code: string, result: any) => {
    const lowerQuestion = question.toLowerCase()

    // Detect language of the question
    const isSpanish =
      lowerQuestion.includes("qué") ||
      lowerQuestion.includes("cómo") ||
      lowerQuestion.includes("por qué") ||
      lowerQuestion.includes("explica") ||
      lowerQuestion.includes("función") ||
      lowerQuestion.includes("código") ||
      lowerQuestion.includes("contador") ||
      lowerQuestion.includes("sube") ||
      language === "es"

    // Gas-related questions
    if (lowerQuestion.includes("gas") || lowerQuestion.includes("cost") || lowerQuestion.includes("costo")) {
      return {
        content: isSpanish
          ? `El gas en Solidity representa el costo computacional de ejecutar operaciones en la blockchain de Ethereum. Cada operación tiene un costo específico de gas:

• SLOAD (leer del storage): ~2,100 gas
• SSTORE (escribir al storage): ~20,000 gas para valores nuevos, ~5,000 para actualizaciones
• Operaciones aritméticas básicas: 3-5 gas cada una

En tu código, la función increment usa aproximadamente 22,000 gas porque lee el valor actual (SLOAD) y escribe un nuevo valor (SSTORE).`
          : `Gas in Solidity represents the computational cost of executing operations on the Ethereum blockchain. Each operation has a specific gas cost:

• SLOAD (reading from storage): ~2,100 gas
• SSTORE (writing to storage): ~20,000 gas for new values, ~5,000 gas for updates
• Basic arithmetic operations: 3-5 gas each

In your code, the increment function uses approximately 22,000 gas because it reads the current value (SLOAD) and writes a new value (SSTORE).`,
        codeSnippet: "function increment() public {\n    count += 1; // SLOAD + ADD + SSTORE\n}",
      }
    }

    // Storage-related questions
    if (
      lowerQuestion.includes("storage") ||
      lowerQuestion.includes("variable") ||
      lowerQuestion.includes("almacenamiento")
    ) {
      return {
        content: isSpanish
          ? `El storage en Solidity son datos persistentes que viven en la blockchain. Cada slot de storage tiene 32 bytes y cuesta gas leer/escribir.

En tu contrato Counter:
• 'count' se almacena en el slot 0
• Leer storage cuesta 2,100 gas (SLOAD)
• Escribir al storage cuesta 20,000 gas para valores nuevos (SSTORE)

Las variables de storage persisten entre llamadas a funciones y transacciones, a diferencia de las variables de memoria que son temporales.`
          : `Storage in Solidity is persistent data that lives on the blockchain. Each storage slot is 32 bytes and costs gas to read/write.

In your Counter contract:
• 'count' is stored in slot 0
• Reading storage costs 2,100 gas (SLOAD)
• Writing to storage costs 20,000 gas for new values (SSTORE)

Storage variables persist between function calls and transactions, unlike memory variables which are temporary.`,
        codeSnippet: "uint256 public count = 0; // Stored in slot 0",
      }
    }

    // Function-related questions
    if (
      lowerQuestion.includes("function") ||
      lowerQuestion.includes("increment") ||
      lowerQuestion.includes("función") ||
      lowerQuestion.includes("contador") ||
      lowerQuestion.includes("sube")
    ) {
      return {
        content: isSpanish
          ? `La función increment() es una función pública que incrementa la variable count en 1.

Esto es lo que pasa paso a paso:
1. Cargar el valor actual del storage (SLOAD)
2. Sumar 1 al valor (ADD)
3. Guardar el nuevo valor de vuelta al storage (SSTORE)

La visibilidad 'public' significa que cualquiera puede llamar esta función, y modificará el estado del contrato.

El contador sube porque la operación 'count += 1' es equivalente a 'count = count + 1', que toma el valor actual y le suma uno.`
          : `The increment() function is a public function that increases the count variable by 1.

Here's what happens step by step:
1. Load current value from storage (SLOAD)
2. Add 1 to the value (ADD)
3. Store the new value back to storage (SSTORE)

The 'public' visibility means anyone can call this function, and it will modify the contract's state.`,
        codeSnippet: "function increment() public {\n    count += 1; // count = count + 1\n}",
      }
    }

    // Decrement/require questions
    if (
      lowerQuestion.includes("require") ||
      lowerQuestion.includes("decrement") ||
      lowerQuestion.includes("decrementar") ||
      lowerQuestion.includes("seguridad") ||
      lowerQuestion.includes("security")
    ) {
      return {
        content: isSpanish
          ? `La declaración require() es una característica de seguridad que valida condiciones antes de ejecutar código.

En la función decrement:
• require(count > 0, "mensaje") verifica si count es mayor que 0
• Si la condición falla, la transacción se revierte con el mensaje de error
• Si pasa, la función continúa la ejecución

Esto previene que el contador baje de cero, lo que podría causar un underflow (desbordamiento hacia abajo).`
          : `The require() statement is a security feature that validates conditions before executing code.

In the decrement function:
• require(count > 0, "message") checks if count is greater than 0
• If the condition fails, the transaction reverts with the error message
• If it passes, the function continues execution

This prevents the count from going below zero, which could cause an underflow.`,
        codeSnippet: 'require(count > 0, "Counter cannot be negative");',
      }
    }

    // Code explanation questions
    if (
      lowerQuestion.includes("código") ||
      lowerQuestion.includes("explica") ||
      lowerQuestion.includes("code") ||
      lowerQuestion.includes("explain") ||
      lowerQuestion.includes("izquierda") ||
      lowerQuestion.includes("left")
    ) {
      return {
        content: isSpanish
          ? `Te explico el código de tu contrato Counter:

**Línea 1-2**: Licencia y versión de Solidity
• SPDX-License-Identifier: MIT - Especifica la licencia
• pragma solidity ^0.8.0 - Versión del compilador

**Línea 4**: Declaración del contrato
• contract Counter - Define un nuevo contrato llamado Counter

**Línea 5**: Variable de estado
• uint256 public count = 0 - Variable entera sin signo, pública, inicializada en 0

**Líneas 7-9**: Función increment
• function increment() public - Función pública que incrementa count en 1

**Líneas 11-14**: Función decrement
• Incluye require() para validación de seguridad
• Solo permite decrementar si count > 0

**Líneas 16-18**: Función getter
• function getCount() - Función de solo lectura que retorna el valor actual`
          : `Let me explain your Counter contract code:

**Lines 1-2**: License and Solidity version
• SPDX-License-Identifier: MIT - Specifies the license
• pragma solidity ^0.8.0 - Compiler version

**Line 4**: Contract declaration
• contract Counter - Defines a new contract called Counter

**Line 5**: State variable
• uint256 public count = 0 - Unsigned integer, public, initialized to 0

**Lines 7-9**: Increment function
• function increment() public - Public function that increases count by 1

**Lines 11-14**: Decrement function
• Includes require() for security validation
• Only allows decrementing if count > 0

**Lines 16-18**: Getter function
• function getCount() - Read-only function that returns current value`,
        codeSnippet: `contract Counter {
    uint256 public count = 0;  // Estado del contrato
    
    function increment() public {
        count += 1;  // Incrementa en 1
    }
}`,
      }
    }

    // Optimization questions
    if (lowerQuestion.includes("optimiz") || lowerQuestion.includes("mejor") || lowerQuestion.includes("eficien")) {
      return {
        content: isSpanish
          ? `Para optimizar tu contrato Counter:

**Optimizaciones de Gas:**
• Usar uint256 es más eficiente que tipos más pequeños
• Evitar operaciones de storage innecesarias
• Usar eventos para logging en lugar de storage

**Mejoras de Seguridad:**
• Agregar modificadores de acceso (onlyOwner)
• Implementar límites máximos para el contador
• Usar SafeMath para versiones < 0.8.0

**Ejemplo optimizado:**
\`\`\`solidity
contract OptimizedCounter {
    uint256 public count;
    uint256 public constant MAX_COUNT = 1000;
    
    event CountChanged(uint256 newCount);
    
    function increment() external {
        require(count < MAX_COUNT, "Max reached");
        unchecked { ++count; }
        emit CountChanged(count);
    }
}
\`\`\``
          : `To optimize your Counter contract:

**Gas Optimizations:**
• Using uint256 is more efficient than smaller types
• Avoid unnecessary storage operations
• Use events for logging instead of storage

**Security Improvements:**
• Add access modifiers (onlyOwner)
• Implement maximum limits for the counter
• Use SafeMath for versions < 0.8.0

**Optimized example:**
\`\`\`solidity
contract OptimizedCounter {
    uint256 public count;
    uint256 public constant MAX_COUNT = 1000;
    
    event CountChanged(uint256 newCount);
    
    function increment() external {
        require(count < MAX_COUNT, "Max reached");
        unchecked { ++count; }
        emit CountChanged(count);
    }
}
\`\`\``,
        codeSnippet: "unchecked { ++count; } // Saves gas by skipping overflow checks",
      }
    }

    // Default response - now more contextual
    return {
      content: isSpanish
        ? `¡Perfecto! Veo que tienes un contrato Counter. Te puedo ayudar con:

**Tu código actual:**
• Variable 'count' que almacena un número entero
• Función increment() para subir el contador
• Función decrement() con validación de seguridad
• Función getCount() para leer el valor

**Puedes preguntarme sobre:**
• ¿Cómo funciona el gas en este contrato?
• ¿Por qué se usa require() en decrement?
• ¿Cómo optimizar el código?
• ¿Qué pasa cuando ejecuto increment()?

¡Haz cualquier pregunta específica!`
        : `Perfect! I see you have a Counter contract. I can help you with:

**Your current code:**
• 'count' variable that stores an integer
• increment() function to increase the counter
• decrement() function with security validation
• getCount() function to read the value

**You can ask me about:**
• How does gas work in this contract?
• Why is require() used in decrement?
• How to optimize the code?
• What happens when I execute increment()?

Ask me any specific question!`,
    }
  }

  const isSpanish = language === "es"

  const suggestedQuestions = [
    isSpanish ? "¿Cómo funciona el gas en mi código?" : "How does gas work in my code?",
    isSpanish ? "¿Por qué se usa require()?" : "Why is require() used?",
    isSpanish ? "Explícame la función increment()" : "Explain the increment() function",
    isSpanish ? "¿Cómo optimizar este contrato?" : "How to optimize this contract?",
  ]

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-blue-500" />
          {t("ai.title")}
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            AI
          </Badge>
        </CardTitle>
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
