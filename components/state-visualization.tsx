"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Database, Layers, Zap } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface StateVisualizationProps {
  currentStep: number
  trace: any[]
}

export function StateVisualization({ currentStep, trace }: StateVisualizationProps) {
  const { t } = useLanguage()
  const currentTrace = trace[currentStep]

  if (!currentTrace) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-card-foreground">
              <Layers className="h-4 w-4" />
              Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("state.empty")}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-card-foreground">
              <Database className="h-4 w-4" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("state.empty")}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-card-foreground">
              <Zap className="h-4 w-4" />
              {t("trace.gas")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("state.empty")}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Stack */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-card-foreground">
            <Layers className="h-4 w-4" />
            Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentTrace.stack.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("state.empty")}</p>
            ) : (
              currentTrace.stack.map((item: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded border">
                  <span className="text-xs text-muted-foreground font-medium">#{index}</span>
                  <Badge variant="outline" className="font-mono text-xs bg-background text-foreground border-border">
                    {item}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Storage */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-card-foreground">
            <Database className="h-4 w-4" />
            Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(currentTrace.storage).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{key}</span>
                  <Badge variant="secondary" className="font-mono text-xs bg-secondary/80 text-secondary-foreground">
                    {value as string}
                  </Badge>
                </div>
                <Separator className="bg-border" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gas & Execution Info */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-card-foreground">
            <Zap className="h-4 w-4" />
            Execution Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground font-medium">{t("trace.gas")}</p>
              <Badge variant="default" className="font-mono bg-primary text-primary-foreground">
                {currentTrace.gasUsed.toLocaleString()}
              </Badge>
            </div>
            <Separator className="bg-border" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Instruction</p>
              <Badge variant="outline" className="font-mono bg-background text-foreground border-border">
                {currentTrace.instruction}
              </Badge>
            </div>
            <Separator className="bg-border" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">{t("trace.line")}</p>
              <Badge variant="secondary" className="bg-secondary/80 text-secondary-foreground">
                {currentTrace.line}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
