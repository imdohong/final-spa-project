<script setup>
import { onMounted, computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMovieStore } from '../stores/movieStore';

const store = useMovieStore();
const router = useRouter();

const sortOption = ref('popular');
const searchKeyword = ref('');
const currentPage = ref(1);
const moviesPerPage = 8;

const sortButtons = [
  { label: '인기순', value: 'popular' },
  { label: '제목순', value: 'title' },
  { label: '개봉일순', value: 'releaseDate' },
  { label: '평점순', value: 'rating' }
];

const sortedMovies = computed(() => {
  const copiedMovies = [...store.movies];

  if (sortOption.value === 'title') {
    return copiedMovies.sort((a, b) => {
      return (a.title || '').localeCompare(b.title || '', 'ko-KR');
    });
  }

  if (sortOption.value === 'releaseDate') {
    return copiedMovies.sort((a, b) => {
      return new Date(b.release_date || '1900-01-01') - new Date(a.release_date || '1900-01-01');
    });
  }

  if (sortOption.value === 'rating') {
    return copiedMovies.sort((a, b) => {
      return (b.vote_average || 0) - (a.vote_average || 0);
    });
  }

  return copiedMovies;
});

const totalPages = computed(() => {
  return Math.ceil(sortedMovies.value.length / moviesPerPage);
});

const paginatedMovies = computed(() => {
  const startIndex = (currentPage.value - 1) * moviesPerPage;
  const endIndex = startIndex + moviesPerPage;
  return sortedMovies.value.slice(startIndex, endIndex);
});

const changeSortOption = (option) => {
  sortOption.value = option;
  currentPage.value = 1;
};

const movePage = (pageNumber) => {
  currentPage.value = pageNumber;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const submitSearch = () => {
  const keyword = searchKeyword.value.trim();

  if (!keyword) {
    alert('검색어를 입력해 주세요.');
    return;
  }

  router.push({
    name: 'search-results',
    query: {
      keyword
    }
  });
};

onMounted(async () => {
  await store.fetchMovies();
  document.title = '🍿 국내 극장 화제작';
});

watch(
  () => store.movies.length,
  () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = 1;
    }
  }
);
</script>

<template>
  <main class="page">
    <div class="header-section">
      <h1>🍿 국내 극장 화제작</h1>
      <p class="sub-title">2025년 이후 국내 정식 개봉한 실시간 인기 상영작</p>
    </div>

    <section class="control-panel">
      <form class="search-box" @submit.prevent="submitSearch">
        <input
          v-model="searchKeyword"
          type="text"
          class="search-input"
          placeholder="영화 제목 또는 줄거리 검색"
        />
        <button type="submit" class="search-btn">검색</button>
      </form>

      <div class="sort-box">
        <button
          v-for="button in sortButtons"
          :key="button.value"
          type="button"
          class="sort-btn"
          :class="{ active: sortOption === button.value }"
          @click="changeSortOption(button.value)"
        >
          {{ button.label }}
        </button>
      </div>
    </section>

    <div v-if="store.isLoading" class="status-message loading">
      ⏳ 실시간 국내 개봉작 데이터를 싣고 오는 중입니다...
    </div>

    <div v-else-if="store.errorMessage" class="status-message error">
      🚨 {{ store.errorMessage }}
    </div>

    <template v-else>
      <div class="list-summary">
        <span>총 {{ sortedMovies.length }}개의 영화</span>
        <span>{{ currentPage }} / {{ totalPages || 1 }} 페이지</span>
      </div>

      <div class="movie-list">
        <article v-for="movie in paginatedMovies" :key="movie.id" class="movie-card">
          <RouterLink
            :to="`/movies/${movie.id}`"
            class="poster-link"
            :aria-label="`${movie.title} 상세 정보 보기`"
          >
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

            <p class="release-date" v-if="movie.release_date">
              📅 개봉일: {{ movie.release_date }}
            </p>

            <p class="rating">
              ⭐ {{ movie.vote_average ? movie.vote_average.toFixed(1) : '0.0' }} / 10
            </p>

            <p class="overview">
              {{
                movie.overview
                  ? movie.overview.substring(0, 70) + '...'
                  : '국내에 등록된 줄거리 요약 정보가 없습니다.'
              }}
            </p>

            <button
              type="button"
              @click="store.toggleFavorite(movie)"
              :class="{ active: movie.isFavorite }"
              class="fav-btn"
            >
              {{ movie.isFavorite ? '❤️ 찜 해제' : '🤍 찜하기' }}
            </button>
          </div>
        </article>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button
          v-for="pageNumber in totalPages"
          :key="pageNumber"
          type="button"
          class="page-btn"
          :class="{ active: currentPage === pageNumber }"
          @click="movePage(pageNumber)"
        >
          {{ pageNumber }}
        </button>
      </div>
    </template>
  </main>
</template>

<style scoped>
.page {
  padding: 40px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header-section {
  margin-bottom: 30px;
  text-align: center;
  color: #2c3e50;
}

.header-section h1 {
  font-size: 34px;
  font-weight: 900;
  margin-bottom: 8px;
}

.sub-title {
  font-size: 15px;
  color: #7f8c8d;
  margin-top: 5px;
}

.control-panel {
  max-width: 1100px;
  margin: 0 auto 30px auto;
  padding: 20px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-input {
  flex: 1;
  height: 46px;
  border: 1px solid #dfe4ea;
  border-radius: 10px;
  padding: 0 15px;
  font-size: 15px;
  font-weight: 600;
  outline: none;
}

.search-input:focus {
  border-color: #ff4757;
  box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.12);
}

.search-btn {
  height: 46px;
  padding: 0 24px;
  border: none;
  border-radius: 10px;
  background-color: #ff4757;
  color: #ffffff;
  font-weight: 900;
  cursor: pointer;
}

.sort-box {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.sort-btn {
  border: 1px solid #dfe4ea;
  background-color: #f1f2f6;
  color: #2f3542;
  border-radius: 999px;
  padding: 10px 18px;
  font-weight: 800;
  cursor: pointer;
}

.sort-btn.active {
  background-color: #1e272e;
  color: #ffffff;
  border-color: #1e272e;
}

.status-message {
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

.list-summary {
  max-width: 1100px;
  margin: 0 auto 18px auto;
  display: flex;
  justify-content: space-between;
  color: #57606f;
  font-size: 14px;
  font-weight: 800;
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
  text-align: left;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.movie-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.11);
}

.poster-link {
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

.title-link {
  text-decoration: none;
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

.title:hover {
  color: #ff4757;
}

.release-date {
  font-size: 13px;
  color: #7f8c8d;
  margin-bottom: 10px;
  font-weight: 600;
}

.rating {
  font-weight: 900;
  color: #f39c12;
  margin-bottom: 10px;
  font-size: 16px;
}

.overview {
  font-size: 13px;
  color: #555;
  line-height: 1.5;
  margin-bottom: 20px;
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
  transition: 0.3s;
  margin-top: auto;
}

.fav-btn.active {
  background: #ff4757;
  color: white;
}

.pagination {
  max-width: 1100px;
  margin: 34px auto 0 auto;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

.page-btn {
  min-width: 42px;
  height: 42px;
  border: 1px solid #dfe4ea;
  border-radius: 10px;
  background: #ffffff;
  color: #2f3542;
  font-weight: 900;
  cursor: pointer;
}

.page-btn.active {
  background: #ff4757;
  color: #ffffff;
  border-color: #ff4757;
}

@media (max-width: 640px) {
  .page {
    padding: 24px 16px;
  }

  .search-box {
    flex-direction: column;
  }

  .search-btn {
    width: 100%;
  }
}
</style>