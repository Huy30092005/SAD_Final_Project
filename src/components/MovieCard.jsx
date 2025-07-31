import "../css/MovieCard.css";
import { useMovieContext } from "../contexts/MovieContext";

function MovieCard({ movie }) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext();
  const favorite = isFavorite(movie.id);

  function onFavoriteClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (favorite) removeFromFavorites(movie.id);
    else addToFavorites(movie);
  }

  function handleCardClick() {
    window.open(`https://www.themoviedb.org/movie/${movie.id}`, "_blank");
  }

  // Calculate progress bar percentage and color based on vote_average (0-10)
  const rating = movie.vote_average || 0;
  const percentage = (rating / 10) * 100;
  let progressBarColor;
  if (rating >= 7.45 ) {
    progressBarColor = "green";
  } else if (rating >= 5 && rating < 7.45) {
    progressBarColor = "yellow";
  } else if (rating >= 2.4 && rating < 5) {
    progressBarColor = "orange";
  } else {
    progressBarColor = "red";
  }

  // Log for debugging in production
  if (!movie.vote_average) {
    console.warn(`No vote_average for movie: ${movie.title} (ID: ${movie.id})`);
  }

  return (
    <div className="movie-card" onClick={handleCardClick} style={{ cursor: "pointer" }}>
      <div className="movie-poster">
        <img
          src={
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : "https://via.placeholder.com/500x750?text=No+Poster"
          }
          alt=" No image available "
        />
        <div className="movie-overlay">
          <button className={`favorite-btn ${favorite ? "active" : ""}`} onClick={onFavoriteClick}>
            ♥
          </button>
        </div>
      </div>
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p> Release Date: {movie.release_date || "N/A"}</p>
        <p>{movie.overview ? movie.overview.slice(0, 80) + "..." : "No description available."}</p>
        <div className="movie-rating">
          <span>User Score: {rating.toFixed(1)}/10</span>
          <div className="progress-bar" data-percentage={percentage}>
            <div
              className={`progress-bar-fill progress-bar-${progressBarColor}`}
              style={{ width: `${percentage}%`, minWidth: '5px' }}
              data-rating={rating}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;