import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useMovieStore = defineStore('movie', () => {
  const movies = ref([]);
  const favorites = ref(JSON.parse(sessionStorage.getItem('favorites') || '[]'));
  const isLoading = ref(false);
  const errorMessage = ref('');
  const selectedMovie = ref(null);

  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '69a28d2225fa1c77f90dd38a06fd7475';

  const saveFavorites = () => {
    sessionStorage.setItem('favorites', JSON.stringify(favorites.value));
  };

  const isFavorite = (movieId) => {
    return favorites.value.some((movie) => movie.id === Number(movieId));
  };

  const applyFavoriteFlags = () => {
    movies.value = movies.value.map((movie) => {
      return {
        ...movie,
        isFavorite: isFavorite(movie.id)
      };
    });
  };

  const fetchMovies = async (forceRefresh = false) => {
    if (movies.value.length > 0 && !forceRefresh) {
      applyFavoriteFlags();
      return;
    }

    isLoading.value = true;
    errorMessage.value = '';

    try {
      const movieParams = {
        api_key: TMDB_API_KEY,
        language: 'ko-KR',
        region: 'KR',
        sort_by: 'popularity.desc',
        include_adult: false,
        'release_date.gte': '2025-01-01',
        with_release_type: '2|3',
        page: 1
      };

      const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
        params: movieParams
      });

      movies.value = response.data.results.map((movie) => {
        return {
          ...movie,
          isFavorite: isFavorite(movie.id)
        };
      });
    } catch (error) {
      console.error('API 통신 에러 상세 내역:', error);
      errorMessage.value = '영화 데이터를 불러오는 데 실패했습니다. 통신 상태나 API key를 확인해 주세요.';
    } finally {
      isLoading.value = false;
    }
  };

  const fetchMovieDetail = async (movieId) => {
    isLoading.value = true;
    errorMessage.value = '';
    selectedMovie.value = null;

    try {
      const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'ko-KR'
        }
      });

      selectedMovie.value = {
        ...response.data,
        isFavorite: isFavorite(response.data.id)
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        errorMessage.value = '존재하지 않거나 삭제된 영화 정보입니다.';
      } else {
        errorMessage.value = '서버 통신 중 에러가 발생했습니다.';
      }
    } finally {
      isLoading.value = false;
    }
  };

  const toggleFavorite = (targetMovie) => {
    const movieId = typeof targetMovie === 'object' ? targetMovie.id : Number(targetMovie);

    const movie =
      typeof targetMovie === 'object'
        ? targetMovie
        : movies.value.find((item) => item.id === movieId) ||
          favorites.value.find((item) => item.id === movieId);

    if (!movie) {
      return;
    }

    const alreadyFavorite = isFavorite(movieId);

    if (alreadyFavorite) {
      favorites.value = favorites.value.filter((item) => item.id !== movieId);
    } else {
      favorites.value.push({
        ...movie,
        isFavorite: true
      });
    }

    movies.value = movies.value.map((item) => {
      if (item.id !== movieId) {
        return item;
      }

      return {
        ...item,
        isFavorite: !alreadyFavorite
      };
    });

    if (selectedMovie.value && selectedMovie.value.id === movieId) {
      selectedMovie.value = {
        ...selectedMovie.value,
        isFavorite: !alreadyFavorite
      };
    }

    saveFavorites();
  };

  const clearFavorites = () => {
    favorites.value = [];

    movies.value = movies.value.map((movie) => {
      return {
        ...movie,
        isFavorite: false
      };
    });

    if (selectedMovie.value) {
      selectedMovie.value = {
        ...selectedMovie.value,
        isFavorite: false
      };
    }

    saveFavorites();
  };

  return {
    movies,
    favorites,
    isLoading,
    errorMessage,
    selectedMovie,
    fetchMovies,
    fetchMovieDetail,
    toggleFavorite,
    clearFavorites,
    isFavorite
  };
});