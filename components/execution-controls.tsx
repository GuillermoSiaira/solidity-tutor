"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, SkipBack, SkipForward, Square } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface ExecutionControlsProps {
  currentStep: number
  totalSteps: number
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onStepForward: () => void
  onStepBack: () => void
  onGoToStep: (step: number) => void
}

export function ExecutionControls({
  currentStep,
  totalSteps,
  isPlaying,
  onPlay,
  onPause,
  onStop,
  onStepForward,
  onStepBack,
}: ExecutionControlsProps) {
  const { t } = useLanguage()

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onStepBack} disabled={currentStep === 0}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={isPlaying ? onPause : onPlay} disabled={totalSteps === 0}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={onStop} disabled={!isPlaying && currentStep === 0}>
              <Square className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onStepForward} disabled={currentStep >= totalSteps - 1}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {t("trace.step")} {currentStep + 1} {t("common.of")} {totalSteps}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
