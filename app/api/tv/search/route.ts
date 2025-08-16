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
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch TV shows from TMDB")
    }

    const data = await response.json()

    // Transform the data to include streaming links
    const showsWithStreaming = data.results.map((show: any) => ({
      id: show.id,
      name: show.name,
      overview: show.overview,
      poster_path: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
      backdrop_path: show.backdrop_path ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` : null,
      first_air_date: show.first_air_date,
      vote_average: show.vote_average,
      vote_count: show.vote_count,
      genre_ids: show.genre_ids,
      origin_country: show.origin_country,
      // Add streaming URLs for TV shows
      streaming_urls: {
        vidsrc: `https://vidsrc.wtf/embed/tv/${show.id}`,
        vikingEmbed: `https://vembed.stream/play/tv/${show.id}`,
        filmku: `https://filmku.stream/embed/tv/${show.id}`,
      },
    }))

    return NextResponse.json({
      results: showsWithStreaming,
      total_results: data.total_results,
      total_pages: data.total_pages,
      page: data.page,
    })
  } catch (error) {
    console.error("TV search API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
