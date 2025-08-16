import { type NextRequest, NextResponse } from "next/server"

const TMDB_API_KEY = process.env.TMDB_API_KEY || "demo_key"
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch from TMDB")
    }

    const data = await response.json()

    // Transform the data to include streaming links
    const moviesWithStreaming = data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      backdrop_path: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      genre_ids: movie.genre_ids,
      // Add streaming URLs
      streaming_urls: {
        vidsrc: `https://vidsrc.wtf/embed/movie/${movie.id}`,
        vikingEmbed: `https://vembed.stream/play/${movie.id}`,
        filmku: `https://filmku.stream/embed/${movie.id}`,
      },
    }))

    return NextResponse.json({
      results: moviesWithStreaming,
      total_results: data.total_results,
      total_pages: data.total_pages,
      page: data.page,
    })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
