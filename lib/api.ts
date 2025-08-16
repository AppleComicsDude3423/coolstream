export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids?: number[]
  genres?: Array<{ id: number; name: string }>
  runtime?: number
  cast?: Array<{ id: number; name: string; character: string; profile_path: string | null }>
  crew?: Array<{ id: number; name: string; job: string }>
  videos?: Array<{ id: string; key: string; name: string; site: string; type: string }>
  similar?: Array<{ id: number; title: string; poster_path: string | null; vote_average: number }>
  streaming_urls: {
    vidsrc: string
    vikingEmbed: string
    filmku: string
  }
}

export interface TVShow {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  vote_count: number
  genre_ids?: number[]
  origin_country: string[]
  streaming_urls: {
    vidsrc: string
    vikingEmbed: string
    filmku: string
  }
}

export interface ApiResponse<T> {
  results: T[]
  total_results: number
  total_pages: number
  page: number
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  }

  async searchMovies(query: string): Promise<ApiResponse<Movie>> {
    const response = await fetch(`${this.baseUrl}/api/movies/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) {
      throw new Error("Failed to search movies")
    }
    return response.json()
  }

  async getTrendingMovies(timeWindow: "day" | "week" = "day"): Promise<ApiResponse<Movie>> {
    const response = await fetch(`${this.baseUrl}/api/movies/trending?time_window=${timeWindow}`)
    if (!response.ok) {
      throw new Error("Failed to get trending movies")
    }
    return response.json()
  }

  async getPopularMovies(page = 1): Promise<ApiResponse<Movie>> {
    const response = await fetch(`${this.baseUrl}/api/movies/popular?page=${page}`)
    if (!response.ok) {
      throw new Error("Failed to get popular movies")
    }
    return response.json()
  }

  async getMovieDetails(id: number): Promise<Movie> {
    const response = await fetch(`${this.baseUrl}/api/movies/${id}`)
    if (!response.ok) {
      throw new Error("Failed to get movie details")
    }
    return response.json()
  }

  async searchTVShows(query: string): Promise<ApiResponse<TVShow>> {
    const response = await fetch(`${this.baseUrl}/api/tv/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) {
      throw new Error("Failed to search TV shows")
    }
    return response.json()
  }

  async getTrendingTVShows(timeWindow: "day" | "week" = "day"): Promise<ApiResponse<TVShow>> {
    const response = await fetch(`${this.baseUrl}/api/tv/trending?time_window=${timeWindow}`)
    if (!response.ok) {
      throw new Error("Failed to get trending TV shows")
    }
    return response.json()
  }
}

export const apiClient = new ApiClient()

// Genre mapping for display purposes
export const MOVIE_GENRES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
}

export const TV_GENRES: Record<number, string> = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
}
