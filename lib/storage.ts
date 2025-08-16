// Local storage utilities for user data persistence
export interface WatchlistItem {
  id: number
  title: string
  type: "movie" | "tv"
  poster_path: string | null
  vote_average: number
  addedAt: string
}

export interface WatchProgress {
  contentId: number
  contentType: "movie" | "tv"
  title: string
  poster_path: string | null
  progress: number // percentage 0-100
  duration: number // in seconds
  lastWatched: string
  provider: string
}

export interface UserPreferences {
  preferredProvider: "vidsrc" | "vikingEmbed" | "filmku"
  autoplay: boolean
  volume: number
  quality: "auto" | "720p" | "1080p"
  subtitles: boolean
  theme: "dark" | "light"
}

class StorageManager {
  private getStorageKey(key: string): string {
    const userKey = localStorage.getItem("coolstream_key") || "default"
    return `coolstream_${userKey}_${key}`
  }

  // Watchlist management
  getWatchlist(): WatchlistItem[] {
    try {
      const data = localStorage.getItem(this.getStorageKey("watchlist"))
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  addToWatchlist(item: Omit<WatchlistItem, "addedAt">): void {
    const watchlist = this.getWatchlist()
    const exists = watchlist.find((w) => w.id === item.id && w.type === item.type)
    if (!exists) {
      const newItem: WatchlistItem = {
        ...item,
        addedAt: new Date().toISOString(),
      }
      watchlist.unshift(newItem)
      localStorage.setItem(this.getStorageKey("watchlist"), JSON.stringify(watchlist))
    }
  }

  removeFromWatchlist(id: number, type: "movie" | "tv"): void {
    const watchlist = this.getWatchlist()
    const filtered = watchlist.filter((item) => !(item.id === id && item.type === type))
    localStorage.setItem(this.getStorageKey("watchlist"), JSON.stringify(filtered))
  }

  isInWatchlist(id: number, type: "movie" | "tv"): boolean {
    const watchlist = this.getWatchlist()
    return watchlist.some((item) => item.id === id && item.type === type)
  }

  // Continue watching management
  getContinueWatching(): WatchProgress[] {
    try {
      const data = localStorage.getItem(this.getStorageKey("continue_watching"))
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  updateWatchProgress(progress: Omit<WatchProgress, "lastWatched">): void {
    const continueWatching = this.getContinueWatching()
    const existingIndex = continueWatching.findIndex(
      (item) => item.contentId === progress.contentId && item.contentType === progress.contentType,
    )

    const updatedProgress: WatchProgress = {
      ...progress,
      lastWatched: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      continueWatching[existingIndex] = updatedProgress
    } else {
      continueWatching.unshift(updatedProgress)
    }

    // Keep only last 20 items
    const trimmed = continueWatching.slice(0, 20)
    localStorage.setItem(this.getStorageKey("continue_watching"), JSON.stringify(trimmed))
  }

  removeFromContinueWatching(contentId: number, contentType: "movie" | "tv"): void {
    const continueWatching = this.getContinueWatching()
    const filtered = continueWatching.filter(
      (item) => !(item.contentId === contentId && item.contentType === contentType),
    )
    localStorage.setItem(this.getStorageKey("continue_watching"), JSON.stringify(filtered))
  }

  // User preferences
  getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(this.getStorageKey("preferences"))
      const defaults: UserPreferences = {
        preferredProvider: "vidsrc",
        autoplay: true,
        volume: 0.8,
        quality: "auto",
        subtitles: false,
        theme: "dark",
      }
      return data ? { ...defaults, ...JSON.parse(data) } : defaults
    } catch {
      return {
        preferredProvider: "vidsrc",
        autoplay: true,
        volume: 0.8,
        quality: "auto",
        subtitles: false,
        theme: "dark",
      }
    }
  }

  updatePreferences(preferences: Partial<UserPreferences>): void {
    const current = this.getPreferences()
    const updated = { ...current, ...preferences }
    localStorage.setItem(this.getStorageKey("preferences"), JSON.stringify(updated))
  }

  // Clear all user data
  clearUserData(): void {
    const userKey = localStorage.getItem("coolstream_key") || "default"
    const keys = ["watchlist", "continue_watching", "preferences"]
    keys.forEach((key) => {
      localStorage.removeItem(`coolstream_${userKey}_${key}`)
    })
  }
}

export const storageManager = new StorageManager()
