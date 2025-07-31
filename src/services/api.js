const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_API_KEY;

// Fisher-Yates shuffle to randomize array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getPopularMovies = async (page = 1, limit = 20) => {
  try {
    if (!API_KEY) throw new Error("API key is missing");
    if (page < 1 || !Number.isInteger(page)) throw new Error("Invalid page number");
    if (limit < 1 || !Number.isInteger(limit)) throw new Error("Invalid limit value");

    console.log("Fetching popular movies with URL:", `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API response error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    const data = await response.json();
    if (!data.results) {
      throw new Error("No results found in the response");
    }

    return {
      results: shuffleArray(data.results.slice(0, limit)),
      total_pages: data.total_pages || 1,
    };
  } catch (error) {
    console.error("Error fetching popular movies:", error.message);
    throw error;
  }
};

export const searchMovies = async (query, page = 1, limit = 20) => {
  try {
    if (!API_KEY) throw new Error("API key is missing");
    if (!query || typeof query !== "string") {
      throw new Error("Invalid or missing query parameter");
    }
    if (page < 1 || !Number.isInteger(page)) throw new Error("Invalid page number");
    if (limit < 1 || !Number.isInteger(limit)) throw new Error("Invalid limit value");

    console.log("Searching movies with URL:", `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`);
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API response error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    const data = await response.json();
    if (!data.results) {
      throw new Error("No results found in the response");
    }

    return {
      results: shuffleArray(data.results.slice(0, limit)),
      total_pages: data.total_pages || 1,
    };
  } catch (error) {
    console.error("Error searching movies:", error.message);
    throw error;
  }
};

export const searchMoviesByGenre = async (genreId, page = 1, limit = 20) => {
  try {
    if (!API_KEY) throw new Error("API key is missing");
    if (!genreId || isNaN(genreId)) {
      throw new Error("Invalid or missing genreId parameter");
    }
    if (page < 1 || !Number.isInteger(page)) throw new Error("Invalid page number");
    if (limit < 1 || !Number.isInteger(limit)) throw new Error("Invalid limit value");

    console.log("Searching by genre with URL:", `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${page}`);
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${page}`
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API response error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    const data = await response.json();
    if (!data.results) {
      throw new Error("No results found in the response");
    }

    return {
      results: shuffleArray(data.results.slice(0, limit)),
      total_pages: data.total_pages || 1,
    };
  } catch (error) {
    console.error("Error searching movies by genre:", error.message);
    throw error;
  }
};

export const searchMoviesByNameAndGenre = async (query, genreId, page = 1, limit = 20) => {
  try {
    if (!API_KEY) throw new Error("API key is missing");
    if (!query || typeof query !== "string") {
      throw new Error("Invalid or missing query parameter");
    }
    if (!genreId || isNaN(genreId)) {
      throw new Error("Invalid or missing genreId parameter");
    }
    if (page < 1 || !Number.isInteger(page)) throw new Error("Invalid page number");
    if (limit < 1 || !Number.isInteger(limit)) throw new Error("Invalid limit value");

    console.log("Searching movies by name with URL:", `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`);
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API response error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    const data = await response.json();
    if (!data.results) {
      throw new Error("No results found in the response");
    }

    // Filter results to include only movies with the specified genre
    const filteredResults = data.results.filter((movie) =>
      movie.genre_ids && movie.genre_ids.includes(parseInt(genreId))
    );

    return {
      results: shuffleArray(filteredResults.slice(0, limit)),
      total_pages: data.total_pages || 1,
    };
  } catch (error) {
    console.error("Error searching movies by name and genre:", error.message);
    throw error;
  }
};

export const authenticateUser = async (username, password) => {
  try {
    if (!API_KEY) throw new Error("API key is missing");
    if (!username || typeof username !== "string") {
      throw new Error("Invalid or missing username");
    }
    if (!password || typeof password !== "string") {
      throw new Error("Invalid or missing password");
    }

    const tokenResponse = await fetch(`${BASE_URL}/authentication/token/new?api_key=${API_KEY}`);
    if (!tokenResponse.ok) {
      throw new Error(`Failed to get request token: HTTP status ${tokenResponse.status}`);
    }
    const tokenData = await tokenResponse.json();
    if (!tokenData.success || !tokenData.request_token) {
      throw new Error("Invalid request token response");
    }
    const requestToken = tokenData.request_token;

    const validateResponse = await fetch(
      `${BASE_URL}/authentication/token/validate_with_login?api_key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          request_token: requestToken,
        }),
      }
    );
    if (!validateResponse.ok) {
      if (validateResponse.status === 401) {
        throw new Error("Invalid username or password");
      }
      throw new Error(`Failed to validate login: HTTP status ${validateResponse.status}`);
    }
    const validateData = await validateResponse.json();
    if (!validateData.success || !validateData.request_token) {
      throw new Error("Invalid login validation response");
    }

    const sessionResponse = await fetch(
      `${BASE_URL}/authentication/session/new?api_key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_token: validateData.request_token,
        }),
      }
    );
    if (!sessionResponse.ok) {
      throw new Error(`Failed to create session: HTTP status ${sessionResponse.status}`);
    }
    const sessionData = await sessionResponse.json();
    if (!sessionData.success || !sessionData.session_id) {
      throw new Error("Invalid session creation response");
    }

    return sessionData.session_id;
  } catch (error) {
    console.error("Authentication error:", error.message);
    throw error;
  }
};