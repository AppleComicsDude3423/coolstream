"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Play,
  Search,
  TrendingUpIcon as Trending,
  Film,
  Tv,
  Home,
  Star,
  Calendar,
  LogOut,
  Heart,
  Settings,
} from "lucide-react"
import { apiClient, type Movie, type TVShow, MOVIE_GENRES, TV_GENRES } from "@/lib/api"
import { VideoPlayer } from "@/components/video-player"
import { WatchlistManager } from "@/components/watchlist-manager"
import { ContinueWatching } from "@/components/continue-watching"
import { UserPreferencesModal } from "@/components/user-preferences"
import { storageManager } from "@/lib/storage"

interface StreamingDashboardProps {
  onLogout: () => void
  userKey: string
}

export function StreamingDashboard({ onLogout, userKey }: StreamingDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<(Movie | TVShow)[]>([])
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])
  const [trendingTVShows, setTrendingTVShows] = useState<TVShow[]>([])
  const [popularMovies, setPopularMovies] = useState<Movie[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const [selectedContent, setSelectedContent] = useState<Movie | TVShow | null>(null)
  const [isWatchingContent, setIsWatchingContent] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)

  // Load initial data
  useEffect(() => {
    loadTrendingContent()
    loadPopularMovies()
  }, [])

  const loadTrendingContent = async () => {
    try {
      const [moviesResponse, tvResponse] = await Promise.all([
        apiClient.getTrendingMovies("day"),
        apiClient.getTrendingTVShows("day"),
      ])
      setTrendingMovies(moviesResponse.results.slice(0, 10))
      setTrendingTVShows(tvResponse.results.slice(0, 10))
    } catch (error) {
      console.error("Failed to load trending content:", error)
    }
  }

  const loadPopularMovies = async () => {
    try {
      const response = await apiClient.getPopularMovies(1)
      setPopularMovies(response.results.slice(0, 10))
    } catch (error) {
      console.error("Failed to load popular movies:", error)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const [movieResults, tvResults] = await Promise.all([
        apiClient.searchMovies(searchQuery),
        apiClient.searchTVShows(searchQuery),
      ])
      setSearchResults([...movieResults.results.slice(0, 5), ...tvResults.results.slice(0, 5)])
      setActiveTab("search")
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleWatchContent = (content: Movie | TVShow) => {
    setSelectedContent(content)
    setIsWatchingContent(true)
  }

  const handleClosePlayer = () => {
    setIsWatchingContent(false)
    setSelectedContent(null)
  }

  const toggleWatchlist = (content: Movie | TVShow) => {
    const type = "title" in content ? "movie" : "tv"
    const title = "title" in content ? content.title : content.name
    const isInWatchlist = storageManager.isInWatchlist(content.id, type)

    if (isInWatchlist) {
      storageManager.removeFromWatchlist(content.id, type)
    } else {
      storageManager.addToWatchlist({
        id: content.id,
        title,
        type,
        poster_path: content.poster_path,
        vote_average: content.vote_average,
      })
    }
  }

  const ContentCard = ({ content, type }: { content: Movie | TVShow; type: "movie" | "tv" }) => {
    const title = "title" in content ? content.title : content.name
    const releaseDate = "release_date" in content ? content.release_date : content.first_air_date
    const genres = content.genre_ids?.map((id) => (type === "movie" ? MOVIE_GENRES[id] : TV_GENRES[id])) || []
    const isInWatchlist = storageManager.isInWatchlist(content.id, type)

    return (
      <Card className="glass-effect hover:glow-effect transition-all duration-300 cursor-pointer group">
        <div className="relative overflow-hidden rounded-t-lg">
          {content.poster_path ? (
            <img
              src={content.poster_path || "/placeholder.svg"}
              alt={title}
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-64 bg-muted flex items-center justify-center">
              {type === "movie" ? (
                <Film className="h-12 w-12 text-muted-foreground" />
              ) : (
                <Tv className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="sm"
              variant="ghost"
              className="bg-black/50 hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation()
                toggleWatchlist(content)
              }}
            >
              <Heart className={`h-4 w-4 ${isInWatchlist ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button size="sm" onClick={() => handleWatchContent(content)}>
              <Play className="h-4 w-4 mr-1" />
              Watch
            </Button>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-2 line-clamp-1">{title}</h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span className="text-xs text-muted-foreground">{content.vote_average.toFixed(1)}</span>
            </div>
            {releaseDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{new Date(releaseDate).getFullYear()}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {genres.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isWatchingContent && selectedContent) {
    return <VideoPlayer content={selectedContent} onClose={handleClosePlayer} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-effect border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-primary">CoolStream</h1>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search movies and TV shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-effect"
                />
              </div>
            </form>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Key: {userKey}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setShowPreferences(true)}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border/50">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 glass-effect">
              <TabsTrigger value="home" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </TabsTrigger>
              <TabsTrigger value="movies" className="flex items-center gap-2">
                <Film className="h-4 w-4" />
                Movies
              </TabsTrigger>
              <TabsTrigger value="tv" className="flex items-center gap-2">
                <Tv className="h-4 w-4" />
                TV Shows
              </TabsTrigger>
              <TabsTrigger value="watchlist" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Watchlist
              </TabsTrigger>
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Home Tab */}
          <TabsContent value="home" className="space-y-8">
            {/* Hero Section */}
            <section className="relative rounded-xl overflow-hidden aurora-bg h-64 flex items-center justify-center">
              <div className="text-center text-white z-10">
                <h2 className="text-4xl font-bold mb-2">Welcome to CoolStream</h2>
                <p className="text-lg opacity-90">Stream with coolness - Exclusive premium content</p>
              </div>
            </section>

            {/* Continue Watching */}
            <ContinueWatching onWatchContent={handleWatchContent} />

            {/* Trending Movies */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Trending className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Trending Movies</h2>
              </div>
              <ScrollArea className="w-full">
                <div className="flex gap-4 pb-4">
                  {trendingMovies.map((movie) => (
                    <div key={movie.id} className="flex-shrink-0 w-48">
                      <ContentCard content={movie} type="movie" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </section>

            {/* Trending TV Shows */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Tv className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Trending TV Shows</h2>
              </div>
              <ScrollArea className="w-full">
                <div className="flex gap-4 pb-4">
                  {trendingTVShows.map((show) => (
                    <div key={show.id} className="flex-shrink-0 w-48">
                      <ContentCard content={show} type="tv" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </section>
          </TabsContent>

          {/* Movies Tab */}
          <TabsContent value="movies" className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Film className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Popular Movies</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {popularMovies.map((movie) => (
                <ContentCard key={movie.id} content={movie} type="movie" />
              ))}
            </div>
          </TabsContent>

          {/* TV Shows Tab */}
          <TabsContent value="tv" className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Tv className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Popular TV Shows</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {trendingTVShows.map((show) => (
                <ContentCard key={show.id} content={show} type="tv" />
              ))}
            </div>
          </TabsContent>

          {/* Watchlist Tab */}
          <TabsContent value="watchlist">
            <WatchlistManager onWatchContent={handleWatchContent} />
          </TabsContent>

          {/* Search Results Tab */}
          <TabsContent value="search" className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Search Results</h2>
              {searchQuery && <span className="text-muted-foreground">for "{searchQuery}"</span>}
            </div>
            {isSearching ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {searchResults.map((content) => (
                  <ContentCard key={content.id} content={content} type={"title" in content ? "movie" : "tv"} />
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Use the search bar above to find movies and TV shows</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* User Preferences Modal */}
      {showPreferences && <UserPreferencesModal onClose={() => setShowPreferences(false)} />}
    </div>
  )
}
