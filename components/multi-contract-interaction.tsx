"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, ContactIcon as Contract, Database, Zap } from "lucide-react"
import { useState } from "react"

interface ContractNode {
  id: string
  name: string
  address: string
  functions: string[]
  isActive: boolean
  position: { x: number; y: number }
}

interface InteractionEdge {
  from: string
  to: string
  functionCall: string
  gasUsed: number
  isActive: boolean
}

export function MultiContractInteraction() {
  const [contracts] = useState<ContractNode[]>([
    {
      id: "wallet",
      name: "TokenWallet",
      address: "0x742d35Cc...",
      functions: ["deposit", "withdraw", "transfer"],
      isActive: true,
      position: { x: 50, y: 100 },
    },
    {
      id: "token",
      name: "ERC20Token",
      address: "0x1234567...",
      functions: ["transfer", "approve", "balanceOf"],
      isActive: false,
      position: { x: 300, y: 100 },
    },
    {
      id: "exchange",
      name: "DEXExchange",
      address: "0xabcdef1...",
      functions: ["swap", "addLiquidity", "removeLiquidity"],
      isActive: false,
      position: { x: 175, y: 300 },
    },
  ])

  const [interactions] = useState<InteractionEdge[]>([
    {
      from: "wallet",
      to: "token",
      functionCall: "token.transfer(to, amount)",
      gasUsed: 21000,
      isActive: true,
    },
    {
      from: "wallet",
      to: "exchange",
      functionCall: "exchange.swap(tokenA, tokenB, amount)",
      gasUsed: 150000,
      isActive: false,
    },
  ])

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Contract className="h-4 w-4" />
          Multi-Contract Interactions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Contract Interaction Diagram */}
        <div className="relative h-96 bg-muted/20 rounded-lg p-4 mb-4">
          {/* Contract Nodes */}
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className={`absolute p-3 rounded-lg border-2 transition-all duration-300 ${
                contract.isActive ? "bg-blue-100 border-blue-300 shadow-lg" : "bg-gray-100 border-gray-300"
              }`}
              style={{
                left: `${contract.position.x}px`,
                top: `${contract.position.y}px`,
                width: "140px",
              }}
            >
              <div className="text-sm font-medium mb-1">{contract.name}</div>
              <div className="text-xs text-muted-foreground mb-2 font-mono">{contract.address}</div>
              <div className="space-y-1">
                {contract.functions.slice(0, 2).map((func) => (
                  <Badge key={func} variant="outline" className="text-xs mr-1">
                    {func}
                  </Badge>
                ))}
              </div>
            </div>
          ))}

          {/* Interaction Arrows */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {interactions.map((interaction, index) => {
              const fromContract = contracts.find((c) => c.id === interaction.from)
              const toContract = contracts.find((c) => c.id === interaction.to)

              if (!fromContract || !toContract) return null

              const startX = fromContract.position.x + 70
              const startY = fromContract.position.y + 40
              const endX = toContract.position.x + 70
              const endY = toContract.position.y + 40

              return (
                <g key={index}>
                  <defs>
                    <marker
                      id={`arrowhead-${index}`}
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill={interaction.isActive ? "#3b82f6" : "#9ca3af"} />
                    </marker>
                  </defs>
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={interaction.isActive ? "#3b82f6" : "#9ca3af"}
                    strokeWidth="2"
                    markerEnd={`url(#arrowhead-${index})`}
                    className="transition-all duration-300"
                  />
                  {/* Function call label */}
                  <text
                    x={(startX + endX) / 2}
                    y={(startY + endY) / 2 - 10}
                    textAnchor="middle"
                    className="text-xs fill-current"
                    fill={interaction.isActive ? "#1f2937" : "#9ca3af"}
                  >
                    {interaction.functionCall.split("(")[0]}
                  </text>
                  <text
                    x={(startX + endX) / 2}
                    y={(startY + endY) / 2 + 5}
                    textAnchor="middle"
                    className="text-xs fill-current"
                    fill="#6b7280"
                  >
                    {interaction.gasUsed.toLocaleString()} gas
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Interaction Details */}
        <div className="space-y-3">
          <div className="text-sm font-medium">Current Interactions:</div>
          {interactions.map((interaction, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                interaction.isActive ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  <span className="text-sm font-medium">{interaction.functionCall}</span>
                </div>
                <Badge variant={interaction.isActive ? "default" : "secondary"}>
                  {interaction.gasUsed.toLocaleString()} gas
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {contracts.find((c) => c.id === interaction.from)?.name} →{" "}
                {contracts.find((c) => c.id === interaction.to)?.name}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            <Database className="h-4 w-4 mr-2" />
            Add Contract Interaction
          </Button>
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            <Zap className="h-4 w-4 mr-2" />
            Simulate Cross-Contract Call
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
