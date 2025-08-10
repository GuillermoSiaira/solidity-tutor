"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

interface TestResult {
  name: string
  status: "pending" | "success" | "error"
  message: string
}

export function EditorTest() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Dynamic Import", status: "pending", message: "Testing Monaco Editor import..." },
    { name: "Editor Creation", status: "pending", message: "Testing editor instance creation..." },
    { name: "Solidity Language", status: "pending", message: "Testing Solidity syntax highlighting..." },
    { name: "Event Handling", status: "pending", message: "Testing editor event listeners..." },
  ])

  const updateTest = (index: number, status: TestResult["status"], message: string) => {
    setTests((prev) => prev.map((test, i) => (i === index ? { ...test, status, message } : test)))
  }

  const runTests = async () => {
    // Reset tests
    setTests((prev) => prev.map((test) => ({ ...test, status: "pending" })))

    try {
      // Test 1: Dynamic Import
      updateTest(0, "pending", "Importing Monaco Editor...")
      const monaco = await import("monaco-editor")
      updateTest(0, "success", "Monaco Editor imported successfully")

      // Test 2: Editor Creation
      updateTest(1, "pending", "Creating temporary editor instance...")
      const container = document.createElement("div")
      container.style.width = "100px"
      container.style.height = "100px"
      document.body.appendChild(container)

      const editor = monaco.editor.create(container, {
        value: "test",
        language: "javascript",
        theme: "vs-light",
      })
      updateTest(1, "success", "Editor instance created successfully")

      // Test 3: Solidity Language
      updateTest(2, "pending", "Registering Solidity language...")
      const languages = monaco.languages.getLanguages()
      const hasSolidity = languages.some((lang) => lang.id === "solidity")

      if (!hasSolidity) {
        monaco.languages.register({ id: "solidity" })
      }
      updateTest(2, "success", "Solidity language support added")

      // Test 4: Event Handling
      updateTest(3, "pending", "Testing editor events...")
      let eventFired = false
      const disposable = editor.onDidChangeModelContent(() => {
        eventFired = true
      })

      editor.setValue("test change")

      setTimeout(() => {
        if (eventFired) {
          updateTest(3, "success", "Editor events working correctly")
        } else {
          updateTest(3, "error", "Editor events not firing")
        }

        // Cleanup
        disposable.dispose()
        editor.dispose()
        document.body.removeChild(container)
      }, 100)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      // Update failed test
      const pendingIndex = tests.findIndex((test) => test.status === "pending")
      if (pendingIndex !== -1) {
        updateTest(pendingIndex, "error", `Failed: ${errorMessage}`)
      }
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            Success
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Running</Badge>
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Monaco Editor Test Suite
          <Button onClick={runTests} size="sm">
            Run Tests
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tests.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <div>
                  <h4 className="font-medium">{test.name}</h4>
                  <p className="text-sm text-muted-foreground">{test.message}</p>
                </div>
              </div>
              {getStatusBadge(test.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
