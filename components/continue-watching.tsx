"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Clock, X } from "lucide-react"
import { storageManager, type WatchProgress } from "@/lib/storage"
import type { Movie, TVShow } from "@/lib/api"

interface ContinueWatchingProps {
  onWatchContent: (content: Movie | TVShow) => void
}

export function ContinueWatching({ onWatchContent }: ContinueWatchingProps) {
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([])

  useEffect(() => {
    setContinueWatching(storageManager.getContinueWatching())
  }, [])

  const handleRemoveFromContinueWatching = (contentId: number, contentType: "movie" | "tv") => {
    storageManager.removeFromContinueWatching(contentId, contentType)
    setContinueWatching(storageManager.getContinueWatching())
  }

  const handleWatchContent = (item: WatchProgress) => {
    // Convert WatchProgress to Movie/TVShow format for player
    const content = {
      id: item.contentId,
      [item.contentType === "movie" ? "title" : "name"]: item.title,
      overview: "",
      poster_path: item.poster_path,
      backdrop_path: null,
      [item.contentType === "movie" ? "release_date" : "first_air_date"]: "",
      vote_average: 0,
      vote_count: 0,
      genre_ids: [],
      streaming_urls: {
        vidsrc: `https://vidsrc.wtf/embed/${item.contentType}/${item.contentId}`,
        vikingEmbed: `https://vembed.stream/play/${item.contentType === "movie" ? "" : "tv/"}${item.contentId}`,
        filmku: `https://filmku.stream/embed/${item.contentType === "movie" ? "" : "tv/"}${item.contentId}`,
      },
    }

    if (item.contentType === "tv") {
      ;(content as any).origin_country = []
    }

    onWatchContent(content as Movie | TVShow)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  if (continueWatching.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No recently watched content</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Continue Watching</h2>
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4">
          {continueWatching.slice(0, 8).map((item) => (
            <Card
              key={`${item.contentType}-${item.contentId}`}
              className="flex-shrink-0 w-64 glass-effect hover:glow-effect transition-all duration-300 cursor-pointer group"
            >
              <div className="relative">
                {item.poster_path ? (
                  <img
                    src={item.poster_path || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-36 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-36 bg-muted flex items-center justify-center rounded-t-lg">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveFromContinueWatching(item.contentId, item.contentType)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <Progress value={item.progress} className="h-1" />
                </div>
              </div>
              <CardContent className="p-3">
                <h3 className="font-semibold text-sm mb-1 line-clamp-1">{item.title}</h3>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {item.contentType === "movie" ? "Movie" : "TV Show"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{Math.round(item.progress)}%</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{formatTimeAgo(item.lastWatched)}</p>
                <Button size="sm" className="w-full" onClick={() => handleWatchContent(item)}>
                  <Play className="h-3 w-3 mr-1" />
                  Resume
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
