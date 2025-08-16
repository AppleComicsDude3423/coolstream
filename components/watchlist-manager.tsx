"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Heart, Play, Trash2, Calendar, Star } from "lucide-react"
import { storageManager, type WatchlistItem } from "@/lib/storage"
import type { Movie, TVShow } from "@/lib/api"

interface WatchlistManagerProps {
  onWatchContent: (content: Movie | TVShow) => void
}

export function WatchlistManager({ onWatchContent }: WatchlistManagerProps) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])

  useEffect(() => {
    setWatchlist(storageManager.getWatchlist())
  }, [])

  const handleRemoveFromWatchlist = (id: number, type: "movie" | "tv") => {
    storageManager.removeFromWatchlist(id, type)
    setWatchlist(storageManager.getWatchlist())
  }

  const handleWatchContent = (item: WatchlistItem) => {
    // Convert WatchlistItem to Movie/TVShow format for player
    const content = {
      id: item.id,
      [item.type === "movie" ? "title" : "name"]: item.title,
      overview: "",
      poster_path: item.poster_path,
      backdrop_path: null,
      [item.type === "movie" ? "release_date" : "first_air_date"]: "",
      vote_average: item.vote_average,
      vote_count: 0,
      genre_ids: [],
      streaming_urls: {
        vidsrc: `https://vidsrc.wtf/embed/${item.type}/${item.id}`,
        vikingEmbed: `https://vembed.stream/play/${item.type === "movie" ? "" : "tv/"}${item.id}`,
        filmku: `https://filmku.stream/embed/${item.type === "movie" ? "" : "tv/"}${item.id}`,
      },
    }

    if (item.type === "tv") {
      ;(content as any).origin_country = []
    }

    onWatchContent(content as Movie | TVShow)
  }

  if (watchlist.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Your watchlist is empty</h3>
        <p className="text-muted-foreground">Add movies and TV shows to watch them later</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Watchlist</h2>
        <Badge variant="secondary">{watchlist.length} items</Badge>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((item) => (
            <Card
              key={`${item.type}-${item.id}`}
              className="glass-effect hover:glow-effect transition-all duration-300"
            >
              <div className="relative">
                {item.poster_path ? (
                  <img
                    src={item.poster_path || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center rounded-t-lg">
                    <Heart className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-80 hover:opacity-100"
                  onClick={() => handleRemoveFromWatchlist(item.id, item.type)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-1">{item.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {item.type === "movie" ? "Movie" : "TV Show"}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">{item.vote_average.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-3 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Added {new Date(item.addedAt).toLocaleDateString()}</span>
                </div>
                <Button size="sm" className="w-full" onClick={() => handleWatchContent(item)}>
                  <Play className="h-3 w-3 mr-2" />
                  Watch Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
