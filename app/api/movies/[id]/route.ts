import { type NextRequest, NextResponse } from "next/server"

const TMDB_API_KEY = process.env.TMDB_API_KEY || "demo_key"
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const movieId = params.id

    // Fetch movie details
    const movieResponse = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,similar`,
    )

    if (!movieResponse.ok) {
      throw new Error("Failed to fetch movie details from TMDB")
    }

    const movieData = await movieResponse.json()

    // Transform the data
    const movieWithStreaming = {
      id: movieData.id,
      title: movieData.title,
      overview: movieData.overview,
      poster_path: movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : null,
      backdrop_path: movieData.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movieData.backdrop_path}` : null,
      release_date: movieData.release_date,
      vote_average: movieData.vote_average,
      vote_count: movieData.vote_count,
      runtime: movieData.runtime,
      genres: movieData.genres,
      production_companies: movieData.production_companies,
      budget: movieData.budget,
      revenue: movieData.revenue,
      tagline: movieData.tagline,
      status: movieData.status,
      // Cast and crew
      cast: movieData.credits?.cast?.slice(0, 10) || [],
      crew:
        movieData.credits?.crew?.filter((person: any) => ["Director", "Producer", "Writer"].includes(person.job)) || [],
      // Videos (trailers, etc.)
      videos:
        movieData.videos?.results?.filter((video: any) => video.site === "YouTube" && video.type === "Trailer") || [],
      // Similar movies
      similar:
        movieData.similar?.results?.slice(0, 6).map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : null,
          vote_average: movie.vote_average,
        })) || [],
      // Add streaming URLs
      streaming_urls: {
        vidsrc: `https://vidsrc.wtf/embed/movie/${movieId}`,
        vikingEmbed: `https://vembed.stream/play/${movieId}`,
        filmku: `https://filmku.stream/embed/${movieId}`,
      },
    }

    return NextResponse.json(movieWithStreaming)
  } catch (error) {
    console.error("Movie details API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
