<script setup>
import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useMovieStore } from '../stores/movieStore';

const route = useRoute();
const store = useMovieStore();

const keyword = computed(() => {
  return String(route.query.keyword || '').trim();
});

const filteredMovies = computed(() => {
  const normalizedKeyword = keyword.value.toLowerCase();

  if (!normalizedKeyword) {
    return [];
  }

  return store.movies.filter((movie) => {
    const title = (movie.title || '').toLowerCase();
    const overview = (movie.overview || '').toLowerCase();

    return title.includes(normalizedKeyword) || overview.includes(normalizedKeyword);
  });
});

const loadMoviesIfNeeded = async () => {
  await store.fetchMovies();
};

onMounted(async () => {
  await loadMoviesIfNeeded();
  document.title = `검색 결과: ${keyword.value || '검색어 없음'}`;
});

watch(keyword, (newKeyword) => {
  document.title = `검색 결과: ${newKeyword || '검색어 없음'}`;
});
</script>

<template>
  <main class="page">
    <section class="result-header">
      <h1>🔎 검색 결과</h1>
      <p v-if="keyword" class="result-guide">
        <strong>“{{ keyword }}”</strong> 검색 결과 {{ filteredMovies.length }}개
      </p>
      <p v-else class="result-guide">검색어가 입력되지 않았습니다.</p>
    </section>

    <div v-if="store.isLoading" class="status-message loading">
      ⏳ 영화 데이터를 확인하는 중입니다...
    </div>

    <div v-else-if="store.errorMessage" class="status-message error">
      🚨 {{ store.errorMessage }}
    </div>

    <div v-else-if="filteredMovies.length === 0" class="empty-box">
      <span class="empty-icon">🎬</span>
      <h2>검색 결과가 없습니다.</h2>
      <p>다른 영화 제목이나 줄거리 키워드로 다시 검색해 보세요.</p>
      <RouterLink to="/movies" class="move-link">영화 목록으로 이동</RouterLink>
    </div>

    <div v-else class="movie-list">
      <article v-for="movie in filteredMovies" :key="movie.id" class="movie-card">
        <RouterLink :to="`/movies/${movie.id}`" class="poster-link">
          <img
            v-if="movie.poster_path"
            :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
            :alt="movie.title"
            class="poster"
          />
          <div v-else class="poster-placeholder">이미지 준비 중</div>
        </RouterLink>

        <div class="card-content">
          <RouterLink :to="`/movies/${movie.id}`" class="title-link">
            <h3 class="title">{{ movie.title }}</h3>
          </RouterLink>

          <p class="release-date">📅 {{ movie.release_date || '개봉일 정보 없음' }}</p>
          <p class="rating">⭐ {{ movie.vote_average ? movie.vote_average.toFixed(1) : '0.0' }} / 10</p>
          <p class="overview">
            {{ movie.overview ? movie.overview.substring(0, 80) + '...' : '줄거리 정보가 없습니다.' }}
          </p>

          <button
            type="button"
            @click="store.toggleFavorite(movie)"
            class="fav-btn"
            :class="{ active: movie.isFavorite }"
          >
            {{ movie.isFavorite ? '❤️ 찜 해제' : '🤍 찜하기' }}
          </button>
        </div>
      </article>
    </div>
  </main>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 40px;
  background: #f8f9fa;
}

.result-header {
  max-width: 1100px;
  margin: 0 auto 28px auto;
  padding: 28px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  text-align: center;
}

.result-header h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 900;
  color: #2f3542;
}

.result-guide {
  margin: 0;
  color: #57606f;
  font-weight: 700;
}

.status-message {
  max-width: 1100px;
  margin: 0 auto;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  padding: 50px;
  border-radius: 12px;
}

.loading {
  color: #3498db;
  background-color: #e3f2fd;
}

.error {
  color: #e74c3c;
  background-color: #fdeaea;
}

.empty-box {
  max-width: 620px;
  margin: 60px auto 0 auto;
  padding: 50px 24px;
  border-radius: 20px;
  background: #ffffff;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.empty-icon {
  font-size: 48px;
}

.empty-box h2 {
  font-size: 26px;
  font-weight: 900;
  color: #2f3542;
  margin: 16px 0 8px 0;
}

.empty-box p {
  color: #747d8c;
  font-weight: 600;
  margin-bottom: 26px;
}

.move-link {
  display: inline-flex;
  padding: 13px 22px;
  border-radius: 10px;
  background: #ff4757;
  color: #ffffff;
  text-decoration: none;
  font-weight: 900;
}

.movie-list {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 28px;
}

.movie-card {
  border-radius: 16px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.poster-link,
.title-link {
  display: block;
  text-decoration: none;
}

.poster {
  width: 100%;
  height: 360px;
  object-fit: cover;
  display: block;
}

.poster-placeholder {
  width: 100%;
  height: 360px;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f8c8d;
  font-weight: bold;
}

.card-content {
  padding: 18px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.title {
  font-size: 18px;
  color: #2f3542;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 900;
}

.release-date,
.overview {
  color: #57606f;
  font-size: 13px;
  font-weight: 600;
}

.rating {
  font-weight: 900;
  color: #f39c12;
  margin: 8px 0;
}

.overview {
  line-height: 1.5;
  flex-grow: 1;
}

.fav-btn {
  width: 100%;
  padding: 12px;
  cursor: pointer;
  border: none;
  background: #ecf0f1;
  color: #333;
  border-radius: 10px;
  font-weight: 900;
  font-size: 14px;
  margin-top: auto;
}

.fav-btn.active {
  background: #ff4757;
  color: white;
}
</style>