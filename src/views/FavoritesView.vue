<script setup>
import { computed, onMounted } from 'vue';
import { useMovieStore } from '../stores/movieStore';

const store = useMovieStore();

const favoriteMovies = computed(() => {
  return store.favorites;
});

onMounted(() => {
  document.title = '❤️ 찜 목록 | NETVUE';
});
</script>

<template>
  <main class="page">
    <section class="favorite-header">
      <div>
        <h1>❤️ 나의 찜 목록</h1>
        <p>내가 선택한 영화만 모아 보는 독립 페이지입니다.</p>
      </div>

      <button
        v-if="favoriteMovies.length > 0"
        type="button"
        class="clear-btn"
        @click="store.clearFavorites"
      >
        전체 비우기
      </button>
    </section>

    <div v-if="favoriteMovies.length === 0" class="empty-box">
      <span class="empty-icon">🤍</span>
      <h2>아직 찜한 영화가 없습니다.</h2>
      <p>영화 목록에서 마음에 드는 영화를 찜해 보세요.</p>
      <RouterLink to="/movies" class="move-link">영화 목록 보러가기</RouterLink>
    </div>

    <div v-else class="movie-list">
      <article v-for="movie in favoriteMovies" :key="movie.id" class="movie-card">
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

          <button
            type="button"
            class="remove-btn"
            @click="store.toggleFavorite(movie)"
          >
            찜 목록에서 제거
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

.favorite-header {
  max-width: 1100px;
  margin: 0 auto 28px auto;
  padding: 28px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.favorite-header h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 900;
  color: #2f3542;
}

.favorite-header p {
  margin: 0;
  color: #747d8c;
  font-weight: 700;
}

.clear-btn {
  border: none;
  border-radius: 10px;
  background: #2f3542;
  color: #ffffff;
  padding: 13px 20px;
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;
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

.release-date {
  color: #57606f;
  font-size: 13px;
  font-weight: 600;
}

.rating {
  font-weight: 900;
  color: #f39c12;
  margin: 8px 0 18px 0;
}

.remove-btn {
  margin-top: auto;
  width: 100%;
  padding: 12px;
  cursor: pointer;
  border: none;
  background: #ff4757;
  color: white;
  border-radius: 10px;
  font-weight: 900;
  font-size: 14px;
}

@media (max-width: 640px) {
  .page {
    padding: 24px 16px;
  }

  .favorite-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>