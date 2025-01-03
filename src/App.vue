<template>
  <div class="main">
    <header class="header">
      <button v-if="router.currentRoute.value.fullPath !== '/login' && router.currentRoute.value.fullPath !== '/register'" class="logout-button" @click="logout">logout</button>
    </header>
    <router-view></router-view>
    <footer class="footer" v-if="router.currentRoute.value.fullPath !== '/login' && router.currentRoute.value.fullPath !== '/register'">
      <router-link class="link" :to="{ name: 'main' }">
        <img src="./assets/home.svg" alt="home" class="footer-img">
      </router-link>
      <router-link class="link" :to="{ name: 'dictionary' }">
        <img src="./assets/dictionary.svg" alt="dictionary" class="footer-img">
      </router-link>
    </footer>
  </div>
</template>

<script setup>
import router from './router';
import axios from 'axios';

const logout = async () => {
  try {
    // Отправка запроса на сервер для выхода
    await axios.post('/api/logout', {}, { withCredentials: true });

    // Очистка локальных данных
    localStorage.removeItem('refreshToken');

    // Перенаправление на страницу входа
    router.push('/login');
  } catch (error) {
    console.error('Ошибка при выходе:', error.response?.data?.message || error.message);
  }
};
</script>

<style scoped>
.main {
  background: url(../src/assets/bg.jpg) center no-repeat;
  overflow-y: hidden;
  height: 100vh;
  width: 100vw;
  background-size: cover;
}

.footer {
  display: flex;
  justify-content: space-around;
  position: fixed;
  bottom: 2vh;
  left: 0;
  width: 100%;
}

.footer-img {
  width: 6vh;
}

.link.router-link-active {
  border-bottom: 2px solid #FFFFFF;
  filter: brightness(0) invert(1);
}

.header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 3vh;
  padding-right: 3vw;
}

.logout-button {
  width: 10vw;
  height: 3vh;
}
</style>
