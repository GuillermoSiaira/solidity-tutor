"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "es" | "en" | "fr" | "de" | "pt"

interface Translations {
  [key: string]: {
    [key in Language]: string
  }
}

const translations: Translations = {
  // Header
  "app.title": {
    es: "Solidity Tutor",
    en: "Solidity Tutor",
    fr: "Tuteur Solidity",
    de: "Solidity Tutor",
    pt: "Tutor Solidity",
  },
  "app.subtitle": {
    es: "Herramienta Educativa",
    en: "Educational Tool",
    fr: "Outil Éducatif",
    de: "Bildungswerkzeug",
    pt: "Ferramenta Educacional",
  },

  // Editor
  "editor.title": {
    es: "Editor de Código Solidity",
    en: "Solidity Code Editor",
    fr: "Éditeur de Code Solidity",
    de: "Solidity Code-Editor",
    pt: "Editor de Código Solidity",
  },
  "editor.advanced": {
    es: "Editor Avanzado",
    en: "Advanced Editor",
    fr: "Éditeur Avancé",
    de: "Erweiterte Editor",
    pt: "Editor Avançado",
  },
  "editor.simple": {
    es: "Editor Simple",
    en: "Simple Editor",
    fr: "Éditeur Simple",
    de: "Einfacher Editor",
    pt: "Editor Simples",
  },
  "editor.placeholder": {
    es: "Escribe tu código Solidity aquí...",
    en: "Write your Solidity code here...",
    fr: "Écrivez votre code Solidity ici...",
    de: "Schreiben Sie hier Ihren Solidity-Code...",
    pt: "Escreva seu código Solidity aqui...",
  },
  "editor.execute": {
    es: "Ejecutar Transacción",
    en: "Execute Transaction",
    fr: "Exécuter la Transaction",
    de: "Transaktion Ausführen",
    pt: "Executar Transação",
  },
  "editor.executing": {
    es: "Ejecutando...",
    en: "Executing...",
    fr: "Exécution...",
    de: "Ausführung...",
    pt: "Executando...",
  },

  // Trace
  "trace.title": {
    es: "Trace de Ejecución",
    en: "Execution Trace",
    fr: "Trace d'Exécution",
    de: "Ausführungs-Trace",
    pt: "Rastreamento de Execução",
  },
  "trace.play": {
    es: "Reproducir",
    en: "Play",
    fr: "Jouer",
    de: "Abspielen",
    pt: "Reproduzir",
  },
  "trace.pause": {
    es: "Pausar",
    en: "Pause",
    fr: "Pause",
    de: "Pausieren",
    pt: "Pausar",
  },
  "trace.empty": {
    es: "Ejecuta una transacción para ver el trace",
    en: "Execute a transaction to see the trace",
    fr: "Exécutez une transaction pour voir le trace",
    de: "Führen Sie eine Transaktion aus, um den Trace zu sehen",
    pt: "Execute uma transação para ver o rastreamento",
  },
  "trace.steps": {
    es: "Pasos de Ejecución",
    en: "Execution Steps",
    fr: "Étapes d'Exécution",
    de: "Ausführungsschritte",
    pt: "Passos de Execução",
  },
  "trace.step": {
    es: "Paso",
    en: "Step",
    fr: "Étape",
    de: "Schritt",
    pt: "Passo",
  },
  "trace.line": {
    es: "Línea",
    en: "Line",
    fr: "Ligne",
    de: "Zeile",
    pt: "Linha",
  },
  "trace.gas": {
    es: "Gas usado",
    en: "Gas used",
    fr: "Gas utilisé",
    de: "Gas verbraucht",
    pt: "Gas usado",
  },

  // Storage
  "storage.title": {
    es: "Cambios en Storage",
    en: "Storage Changes",
    fr: "Changements de Stockage",
    de: "Speicher-Änderungen",
    pt: "Mudanças no Armazenamento",
  },
  "storage.variable": {
    es: "Variable",
    en: "Variable",
    fr: "Variable",
    de: "Variable",
    pt: "Variável",
  },
  "storage.previous": {
    es: "Valor Anterior",
    en: "Previous Value",
    fr: "Valeur Précédente",
    de: "Vorheriger Wert",
    pt: "Valor Anterior",
  },
  "storage.new": {
    es: "Valor Nuevo",
    en: "New Value",
    fr: "Nouvelle Valeur",
    de: "Neuer Wert",
    pt: "Novo Valor",
  },
  "storage.new_badge": {
    es: "Nuevo",
    en: "New",
    fr: "Nouveau",
    de: "Neu",
    pt: "Novo",
  },

  // Messages
  "message.success": {
    es: "Ejecución exitosa",
    en: "Execution successful",
    fr: "Exécution réussie",
    de: "Ausführung erfolgreich",
    pt: "Execução bem-sucedida",
  },
  "message.success_desc": {
    es: "La transacción se ejecutó correctamente",
    en: "The transaction was executed successfully",
    fr: "La transaction a été exécutée avec succès",
    de: "Die Transaktion wurde erfolgreich ausgeführt",
    pt: "A transação foi executada com sucesso",
  },
  "message.error": {
    es: "Error de ejecución",
    en: "Execution error",
    fr: "Erreur d'exécution",
    de: "Ausführungsfehler",
    pt: "Erro de execução",
  },
  "message.unknown_error": {
    es: "Error desconocido",
    en: "Unknown error",
    fr: "Erreur inconnue",
    de: "Unbekannter Fehler",
    pt: "Erro desconhecido",
  },
  "message.editor_loading": {
    es: "Cargando editor de código...",
    en: "Loading code editor...",
    fr: "Chargement de l'éditeur de code...",
    de: "Code-Editor wird geladen...",
    pt: "Carregando editor de código...",
  },
  "message.editor_error": {
    es: "Error al cargar el editor. Por favor, recarga la página.",
    en: "Failed to load editor. Please refresh the page.",
    fr: "Échec du chargement de l'éditeur. Veuillez actualiser la page.",
    de: "Editor konnte nicht geladen werden. Bitte laden Sie die Seite neu.",
    pt: "Falha ao carregar o editor. Por favor, atualize a página.",
  },

  // AI Tutor
  "ai.title": {
    es: "Tutor IA",
    en: "AI Tutor",
    fr: "Tuteur IA",
    de: "KI-Tutor",
    pt: "Tutor IA",
  },
  "ai.welcome": {
    es: "¡Hola! Soy tu tutor de Solidity con IA. Puedo ayudarte a entender conceptos, explicar tu código y responder preguntas sobre desarrollo de contratos inteligentes. ¿En qué puedo ayudarte?",
    en: "Hello! I'm your AI Solidity tutor. I can help you understand concepts, explain your code, and answer questions about smart contract development. How can I help you?",
    fr: "Bonjour ! Je suis votre tuteur IA Solidity. Je peux vous aider à comprendre les concepts, expliquer votre code et répondre aux questions sur le développement de contrats intelligents. Comment puis-je vous aider ?",
    de: "Hallo! Ich bin Ihr KI-Solidity-Tutor. Ich kann Ihnen helfen, Konzepte zu verstehen, Ihren Code zu erklären und Fragen zur Smart-Contract-Entwicklung zu beantworten. Wie kann ich Ihnen helfen?",
    pt: "Olá! Sou seu tutor de Solidity com IA. Posso ajudá-lo a entender conceitos, explicar seu código e responder perguntas sobre desenvolvimento de contratos inteligentes. Como posso ajudá-lo?",
  },
  "ai.placeholder": {
    es: "Pregunta sobre Solidity, gas, storage, etc...",
    en: "Ask about Solidity, gas, storage, etc...",
    fr: "Demandez à propos de Solidity, gas, stockage, etc...",
    de: "Fragen Sie nach Solidity, Gas, Speicher, etc...",
    pt: "Pergunte sobre Solidity, gas, armazenamento, etc...",
  },
  "ai.thinking": {
    es: "Pensando...",
    en: "Thinking...",
    fr: "Réflexion...",
    de: "Denken...",
    pt: "Pensando...",
  },
  "ai.suggestions": {
    es: "Preguntas sugeridas:",
    en: "Suggested questions:",
    fr: "Questions suggérées:",
    de: "Vorgeschlagene Fragen:",
    pt: "Perguntas sugeridas:",
  },
  "ai.question.gas": {
    es: "¿Cómo funciona el gas en Solidity?",
    en: "How does gas work in Solidity?",
    fr: "Comment fonctionne le gas en Solidity ?",
    de: "Wie funktioniert Gas in Solidity?",
    pt: "Como funciona o gas no Solidity?",
  },
  "ai.question.storage": {
    es: "¿Qué es el storage en contratos?",
    en: "What is storage in contracts?",
    fr: "Qu'est-ce que le stockage dans les contrats ?",
    de: "Was ist Speicher in Verträgen?",
    pt: "O que é armazenamento em contratos?",
  },
  "ai.question.security": {
    es: "¿Cómo hacer contratos seguros?",
    en: "How to make secure contracts?",
    fr: "Comment créer des contrats sécurisés ?",
    de: "Wie erstellt man sichere Verträge?",
    pt: "Como fazer contratos seguros?",
  },
  "ai.question.optimization": {
    es: "¿Cómo optimizar el gas?",
    en: "How to optimize gas?",
    fr: "Comment optimiser le gas ?",
    de: "Wie optimiert man Gas?",
    pt: "Como otimizar o gas?",
  },

  // State
  "state.empty": {
    es: "Vacío",
    en: "Empty",
    fr: "Vide",
    de: "Leer",
    pt: "Vazio",
  },

  // Common
  "common.of": {
    es: "de",
    en: "of",
    fr: "de",
    de: "von",
    pt: "de",
  },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("es")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && ["es", "en", "fr", "de", "pt"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    return translations[key]?.[language] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
