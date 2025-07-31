import MovieCard from "../components/MovieCard";
import { useState, useEffect } from "react";
import { getPopularMovies, searchMovies, searchMoviesByGenre, searchMoviesByNameAndGenre } from "../services/api";
import "../css/Home.css";

function Notification({ id, message, type, onClose }) {
  useEffect(() => {
    console.log(`Notification ${id} mounted with message: ${message}`);
    const timer = setTimeout(() => {
      console.log(`Removing notification ${id}`);
      onClose(id);
    }, 3000);
    return () => {
      console.log(`Cleaning up notification ${id}`);
      clearTimeout(timer);
    };
  }, [id, onClose]);

  return (
    <div className={`notification notification-${type}`}>
      {message}
    </div>
  );
}

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [genreId, setGenreId] = useState("");
  const [movies, setMovies] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const genres = [
    { id: "", name: "Popular" },
    { id: "28", name: "Action" },
    { id: "12", name: "Adventure" },
    { id: "16", name: "Animation" },
    { id: "35", name: "Comedy" },
    { id: "18", name: "Drama" },
    { id: "27", name: "Horror" },
    { id: "878", name: "Science Fiction" },
    { id: "37", name: "Western" }
  ];

  const addNotification = (message, type) => {
    const id = Date.now();
    console.log(`Adding notification ${id}: ${message} (${type})`);
    setNotifications((prev) => {
      if (prev.some((notif) => notif.message === message && notif.type === type)) {
        console.log(`Duplicate notification blocked: ${message}`);
        return prev;
      }
      return [...prev, { id, message, type }];
    });
  };

  const removeNotification = (id) => {
    console.log(`Removing notification ${id} from state`);
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const getRecommendedMovie = (movies) => {
    if (!movies || movies.length === 0) return null;
    const validMovies = movies.filter((movie) => movie.vote_average && movie.vote_average > 0);
    if (validMovies.length === 0) return null;
    return validMovies.reduce((best, movie) =>
      movie.vote_average > best.vote_average ? movie : best,
      validMovies[0]
    );
  };

  const fetchMovies = async (page = 1, query = "", genre = "") => {
    if (loading) {
      console.log("fetchMovies skipped: already loading");
      return;
    }
    setLoading(true);
    console.log("fetchMovies called with:", { query, genre, page });
    try {
      let response = { results: [], total_pages: 1 };
      const trimmedQuery = query ? query.trim() : "";
      const genreNum = genre && genre !== "" ? parseInt(genre, 10) : null;
      console.log("Processed inputs:", { trimmedQuery, genreNum });

      if (trimmedQuery && genreNum) {
        console.log("Calling searchMoviesByNameAndGenre");
        response = await searchMoviesByNameAndGenre(trimmedQuery, genreNum, page, limit);
      } else if (trimmedQuery) {
        console.log("Calling searchMovies");
        response = await searchMovies(trimmedQuery, page, limit);
      } else if (genreNum) {
        console.log("Calling searchMoviesByGenre");
        response = await searchMoviesByGenre(genreNum, page, limit);
      } else {
        console.log("Calling getPopularMovies");
        response = await getPopularMovies(page, limit);
      }

      console.log("API response:", response);
      if (!response.results || response.results.length === 0) {
        addNotification("No movies found for this search.", "info");
        setMovies([]);
        setTotalPages(1);
      } else {
        setMovies(response.results);
        setTotalPages(Math.min(response.total_pages, 20));
        addNotification(`Found ${response.results.length} movies on page ${page}!`, "success");
        const recommended = getRecommendedMovie(response.results);
        if (recommended) {
          addNotification(`Recommended: ${recommended.title}`, "recommendation");
        }
      }
    } catch (err) {
      console.error("Fetch movies error:", err);
      const errorMessage = err.message.includes('API key is missing')
        ? "API configuration error. Please contact support."
        : err.message.includes('401')
          ? "Invalid API key. Please check your configuration."
          : "Failed to fetch movies. Please try again.";
      addNotification(errorMessage, "error");
      setMovies([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch for popular movies on component mount
  useEffect(() => {
    console.log("fetchMovies call for page:", currentPage);
    fetchMovies(currentPage, searchQuery, genreId);
  }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("handleSearch called with:", { searchQuery, genreId });
    if (loading) {
      console.log("handleSearch skipped: already loading");
      return;
    }

    if (searchQuery && searchQuery.trim().length < 2) {
      addNotification("Search query must be at least 2 characters long.", "error");
      return;
    }

    setCurrentPage(1); // Reset to page 1
    fetchMovies(1, searchQuery, genreId);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      console.log("Navigating to previous page:", currentPage - 1);
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      console.log("Navigating to next page:", currentPage + 1);
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="home">
      <div className="notification-container">
        {notifications.map((notif) => (
          <Notification
            key={notif.id}
            id={notif.id}
            message={notif.message}
            type={notif.type}
            onClose={removeNotification}
          />
        ))}
      </div>
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Type the movie's name"
          className="search-input"
          value={searchQuery}
          onChange={(e) => {
            console.log("Input changed:", e.target.value);
            setSearchQuery(e.target.value);
          }}
        />
        <select
          className="genre-select"
          value={genreId}
          onChange={(e) => {
            console.log("Genre changed:", e.target.value);
            setGenreId(e.target.value);
          }}
        >
          {genres.map((genre) => (
            <option key={genre.id || "all"} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="search-button"
          disabled={loading || (searchQuery && searchQuery.trim().length < 2)}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : movies.length === 0 ? (
        <div className="no-results">Select your favorite genre or search for a movie.</div>
      ) : (
        <>
          <div className="movies-grid">
            {movies.map((movie) => (
              <MovieCard movie={movie} key={movie.id} />
            ))}
          </div>
          <div className="pagination">
            <button
              className="pagination-button"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-button"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || loading}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;