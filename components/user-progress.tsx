"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Trophy, Save, AlertCircle } from "lucide-react"
import { supabase, isSupabaseConfigured, type UserProgress, type SavedContract } from "@/lib/supabase"
import { useLanguage } from "@/hooks/use-language"

interface UserProgressProps {
  userId: string
  currentCode: string
}

export function UserProgressComponent({ userId, currentCode }: UserProgressProps) {
  const { t } = useLanguage()
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [savedContracts, setSavedContracts] = useState<SavedContract[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isSupabaseConfigured()) {
      loadUserData()
    } else {
      setIsLoading(false)
    }
  }, [userId])

  const loadUserData = async () => {
    try {
      // Load user progress
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      // Load saved contracts
      const { data: contractsData } = await supabase
        .from("saved_contracts")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })

      setProgress(progressData || [])
      setSavedContracts(contractsData || [])
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveCurrentContract = async () => {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase not configured. Cannot save contract.")
      return
    }

    try {
      const contractName = `Contract_${Date.now()}`

      const { error } = await supabase.from("saved_contracts").insert({
        user_id: userId,
        name: contractName,
        code: currentCode,
        description: "Auto-saved contract",
        is_public: false,
      })

      if (!error) {
        loadUserData() // Refresh the list
      }
    } catch (error) {
      console.error("Error saving contract:", error)
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Supabase is not configured. User progress and saved contracts are not available.
              <br />
              <br />
              To enable these features, please add the Supabase integration to your project.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const completedLessons = progress.filter((p) => p.completed).length
  const totalScore = progress.reduce((sum, p) => sum + p.score, 0)
  const averageScore = progress.length > 0 ? totalScore / progress.length : 0

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{completedLessons}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(averageScore)}%</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{savedContracts.length}</div>
              <div className="text-sm text-muted-foreground">Saved Contracts</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round((completedLessons / Math.max(progress.length, 1)) * 100)}%</span>
            </div>
            <Progress value={(completedLessons / Math.max(progress.length, 1)) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Save Current Work */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Current Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={saveCurrentContract} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Current Contract
          </Button>
        </CardContent>
      </Card>

      {/* Saved Contracts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Saved Contracts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {savedContracts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No saved contracts yet</p>
            ) : (
              savedContracts.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{contract.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(contract.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {contract.is_public ? "Public" : "Private"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
