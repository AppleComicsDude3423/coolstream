"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Volume2, Subtitles, Palette } from "lucide-react"
import { storageManager, type UserPreferences } from "@/lib/storage"

interface UserPreferencesProps {
  onClose: () => void
}

export function UserPreferencesModal({ onClose }: UserPreferencesProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(storageManager.getPreferences())

  const handleSave = () => {
    storageManager.updatePreferences(preferences)
    onClose()
  }

  const handleReset = () => {
    const defaults: UserPreferences = {
      preferredProvider: "vidsrc",
      autoplay: true,
      volume: 0.8,
      quality: "auto",
      subtitles: false,
      theme: "dark",
    }
    setPreferences(defaults)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>User Preferences</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="playback" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="playback">Playback</TabsTrigger>
              <TabsTrigger value="quality">Quality</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>

            <TabsContent value="playback" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Preferred Streaming Provider</Label>
                    <p className="text-sm text-muted-foreground">Default provider for video playback</p>
                  </div>
                  <Select
                    value={preferences.preferredProvider}
                    onValueChange={(value: "vidsrc" | "vikingEmbed" | "filmku") =>
                      setPreferences({ ...preferences, preferredProvider: value })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vidsrc">VidSrc</SelectItem>
                      <SelectItem value="vikingEmbed">Viking</SelectItem>
                      <SelectItem value="filmku">FILMku</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Autoplay</Label>
                    <p className="text-sm text-muted-foreground">Automatically start playing videos</p>
                  </div>
                  <Switch
                    checked={preferences.autoplay}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, autoplay: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    <Label>Default Volume</Label>
                  </div>
                  <Slider
                    value={[preferences.volume]}
                    max={1}
                    step={0.1}
                    onValueChange={(value) => setPreferences({ ...preferences, volume: value[0] })}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">{Math.round(preferences.volume * 100)}%</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quality" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Video Quality</Label>
                    <p className="text-sm text-muted-foreground">Preferred video resolution</p>
                  </div>
                  <Select
                    value={preferences.quality}
                    onValueChange={(value: "auto" | "720p" | "1080p") =>
                      setPreferences({ ...preferences, quality: value })
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Subtitles className="h-4 w-4" />
                      <Label>Subtitles</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Enable subtitles by default</p>
                  </div>
                  <Switch
                    checked={preferences.subtitles}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, subtitles: checked })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      <Label>Theme</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                  </div>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value: "dark" | "light") => setPreferences({ ...preferences, theme: value })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button variant="outline" onClick={handleReset}>
              Reset to Defaults
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Preferences</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
