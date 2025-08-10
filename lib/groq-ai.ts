// Fallback AI response generator when Groq is not available
const generateFallbackResponse = (question: string, code: string, language = "es") => {
  const lowerQuestion = question.toLowerCase()
  const isSpanish = language === "es"

  // Gas-related questions
  if (lowerQuestion.includes("gas") || lowerQuestion.includes("cost") || lowerQuestion.includes("costo")) {
    return {
      content: isSpanish
        ? `El gas en Solidity representa el costo computacional de ejecutar operaciones en la blockchain de Ethereum. Cada operación tiene un costo específico de gas:

• SLOAD (leer del storage): ~2,100 gas
• SSTORE (escribir al storage): ~20,000 gas para valores nuevos
• Operaciones aritméticas básicas: 3-5 gas cada una

En tu código, la función increment usa aproximadamente 22,000 gas porque lee el valor actual (SLOAD) y escribe un nuevo valor (SSTORE).`
        : `Gas in Solidity represents the computational cost of executing operations on the Ethereum blockchain. Each operation has a specific gas cost:

• SLOAD (reading from storage): ~2,100 gas
• SSTORE (writing to storage): ~20,000 gas for new values
• Basic arithmetic operations: 3-5 gas each

In your code, the increment function uses approximately 22,000 gas because it reads the current value (SLOAD) and writes a new value (SSTORE).`,
      codeSnippet: "function increment() public {\n    count += 1; // SLOAD + ADD + SSTORE\n}",
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

  // Default response
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

export async function generateAIResponse(question: string, code: string, language = "es", context?: any) {
  // Check if Groq API key is available
  const groqApiKey = process.env.GROQ_API_KEY

  if (!groqApiKey) {
    console.warn("Groq API key not found. Using fallback responses.")
    return generateFallbackResponse(question, code, language)
  }

  try {
    const { createGroq } = await import("@ai-sdk/groq")
    const { generateText } = await import("ai")

    const groq = createGroq({
      apiKey: groqApiKey,
    })

    const systemPrompt =
      language === "es"
        ? `Eres un tutor experto en Solidity y desarrollo de contratos inteligentes. Tu trabajo es ayudar a estudiantes a entender conceptos de Solidity, explicar código y responder preguntas de manera educativa y clara.

Contexto del código actual:
${code}

Responde siempre en español de manera educativa, con ejemplos prácticos y explicaciones paso a paso cuando sea necesario.`
        : `You are an expert Solidity tutor and smart contract development instructor. Your job is to help students understand Solidity concepts, explain code, and answer questions in an educational and clear manner.

Current code context:
${code}

Always respond in English in an educational manner, with practical examples and step-by-step explanations when necessary.`

    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      system: systemPrompt,
      prompt: question,
      maxTokens: 1000,
      temperature: 0.7,
    })

    return {
      content: text,
      codeSnippet: extractCodeSnippet(text),
    }
  } catch (error) {
    console.error("Error generating AI response:", error)
    // Fallback to local responses if Groq fails
    return generateFallbackResponse(question, code, language)
  }
}

function extractCodeSnippet(text: string): string | undefined {
  const codeMatch = text.match(/```[\s\S]*?```/)
  if (codeMatch) {
    return codeMatch[0]
      .replace(/```\w*\n?/g, "")
      .replace(/```/g, "")
      .trim()
  }
  return undefined
}
