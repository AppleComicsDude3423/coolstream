"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Star } from "lucide-react"
import { StreamingDashboard } from "@/components/streaming-dashboard"

const VALID_KEYS = ["a01231", "0d1000", "uuuu1", "a3b2729", "codetrident"]

export default function CoolStreamApp() {
  const [accessKey, setAccessKey] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const savedAuth = localStorage.getItem("coolstream_authenticated")
    const savedKey = localStorage.getItem("coolstream_key")

    if (savedAuth === "true" && savedKey && VALID_KEYS.includes(savedKey)) {
      setIsAuthenticated(true)
      setAccessKey(savedKey)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (VALID_KEYS.includes(accessKey.trim())) {
      setIsAuthenticated(true)
      localStorage.setItem("coolstream_authenticated", "true")
      localStorage.setItem("coolstream_key", accessKey.trim())
    } else {
      setError("Invalid access key. Please check your exclusive access code.")
    }

    setIsLoading(false)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setAccessKey("")
    localStorage.removeItem("coolstream_authenticated")
    localStorage.removeItem("coolstream_key")
  }

  if (isAuthenticated) {
    return <StreamingDashboard onLogout={handleLogout} userKey={accessKey} />
  }

  return (
    <div className="min-h-screen aurora-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-effect floating">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Play className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">CoolStream</h1>
          </div>
          <CardTitle className="text-xl">Exclusive Access Required</CardTitle>
          <CardDescription>Enter your exclusive access key to stream with coolness</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="accessKey" className="text-sm font-medium">
                Access Key
              </label>
              <Input
                id="accessKey"
                type="password"
                placeholder="Enter your exclusive key"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                className="glass-effect"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full glow-effect" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Access CoolStream"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border/50">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
              <Star className="h-3 w-3" />
              <span>Premium Streaming Service</span>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Valid keys: a01231, 0d1000, uuuu1, a3b2729, codetrident
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
