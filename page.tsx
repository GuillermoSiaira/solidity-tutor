"use client"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Loader2, Play, Code, Activity, MessageSquare, User, AlertCircle, GitBranch, Network } from "lucide-react"
import { CodeEditor } from "@/components/code-editor"
import { SimpleCodeEditor } from "@/components/simple-code-editor"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSelector } from "@/components/language-selector"
import { EnhancedAITutor } from "@/components/enhanced-ai-tutor"
import { ExecutionControls } from "@/components/execution-controls"
import { StateVisualization } from "@/components/state-visualization"
import { ExecutionFlowDiagram } from "@/components/execution-flow-diagram"
import { MultiContractInteraction } from "@/components/multi-contract-interaction"
import { UserProgressComponent } from "@/components/user-progress"
import { useLanguage } from "@/hooks/use-language"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

interface TraceStep {
  line: number
  instruction: string
  gasUsed: number
  stack: string[]
  memory: string[]
  storage: Record<string, string>
}

interface StorageChange {
  variable: string
  previousValue: string
  newValue: string
  isNew?: boolean
}

interface ExecutionResult {
  success: boolean
  trace: TraceStep[]
  storageChanges: StorageChange[]
  error?: string
}

const defaultSolidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TokenWallet
 * @dev A comprehensive token wallet contract demonstrating multiple state variables
 * @notice This contract manages token deposits, withdrawals, and transfers with authorization
 * @author Solidity Tutor
 */
contract TokenWallet {
    /// @dev The owner of the wallet contract
    address public owner;
    
    /// @notice Total balance of tokens in the wallet
    uint256 public balance;
    
    /// @dev Counter for total number of transactions processed
    uint256 public totalTransactions;
    
    /// @notice Whether the wallet is currently active
    bool public isActive;
    
    /// @dev Human-readable name for this wallet
    string public walletName;
    
    /// @notice Number of decimal places for token precision
    uint8 public decimals;
    
    /// @dev Maximum balance allowed in this wallet
    uint256 public maxBalance;
    
    /// @notice Mapping of user addresses to their token balances
    mapping(address => uint256) public userBalances;
    
    /// @dev Mapping to track authorized users
    mapping(address => bool) public authorizedUsers;
    
    /// @notice Array storing transaction history addresses
    address[] public transactionHistory;
    
    /**
     * @dev Emitted when tokens are deposited
     * @param user Address of the user making the deposit
     * @param amount Amount of tokens deposited
     */
    event Deposit(address indexed user, uint256 amount);
    
    /**
     * @dev Emitted when tokens are withdrawn
     * @param user Address of the user making the withdrawal
     * @param amount Amount of tokens withdrawn
     */
    event Withdrawal(address indexed user, uint256 amount);
    
    /**
     * @dev Emitted when tokens are transferred between users
     * @param from Address sending the tokens
     * @param to Address receiving the tokens
     * @param amount Amount of tokens transferred
     */
    event Transfer(address indexed from, address indexed to, uint256 amount);
    
    /**
     * @dev Contract constructor initializes default values
     * @notice Sets up the wallet with default configuration
     */
    constructor() {
        owner = msg.sender;
        balance = 0;
        totalTransactions = 0;
        isActive = true;
        walletName = "MyTokenWallet";
        decimals = 18;
        maxBalance = 1000000 * 10**decimals;
        authorizedUsers[msg.sender] = true;
    }
    
    /**
     * @notice Deposit tokens into the wallet
     * @dev Increases both total balance and user's individual balance
     * @param amount The amount of tokens to deposit
     * @custom:requirements Wallet must be active, amount > 0, within max balance
     */
    function deposit(uint256 amount) public {
        require(isActive, "Wallet is not active");
        require(amount > 0, "Amount must be greater than 0");
        require(balance + amount <= maxBalance, "Exceeds maximum balance");
        
        balance += amount;
        userBalances[msg.sender] += amount;
        totalTransactions += 1;
        
        transactionHistory.push(msg.sender);
        
        emit Deposit(msg.sender, amount);
    }
    
    /**
     * @notice Withdraw tokens from the wallet
     * @dev Decreases both total balance and user's individual balance
     * @param amount The amount of tokens to withdraw
     * @custom:requirements Wallet active, amount > 0, sufficient user balance
     */
    function withdraw(uint256 amount) public {
        require(isActive, "Wallet is not active");
        require(amount > 0, "Amount must be greater than 0");
        require(userBalances[msg.sender] >= amount, "Insufficient balance");
        
        balance -= amount;
        userBalances[msg.sender] -= amount;
        totalTransactions += 1;
        
        transactionHistory.push(msg.sender);
        
        emit Withdrawal(msg.sender, amount);
    }
}`

export default function SolidityTutor() {
  const { t } = useLanguage()
  const [code, setCode] = useState(defaultSolidityCode)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [useSimpleEditor, setUseSimpleEditor] = useState(false)
  const [showAITutor, setShowAITutor] = useState(true)
  const [showProgress, setShowProgress] = useState(false)
  const [user, setUser] = useState<any>(null)
  const editorRef = useRef<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check for authenticated user (only if Supabase is configured)
  useEffect(() => {
    if (!isSupabaseConfigured()) return

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const highlightLine = useCallback((lineNumber: number) => {
    if (editorRef.current && editorRef.current.highlightLine) {
      editorRef.current.highlightLine(lineNumber)
    }
  }, [])

  const handleEditorReady = useCallback((editor: any) => {
    editorRef.current = editor
  }, [])

  const executeTransaction = async () => {
    setIsExecuting(true)
    setExecutionResult(null)
    setCurrentStep(0)

    try {
      // Enhanced mock result for TokenWallet deposit function
      const mockResult: ExecutionResult = {
        success: true,
        trace: [
          {
            line: 85,
            instruction: "SLOAD",
            gasUsed: 2100,
            stack: ["0x1"],
            memory: [],
            storage: {
              isActive: "true",
              balance: "0",
              totalTransactions: "0",
              walletName: "MyTokenWallet",
            },
          },
          {
            line: 86,
            instruction: "PUSH1",
            gasUsed: 2103,
            stack: ["0x1", "0x64"],
            memory: [],
            storage: {
              isActive: "true",
              balance: "0",
              totalTransactions: "0",
              walletName: "MyTokenWallet",
            },
          },
          {
            line: 89,
            instruction: "ADD",
            gasUsed: 2106,
            stack: ["0x64"],
            memory: [],
            storage: {
              isActive: "true",
              balance: "0",
              totalTransactions: "0",
              walletName: "MyTokenWallet",
            },
          },
          {
            line: 89,
            instruction: "SSTORE",
            gasUsed: 22106,
            stack: ["0x64"],
            memory: [],
            storage: {
              isActive: "true",
              balance: "100",
              totalTransactions: "0",
              walletName: "MyTokenWallet",
            },
          },
          {
            line: 90,
            instruction: "SLOAD",
            gasUsed: 24206,
            stack: [],
            memory: [],
            storage: {
              isActive: "true",
              balance: "100",
              totalTransactions: "0",
              walletName: "MyTokenWallet",
              "userBalances[msg.sender]": "0",
            },
          },
          {
            line: 90,
            instruction: "ADD",
            gasUsed: 24209,
            stack: ["0x64"],
            memory: [],
            storage: {
              isActive: "true",
              balance: "100",
              totalTransactions: "0",
              walletName: "MyTokenWallet",
              "userBalances[msg.sender]": "0",
            },
          },
          {
            line: 90,
            instruction: "SSTORE",
            gasUsed: 44209,
            stack: [],
            memory: [],
            storage: {
              isActive: "true",
              balance: "100",
              totalTransactions: "0",
              walletName: "MyTokenWallet",
              "userBalances[msg.sender]": "100",
            },
          },
          {
            line: 91,
            instruction: "SLOAD",
            gasUsed: 46309,
            stack: ["0x1"],
            memory: [],
            storage: {
              isActive: "true",
              balance: "100",
              totalTransactions: "0",
              walletName: "MyTokenWallet",
              "userBalances[msg.sender]": "100",
            },
          },
          {
            line: 91,
            instruction: "ADD",
            gasUsed: 46312,
            stack: ["0x1"],
            memory: [],
            storage: {
              isActive: "true",
              balance: "100",
              totalTransactions: "0",
              walletName: "MyTokenWallet",
              "userBalances[msg.sender]": "100",
            },
          },
          {
            line: 91,
            instruction: "SSTORE",
            gasUsed: 51312,
            stack: [],
            memory: [],
            storage: {
              isActive: "true",
              balance: "100",
              totalTransactions: "1",
              walletName: "MyTokenWallet",
              "userBalances[msg.sender]": "100",
            },
          },
        ],
        storageChanges: [
          {
            variable: "balance",
            previousValue: "0",
            newValue: "100",
            isNew: false,
          },
          {
            variable: "userBalances[msg.sender]",
            previousValue: "0",
            newValue: "100",
            isNew: true,
          },
          {
            variable: "totalTransactions",
            previousValue: "0",
            newValue: "1",
            isNew: false,
          },
        ],
      }

      setExecutionResult(mockResult)

      // Save progress if user is authenticated and Supabase is configured
      if (user && isSupabaseConfigured()) {
        try {
          await supabase.from("user_progress").insert({
            user_id: user.id,
            lesson_id: "token_wallet_deposit",
            code,
            completed: true,
            score: 100,
          })
        } catch (error) {
          console.error("Error saving progress:", error)
        }
      }

      toast({
        title: t("message.success"),
        description: t("message.success_desc"),
      })
    } catch (error) {
      toast({
        title: t("message.error"),
        description: error instanceof Error ? error.message : t("message.unknown_error"),
        variant: "destructive",
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const playTrace = () => {
    if (!executionResult?.trace) return

    setIsPlaying(true)
    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = prev + 1
        if (nextStep >= executionResult.trace.length) {
          setIsPlaying(false)
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
          return prev
        }
        highlightLine(executionResult.trace[nextStep].line)
        return nextStep
      })
    }, 1500)
  }

  const stopTrace = () => {
    setIsPlaying(false)
    setCurrentStep(0)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const stepForward = () => {
    if (executionResult && currentStep < executionResult.trace.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      highlightLine(executionResult.trace[nextStep].line)
    }
  }

  const stepBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      if (executionResult) {
        highlightLine(executionResult.trace[prevStep].line)
      }
    }
  }

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      toast({
        title: "Authentication not available",
        description: "Supabase integration is required for authentication.",
        variant: "destructive",
      })
      return
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut()
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{t("app.title")}</h1>
            <Badge variant="secondary">{t("app.subtitle")}</Badge>
          </div>
          <div className="flex items-center gap-2">
            {user && isSupabaseConfigured() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProgress(!showProgress)}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                {showProgress ? "Hide Progress" : "Show Progress"}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAITutor(!showAITutor)}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              {showAITutor ? "Hide AI Tutor" : "Show AI Tutor"}
            </Button>
            {isSupabaseConfigured() && (
              <>
                {user ? (
                  <Button variant="outline" size="sm" onClick={signOut}>
                    Sign Out
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={signInWithGoogle}>
                    Sign In
                  </Button>
                )}
              </>
            )}
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>

        {/* Integration Status Alert */}
        {!isSupabaseConfigured() && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Some features are limited without integrations. Add Supabase, Groq, and Blob integrations for the full
              experience.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Code Editor */}
          <ResizablePanel
            defaultSize={showAITutor && showProgress ? 30 : showAITutor || showProgress ? 35 : 50}
            minSize={25}
          >
            <div className="h-full flex flex-col gap-4">
              <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      {t("editor.title")}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setUseSimpleEditor(!useSimpleEditor)}>
                        {useSimpleEditor ? t("editor.advanced") : t("editor.simple")}
                      </Button>
                      {!useSimpleEditor && (
                        <Button variant="ghost" size="sm" onClick={() => setUseSimpleEditor(true)} className="text-xs">
                          Force Simple
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                  <div className="flex-1 border rounded-md overflow-hidden">
                    {useSimpleEditor ? (
                      <SimpleCodeEditor value={code} onChange={setCode} placeholder={t("editor.placeholder")} />
                    ) : (
                      <CodeEditor
                        value={code}
                        onChange={setCode}
                        language="solidity"
                        height="100%"
                        onEditorReady={handleEditorReady}
                      />
                    )}
                  </div>
                  <Button onClick={executeTransaction} disabled={isExecuting} className="w-full" size="lg">
                    {isExecuting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("editor.executing")}
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Execute deposit(100)
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Middle Panel - Execution Visualization */}
          <ResizablePanel
            defaultSize={showAITutor && showProgress ? 35 : showAITutor || showProgress ? 35 : 50}
            minSize={25}
          >
            <div className="h-full flex flex-col gap-4">
              {/* Execution Controls */}
              {executionResult && (
                <ExecutionControls
                  currentStep={currentStep}
                  totalSteps={executionResult.trace.length}
                  isPlaying={isPlaying}
                  onPlay={playTrace}
                  onPause={() => setIsPlaying(false)}
                  onStop={stopTrace}
                  onStepForward={stepForward}
                  onStepBack={stepBack}
                  onGoToStep={setCurrentStep}
                />
              )}

              {/* Visualization Tabs */}
              <div className="flex-1">
                {!executionResult ? (
                  <Card className="h-full flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t("trace.empty")}</p>
                    </div>
                  </Card>
                ) : (
                  <Tabs defaultValue="state" className="h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="state" className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        State
                      </TabsTrigger>
                      <TabsTrigger value="flow" className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        Flow
                      </TabsTrigger>
                      <TabsTrigger value="contracts" className="flex items-center gap-2">
                        <Network className="h-4 w-4" />
                        Contracts
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="state" className="flex-1 mt-4">
                      <div className="h-full flex flex-col gap-4">
                        <StateVisualization currentStep={currentStep} trace={executionResult.trace} />

                        {/* Storage Changes Table */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">{t("storage.title")}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-xs">{t("storage.variable")}</TableHead>
                                  <TableHead className="text-xs">{t("storage.previous")}</TableHead>
                                  <TableHead className="text-xs">{t("storage.new")}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {executionResult.storageChanges.map((change, index) => (
                                  <TableRow key={index} className="animate-in fade-in-50 duration-500">
                                    <TableCell className="font-mono text-xs">{change.variable}</TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                      {change.previousValue}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs font-semibold text-green-600">
                                      {change.newValue}
                                      {change.isNew && (
                                        <Badge variant="secondary" className="ml-2 text-xs">
                                          New
                                        </Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="flow" className="flex-1 mt-4">
                      <ExecutionFlowDiagram
                        currentStep={currentStep}
                        trace={executionResult.trace}
                        storageChanges={executionResult.storageChanges}
                      />
                    </TabsContent>

                    <TabsContent value="contracts" className="flex-1 mt-4">
                      <MultiContractInteraction />
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </div>
          </ResizablePanel>

          {/* Right Panel - AI Tutor and/or Progress */}
          {(showAITutor || (showProgress && user && isSupabaseConfigured())) && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={35} minSize={25}>
                <div className="h-full flex flex-col gap-4">
                  {showProgress && user && isSupabaseConfigured() && (
                    <div className="flex-1">
                      <UserProgressComponent userId={user.id} currentCode={code} />
                    </div>
                  )}
                  {showAITutor && (
                    <div className="flex-1">
                      <EnhancedAITutor currentCode={code} executionResult={executionResult} userId={user?.id} />
                    </div>
                  )}
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
