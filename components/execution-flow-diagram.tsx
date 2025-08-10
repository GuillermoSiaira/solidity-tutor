"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowDown, Database, Zap, GitBranch } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface FlowStep {
  id: string
  type: "function" | "storage" | "condition" | "event"
  name: string
  line: number
  gasUsed?: number
  storageChanges?: string[]
  isActive?: boolean
  connections?: string[]
}

interface ExecutionFlowDiagramProps {
  currentStep: number
  trace: any[]
  storageChanges: any[]
}

export function ExecutionFlowDiagram({ currentStep, trace, storageChanges }: ExecutionFlowDiagramProps) {
  const { t } = useLanguage()

  // Generate flow steps from trace data
  const generateFlowSteps = (): FlowStep[] => {
    const steps: FlowStep[] = [
      {
        id: "start",
        type: "function",
        name: "deposit(100)",
        line: 85,
        gasUsed: 0,
        connections: ["validation"],
      },
      {
        id: "validation",
        type: "condition",
        name: "require(isActive)",
        line: 86,
        gasUsed: 2100,
        connections: ["amount-check"],
      },
      {
        id: "amount-check",
        type: "condition",
        name: "require(amount > 0)",
        line: 87,
        gasUsed: 2103,
        connections: ["balance-check"],
      },
      {
        id: "balance-check",
        type: "condition",
        name: "require(balance + amount <= maxBalance)",
        line: 88,
        gasUsed: 2106,
        connections: ["update-balance"],
      },
      {
        id: "update-balance",
        type: "storage",
        name: "balance += amount",
        line: 90,
        gasUsed: 22106,
        storageChanges: ["balance: 0 → 100"],
        connections: ["update-user-balance"],
      },
      {
        id: "update-user-balance",
        type: "storage",
        name: "userBalances[msg.sender] += amount",
        line: 91,
        gasUsed: 44209,
        storageChanges: ["userBalances[msg.sender]: 0 → 100"],
        connections: ["increment-transactions"],
      },
      {
        id: "increment-transactions",
        type: "storage",
        name: "totalTransactions += 1",
        line: 92,
        gasUsed: 46309,
        storageChanges: ["totalTransactions: 0 → 1"],
        connections: ["add-history"],
      },
      {
        id: "add-history",
        type: "storage",
        name: "transactionHistory.push(msg.sender)",
        line: 94,
        gasUsed: 51312,
        storageChanges: ["transactionHistory.length: 0 → 1"],
        connections: ["emit-event"],
      },
      {
        id: "emit-event",
        type: "event",
        name: "emit Deposit(msg.sender, amount)",
        line: 96,
        gasUsed: 51312,
        connections: [],
      },
    ]

    return steps.map((step, index) => ({
      ...step,
      isActive: index <= currentStep,
    }))
  }

  const flowSteps = generateFlowSteps()

  const getStepIcon = (type: string) => {
    switch (type) {
      case "function":
        return <GitBranch className="h-4 w-4" />
      case "storage":
        return <Database className="h-4 w-4" />
      case "condition":
        return <Zap className="h-4 w-4" />
      case "event":
        return <ArrowRight className="h-4 w-4" />
      default:
        return <ArrowRight className="h-4 w-4" />
    }
  }

  const getStepColor = (type: string, isActive: boolean) => {
    if (!isActive) return "bg-muted text-muted-foreground"

    switch (type) {
      case "function":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "storage":
        return "bg-green-100 text-green-800 border-green-200"
      case "condition":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "event":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          Execution Flow
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {flowSteps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Step Node */}
              <div
                className={`p-3 rounded-lg border-2 transition-all duration-300 ${getStepColor(
                  step.type,
                  step.isActive || false,
                )} ${step.isActive ? "shadow-md scale-105" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStepIcon(step.type)}
                    <span className="font-medium text-sm">{step.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    L{step.line}
                  </Badge>
                </div>

                {step.gasUsed !== undefined && (
                  <div className="text-xs text-muted-foreground mb-1">Gas: {step.gasUsed.toLocaleString()}</div>
                )}

                {step.storageChanges && step.storageChanges.length > 0 && (
                  <div className="space-y-1">
                    {step.storageChanges.map((change, changeIndex) => (
                      <div key={changeIndex} className="text-xs font-mono bg-black/5 px-2 py-1 rounded">
                        {change}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Connection Arrow */}
              {step.connections && step.connections.length > 0 && index < flowSteps.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowDown
                    className={`h-4 w-4 transition-colors duration-300 ${
                      step.isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 p-3 bg-muted rounded-lg">
          <div className="text-sm font-medium mb-2">Execution Summary</div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Total Steps:</span>
              <span className="ml-2 font-mono">{flowSteps.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Current Step:</span>
              <span className="ml-2 font-mono">{currentStep + 1}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Gas Used:</span>
              <span className="ml-2 font-mono">
                {flowSteps[Math.min(currentStep, flowSteps.length - 1)]?.gasUsed?.toLocaleString() || 0}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Storage Changes:</span>
              <span className="ml-2 font-mono">{storageChanges.length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
