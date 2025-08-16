"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  Users,
  Heart,
  Share,
  Download,
  Settings,
} from "lucide-react"
import { apiClient, type Movie, type TVShow, MOVIE_GENRES, TV_GENRES } from "@/lib/api"
import { storageManager } from "@/lib/storage"

interface VideoPlayerProps {
  content: Movie | TVShow
  onClose: () => void
}

export function VideoPlayer({ content, onClose }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [selectedProvider, setSelectedProvider] = useState("vidsrc")
  const [isLoading, setIsLoading] = useState(true)
  const [contentDetails, setContentDetails] = useState<Movie | null>(null)

  const videoRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  const title = "title" in content ? content.title : content.name
  const releaseDate = "release_date" in content ? content.release_date : content.first_air_date
  const genres = content.genre_ids?.map((id) => ("title" in content ? MOVIE_GENRES[id] : TV_GENRES[id])) || []
  const contentType = "title" in content ? "movie" : "tv"

  // Load user preferences
  useEffect(() => {
    const preferences = storageManager.getPreferences()
    setSelectedProvider(preferences.preferredProvider)
    setVolume(preferences.volume)
  }, [])

  // Load detailed content information
  useEffect(() => {
    const loadDetails = async () => {
      if ("title" in content) {
        try {
          const details = await apiClient.getMovieDetails(content.id)
          setContentDetails(details)
          setDuration(details.runtime ? details.runtime * 60 : 7200) // Convert minutes to seconds or default to 2 hours
        } catch (error) {
          console.error("Failed to load movie details:", error)
          setDuration(7200) // Default 2 hours
        }
      } else {
        setDuration(2700) // Default 45 minutes for TV shows
      }
    }
    loadDetails()
  }, [content])

  // Simulate video progress for demo purposes
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 1
          if (newTime >= duration) {
            setIsPlaying(false)
            return duration
          }

          // Update watch progress every 30 seconds
          if (newTime % 30 === 0) {
            const progress = (newTime / duration) * 100
            storageManager.updateWatchProgress({
              contentId: content.id,
              contentType,
              title,
              poster_path: content.poster_path,
              progress,
              duration,
              provider: selectedProvider,
            })
          }

          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, duration, content.id, contentType, title, content.poster_path, selectedProvider])

  // Get streaming URL based on selected provider
  const getStreamingUrl = () => {
    const type = "title" in content ? "movie" : "tv"
    switch (selectedProvider) {
      case "vikingEmbed":
        return content.streaming_urls.vikingEmbed
      case "filmku":
        return content.streaming_urls.filmku
      default:
        return content.streaming_urls.vidsrc
    }
  }

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Auto-hide controls
  const resetControlsTimeout = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  // Handle mouse movement to show controls
  const handleMouseMove = () => {
    resetControlsTimeout()
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const toggleWatchlist = () => {
    const isInWatchlist = storageManager.isInWatchlist(content.id, contentType)
    if (isInWatchlist) {
      storageManager.removeFromWatchlist(content.id, contentType)
    } else {
      storageManager.addToWatchlist({
        id: content.id,
        title,
        type: contentType,
        poster_path: content.poster_path,
        vote_average: content.vote_average,
      })
    }
  }

  const isInWatchlist = storageManager.isInWatchlist(content.id, contentType)

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 bg-black z-50 flex flex-col ${isFullscreen ? "" : "p-4"}`}
      onMouseMove={handleMouseMove}
    >
      {/* Header - Hidden in fullscreen */}
      {!isFullscreen && (
        <div
          className={`flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-lg font-bold text-white">{title}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                {releaseDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(releaseDate).getFullYear()}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span>{content.vote_average.toFixed(1)}</span>
                </div>
                {contentDetails?.runtime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{contentDetails.runtime}min</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleWatchlist}>
              <Heart className={`h-4 w-4 ${isInWatchlist ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Video Player */}
      <div className="flex-1 relative bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-white">Loading stream...</p>
              <p className="text-sm text-gray-400 mt-2">Provider: {selectedProvider}</p>
            </div>
          </div>
        )}

        <iframe
          ref={videoRef}
          src={getStreamingUrl()}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          onLoad={() => setIsLoading(false)}
          style={{ border: "none" }}
        />

        {/* Video Controls Overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Progress Bar */}
          <div className="mb-4">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              className="w-full"
              onValueChange={(value) => setCurrentTime(value[0])}
            />
            <div className="flex justify-between text-xs text-gray-300 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-primary/20 hover:bg-primary/30"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}>
                <SkipForward className="h-4 w-4" />
              </Button>

              {/* Volume Control */}
              <div className="flex items-center gap-2 ml-4">
                <Button variant="ghost" size="sm" onClick={() => setIsMuted(!isMuted)}>
                  {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  className="w-20"
                  onValueChange={(value) => {
                    setVolume(value[0])
                    setIsMuted(value[0] === 0)
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Provider Selection */}
              <Tabs value={selectedProvider} onValueChange={setSelectedProvider}>
                <TabsList className="bg-black/50">
                  <TabsTrigger value="vidsrc" className="text-xs">
                    VidSrc
                  </TabsTrigger>
                  <TabsTrigger value="vikingEmbed" className="text-xs">
                    Viking
                  </TabsTrigger>
                  <TabsTrigger value="filmku" className="text-xs">
                    FILMku
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Info Sidebar - Only visible when not fullscreen */}
      {!isFullscreen && (
        <div className="w-80 bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              {/* Poster and Basic Info */}
              <div className="flex gap-4">
                {content.poster_path && (
                  <img
                    src={content.poster_path || "/placeholder.svg"}
                    alt={title}
                    className="w-20 h-28 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-2">{title}</h3>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {genres.slice(0, 3).map((genre) => (
                      <Badge key={genre} variant="secondary" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Overview */}
              <div>
                <h4 className="font-semibold text-white mb-2">Overview</h4>
                <p className="text-sm text-gray-300 leading-relaxed">{content.overview}</p>
              </div>

              {/* Cast */}
              {contentDetails?.cast && contentDetails.cast.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white mb-2">Cast</h4>
                  <div className="space-y-2">
                    {contentDetails.cast.slice(0, 5).map((actor) => (
                      <div key={actor.id} className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {actor.name} as {actor.character}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Content */}
              {contentDetails?.similar && contentDetails.similar.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white mb-2">You might also like</h4>
                  <div className="space-y-2">
                    {contentDetails.similar.slice(0, 3).map((similar) => (
                      <div
                        key={similar.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-white/10 cursor-pointer"
                      >
                        {similar.poster_path && (
                          <img
                            src={similar.poster_path || "/placeholder.svg"}
                            alt={similar.title}
                            className="w-8 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">{similar.title}</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs text-gray-400">{similar.vote_average.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
